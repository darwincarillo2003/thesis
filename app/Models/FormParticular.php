<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormParticular extends Model
{
    use HasFactory;

    protected $primaryKey = 'particular_id';

    protected $fillable = [
        'submission_id',
        'item_type',
        'description',
        'quantity',
        'unit_price',
        'amount',
        'account_code',
        'remarks',
        'additional_data',
        'line_order'
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
        'additional_data' => 'array',
        'line_order' => 'integer'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            // Auto-calculate amount if not provided
            if (empty($model->amount) && $model->quantity && $model->unit_price) {
                $model->amount = $model->quantity * $model->unit_price;
            }
        });
    }

    /**
     * Get the submission this particular belongs to
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(FormSubmission::class, 'submission_id', 'submission_id');
    }

    /**
     * Scope to order by line order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('line_order');
    }

    /**
     * Scope by item type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('item_type', $type);
    }

    /**
     * Calculate total for this line item
     */
    public function calculateAmount()
    {
        $this->amount = $this->quantity * $this->unit_price;
        return $this->amount;
    }
}






