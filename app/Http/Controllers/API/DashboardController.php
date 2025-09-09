<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Organization;
use App\Models\Role;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for admin
     */
    public function getStats(): JsonResponse
    {
        try {
            // Get total users count
            $totalUsers = User::count();
            
            // Get total organizations count
            $totalOrganizations = Organization::distinct('organization_id')->count();
            
            // Get total roles count
            $totalRoles = Role::count();
            
            // Get active users count (assuming users with recent activity or non-null email_verified_at)
            // You can adjust this logic based on how you define "active users"
            $activeUsers = User::whereNotNull('email_verified_at')->count();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => $totalUsers,
                    'total_organizations' => $totalOrganizations,
                    'total_roles' => $totalRoles,
                    'active_users' => $activeUsers,
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics'
            ], 500);
        }
    }

    /**
     * Get student organization dashboard statistics
     */
    public function getStudentOrgStats(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Get user's organization
            $userOrganization = null;
            if ($user->organizations && count($user->organizations) > 0) {
                $userOrganization = $user->organizations[0]->organization_name;
            } elseif ($user->organization_name) {
                $userOrganization = $user->organization_name;
            }

            // Get submissions for this user's organization
            $query = FormSubmission::with(['form', 'submitter'])
                ->where('submitted_by', $user->user_id);

            $totalReports = $query->count();
            $pendingReview = $query->whereIn('status', ['submitted', 'under_review'])->count();
            $approved = $query->where('status', 'approved')->count();
            $flagged = $query->where('status', 'rejected')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_reports' => $totalReports,
                    'pending_review' => $pendingReview,
                    'approved' => $approved,
                    'flagged' => $flagged,
                    'organization' => $userOrganization
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Student org dashboard stats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics'
            ], 500);
        }
    }

    /**
     * Get student organization dashboard submissions
     */
    public function getStudentOrgSubmissions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $page = $request->get('page', 1);
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');

            // Get submissions for this user
            $query = FormSubmission::with(['form', 'submitter'])
                ->where('submitted_by', $user->user_id);

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('submission_code', 'like', "%{$search}%")
                      ->orWhereHas('form', function ($formQuery) use ($search) {
                          $formQuery->where('form_title', 'like', "%{$search}%");
                      })
                      ->orWhere('status', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $allowedSortFields = ['created_at', 'status', 'submission_code', 'total_amount'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortDirection);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Paginate results
            $submissions = $query->paginate($perPage, ['*'], 'page', $page);

            // Format the submissions
            $formattedSubmissions = $submissions->map(function ($submission) {
                return [
                    'id' => $submission->submission_id,
                    'submission_code' => $submission->submission_code,
                    'organization' => $submission->submitter->organization_name ?? 
                                    ($submission->submitter->organizations[0]->organization_name ?? 'N/A'),
                    'submitted_by' => $submission->submitter->first_name . ' ' . $submission->submitter->last_name,
                    'form_title' => $submission->form->form_title ?? 'N/A',
                    'date' => $submission->created_at->format('Y-m-d'),
                    'formatted_date' => $submission->created_at->format('M d, Y'),
                    'status' => ucfirst($submission->status),
                    'total_amount' => $submission->total_amount,
                    'formatted_amount' => $submission->total_amount ? '₱' . number_format($submission->total_amount, 2) : 'N/A',
                    'can_edit' => $submission->isEditable(),
                    'can_submit' => $submission->canBeSubmitted()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'submissions' => $formattedSubmissions,
                    'pagination' => [
                        'current_page' => $submissions->currentPage(),
                        'last_page' => $submissions->lastPage(),
                        'per_page' => $submissions->perPage(),
                        'total' => $submissions->total(),
                        'from' => $submissions->firstItem(),
                        'to' => $submissions->lastItem()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Student org submissions error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch submissions'
            ], 500);
        }
    }

    /**
     * Delete a submission
     */
    public function deleteSubmission($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            $submission = FormSubmission::where('submission_id', $id)
                ->where('submitted_by', $user->user_id)
                ->first();

            if (!$submission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Submission not found or you do not have permission to delete it'
                ], 404);
            }

            // Only allow deletion of draft submissions
            if (!$submission->isEditable()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only draft or returned submissions can be deleted'
                ], 400);
            }

            // Delete related records first
            $submission->particulars()->delete();
            $submission->signatures()->delete();
            $submission->documents()->delete();
            
            // Delete the submission
            $submission->delete();

            return response()->json([
                'success' => true,
                'message' => 'Submission deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Delete submission error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete submission'
            ], 500);
        }
    }
}




