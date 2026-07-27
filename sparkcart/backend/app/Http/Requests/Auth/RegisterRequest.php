<?php

namespace App\Http\Requests\Auth;

use App\Support\RegistrationProfiler;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        app(RegistrationProfiler::class)->start('validation');

        $this->merge([
            'first_name' => Str::squish((string) $this->input('first_name')),
            'last_name' => Str::squish((string) $this->input('last_name')),
            'email' => Str::lower(trim((string) $this->input('email'))),
        ]);
    }

    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:100',
                "regex:/^[\pL\pM][\pL\pM\s'.-]*$/u",
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
                "regex:/^[\pL\pM][\pL\pM\s'.-]*$/u",
            ],
            'email' => ['required', 'string', 'lowercase', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ];
    }

    protected function passedValidation(): void
    {
        app(RegistrationProfiler::class)->finish('validation');
    }
}
