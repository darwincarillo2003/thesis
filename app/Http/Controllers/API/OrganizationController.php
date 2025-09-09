<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class OrganizationController extends Controller
{
    /**
     * Display a listing of organizations with user counts.
     */
    public function index(): JsonResponse
    {
        try {
            // Get organizations with all fields and proper user counts
            $organizations = Organization::select('organization_id', 'organization_name', 'description', 'created_at', 'updated_at')
                ->orderBy('organization_name')
                ->get()
                ->unique('organization_id') // Remove duplicates by ID
                ->values(); // Re-index array

            // Add real user counts by querying the pivot table directly
            $organizations->each(function($org) {
                $org->users_count = \DB::table('user_organizations')
                    ->where('organization_id', $org->organization_id)
                    ->count();
            });

            return response()->json([
                'success' => true,
                'data' => $organizations,
                'message' => 'Organizations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('OrganizationController Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch organizations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created organization.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'organization_name' => 'required|string|max:255|unique:organizations,organization_name',
                'description' => 'required|string|max:1000'
            ]);

            // Double-check for duplicates before creating
            $existing = Organization::where('organization_name', $validated['organization_name'])->first();
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Organization with this name already exists',
                    'errors' => ['organization_name' => ['Organization name already exists']]
                ], 422);
            }

            $organization = Organization::create($validated);

            return response()->json([
                'success' => true,
                'data' => $organization,
                'message' => 'Organization created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error creating organization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create organization'
            ], 500);
        }
    }

    /**
     * Display the specified organization.
     */
    public function show($id): JsonResponse
    {
        try {
            $organization = Organization::withCount('users')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $organization,
                'message' => 'Organization retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Organization not found'
            ], 404);
        }
    }

    /**
     * Update the specified organization.
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $organization = Organization::findOrFail($id);

            $validated = $request->validate([
                'organization_name' => 'required|string|max:255|unique:organizations,organization_name,' . $id . ',organization_id',
                'description' => 'required|string|max:1000'
            ]);

            $organization->update($validated);

            return response()->json([
                'success' => true,
                'data' => $organization->fresh(['users']),
                'message' => 'Organization updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating organization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update organization'
            ], 500);
        }
    }

    /**
     * Remove the specified organization.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $organization = Organization::findOrFail($id);
            
            // Check if organization has users assigned
            if ($organization->users()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete organization that has users assigned to it'
                ], 400);
            }

            $organization->delete();

            return response()->json([
                'success' => true,
                'message' => 'Organization deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error deleting organization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete organization'
            ], 500);
        }
    }
}
