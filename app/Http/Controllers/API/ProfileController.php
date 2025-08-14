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
            ->select(['profile_id', 'user_id', 'first_name', 'middle_name', 'last_name', 'suffix'])
            ->with(['user:user_id,email,role_id']);

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
}




