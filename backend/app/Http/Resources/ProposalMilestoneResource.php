<?php

namespace App\Http\Resources;

use App\Models\ProposalMilestone;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ProposalMilestone */
class ProposalMilestoneResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'amount' => (float) $this->amount,
            'due_label' => $this->due_label,
            'sort_order' => $this->sort_order,
        ];
    }
}
