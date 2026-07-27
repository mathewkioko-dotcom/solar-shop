<?php

namespace App\Support;

final class KenyanPhone
{
    public const VALIDATION_PATTERN = '/^\+254[17]\d{8}$/';

    public static function normalize(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $phone = preg_replace('/[\s()-]+/', '', trim($value));

        if (preg_match('/^0([17]\d{8})$/', $phone, $matches)) {
            return '+254'.$matches[1];
        }

        if (preg_match('/^254([17]\d{8})$/', $phone, $matches)) {
            return '+254'.$matches[1];
        }

        return $phone;
    }
}
