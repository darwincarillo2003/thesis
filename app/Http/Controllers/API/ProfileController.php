<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Profile;

class ProfileController extends Controller
{
    /**
     * Return a list of profiles for user management.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 25);
        $search = trim((string) $request->query('search', ''));

        $query = Profile::query()
            ->select(['profile_id', 'user_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'profile_pic'])
            ->with(['user:user_id,email,role_id', 'user.role:role_id,role_name']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('middle_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('suffix', 'like', "%{$search}%");
            });
        }

        $profiles = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'profiles' => $profiles,
            ],
        ]);
    }

    /**
     * Upload profile picture for a user
     */
    public function uploadProfilePicture(Request $request, $profileId)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $profile = Profile::find($profileId);

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found'
            ], 404);
        }

        try {
            // Delete old profile picture if exists
            if ($profile->profile_pic) {
                $profile->deleteProfilePicture();
            }

            // Store new profile picture
            $file = $request->file('profile_picture');
            $fileName = 'profile_' . $profileId . '_' . time() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('profile_pictures', $fileName, 'public');

            // Update profile record
            $profile->update([
                'profile_pic' => $filePath
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Profile picture uploaded successfully',
                'data' => [
                    'profile_pic_url' => asset('storage/' . $filePath)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete profile picture for a user
     */
    public function deleteProfilePicture($profileId)
    {
        $profile = Profile::find($profileId);

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found'
            ], 404);
        }

        try {
            $profile->deleteProfilePicture();

            return response()->json([
                'success' => true,
                'message' => 'Profile picture deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete profile picture',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}





