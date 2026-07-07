<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\CityResource;
use App\Http\Resources\CountryResource;
use App\Http\Resources\SkillResource;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\PlatformSetting;
use App\Models\Skill;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

#[Group('Catalog & Meta')]
class MetaController extends Controller
{
    /**
     * List countries
     *
     * Active countries supported by the platform, with their currency.
     *
     * @unauthenticated
     */
    public function countries(): AnonymousResourceCollection
    {
        return CountryResource::collection(
            Country::query()->where('is_active', true)->orderBy('name')->get(),
        );
    }

    /**
     * List cities
     *
     * Active cities, optionally filtered by country (FIT-ONB-03).
     *
     * @unauthenticated
     */
    public function cities(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'country_id' => ['nullable', 'integer', 'exists:countries,id'],
        ]);

        return CityResource::collection(
            City::query()
                ->where('is_active', true)
                ->when($request->integer('country_id'), fn ($query, $countryId) => $query->where('country_id', $countryId))
                ->orderBy('name')
                ->get(),
        );
    }

    /**
     * List categories
     *
     * Active category tree (bilingual EN/FR labels) with job and service counts
     * (FIT-CAT-01, FIT-CAT-02).
     *
     * @unauthenticated
     */
    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->with(['children' => fn ($query) => $query->where('is_active', true)])
                ->withCount(['jobPosts', 'services'])
                ->orderBy('sort_order')
                ->get(),
        );
    }

    /**
     * List skills
     *
     * Active skills/tags for pickers and search filters (FIT-CAT-03).
     * Optionally filter by `category_id` or a `search` term.
     *
     * @unauthenticated
     */
    public function skills(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'search' => ['nullable', 'string', 'max:100'],
        ]);

        return SkillResource::collection(
            Skill::query()
                ->where('is_active', true)
                ->when($request->integer('category_id'), fn ($query, $categoryId) => $query->where('category_id', $categoryId))
                ->when($request->string('search')->toString(), fn ($query, $search) => $query->where('name', 'like', "%{$search}%"))
                ->orderBy('name')
                ->limit(100)
                ->get(),
        );
    }

    /**
     * Public platform settings
     *
     * Public configuration the apps need at boot: commission rate, connects
     * pricing, exchange rate and withdrawal minimums.
     *
     * @unauthenticated
     */
    public function settings(): JsonResponse
    {
        return response()->json([
            'commission_rate' => (float) PlatformSetting::get('commission_rate', 0.10),
            'default_connects_per_proposal' => (int) PlatformSetting::get('default_connects_per_proposal', 6),
            'free_connects_on_signup' => (int) PlatformSetting::get('free_connects_on_signup', 10),
            'referral_bonus_connects' => (int) PlatformSetting::get('referral_bonus_connects', 5),
            'xaf_per_usd' => (float) PlatformSetting::get('xaf_per_usd', 600),
            'min_withdrawal_amount' => (float) PlatformSetting::get('min_withdrawal_amount', 5000),
            'currency' => 'XAF',
            'languages' => ['en', 'fr'],
        ]);
    }
}
