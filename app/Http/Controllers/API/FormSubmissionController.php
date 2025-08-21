<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\FormParticular;
use App\Models\FormDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class FormSubmissionController extends Controller
{
    /**
     * Get paginated list of submissions
     */
    public function index(Request $request)
    {
        $perPage = min(50, (int) $request->query('per_page', 15));
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $formId = $request->query('form_id');

        $query = FormSubmission::query()
            ->with([
                'form:form_id,form_code,form_name',
                'submitter:user_id,email',
                'submitter.profile:user_id,first_name,last_name',
                'currentApprover:user_id,email',
                'currentApprover.profile:user_id,first_name,last_name'
            ])
            ->withCount(['particulars', 'documents']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('submission_code', 'like', "%{$search}%")
                  ->orWhereHas('form', function ($query) use ($search) {
                      $query->where('form_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('submitter.profile', function ($query) use ($search) {
                      $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status) {
            $query->status($status);
        }

        if ($formId) {
            $query->where('form_id', $formId);
        }

        // User-specific filtering
        $user = auth()->user();
        if ($user->role->role_name !== 'Admin') {
            if ($request->query('my_submissions') === 'true') {
                $query->byUser($user->user_id);
            } else {
                // Show pending approvals for this user
                $query->pendingApproval($user->user_id);
            }
        }

        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        
        if (in_array($sortField, ['submission_code', 'status', 'submitted_at', 'created_at', 'total_amount'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        $submissions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'submissions' => $submissions,
            ],
        ]);
    }

    /**
     * Store a new submission (save as draft)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_id' => 'required|exists:forms,form_id',
            'form_data' => 'required|array',
            'particulars' => 'array',
            'particulars.*.description' => 'required|string',
            'particulars.*.quantity' => 'numeric|min:0',
            'particulars.*.unit_price' => 'numeric|min:0',
            'particulars.*.amount' => 'numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $form = Form::with('activeFields')->find($request->form_id);

        if (!$form || !$form->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Form not available'
            ], 404);
        }

        DB::beginTransaction();
        
        try {
            // Create submission
            $submission = FormSubmission::create([
                'form_id' => $request->form_id,
                'submitted_by' => auth()->id(),
                'status' => 'draft',
                'form_data' => $request->form_data
            ]);

            // Add particulars if provided
            if ($request->particulars) {
                foreach ($request->particulars as $index => $particular) {
                    FormParticular::create([
                        'submission_id' => $submission->submission_id,
                        'item_type' => $particular['type'] ?? 'item',
                        'description' => $particular['description'],
                        'quantity' => $particular['quantity'] ?? 1,
                        'unit_price' => $particular['unit_price'] ?? 0,
                        'amount' => $particular['amount'] ?? ($particular['quantity'] * $particular['unit_price']),
                        'account_code' => $particular['account_code'] ?? null,
                        'remarks' => $particular['remarks'] ?? null,
                        'line_order' => $index
                    ]);
                }

                // Calculate total
                $submission->calculateTotal();
            }

            DB::commit();

            $submission->load(['form', 'particulars']);

            return response()->json([
                'success' => true,
                'message' => 'Submission saved as draft',
                'data' => ['submission' => $submission]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific submission
     */
    public function show($id)
    {
        $submission = FormSubmission::with([
            'form.fields.ordered',
            'submitter.profile',
            'particulars.ordered',
            'documents',
            'signatures.user.profile',
            'currentApprover.profile'
        ])->find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        // Check access rights
        $user = auth()->user();
        if ($user->role->role_name !== 'Admin' && 
            $submission->submitted_by !== $user->user_id && 
            $submission->current_approver_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => ['submission' => $submission]
        ]);
    }

    /**
     * Update a submission (only drafts and returned submissions)
     */
    public function update(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        // Check if user can edit
        if ($submission->submitted_by !== auth()->id() || !$submission->isEditable()) {
            return response()->json([
                'success' => false,
                'message' => 'Submission cannot be edited'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'form_data' => 'required|array',
            'particulars' => 'array',
            'particulars.*.description' => 'required|string',
            'particulars.*.quantity' => 'numeric|min:0',
            'particulars.*.unit_price' => 'numeric|min:0',
            'particulars.*.amount' => 'numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            // Update submission
            $submission->update([
                'form_data' => $request->form_data,
                'status' => 'draft' // Reset to draft if it was returned
            ]);

            // Update particulars
            if ($request->has('particulars')) {
                // Delete existing particulars
                $submission->particulars()->delete();

                // Add new particulars
                foreach ($request->particulars as $index => $particular) {
                    FormParticular::create([
                        'submission_id' => $submission->submission_id,
                        'item_type' => $particular['type'] ?? 'item',
                        'description' => $particular['description'],
                        'quantity' => $particular['quantity'] ?? 1,
                        'unit_price' => $particular['unit_price'] ?? 0,
                        'amount' => $particular['amount'] ?? ($particular['quantity'] * $particular['unit_price']),
                        'account_code' => $particular['account_code'] ?? null,
                        'remarks' => $particular['remarks'] ?? null,
                        'line_order' => $index
                    ]);
                }

                // Recalculate total
                $submission->calculateTotal();
            }

            DB::commit();

            $submission->load(['form', 'particulars']);

            return response()->json([
                'success' => true,
                'message' => 'Submission updated successfully',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit a form (move from draft to submitted)
     */
    public function submit($id)
    {
        $submission = FormSubmission::with('form.workflow')->find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        if ($submission->submitted_by !== auth()->id() || !$submission->canBeSubmitted()) {
            return response()->json([
                'success' => false,
                'message' => 'Submission cannot be submitted'
            ], 403);
        }

        try {
            $submission->submit();

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a submission
     */
    public function approve(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        $user = auth()->user();

        if ($submission->current_approver_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to approve this submission'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comments' => 'nullable|string',
            'signature_data' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $submission->approve($user, $request->comments, $request->signature_data);

            return response()->json([
                'success' => true,
                'message' => 'Submission approved successfully',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a submission
     */
    public function reject(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        $user = auth()->user();

        if ($submission->current_approver_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to reject this submission'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comments' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $submission->reject($user, $request->comments);

            return response()->json([
                'success' => true,
                'message' => 'Submission rejected',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return submission for revision
     */
    public function returnForRevision(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        $user = auth()->user();

        if ($submission->current_approver_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to return this submission'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comments' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $submission->returnForRevision($user, $request->comments);

            return response()->json([
                'success' => true,
                'message' => 'Submission returned for revision',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to return submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload documents for a submission
     */
    public function uploadDocument(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'document' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
            'document_type' => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('document');
            $originalName = $file->getClientOriginalName();
            $fileName = time() . '_' . $originalName;
            $filePath = $file->storeAs('form_documents/' . $submission->submission_id, $fileName);

            FormDocument::create([
                'submission_id' => $submission->submission_id,
                'original_name' => $originalName,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'document_type' => $request->document_type ?? 'supporting',
                'description' => $request->description,
                'uploaded_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a submission (only drafts)
     */
    public function destroy($id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Submission not found'
            ], 404);
        }

        if ($submission->submitted_by !== auth()->id() || $submission->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Submission cannot be deleted'
            ], 403);
        }

        try {
            $submission->delete();

            return response()->json([
                'success' => true,
                'message' => 'Submission deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete submission',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}






