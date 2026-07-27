<?php

namespace App\Http\Requests\Checkout;

use App\Support\KenyanPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCheckoutOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $contact = $this->input('contact', []);
        $address = $this->input('address', []);

        if (is_array($contact)) {
            $contact['phone'] = KenyanPhone::normalize($contact['phone'] ?? null);
            $contact['email'] = isset($contact['email'])
                ? strtolower(trim((string) $contact['email']))
                : null;
        }

        if (is_array($address)) {
            $address['phone'] = KenyanPhone::normalize($address['phone'] ?? null);
        }

        $this->merge([
            'contact' => $contact,
            'address' => $address,
        ]);
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'submission_id' => ['required', 'uuid'],
            'checkout_recovery_secret' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/i'],
            'contact' => ['required', 'array'],
            'contact.first_name' => ['required', 'string', 'max:100'],
            'contact.last_name' => ['required', 'string', 'max:100'],
            'contact.email' => [
                'required',
                'email:rfc',
                'max:255',
                ...($user ? [Rule::in([strtolower((string) $user->email)])] : []),
            ],
            'contact.phone' => ['required', 'regex:'.KenyanPhone::VALIDATION_PATTERN],
            'address' => ['required', 'array'],
            'address.label' => ['nullable', 'string', 'max:50'],
            'address.first_name' => ['required', 'string', 'max:100'],
            'address.last_name' => ['required', 'string', 'max:100'],
            'address.phone' => ['required', 'regex:'.KenyanPhone::VALIDATION_PATTERN],
            'address.county' => ['required', 'string', 'max:100'],
            'address.city' => ['required', 'string', 'max:100'],
            'address.street_address' => ['required', 'string', 'max:255'],
            'address.building_details' => ['nullable', 'string', 'max:255'],
            'address.postal_code' => ['nullable', 'string', 'max:20'],
            'address.delivery_instructions' => ['nullable', 'string', 'max:1000'],
            'save_address' => [
                'required',
                'boolean',
                ...($user ? [] : [Rule::in([false])]),
            ],
            'legal_acceptance' => ['required', 'accepted'],
            'delivery_method' => ['required', Rule::in(['standard_delivery'])],
            'payment_method' => ['required', Rule::in(['mpesa', 'card', 'pay_on_confirmation'])],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.expected_unit_price' => ['nullable', 'decimal:0,2', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'contact.email.in' => 'Checkout must use the email address on your account.',
            'save_address.in' => 'Guests cannot save delivery addresses.',
            'legal_acceptance.accepted' => 'You must agree to the Privacy Policy and Terms & Conditions.',
            'contact.phone.regex' => 'Enter a valid Kenyan contact phone number.',
            'address.phone.regex' => 'Enter a valid Kenyan delivery phone number.',
            'items.*.product_id.distinct' => 'Each product may only appear once in the order.',
        ];
    }
}
