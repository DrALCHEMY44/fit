<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CityResource;
use App\Http\Resources\CountryResource;
use App\Models\City;
use App\Models\Country;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

#[Group('Admin — Countries & Cities')]
class GeoAdminController extends Controller
{
    /**
     * List countries (admin)
     *
     * Includes inactive countries (admin "Supported Countries" module).
     */
    public function countries(): AnonymousResourceCollection
    {
        return CountryResource::collection(Country::query()->orderBy('name')->get());
    }

    /**
     * Create country
     */
    public function storeCountry(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'size:2', 'unique:countries,code'],
            'currency_code' => ['required', 'string', 'max:5'],
            'phone_code' => ['nullable', 'string', 'max:8'],
        ]);

        $country = Country::query()->create([...$data, 'code' => strtoupper($data['code'])]);
        $audit->log($request->user(), 'country.create', $country);

        return new CountryResource($country)->response()->setStatusCode(201);
    }

    /**
     * Update country
     */
    public function updateCountry(Request $request, Country $country, AuditLogger $audit): CountryResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'currency_code' => ['sometimes', 'string', 'max:5'],
            'phone_code' => ['sometimes', 'nullable', 'string', 'max:8'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $country->update($data);
        $audit->log($request->user(), 'country.update', $country, $data);

        return new CountryResource($country->fresh());
    }

    /**
     * Create city
     */
    public function storeCity(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'country_id' => ['required', 'integer', 'exists:countries,id'],
            'name' => ['required', 'string', 'max:100'],
            'region' => ['nullable', 'string', 'max:100'],
        ]);

        $city = City::query()->create($data);
        $audit->log($request->user(), 'city.create', $city);

        return new CityResource($city)->response()->setStatusCode(201);
    }

    /**
     * Update city
     */
    public function updateCity(Request $request, City $city, AuditLogger $audit): CityResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'region' => ['sometimes', 'nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $city->update($data);
        $audit->log($request->user(), 'city.update', $city, $data);

        return new CityResource($city->fresh());
    }
}
