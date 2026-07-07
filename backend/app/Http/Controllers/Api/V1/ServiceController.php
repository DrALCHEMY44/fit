<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ServiceResource;
use App\Models\Service;
use App\Models\ServicePackage;
use App\Services\OrderService;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

#[Group('Services')]
class ServiceController extends Controller
{
    /**
     * Browse services
     *
     * Public catalog of active freelancer services/gigs with filters and
     * sorting (FIT-SRV, FIT-SRC-02).
     *
     * @unauthenticated
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'max_delivery_days' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', Rule::in(['newest', 'price_asc', 'price_desc', 'rating'])],
            'per_page' => ['nullable', 'integer', 'between:1,50'],
        ]);

        $services = Service::query()
            ->where('status', Service::STATUS_ACTIVE)
            ->with(['category', 'freelancer.freelancerProfile', 'packages'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(
                fn ($q) => $q->where('title', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%"),
            ))
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['min_price'] ?? null, fn ($query, $min) => $query->where('price', '>=', $min))
            ->when($filters['max_price'] ?? null, fn ($query, $max) => $query->where('price', '<=', $max))
            ->when($filters['max_delivery_days'] ?? null, fn ($query, $days) => $query->where('delivery_days', '<=', $days))
            ->when($filters['sort'] ?? 'newest', fn ($query, $sort) => match ($sort) {
                'price_asc' => $query->orderBy('price'),
                'price_desc' => $query->orderByDesc('price'),
                'rating' => $query->orderByDesc('rating'),
                default => $query->latest(),
            })
            ->paginate($request->integer('per_page', 15));

        return ServiceResource::collection($services);
    }

    /**
     * Service details
     *
     * @unauthenticated
     */
    public function show(Service $service): ServiceResource
    {
        abort_if($service->status === Service::STATUS_REMOVED, 404);

        return new ServiceResource(
            $service->load(['category', 'freelancer.freelancerProfile.skills', 'packages']),
        );
    }

    /**
     * Create a service
     *
     * A freelancer publishes a fixed-price service with delivery time and
     * optional Basic/Standard/Premium packages (FIT-SRV-01/02/03).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            /** Base price in XAF. @example 50000 */
            'price' => ['required', 'numeric', 'min:1'],
            'delivery_days' => ['required', 'integer', 'between:1,365'],
            'revisions_included' => ['nullable', 'integer', 'between:0,10'],
            'packages' => ['nullable', 'array', 'max:3'],
            'packages.*.tier' => ['required_with:packages', Rule::in(['basic', 'standard', 'premium'])],
            'packages.*.name' => ['required_with:packages', 'string', 'max:100'],
            'packages.*.description' => ['nullable', 'string', 'max:1000'],
            'packages.*.price' => ['required_with:packages', 'numeric', 'min:1'],
            'packages.*.delivery_days' => ['required_with:packages', 'integer', 'between:1,365'],
            'packages.*.revisions_included' => ['nullable', 'integer', 'between:0,10'],
            'packages.*.features' => ['nullable', 'array'],
            'packages.*.features.*' => ['string', 'max:255'],
        ]);

        $service = Service::query()->create([
            ...collect($data)->except('packages')->all(),
            'user_id' => $request->user()->id,
            'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(6)),
        ]);

        foreach ($data['packages'] ?? [] as $package) {
            $service->packages()->create($package);
        }

        return new ServiceResource($service->load(['category', 'packages']))->response()->setStatusCode(201);
    }

    /**
     * Update my service
     */
    public function update(Request $request, Service $service): ServiceResource
    {
        $this->authorizeOwner($request, $service);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:10000'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'price' => ['sometimes', 'numeric', 'min:1'],
            'delivery_days' => ['sometimes', 'integer', 'between:1,365'],
            'revisions_included' => ['sometimes', 'integer', 'between:0,10'],
        ]);

        $service->update($data);

        return new ServiceResource($service->fresh(['category', 'packages']));
    }

    /**
     * Activate / pause my service
     *
     * Toggles visibility in the public catalog (FIT-SRV-05).
     */
    public function setStatus(Request $request, Service $service): ServiceResource
    {
        $this->authorizeOwner($request, $service);

        $data = $request->validate([
            'status' => ['required', Rule::in([Service::STATUS_ACTIVE, Service::STATUS_PAUSED])],
        ]);

        $service->update($data);

        return new ServiceResource($service->fresh());
    }

    /**
     * Upload service images
     *
     * Adds up to 5 presentation images (FIT-SRV-04).
     */
    public function uploadImages(Request $request, Service $service): ServiceResource
    {
        $this->authorizeOwner($request, $service);

        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $paths = collect($request->file('images'))
            ->map(fn ($image) => $image->store('services', 'public'))
            ->all();

        $service->update(['images' => [...($service->images ?? []), ...$paths]]);

        return new ServiceResource($service->fresh());
    }

    /**
     * My services
     *
     * The authenticated freelancer's services in any status.
     */
    public function mine(Request $request): AnonymousResourceCollection
    {
        return ServiceResource::collection(
            Service::query()
                ->where('user_id', $request->user()->id)
                ->with(['category', 'packages'])
                ->latest()
                ->paginate(15),
        );
    }

    /**
     * Order a service
     *
     * A client orders the service directly (FIT-SRV-06). Creates an order in
     * `pending_payment`; pay it via `POST /orders/{order}/pay`. Pass
     * `package_id` to order a specific Basic/Standard/Premium tier.
     */
    public function order(Request $request, Service $service, OrderService $orderService): JsonResponse
    {
        abort_unless($service->status === Service::STATUS_ACTIVE, 422, 'This service is not available.');
        abort_if($service->user_id === $request->user()->id, 422, 'You cannot order your own service.');

        $data = $request->validate([
            'package_id' => ['nullable', 'integer', 'exists:service_packages,id'],
            /** Brief for the freelancer: what exactly do you need? */
            'requirements' => ['nullable', 'string', 'max:5000'],
        ]);

        $package = isset($data['package_id'])
            ? ServicePackage::query()->where('service_id', $service->id)->findOrFail($data['package_id'])
            : null;

        $order = $orderService->createFromService($service, $package, $request->user(), $data['requirements'] ?? null);

        return new OrderResource($order->load(['client', 'freelancer']))->response()->setStatusCode(201);
    }

    private function authorizeOwner(Request $request, Service $service): void
    {
        abort_unless($service->user_id === $request->user()->id, 403, 'You do not own this service.');
    }
}
