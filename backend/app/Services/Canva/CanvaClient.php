<?php

namespace App\Services\Canva;

use App\Models\CanvaConnection;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use RuntimeException;

class CanvaClient
{
    public function isConfigured(): bool
    {
        return filled(config('canva.client_id')) && filled(config('canva.client_secret'));
    }

    public function createAuthUrl(User $user): string
    {
        $verifier = Str::random(64);
        $challenge = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
        $state = Str::random(40);

        Cache::put("canva_oauth:{$state}", [
            'user_id' => $user->id,
            'code_verifier' => $verifier,
        ], now()->addMinutes(15));

        $query = http_build_query([
            'code_challenge' => $challenge,
            'code_challenge_method' => 'S256',
            'scope' => implode(' ', config('canva.scopes')),
            'response_type' => 'code',
            'client_id' => config('canva.client_id'),
            'state' => $state,
            'redirect_uri' => config('canva.redirect_uri'),
        ]);

        return config('canva.auth_url').'?'.$query;
    }

    public function handleCallback(string $code, string $state): CanvaConnection
    {
        $payload = Cache::pull("canva_oauth:{$state}");
        if (! $payload) {
            throw new RuntimeException('Invalid or expired Canva OAuth state.');
        }

        $response = Http::asForm()
            ->withBasicAuth(config('canva.client_id'), config('canva.client_secret'))
            ->post(config('canva.token_url'), [
                'grant_type' => 'authorization_code',
                'code_verifier' => $payload['code_verifier'],
                'code' => $code,
                'redirect_uri' => config('canva.redirect_uri'),
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Canva token exchange failed: '.$response->body());
        }

        $data = $response->json();

        return CanvaConnection::updateOrCreate(
            ['user_id' => $payload['user_id']],
            [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? null,
                'expires_at' => now()->addSeconds((int) ($data['expires_in'] ?? 3600)),
                'token_type' => $data['token_type'] ?? 'Bearer',
                'scope' => $data['scope'] ?? null,
            ]
        );
    }

    public function accessTokenFor(User $user): string
    {
        $connection = CanvaConnection::query()->where('user_id', $user->id)->first();
        if (! $connection) {
            throw new RuntimeException('Canva is not connected. Connect Canva first.');
        }

        if ($connection->isExpired() && $connection->refresh_token) {
            $this->refresh($connection);
            $connection->refresh();
        }

        return $connection->access_token;
    }

    public function refresh(CanvaConnection $connection): void
    {
        $response = Http::asForm()
            ->withBasicAuth(config('canva.client_id'), config('canva.client_secret'))
            ->post(config('canva.token_url'), [
                'grant_type' => 'refresh_token',
                'refresh_token' => $connection->refresh_token,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Canva token refresh failed: '.$response->body());
        }

        $data = $response->json();
        $connection->update([
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'] ?? $connection->refresh_token,
            'expires_at' => now()->addSeconds((int) ($data['expires_in'] ?? 3600)),
            'scope' => $data['scope'] ?? $connection->scope,
        ]);
    }

    public function request(User $user, string $method, string $path, array $json = []): array
    {
        $token = $this->accessTokenFor($user);
        $url = rtrim(config('canva.api_base'), '/').'/'.ltrim($path, '/');

        $pending = Http::withToken($token)->acceptJson();
        $response = match (strtoupper($method)) {
            'GET' => $pending->get($url),
            'POST' => $pending->post($url, $json),
            'PUT' => $pending->put($url, $json),
            'PATCH' => $pending->patch($url, $json),
            'DELETE' => $pending->delete($url, $json),
            default => throw new RuntimeException("Unsupported HTTP method {$method}"),
        };

        if (! $response->successful()) {
            throw new RuntimeException("Canva API {$method} {$path} failed: ".$response->body());
        }

        return $response->json() ?? [];
    }

    public function pollJob(User $user, string $path, int $attempts = 30, int $sleepMs = 800): array
    {
        for ($i = 0; $i < $attempts; $i++) {
            $payload = $this->request($user, 'GET', $path);
            $status = data_get($payload, 'job.status');

            if ($status === 'success') {
                return $payload;
            }

            if (in_array($status, ['failed', 'error'], true)) {
                throw new RuntimeException('Canva job failed: '.json_encode($payload));
            }

            usleep($sleepMs * 1000);
        }

        throw new RuntimeException('Canva job timed out.');
    }
}
