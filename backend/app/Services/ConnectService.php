<?php

namespace App\Services;

use App\Models\ConnectTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class ConnectService
{
    public function spend(User $user, int $amount, Model $source, string $description): ConnectTransaction
    {
        if ($user->connects_balance < $amount) {
            throw ValidationException::withMessages([
                'connects' => ["Insufficient connects: {$amount} required, {$user->connects_balance} available."],
            ]);
        }

        $user->decrement('connects_balance', $amount);

        return $this->record($user->refresh(), ConnectTransaction::TYPE_SPEND, -$amount, $source, $description);
    }

    public function credit(User $user, int $amount, string $type, ?Model $source, string $description): ConnectTransaction
    {
        $user->increment('connects_balance', $amount);

        return $this->record($user->refresh(), $type, $amount, $source, $description);
    }

    private function record(User $user, string $type, int $amount, ?Model $source, string $description): ConnectTransaction
    {
        return ConnectTransaction::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'amount' => $amount,
            'balance_after' => $user->connects_balance,
            'source_type' => $source?->getMorphClass(),
            'source_id' => $source?->getKey(),
            'description' => $description,
        ]);
    }
}
