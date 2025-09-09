<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $primaryKey = 'organization_id';

    protected $fillable = [
        'organization_name',
        'description'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the users belonging to this organization
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_organizations', 'organization_id', 'user_id');
    }
}
