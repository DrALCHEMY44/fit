<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => '2376'.fake()->unique()->numerify('########'),
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => User::ROLE_CLIENT,
            'status' => User::STATUS_ACTIVE,
            'language' => 'en',
            'referral_code' => strtoupper(Str::random(8)),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function client(): static
    {
        return $this->state(fn () => ['role' => User::ROLE_CLIENT])
            ->afterCreating(fn (User $user) => $user->clientProfile()->create([]));
    }

    public function freelancer(): static
    {
        return $this->state(fn () => ['role' => User::ROLE_FREELANCER])
            ->afterCreating(fn (User $user) => $user->freelancerProfile()->create([]));
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => User::ROLE_ADMIN]);
    }
}
