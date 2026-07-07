<?php

namespace Database\Seeders;

use App\Models\ConnectPack;
use App\Models\PlatformSetting;
use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'commission_rate' => 0.10,
            'default_connects_per_proposal' => 6,
            'free_connects_on_signup' => 10,
            'referral_bonus_connects' => 5,
            'xaf_per_usd' => 600,
            'min_withdrawal_amount' => 5000,
        ];

        foreach ($settings as $key => $value) {
            PlatformSetting::set($key, $value);
        }

        // Connect packs mirroring the "Buy Connects" screen.
        $packs = [
            ['name' => 'Starter Pack', 'connects' => 10, 'price_usd' => 1.50, 'badge' => null, 'savings_label' => null],
            ['name' => 'Starter Plus', 'connects' => 20, 'price_usd' => 3.00, 'badge' => null, 'savings_label' => null],
            ['name' => 'Most Popular', 'connects' => 50, 'price_usd' => 6.00, 'badge' => 'Most Popular', 'savings_label' => null],
            ['name' => 'Best Value', 'connects' => 100, 'price_usd' => 10.00, 'badge' => 'Best Value', 'savings_label' => 'Save 33%'],
            ['name' => 'Power Pack', 'connects' => 200, 'price_usd' => 18.00, 'badge' => 'Power Pack', 'savings_label' => 'Save 40%'],
        ];

        foreach ($packs as $index => $pack) {
            ConnectPack::query()->updateOrCreate(
                ['name' => $pack['name']],
                [...$pack, 'price_xaf' => $pack['price_usd'] * 600, 'sort_order' => $index],
            );
        }

        SubscriptionPlan::query()->updateOrCreate(
            ['slug' => 'freelancer-pro'],
            [
                'name' => 'Freelancer Pro',
                'description' => 'Boosted visibility in search, monthly connects and the Pro badge.',
                'price' => 5000,
                'currency' => 'XAF',
                'period' => 'monthly',
                'connects_per_period' => 50,
                'features' => [
                    '50 connects every month',
                    'Priority ranking in talent search',
                    'Pro badge on your profile',
                    'Detailed proposal analytics',
                ],
            ],
        );
    }
}
