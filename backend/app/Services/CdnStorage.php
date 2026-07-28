<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CdnStorage
{
    public function disk(): string
    {
        return (string) config('filesystems.default', 's3');
    }

    /**
     * @return array{path: string, url: string, disk: string, size: int, mime: string|null, originalName: string}
     */
    public function put(UploadedFile $file, string $folder = 'uploads'): array
    {
        $folder = trim($folder, '/');
        $ext = $file->getClientOriginalExtension() ?: $file->extension() ?: 'bin';
        $name = Str::uuid()->toString().'.'.strtolower($ext);
        $path = $folder.'/'.$name;

        $disk = $this->disk();
        Storage::disk($disk)->put($path, file_get_contents($file->getRealPath()), [
            'visibility' => 'public',
            'ContentType' => $file->getMimeType() ?: 'application/octet-stream',
            'CacheControl' => 'public, max-age=31536000, immutable',
        ]);

        return [
            'path' => $path,
            'url' => $this->url($path),
            'disk' => $disk,
            'size' => (int) $file->getSize(),
            'mime' => $file->getMimeType(),
            'originalName' => $file->getClientOriginalName(),
        ];
    }

    public function url(string $path): string
    {
        $path = ltrim($path, '/');
        $base = rtrim((string) config('filesystems.disks.'.$this->disk().'.url'), '/');

        if ($base !== '') {
            return $base.'/'.$path;
        }

        return Storage::disk($this->disk())->url($path);
    }

    public function delete(?string $path): bool
    {
        if (! $path) {
            return false;
        }

        // Accept full CDN URL or relative path
        $base = rtrim((string) config('filesystems.disks.'.$this->disk().'.url'), '/');
        if ($base !== '' && str_starts_with($path, $base.'/')) {
            $path = substr($path, strlen($base) + 1);
        }

        return Storage::disk($this->disk())->delete($path);
    }
}
