<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSignature extends Model
{
    use HasFactory;

    protected $primaryKey = 'signature_id';

    protected $fillable = [
        'submission_id',
        'user_id',
        'role_name',
        'workflow_step',
        'action',
        'comments',
        'signature_data',
        'signed_at',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'workflow_step' => 'integer',
        'signed_at' => 'datetime'
    ];

    /**
     * Available actions
     */
    public static $actions = [
        'approved' => 'Approved',
        'rejected' => 'Rejected', 
        'returned' => 'Returned',
        'noted' => 'Noted'
    ];

    /**
     * Get the submission this signature belongs to
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'submission_id', 'submission_id');
    }

    /**
     * Get the user who signed
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Scope by action
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope by workflow step
     */
    public function scopeByStep($query, $step)
    {
        return $query->where('workflow_step', $step);
    }

    /**
     * Check if signature has image data
     */
    public function hasSignatureImage()
    {
        return !empty($this->signature_data);
    }

    /**
     * Get signature image URL (if stored as base64)
     */
    public function getSignatureImageUrl()
    {
        if ($this->hasSignatureImage()) {
            return 'data:image/png;base64,' . $this->signature_data;
        }
        return null;
    }
}














