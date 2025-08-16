<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Form extends Model
{
    use HasFactory;

    protected $primaryKey = 'form_id';

    protected $fillable = [
        'form_code',
        'form_name', 
        'description',
        'is_active',
        'settings',
        'created_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'settings' => 'array'
    ];

    /**
     * Get the user who created the form
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    /**
     * Get all fields for this form
     */
    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class, 'form_id', 'form_id')
                    ->orderBy('field_order');
    }

    /**
     * Get active fields for this form
     */
    public function activeFields(): HasMany
    {
        return $this->fields()->where('is_active', true);
    }

    /**
     * Get all submissions for this form
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class, 'form_id', 'form_id');
    }

    /**
     * Get workflow steps for this form
     */
    public function workflow(): HasMany
    {
        return $this->hasMany(FormWorkflow::class, 'form_id', 'form_id')
                    ->orderBy('step_order');
    }

    /**
     * Get submissions count
     */
    public function getSubmissionsCountAttribute()
    {
        return $this->submissions()->count();
    }

    /**
     * Get fields count
     */
    public function getFieldsCountAttribute()
    {
        return $this->fields()->count();
    }

    /**
     * Scope to get only active forms
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to search forms
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('form_code', 'like', "%{$search}%")
              ->orWhere('form_name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }
}
