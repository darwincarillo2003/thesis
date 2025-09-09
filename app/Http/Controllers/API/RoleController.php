<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    /**
     * Display a listing of roles with user counts.
     */
    public function index(): JsonResponse
    {
        try {
            $roles = Role::withCount('users')
                ->orderBy('role_name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $roles,
                'message' => 'Roles retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching roles: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch roles'
            ], 500);
        }
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'role_name' => 'required|string|max:255|unique:roles,role_name',
                'description' => 'required|string|max:1000'
            ]);

            $role = Role::create($validated);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating role: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create role'
            ], 500);
        }
    }

    /**
     * Display the specified role.
     */
    public function show($id): JsonResponse
    {
        try {
            $role = Role::withCount('users')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $role,
                'message' => 'Role retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found'
            ], 404);
        }
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $role = Role::findOrFail($id);

            $validated = $request->validate([
                'role_name' => 'required|string|max:255|unique:roles,role_name,' . $id . ',role_id',
                'description' => 'required|string|max:1000'
            ]);

            $role->update($validated);

            return response()->json([
                'success' => true,
                'data' => $role->fresh(['users']),
                'message' => 'Role updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating role: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update role'
            ], 500);
        }
    }

    /**
     * Remove the specified role.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $role = Role::findOrFail($id);
            
            // Check if role has users assigned
            if ($role->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete role that has users assigned to it'
                ], 400);
            }

            $role->delete();

            return response()->json([
                'success' => true,
                'message' => 'Role deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting role: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete role'
            ], 500);
        }
    }
}




