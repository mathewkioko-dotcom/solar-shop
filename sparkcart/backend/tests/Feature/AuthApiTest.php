<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    private const STRONG_PASSWORD = 'StrongPassword123!';

    public function test_customer_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'first_name' => '  Jane  ',
            'last_name' => '  Doe  ',
            'email' => 'JANE@EXAMPLE.COM',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.first_name', 'Jane')
            ->assertJsonPath('user.last_name', 'Doe')
            ->assertJsonPath('user.name', 'Jane Doe')
            ->assertJsonPath('user.email', 'jane@example.com')
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'first_name', 'last_name', 'name', 'email', 'created_at'],
                'token',
            ])
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.remember_token');

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseHas('users', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
        ]);
        $this->assertTrue(Hash::check(
            self::STRONG_PASSWORD,
            User::query()->where('email', 'jane@example.com')->value('password'),
        ));
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'jane@example.com']);

        $this->postJson('/api/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'JANE@example.com',
            'password' => self::STRONG_PASSWORD,
            'password_confirmation' => self::STRONG_PASSWORD,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_invalid_registration_payload_is_rejected(): void
    {
        $this->postJson('/api/auth/register', [
            'first_name' => '',
            'last_name' => '',
            'email' => 'not-an-email',
            'password' => 'weak',
            'password_confirmation' => 'different',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'first_name',
                'last_name',
                'email',
                'password',
            ]);
    }

    public function test_customer_can_login_and_obsolete_named_tokens_are_replaced(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => Hash::make(self::STRONG_PASSWORD),
        ]);
        $obsoleteToken = $user->createToken('baraka-solar-customer')->accessToken;
        $otherDeviceToken = $user->createToken('another-device')->accessToken;

        $response = $this->postJson('/api/auth/login', [
            'email' => 'JANE@EXAMPLE.COM',
            'password' => self::STRONG_PASSWORD,
            'remember' => true,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'jane@example.com')
            ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $obsoleteToken->id]);
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $otherDeviceToken->id]);
        $this->assertDatabaseCount('personal_access_tokens', 2);
    }

    public function test_invalid_credentials_return_a_generic_validation_error(): void
    {
        User::factory()->create([
            'email' => 'jane@example.com',
            'password' => Hash::make(self::STRONG_PASSWORD),
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'IncorrectPassword123!',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email')
            ->assertJsonPath('errors.email.0', 'The provided credentials are incorrect.');
    }

    public function test_bearer_token_can_retrieve_the_safe_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('baraka-solar-customer')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonMissingPath('user.password')
            ->assertJsonMissingPath('user.remember_token')
            ->assertJsonMissingPath('user.tokens');
    }

    public function test_unauthenticated_customer_cannot_retrieve_user(): void
    {
        $this->getJson('/api/auth/user')->assertUnauthorized();
    }

    public function test_logout_revokes_only_the_current_bearer_token(): void
    {
        $user = User::factory()->create();
        $currentToken = $user->createToken('baraka-solar-customer');
        $otherToken = $user->createToken('another-device');

        $this->withToken($currentToken->plainTextToken)
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertDatabaseMissing('personal_access_tokens', [
            'id' => $currentToken->accessToken->id,
        ]);
        $this->assertDatabaseHas('personal_access_tokens', [
            'id' => $otherToken->accessToken->id,
        ]);
    }

    public function test_forgot_password_returns_a_safe_response_and_sends_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'jane@example.com']);

        $message = 'If an account exists for this email, a password reset link has been sent.';

        $this->postJson('/api/auth/forgot-password', [
            'email' => 'jane@example.com',
        ])
            ->assertOk()
            ->assertJsonPath('message', $message);

        $this->postJson('/api/auth/forgot-password', [
            'email' => 'missing@example.com',
        ])
            ->assertOk()
            ->assertJsonPath('message', $message);

        Notification::assertSentTo(
            $user,
            ResetPasswordNotification::class,
            function (ResetPasswordNotification $notification, array $channels) use ($user): bool {
                $url = $notification->toMail($user)->actionUrl;

                return in_array('mail', $channels, true)
                    && str_starts_with($url, 'http://127.0.0.1:5173/reset-password?')
                    && str_contains($url, 'email=jane%40example.com')
                    && str_contains($url, 'token=');
            }
        );
    }

    public function test_customer_can_reset_password_and_existing_tokens_are_revoked(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => Hash::make(self::STRONG_PASSWORD),
        ]);
        $user->createToken('baraka-solar-customer');
        $user->createToken('another-device');
        $resetToken = Password::createToken($user);
        $newPassword = 'NewStrongPassword456!';

        $this->postJson('/api/auth/reset-password', [
            'token' => $resetToken,
            'email' => 'JANE@EXAMPLE.COM',
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Your password has been reset. You can now sign in.');

        $this->assertTrue(Hash::check($newPassword, $user->fresh()->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_invalid_reset_token_is_rejected_without_changing_password(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => Hash::make(self::STRONG_PASSWORD),
        ]);
        $newPassword = 'NewStrongPassword456!';

        $this->postJson('/api/auth/reset-password', [
            'token' => 'invalid-token',
            'email' => 'jane@example.com',
            'password' => $newPassword,
            'password_confirmation' => $newPassword,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');

        $this->assertTrue(Hash::check(self::STRONG_PASSWORD, $user->fresh()->password));
    }
}

