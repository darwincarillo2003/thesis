<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'time',
        'location',
        'priority',
        'status',
        'target_organizations',
        'created_by'
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'target_organizations' => 'array', // ✅ Always array
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Ensure `target_organizations` is always an array when retrieved
     */
    public function getTargetOrganizationsAttribute($value)
    {
        if (is_string($value)) {
            return json_decode($value, true) ?: [];
        }
        return $value ?: [];
    }

    /**
     * Ensure `target_organizations` is always stored as JSON
     */
    public function setTargetOrganizationsAttribute($value)
    {
        $this->attributes['target_organizations'] = json_encode(array_values((array) $value));
    }

    /**
     * Get the user who created this event
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'user_id');
    }

    /**
     * Scope to filter events by user organizations
     */
    public function scopeForUserOrganizations($query, $user)
    {
        if (!$user) {
            \Log::info('Event scope - No user provided, returning empty');
            return $query->whereRaw('1 = 0');
        }

        \Log::info('Event scope - User info:', [
            'user_id' => $user->user_id,
            'role_id' => $user->role_id,
            'email' => $user->email
        ]);

        // Load role and organizations if not already loaded
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }
        if (!$user->relationLoaded('organizations')) {
            $user->load('organizations');
        }

        \Log::info('Event scope - User role:', [
            'role' => $user->role ? $user->role->role_name : 'No role',
            'role_id' => $user->role_id
        ]);

        // COA or Admin can see all events
        if ($user->role && in_array($user->role->role_name, ['admin', 'coa'])) {
            \Log::info('Event scope - Admin/COA user, returning all events');
            return $query;
        }

        $userOrganizations = $user->organizations->pluck('organization_name')->toArray();
        
        \Log::info('Event scope - User organizations:', [
            'user_id' => $user->user_id,
            'organizations' => $userOrganizations
        ]);

        // If user has no organizations, return no events
        if (empty($userOrganizations)) {
            \Log::info('Event scope - No organizations found for user, returning empty');
            return $query->whereRaw('1 = 0');
        }

        return $query->where(function ($q) use ($userOrganizations) {
            // Check for "All Organizations" target
            $q->whereJsonContains('target_organizations', 'All Organizations');
            
            // Or check if any of the user's organizations match
            foreach ($userOrganizations as $org) {
                $q->orWhereJsonContains('target_organizations', $org);
            }
        });
    }

    public function scopeUpcoming($query, $days = 30)
    {
        $futureDate = now()->addDays($days);
        $today = now()->toDateString();
        
        \Log::info('Event scope - Upcoming filter:', [
            'today' => $today,
            'future_date' => $futureDate->toDateString(),
            'days' => $days
        ]);
        
        return $query->where('date', '>=', $today)
                     ->where('date', '<=', $futureDate->toDateString())
                     ->where('status', 'scheduled')
                     ->orderBy('date', 'desc')
                     ->orderBy('time', 'desc');
    }

    public function scopeOnDate($query, $date)
    {
        return $query->where('date', $date);
    }
}
