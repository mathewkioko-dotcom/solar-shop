<?php

namespace App\Http\Requests\Address;

use App\Support\KenyanPhone;
use Illuminate\Foundation\Http\FormRequest;

class StoreAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone' => KenyanPhone::normalize($this->input('phone')),
        ]);
    }

    public function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:50'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'regex:'.KenyanPhone::VALIDATION_PATTERN],
            'county' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'street_address' => ['required', 'string', 'max:255'],
            'building_details' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'delivery_instructions' => ['nullable', 'string', 'max:1000'],
            'is_default' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a valid Kenyan phone number.',
        ];
    }
}
