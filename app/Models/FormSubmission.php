<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class FormSubmission extends Model
{
    use HasFactory;

    protected $primaryKey = 'submission_id';

    protected $fillable = [
        'form_id',
        'submission_code',
        'submitted_by',
        'status',
        'form_data',
        'total_amount',
        'remarks',
        'submitted_at',
        'completed_at',
        'current_approver_id',
        'workflow_step'
    ];

    protected $casts = [
        'form_data' => 'array',
        'total_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'completed_at' => 'datetime',
        'workflow_step' => 'integer'
    ];

    /**
     * Submission statuses
     */
    public static $statuses = [
        'draft' => 'Draft',
        'submitted' => 'Submitted',
        'under_review' => 'Under Review',
        'approved' => 'Approved', 
        'rejected' => 'Rejected',
        'returned' => 'Returned'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->submission_code)) {
                $model->submission_code = static::generateSubmissionCode();
            }
        });
    }

    /**
     * Generate unique submission code
     */
    public static function generateSubmissionCode()
    {
        do {
            $code = 'SUB' . date('Y') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (static::where('submission_code', $code)->exists());

        return $code;
    }

    /**
     * Get the form this submission belongs to
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class, 'form_id', 'form_id');
    }

    /**
     * Get the user who submitted the form
     */
    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by', 'user_id');
    }

    /**
     * Get the current approver
     */
    public function currentApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_approver_id', 'user_id');
    }

    /**
     * Get all particulars/line items for this submission
     */
    public function particulars(): HasMany
    {
        return $this->hasMany(FormParticular::class, 'submission_id', 'submission_id')
                    ->orderBy('line_order');
    }

    /**
     * Get all signatures for this submission
     */
    public function signatures(): HasMany
    {
        return $this->hasMany(FormSignature::class, 'submission_id', 'submission_id')
                    ->orderBy('workflow_step');
    }

    /**
     * Get all documents for this submission
     */
    public function documents(): HasMany
    {
        return $this->hasMany(FormDocument::class, 'submission_id', 'submission_id');
    }

    /**
     * Get supporting documents only
     */
    public function supportingDocuments(): HasMany
    {
        return $this->documents()->where('document_type', 'supporting');
    }

    /**
     * Check if submission is editable
     */
    public function isEditable()
    {
        return in_array($this->status, ['draft', 'returned']);
    }

    /**
     * Check if submission can be submitted
     */
    public function canBeSubmitted()
    {
        return $this->status === 'draft';
    }

    /**
     * Check if submission is pending approval
     */
    public function isPendingApproval()
    {
        return in_array($this->status, ['submitted', 'under_review']);
    }

    /**
     * Check if submission is completed
     */
    public function isCompleted()
    {
        return in_array($this->status, ['approved', 'rejected']);
    }

    /**
     * Submit the form
     */
    public function submit()
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
            'workflow_step' => 1
        ]);

        // Set the first approver based on workflow
        $this->setNextApprover();
    }

    /**
     * Set the next approver based on workflow
     */
    public function setNextApprover()
    {
        $workflow = $this->form->workflow()
                        ->where('step_order', $this->workflow_step)
                        ->first();

        if ($workflow) {
            // Find user with the required role
            $approver = User::whereHas('role', function ($query) use ($workflow) {
                $query->where('role_name', $workflow->role_name);
            })->first();

            if ($approver) {
                $this->update([
                    'current_approver_id' => $approver->user_id,
                    'status' => 'under_review'
                ]);
            }
        }
    }

    /**
     * Approve the submission
     */
    public function approve($approver, $comments = null, $signatureData = null)
    {
        // Create signature record
        FormSignature::create([
            'submission_id' => $this->submission_id,
            'user_id' => $approver->user_id,
            'role_name' => $approver->role->role_name,
            'workflow_step' => $this->workflow_step,
            'action' => 'approved',
            'comments' => $comments,
            'signature_data' => $signatureData,
            'signed_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        // Check if there are more workflow steps
        $nextStep = $this->workflow_step + 1;
        $nextWorkflow = $this->form->workflow()
                           ->where('step_order', $nextStep)
                           ->first();

        if ($nextWorkflow) {
            // Move to next step
            $this->update([
                'workflow_step' => $nextStep
            ]);
            $this->setNextApprover();
        } else {
            // Final approval
            $this->update([
                'status' => 'approved',
                'completed_at' => now(),
                'current_approver_id' => null
            ]);
        }
    }

    /**
     * Reject the submission
     */
    public function reject($approver, $comments = null)
    {
        FormSignature::create([
            'submission_id' => $this->submission_id,
            'user_id' => $approver->user_id,
            'role_name' => $approver->role->role_name,
            'workflow_step' => $this->workflow_step,
            'action' => 'rejected',
            'comments' => $comments,
            'signed_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $this->update([
            'status' => 'rejected',
            'completed_at' => now(),
            'current_approver_id' => null
        ]);
    }

    /**
     * Return the submission for revision
     */
    public function returnForRevision($approver, $comments)
    {
        FormSignature::create([
            'submission_id' => $this->submission_id,
            'user_id' => $approver->user_id,
            'role_name' => $approver->role->role_name,
            'workflow_step' => $this->workflow_step,
            'action' => 'returned',
            'comments' => $comments,
            'signed_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);

        $this->update([
            'status' => 'returned',
            'current_approver_id' => null,
            'workflow_step' => 0
        ]);
    }

    /**
     * Calculate total amount from particulars
     */
    public function calculateTotal()
    {
        $total = $this->particulars()->sum('amount');
        $this->update(['total_amount' => $total]);
        return $total;
    }

    /**
     * Scope for status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for user submissions
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('submitted_by', $userId);
    }

    /**
     * Scope for pending approver
     */
    public function scopePendingApproval($query, $approverId)
    {
        return $query->where('current_approver_id', $approverId)
                    ->whereIn('status', ['submitted', 'under_review']);
    }
}






