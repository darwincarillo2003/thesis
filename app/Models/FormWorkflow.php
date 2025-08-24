<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormWorkflow extends Model
{
    use HasFactory;

    protected $table = 'form_workflow';
    protected $primaryKey = 'workflow_id';

    protected $fillable = [
        'form_id',
        'role_name',
        'step_order',
        'is_required',
        'step_description',
        'conditions'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'step_order' => 'integer',
        'conditions' => 'array'
    ];

    /**
     * Get the form this workflow step belongs to
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class, 'form_id', 'form_id');
    }

    /**
     * Scope to order by step order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('step_order');
    }

    /**
     * Scope for required steps
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Check if conditions are met for this step
     */
    public function conditionsMet($submissionData = [])
    {
        if (empty($this->conditions)) {
            return true;
        }

        // Implement condition logic here
        // For example: amount-based conditions, field-based conditions
        foreach ($this->conditions as $condition) {
            switch ($condition['type']) {
                case 'amount_greater_than':
                    if (isset($submissionData['total_amount'])) {
                        if ($submissionData['total_amount'] <= $condition['value']) {
                            return false;
                        }
                    }
                    break;
                case 'field_equals':
                    if (isset($submissionData['form_data'][$condition['field']])) {
                        if ($submissionData['form_data'][$condition['field']] !== $condition['value']) {
                            return false;
                        }
                    }
                    break;
                // Add more condition types as needed
            }
        }

        return true;
    }
}








