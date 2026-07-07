<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Country;
use Illuminate\Database\Seeder;

class GeoSeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['name' => 'Cameroon', 'code' => 'CM', 'currency_code' => 'XAF', 'phone_code' => '+237', 'cities' => [
                ['name' => 'Douala', 'region' => 'Littoral'],
                ['name' => 'Yaoundé', 'region' => 'Centre'],
                ['name' => 'Bafoussam', 'region' => 'Ouest'],
                ['name' => 'Bamenda', 'region' => 'Nord-Ouest'],
                ['name' => 'Buea', 'region' => 'Sud-Ouest'],
                ['name' => 'Limbe', 'region' => 'Sud-Ouest'],
                ['name' => 'Garoua', 'region' => 'Nord'],
                ['name' => 'Maroua', 'region' => 'Extrême-Nord'],
                ['name' => 'Ngaoundéré', 'region' => 'Adamaoua'],
                ['name' => 'Bertoua', 'region' => 'Est'],
                ['name' => 'Ebolowa', 'region' => 'Sud'],
                ['name' => 'Kribi', 'region' => 'Sud'],
            ]],
            ['name' => 'Ghana', 'code' => 'GH', 'currency_code' => 'GHS', 'phone_code' => '+233', 'cities' => [
                ['name' => 'Accra', 'region' => 'Greater Accra'],
            ]],
            ['name' => 'Kenya', 'code' => 'KE', 'currency_code' => 'KES', 'phone_code' => '+254', 'cities' => [
                ['name' => 'Nairobi', 'region' => 'Nairobi County'],
            ]],
            ['name' => 'Nigeria', 'code' => 'NG', 'currency_code' => 'NGN', 'phone_code' => '+234', 'cities' => [
                ['name' => 'Lagos', 'region' => 'Lagos State'],
            ]],
            ['name' => 'Senegal', 'code' => 'SN', 'currency_code' => 'XOF', 'phone_code' => '+221', 'cities' => [
                ['name' => 'Dakar', 'region' => 'Dakar'],
            ]],
        ];

        foreach ($countries as $countryData) {
            $country = Country::query()->updateOrCreate(
                ['code' => $countryData['code']],
                collect($countryData)->except('cities')->all(),
            );

            foreach ($countryData['cities'] as $city) {
                City::query()->updateOrCreate(
                    ['country_id' => $country->id, 'name' => $city['name']],
                    $city,
                );
            }
        }
    }
}
