<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ManagedPublicFile
{
    private const MANAGED_DIRECTORIES = [
        'brands/logos/',
        'products/images/',
        'products/datasheets/',
    ];

    public static function store(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'public');
    }

    public static function delete(?string $path): void
    {
        $normalized = ltrim((string) $path, '/');
        if ($normalized === '' || ! self::isManaged($normalized)) {
            return;
        }

        Storage::disk('public')->delete($normalized);
    }

    public static function url(?string $path): ?string
    {
        $normalized = ltrim((string) $path, '/');
        if ($normalized === '') {
            return null;
        }

        if (preg_match('/^(https?:)?\/\//i', $normalized)) {
            return $normalized;
        }

        if (self::isManaged($normalized)) {
            if (! Storage::disk('public')->exists($normalized)) {
                return null;
            }

            return Storage::disk('public')->url($normalized);
        }

        return asset($normalized);
    }

    private static function isManaged(string $path): bool
    {
        foreach (self::MANAGED_DIRECTORIES as $directory) {
            if (str_starts_with($path, $directory)) {
                return true;
            }
        }

        return false;
    }
}
