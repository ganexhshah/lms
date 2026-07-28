<?php

use Aws\S3\S3Client;
use Illuminate\Support\Facades\Storage;

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$client = new S3Client([
    'version' => 'latest',
    'region' => env('AWS_DEFAULT_REGION', 'auto'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => true,
    'credentials' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
    ],
]);

$bucket = env('AWS_BUCKET');

$client->putBucketCors([
    'Bucket' => $bucket,
    'CORSConfiguration' => [
        'CORSRules' => [[
            'AllowedOrigins' => [
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:8080',
            ],
            'AllowedMethods' => ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            'AllowedHeaders' => ['*'],
            'ExposeHeaders' => ['ETag', 'Content-Length'],
            'MaxAgeSeconds' => 86400,
        ]],
    ],
]);

echo "CORS applied\n";

$key = 'healthchecks/r2-'.date('YmdHis').'.txt';
$body = 'vellum-r2-ok '.date('c');

Storage::disk('s3')->put($key, $body, [
    'visibility' => 'public',
    'ContentType' => 'text/plain',
    'CacheControl' => 'public, max-age=60',
]);

$url = rtrim((string) env('AWS_URL'), '/').'/'.$key;
$ok = $client->doesObjectExist($bucket, $key);
echo "Uploaded: {$url}\n";
echo 'Object exists: '.($ok ? 'yes' : 'no')."\n";
echo 'Config ok: bucket='.($bucket ? 'set' : 'missing').' key='.(env('AWS_ACCESS_KEY_ID') ? 'set' : 'missing')."\n";
