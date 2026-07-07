<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\UserResource;
use App\Models\Favorite;
use App\Models\JobPost;
use App\Models\Service;
use App\Models\User;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

#[Group('Favorites')]
class FavoriteController extends Controller
{
    /** @var array<string, class-string> */
    private const TYPES = [
        'job' => JobPost::class,
        'service' => Service::class,
        'freelancer' => User::class,
    ];

    /**
     * My favorites
     *
     * Saved jobs, services and freelancers (FIT-SRC-05), grouped by type.
     */
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()->favorites()->with('favoritable')->latest()->get();

        return response()->json([
            'jobs' => JobPostResource::collection(
                $favorites->where('favoritable_type', (new JobPost)->getMorphClass())->pluck('favoritable')->filter(),
            ),
            'services' => ServiceResource::collection(
                $favorites->where('favoritable_type', (new Service)->getMorphClass())->pluck('favoritable')->filter(),
            ),
            'freelancers' => UserResource::collection(
                $favorites->where('favoritable_type', (new User)->getMorphClass())->pluck('favoritable')->filter(),
            ),
        ]);
    }

    /**
     * Save a favorite
     *
     * Bookmarks a job, service or freelancer. Idempotent — saving twice keeps
     * a single entry.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['job', 'service', 'freelancer'])],
            'id' => ['required', 'integer'],
        ]);

        $modelClass = self::TYPES[$data['type']];
        $model = $modelClass::query()->findOrFail($data['id']);

        $favorite = Favorite::query()->firstOrCreate([
            'user_id' => $request->user()->id,
            'favoritable_type' => $model->getMorphClass(),
            'favoritable_id' => $model->getKey(),
        ]);

        return response()->json(['message' => 'Saved.', 'favorite_id' => $favorite->id], $favorite->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Remove a favorite
     */
    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['job', 'service', 'freelancer'])],
            'id' => ['required', 'integer'],
        ]);

        $modelClass = self::TYPES[$data['type']];

        Favorite::query()
            ->where('user_id', $request->user()->id)
            ->where('favoritable_type', (new $modelClass)->getMorphClass())
            ->where('favoritable_id', $data['id'])
            ->delete();

        return response()->json(['message' => 'Removed.']);
    }
}
