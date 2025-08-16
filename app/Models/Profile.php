<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;
    
    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'profile_id';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'profile_pic',
    ];
    
    /**
     * Get the user that owns the profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the full name of the profile
     */
    public function getFullNameAttribute()
    {
        $name = trim($this->first_name . ' ' . $this->middle_name . ' ' . $this->last_name);
        return $this->suffix ? $name . ' ' . $this->suffix : $name;
    }

    /**
     * Get the profile picture URL
     */
    public function getProfilePictureUrlAttribute()
    {
        if ($this->profile_pic && file_exists(public_path('storage/' . $this->profile_pic))) {
            return asset('storage/' . $this->profile_pic);
        }
        
        // Return default image if no profile pic or file doesn't exist
        return asset('images/csp.png'); // Using your existing default image
    }

    /**
     * Check if profile has a custom profile picture
     */
    public function hasCustomProfilePicture()
    {
        return !empty($this->profile_pic) && file_exists(public_path('storage/' . $this->profile_pic));
    }

    /**
     * Delete the profile picture file
     */
    public function deleteProfilePicture()
    {
        if ($this->profile_pic && file_exists(public_path('storage/' . $this->profile_pic))) {
            unlink(public_path('storage/' . $this->profile_pic));
        }
        
        $this->update(['profile_pic' => null]);
    }
}
