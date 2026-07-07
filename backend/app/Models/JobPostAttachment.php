<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPostAttachment extends Model
{
    protected $fillable = ['job_post_id', 'file_path', 'file_name', 'mime_type', 'size_kb'];

    public function jobPost(): BelongsTo
    {
        return $this->belongsTo(JobPost::class);
    }
}
