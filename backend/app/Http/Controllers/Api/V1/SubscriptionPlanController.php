<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SubscriptionPlanResource;
use App\Models\SubscriptionPlan;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

#[Group('Catalog & Meta')]
class SubscriptionPlanController extends Controller
{
    /**
     * List subscription plans
     *
     * Active freelancer Pro plans (FIT-MON-02) with pricing and included connects.
     *
     * @unauthenticated
     */
    public function index(): AnonymousResourceCollection
    {
        return SubscriptionPlanResource::collection(
            SubscriptionPlan::query()->where('is_active', true)->orderBy('price')->get(),
        );
    }
}
