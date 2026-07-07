<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConnectPack extends Model
{
    protected $fillable = [
        'name', 'connects', 'price_usd', 'price_xaf', 'badge',
        'savings_label', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price_usd' => 'decimal:2',
        'price_xaf' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
