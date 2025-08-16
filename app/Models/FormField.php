<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormField extends Model
{
    use HasFactory;

    protected $primaryKey = 'field_id';

    protected $fillable = [
        'form_id',
        'field_name',
        'field_label',
        'field_type',
        'is_required',
        'field_order',
        'field_options',
        'validation_rules',
        'placeholder',
        'help_text',
        'is_active'
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'field_options' => 'array',
        'validation_rules' => 'array',
        'field_order' => 'integer'
    ];

    /**
     * Field types that are allowed
     */
    public static $fieldTypes = [
        'text', 'number', 'date', 'textarea', 'select', 
        'checkbox', 'radio', 'file', 'signature', 'table', 'calculation'
    ];

    /**
     * Get the form this field belongs to
     */
    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class, 'form_id', 'form_id');
    }

    /**
     * Scope to get only active fields
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by field order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('field_order');
    }

    /**
     * Get validation rules as Laravel format
     */
    public function getLaravelValidationRules()
    {
        $rules = [];
        
        if ($this->is_required) {
            $rules[] = 'required';
        } else {
            $rules[] = 'nullable';
        }

        switch ($this->field_type) {
            case 'text':
                $rules[] = 'string';
                if (isset($this->validation_rules['max_length'])) {
                    $rules[] = 'max:' . $this->validation_rules['max_length'];
                }
                break;
            case 'number':
                $rules[] = 'numeric';
                if (isset($this->validation_rules['min'])) {
                    $rules[] = 'min:' . $this->validation_rules['min'];
                }
                if (isset($this->validation_rules['max'])) {
                    $rules[] = 'max:' . $this->validation_rules['max'];
                }
                break;
            case 'date':
                $rules[] = 'date';
                break;
            case 'textarea':
                $rules[] = 'string';
                break;
            case 'select':
            case 'radio':
                if (isset($this->field_options['options'])) {
                    $rules[] = 'in:' . implode(',', $this->field_options['options']);
                }
                break;
            case 'checkbox':
                $rules[] = 'boolean';
                break;
            case 'file':
                $rules[] = 'file';
                if (isset($this->validation_rules['max_size'])) {
                    $rules[] = 'max:' . $this->validation_rules['max_size'];
                }
                if (isset($this->validation_rules['mimes'])) {
                    $rules[] = 'mimes:' . implode(',', $this->validation_rules['mimes']);
                }
                break;
        }

        return implode('|', $rules);
    }

    /**
     * Check if field is a file upload field
     */
    public function isFileField()
    {
        return in_array($this->field_type, ['file', 'signature']);
    }

    /**
     * Check if field supports multiple values
     */
    public function isMultipleField()
    {
        return in_array($this->field_type, ['checkbox', 'table']);
    }
}
