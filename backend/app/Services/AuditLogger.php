<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditLogger
{
    public function log(User $admin, string $action, ?Model $entity = null, array $meta = []): AdminAuditLog
    {
        return AdminAuditLog::query()->create([
            'admin_id' => $admin->id,
            'action' => $action,
            'entity_type' => $entity?->getMorphClass(),
            'entity_id' => $entity?->getKey(),
            'ip_address' => request()->ip(),
            'meta' => $meta ?: null,
        ]);
    }
}
