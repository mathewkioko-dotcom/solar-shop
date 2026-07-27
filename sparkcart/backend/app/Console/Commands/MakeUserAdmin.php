<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email : Email address of the existing user}';

    protected $description = 'Promote an existing customer account to administrator';

    public function handle(): int
    {
        $email = Str::lower(trim((string) $this->argument('email')));
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $this->error("No user exists with email {$email}.");

            return self::FAILURE;
        }

        if ($user->role === 'admin') {
            $this->info("{$email} is already an administrator.");

            return self::SUCCESS;
        }

        $user->forceFill(['role' => 'admin'])->save();
        $this->info("{$email} was promoted to administrator.");

        return self::SUCCESS;
    }
}
