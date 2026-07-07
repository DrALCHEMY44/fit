<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConnectPackResource;
use App\Http\Resources\SubscriptionPlanResource;
use App\Models\ConnectPack;
use App\Models\Coupon;
use App\Models\SubscriptionPlan;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

#[Group('Admin — Monetization')]
class MonetizationAdminController extends Controller
{
    /**
     * List connect packs (admin)
     */
    public function connectPacks(): AnonymousResourceCollection
    {
        return ConnectPackResource::collection(ConnectPack::query()->orderBy('sort_order')->get());
    }

    /**
     * Create connect pack
     */
    public function storeConnectPack(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'connects' => ['required', 'integer', 'min:1'],
            'price_usd' => ['required', 'numeric', 'min:0'],
            'price_xaf' => ['required', 'numeric', 'min:0'],
            'badge' => ['nullable', 'string', 'max:50'],
            'savings_label' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $pack = ConnectPack::query()->create($data);
        $audit->log($request->user(), 'connect_pack.create', $pack);

        return new ConnectPackResource($pack)->response()->setStatusCode(201);
    }

    /**
     * Update connect pack
     */
    public function updateConnectPack(Request $request, ConnectPack $connectPack, AuditLogger $audit): ConnectPackResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'connects' => ['sometimes', 'integer', 'min:1'],
            'price_usd' => ['sometimes', 'numeric', 'min:0'],
            'price_xaf' => ['sometimes', 'numeric', 'min:0'],
            'badge' => ['sometimes', 'nullable', 'string', 'max:50'],
            'savings_label' => ['sometimes', 'nullable', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $connectPack->update($data);
        $audit->log($request->user(), 'connect_pack.update', $connectPack, $data);

        return new ConnectPackResource($connectPack->fresh());
    }

    /**
     * List subscription plans (admin)
     */
    public function plans(): AnonymousResourceCollection
    {
        return SubscriptionPlanResource::collection(SubscriptionPlan::query()->orderBy('price')->get());
    }

    /**
     * Create subscription plan
     */
    public function storePlan(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'numeric', 'min:0'],
            'period' => ['required', Rule::in(['monthly', 'yearly'])],
            'connects_per_period' => ['nullable', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
        ]);

        $plan = SubscriptionPlan::query()->create([...$data, 'slug' => Str::slug($data['name'])]);
        $audit->log($request->user(), 'plan.create', $plan);

        return new SubscriptionPlanResource($plan)->response()->setStatusCode(201);
    }

    /**
     * Update subscription plan
     */
    public function updatePlan(Request $request, SubscriptionPlan $subscriptionPlan, AuditLogger $audit): SubscriptionPlanResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'period' => ['sometimes', Rule::in(['monthly', 'yearly'])],
            'connects_per_period' => ['sometimes', 'integer', 'min:0'],
            'features' => ['sometimes', 'nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $subscriptionPlan->update($data);
        $audit->log($request->user(), 'plan.update', $subscriptionPlan, $data);

        return new SubscriptionPlanResource($subscriptionPlan->fresh());
    }

    /**
     * List coupons
     */
    public function coupons(): JsonResponse
    {
        return response()->json(Coupon::query()->latest()->paginate(20));
    }

    /**
     * Create coupon
     */
    public function storeCoupon(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:coupons,code'],
            'type' => ['required', Rule::in(['percent', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $coupon = Coupon::query()->create([...$data, 'code' => strtoupper($data['code'])]);
        $audit->log($request->user(), 'coupon.create', $coupon);

        return response()->json($coupon, 201);
    }

    /**
     * Update coupon
     */
    public function updateCoupon(Request $request, Coupon $coupon, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'value' => ['sometimes', 'numeric', 'min:0'],
            'max_uses' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'expires_at' => ['sometimes', 'nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $coupon->update($data);
        $audit->log($request->user(), 'coupon.update', $coupon, $data);

        return response()->json($coupon->fresh());
    }
}
