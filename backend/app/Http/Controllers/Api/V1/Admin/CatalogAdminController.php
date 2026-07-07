<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\SkillResource;
use App\Models\Category;
use App\Models\Skill;
use App\Services\AuditLogger;
use Dedoc\Scramble\Attributes\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

#[Group('Admin — Categories & Skills')]
class CatalogAdminController extends Controller
{
    /**
     * List categories (admin)
     *
     * Full tree including inactive categories (FIT-CAT-04).
     */
    public function categories(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()->with('children')->whereNull('parent_id')->withCount(['jobPosts', 'services'])->orderBy('sort_order')->get(),
        );
    }

    /**
     * Create category
     *
     * Bilingual category or sub-category (pass `parent_id`) — FIT-CAT-01/02.
     */
    public function storeCategory(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'name_en' => ['required', 'string', 'max:100'],
            'name_fr' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $category = Category::query()->create([
            ...$data,
            'slug' => Str::slug($data['name_en']),
        ]);

        $audit->log($request->user(), 'category.create', $category);

        return new CategoryResource($category)->response()->setStatusCode(201);
    }

    /**
     * Update category
     *
     * Rename, re-parent, reorder or toggle active state.
     */
    public function updateCategory(Request $request, Category $category, AuditLogger $audit): CategoryResource
    {
        $data = $request->validate([
            'name_en' => ['sometimes', 'string', 'max:100'],
            'name_fr' => ['sometimes', 'string', 'max:100'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:50'],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id', Rule::notIn([$category->id])],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category->update($data);
        $audit->log($request->user(), 'category.update', $category, $data);

        return new CategoryResource($category->fresh());
    }

    /**
     * List skills (admin)
     */
    public function skills(Request $request): AnonymousResourceCollection
    {
        $request->validate(['category_id' => ['nullable', 'integer', 'exists:categories,id']]);

        return SkillResource::collection(
            Skill::query()
                ->when($request->integer('category_id'), fn ($query, $categoryId) => $query->where('category_id', $categoryId))
                ->orderBy('name')
                ->paginate(50),
        );
    }

    /**
     * Create skill
     */
    public function storeSkill(Request $request, AuditLogger $audit): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:skills,name'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $skill = Skill::query()->create([...$data, 'slug' => Str::slug($data['name'])]);

        $audit->log($request->user(), 'skill.create', $skill);

        return new SkillResource($skill)->response()->setStatusCode(201);
    }

    /**
     * Update skill
     */
    public function updateSkill(Request $request, Skill $skill, AuditLogger $audit): SkillResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100', Rule::unique('skills')->ignore($skill->id)],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $skill->update($data);
        $audit->log($request->user(), 'skill.update', $skill, $data);

        return new SkillResource($skill->fresh());
    }
}
