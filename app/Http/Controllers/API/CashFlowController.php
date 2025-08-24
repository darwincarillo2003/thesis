<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\FormParticular;
use App\Models\FormDocument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class CashFlowController extends Controller
{
    /**
     * Get the Cash Flow Statement form structure
     */
    public function getForm()
    {
        $form = Form::with(['fields.ordered', 'workflow.ordered'])
                    ->where('form_code', 'FORM-08')
                    ->where('is_active', true)
                    ->first();

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Cash Flow Statement form not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => ['form' => $form]
        ]);
    }

    /**
     * Store a new cash flow statement submission
     */
    public function store(Request $request)
    {
        // Handle JSON strings from FormData
        $requestData = $request->all();
        
        // Log the incoming request for debugging
        \Log::info('Cash Flow Store Request', [
            'user_id' => auth()->id(),
            'user_role' => auth()->user() ? auth()->user()->role->role_name : 'none',
            'request_method' => $request->method(),
            'request_data' => $requestData,
            'attached_forms' => $requestData['attached_forms'] ?? 'not provided'
        ]);
        
        // Decode JSON strings if they exist (for FormData requests)
        foreach (['cash_inflows', 'cash_outflows', 'ending_cash_balance', 'signatories', 'attached_forms', 'completed_forms'] as $field) {
            if (isset($requestData[$field]) && is_string($requestData[$field])) {
                $decoded = json_decode($requestData[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $requestData[$field] = $decoded;
                }
            }
        }
        
        // Create a new request instance with decoded data for validation
        $request->merge($requestData);
        
        $validator = Validator::make($requestData, [
            'organization_name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:20',
            'month' => 'required|string',
            'cash_inflows' => 'required|array',
            'cash_inflows.beginningCashInBank' => 'nullable|array',
            'cash_inflows.beginningCashOnHand' => 'nullable|array',
            'cash_inflows.cashReceiptSources' => 'nullable|array',
            'cash_outflows' => 'required|array',
            'cash_outflows.organizationAllocations' => 'nullable|array',
            'cash_outflows.otherDisbursements' => 'nullable|array',
            'cash_outflows.contingencyFund' => 'nullable|array',
            'ending_cash_balance' => 'required|array',
            'ending_cash_balance.cashInBank' => 'nullable|string',
            'ending_cash_balance.cashOnHand' => 'nullable|string',
            'signatories' => 'required|array',
            'attached_forms' => 'nullable|array',
            'completed_forms' => 'nullable|array',
            'supporting_documents' => 'nullable|array',
            'supporting_documents.*' => 'file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx'
        ]);

        if ($validator->fails()) {
            // Log validation errors for debugging
            \Log::error('Cash Flow Validation Failed', [
                'errors' => $validator->errors(),
                'request_data' => $requestData
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get the Cash Flow Statement form
        $form = Form::where('form_code', 'FORM-08')->where('is_active', true)->first();
        
        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Cash Flow Statement form not available'
            ], 404);
        }

        // Check if user has treasurer role
        $user = auth()->user();
        if ($user->role->role_name !== 'treasurer' && $user->role->role_name !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only treasurers can submit cash flow statements'
            ], 403);
        }

        DB::beginTransaction();
        
        try {
            // Calculate totals
            $totals = $this->calculateCashFlowTotals($requestData);

            // Create submission
            $submission = FormSubmission::create([
                'form_id' => $form->form_id,
                'submitted_by' => $user->user_id,
                'status' => 'draft',
                'form_data' => [
                    'organization_name' => $requestData['organization_name'],
                    'academic_year' => $requestData['academic_year'],
                    'month' => $requestData['month'],
                    'cash_inflows' => $requestData['cash_inflows'],
                    'cash_outflows' => $requestData['cash_outflows'],
                    'ending_cash_balance' => $requestData['ending_cash_balance'],
                    'signatories' => $requestData['signatories'],
                    'attached_forms' => $requestData['attached_forms'] ?? [],
                    'completed_forms' => $requestData['completed_forms'] ?? [],
                    'calculated_totals' => $totals
                ],
                'total_amount' => $totals['net_cash_flow']
            ]);

            // Create particulars for all cash flow items (for tracking)
            $this->createCashFlowParticulars($submission, $requestData);

            // Handle file uploads
            \Log::info('Checking for supporting documents', [
                'hasFile' => $request->hasFile('supporting_documents'),
                'allFiles' => $request->allFiles(),
                'request_keys' => array_keys($request->all())
            ]);
            
            if ($request->hasFile('supporting_documents')) {
                \Log::info('Found supporting documents files', [
                    'count' => count($request->file('supporting_documents'))
                ]);
                $this->uploadSupportingDocuments($submission, $request->file('supporting_documents'));
            } else {
                \Log::info('No supporting documents found in request');
            }

            DB::commit();

            $submission->load(['form', 'particulars', 'documents']);

            return response()->json([
                'success' => true,
                'message' => 'Cash flow statement saved as draft',
                'data' => ['submission' => $submission]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save cash flow statement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit cash flow statement for approval
     */
    public function submit($id)
    {
        $submission = FormSubmission::with('form.workflow')->find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Cash flow statement not found'
            ], 404);
        }

        $user = auth()->user();
        
        // Check if user owns this submission
        if ($submission->submitted_by !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only submit your own cash flow statements'
            ], 403);
        }

        // Check if it can be submitted
        if (!$submission->canBeSubmitted()) {
            return response()->json([
                'success' => false,
                'message' => 'Cash flow statement cannot be submitted'
            ], 403);
        }

        try {
            // Submit to workflow (starts with step 1, which should be treasurer confirmation)
            $submission->submit();
            
            \Log::info('Cash Flow Submitted', [
                'submission_id' => $submission->submission_id,
                'workflow_step' => $submission->workflow_step,
                'status' => $submission->status,
                'current_approver_id' => $submission->current_approver_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cash flow statement submitted successfully and sent to COA for review',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit cash flow statement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get cash flow statements for COA review
     */
    public function getForCOAReview(Request $request)
    {
        $user = auth()->user();
        
        // Check if user is COA
        if ($user->role->role_name !== 'coa' && $user->role->role_name !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only COA can access this endpoint.'
            ], 403);
        }

        $perPage = min(50, (int) $request->query('per_page', 25));
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');

        // Get Cash Flow Statement form
        $form = Form::where('form_code', 'FORM-08')->first();
        
        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Cash Flow Statement form not found'
            ], 404);
        }

        $query = FormSubmission::query()
            ->with([
                'form:form_id,form_code,form_name',
                'submitter:user_id,email',
                'submitter.profile:user_id,first_name,last_name',
                'currentApprover:user_id,email',
                'currentApprover.profile:user_id,first_name,last_name',
                'signatures.user.profile',
                'documents'
            ])
            ->where('form_id', $form->form_id)
            ->withCount(['particulars', 'documents']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('submission_code', 'like', "%{$search}%")
                  ->orWhereHas('submitter.profile', function ($query) use ($search) {
                      $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%");
                  })
                  ->orWhere('form_data->organization_name', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        } else {
            // Show all cash flow statements that need COA review
            // Include drafts that have been submitted and are pending review
            $query->whereIn('status', ['submitted', 'under_review', 'draft']);
        }

        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        
        if (in_array($sortField, ['submission_code', 'status', 'submitted_at', 'created_at', 'total_amount'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        // Log the query before execution
        \Log::info('COA Review Query Details', [
            'user_id' => $user->user_id,
            'user_role' => $user->role->role_name,
            'form_id' => $form->form_id,
            'search' => $search,
            'status_filter' => $status,
            'query_sql' => $query->toSql(),
            'query_bindings' => $query->getBindings()
        ]);

        $submissions = $query->paginate($perPage);

        // Log for debugging
        \Log::info('COA Review Query Results', [
            'user_id' => $user->user_id,
            'user_role' => $user->role->role_name,
            'total_submissions' => $submissions->total(),
            'current_page_count' => $submissions->count(),
            'form_id' => $form->form_id,
            'submission_ids' => $submissions->pluck('submission_id')->toArray(),
            'statuses' => $submissions->pluck('status')->toArray()
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'submissions' => $submissions,
                'pagination' => [
                    'current_page' => $submissions->currentPage(),
                    'last_page' => $submissions->lastPage(),
                    'per_page' => $submissions->perPage(),
                    'total' => $submissions->total(),
                    'from' => $submissions->firstItem(),
                    'to' => $submissions->lastItem()
                ]
            ],
        ]);
    }

    /**
     * Get detailed cash flow statement for review
     */
    public function show($id)
    {
        try {
            $submission = FormSubmission::with([
                'form.fields',
                'submitter.profile',
                'particulars',
                'documents',
                'signatures.user.profile',
                'currentApprover.profile'
            ])->find($id);
        } catch (\Exception $e) {
            // If relationship loading fails, try with basic relationships
            \Log::error('Error loading submission with relationships', [
                'submission_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            $submission = FormSubmission::with([
                'form',
                'submitter.profile',
                'particulars',
                'documents'
            ])->find($id);
        }

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Cash flow statement not found'
            ], 404);
        }

        // Check access rights
        $user = auth()->user();
        if ($user->role->role_name !== 'admin' && 
            $user->role->role_name !== 'coa' &&
            $submission->submitted_by !== $user->user_id && 
            $submission->current_approver_id !== $user->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied'
            ], 403);
        }

        try {
            return response()->json([
                'success' => true,
                'data' => ['submission' => $submission]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error returning submission data', [
                'submission_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error loading submission data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * COA approve cash flow statement
     */
    public function approve(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Cash flow statement not found'
            ], 404);
        }

        $user = auth()->user();

        // Check if user is authorized to approve
        if ($user->role->role_name !== 'coa' && $user->role->role_name !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only COA can approve cash flow statements'
            ], 403);
        }

        // For COA users, allow approval if the submission is in the right status
        // and the user has COA role (since we skip auditor step for now)
        if ($user->role->role_name !== 'admin' && $user->role->role_name !== 'coa') {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to approve this submission'
            ], 403);
        }
        
        // Check if submission is in a state that can be approved
        if (!in_array($submission->status, ['submitted', 'under_review', 'draft'])) {
            return response()->json([
                'success' => false,
                'message' => 'This submission cannot be approved in its current state'
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
            // For COA approval, ensure we're at the right workflow step
            if ($user->role->role_name === 'coa' && $submission->workflow_step == 1) {
                // Move to COA step (step 2) for approval
                $submission->update(['workflow_step' => 2]);
            }
            
            $submission->approve($user, $request->comments, $request->signature_data);

            return response()->json([
                'success' => true,
                'message' => 'Cash flow statement approved successfully',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            \Log::error('Cash Flow Approval Error', [
                'submission_id' => $submission->submission_id,
                'workflow_step' => $submission->workflow_step,
                'user_role' => $user->role->role_name,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve cash flow statement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * COA reject cash flow statement
     */
    public function reject(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Cash flow statement not found'
            ], 404);
        }

        $user = auth()->user();

        // Check if user is authorized to reject
        if ($user->role->role_name !== 'coa' && $user->role->role_name !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only COA can reject cash flow statements'
            ], 403);
        }

        // For COA users, allow rejection if they have the right role
        // (removed current_approver_id check since we skip auditor workflow)

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
                'message' => 'Cash flow statement rejected',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject cash flow statement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return cash flow statement for revision
     */
    public function returnForRevision(Request $request, $id)
    {
        $submission = FormSubmission::find($id);

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Cash flow statement not found'
            ], 404);
        }

        $user = auth()->user();

        if ($user->role->role_name !== 'coa' && $user->role->role_name !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Only COA can return cash flow statements for revision'
            ], 403);
        }

        // For COA users, allow return if they have the right role
        // (removed current_approver_id check since we skip auditor workflow)

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
                'message' => 'Cash flow statement returned for revision',
                'data' => ['submission' => $submission]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to return cash flow statement',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate cash flow totals
     */
    private function calculateCashFlowTotals($data)
    {
        $totals = [
            'total_cash_inflows' => 0,
            'total_cash_outflows' => 0,
            'organization_allocations' => 0,
            'other_disbursements' => 0,
            'contingency_fund' => 0,
            'total_ending_cash_balance' => 0,
            'net_cash_flow' => 0
        ];

        // Calculate cash inflows
        if (isset($data['cash_inflows'])) {
            $inflows = $data['cash_inflows'];
            
            // Beginning cash
            if (isset($inflows['beginningCashInBank']['amount'])) {
                $totals['total_cash_inflows'] += (float) str_replace(['₱', ','], '', $inflows['beginningCashInBank']['amount']);
            }
            if (isset($inflows['beginningCashOnHand']['amount'])) {
                $totals['total_cash_inflows'] += (float) str_replace(['₱', ','], '', $inflows['beginningCashOnHand']['amount']);
            }
            
            // Cash receipt sources
            if (isset($inflows['cashReceiptSources']) && is_array($inflows['cashReceiptSources'])) {
                foreach ($inflows['cashReceiptSources'] as $source) {
                    if (isset($source['amount'])) {
                        $totals['total_cash_inflows'] += (float) str_replace(['₱', ','], '', $source['amount']);
                    }
                }
            }
        }

        // Calculate cash outflows
        if (isset($data['cash_outflows'])) {
            $outflows = $data['cash_outflows'];
            
            // Organization allocations
            if (isset($outflows['organizationAllocations']) && is_array($outflows['organizationAllocations'])) {
                foreach ($outflows['organizationAllocations'] as $allocation) {
                    if (isset($allocation['amount'])) {
                        $amount = (float) str_replace(['₱', ','], '', $allocation['amount']);
                        $totals['organization_allocations'] += $amount;
                        $totals['total_cash_outflows'] += $amount;
                    }
                }
            }
            
            // Other disbursements
            if (isset($outflows['otherDisbursements']) && is_array($outflows['otherDisbursements'])) {
                foreach ($outflows['otherDisbursements'] as $disbursement) {
                    if (isset($disbursement['amount'])) {
                        $amount = (float) str_replace(['₱', ','], '', $disbursement['amount']);
                        $totals['other_disbursements'] += $amount;
                        $totals['total_cash_outflows'] += $amount;
                    }
                }
            }
            
            // Contingency fund
            if (isset($outflows['contingencyFund']) && is_array($outflows['contingencyFund'])) {
                foreach ($outflows['contingencyFund'] as $fund) {
                    if (isset($fund['amount'])) {
                        $amount = (float) str_replace(['₱', ','], '', $fund['amount']);
                        $totals['contingency_fund'] += $amount;
                        $totals['total_cash_outflows'] += $amount;
                    }
                }
            }
        }

        // Calculate ending cash balance
        if (isset($data['ending_cash_balance'])) {
            $ending = $data['ending_cash_balance'];
            if (isset($ending['cashInBank'])) {
                $totals['total_ending_cash_balance'] += (float) str_replace(['₱', ','], '', $ending['cashInBank']);
            }
            if (isset($ending['cashOnHand'])) {
                $totals['total_ending_cash_balance'] += (float) str_replace(['₱', ','], '', $ending['cashOnHand']);
            }
        }

        // Calculate net cash flow
        $totals['net_cash_flow'] = $totals['total_cash_inflows'] - $totals['total_cash_outflows'];

        return $totals;
    }

    /**
     * Create particulars from cash flow data
     */
    private function createCashFlowParticulars($submission, $data)
    {
        $lineOrder = 0;

        // Cash inflows
        if (isset($data['cash_inflows']['cashReceiptSources'])) {
            foreach ($data['cash_inflows']['cashReceiptSources'] as $source) {
                FormParticular::create([
                    'submission_id' => $submission->submission_id,
                    'item_type' => 'cash_inflow',
                    'description' => $source['description'] ?? '',
                    'quantity' => 1,
                    'unit_price' => (float) str_replace(['₱', ','], '', $source['amount'] ?? '0'),
                    'amount' => (float) str_replace(['₱', ','], '', $source['amount'] ?? '0'),
                    'line_order' => $lineOrder++
                ]);
            }
        }

        // Organization allocations
        if (isset($data['cash_outflows']['organizationAllocations'])) {
            foreach ($data['cash_outflows']['organizationAllocations'] as $allocation) {
                FormParticular::create([
                    'submission_id' => $submission->submission_id,
                    'item_type' => 'organization_allocation',
                    'description' => ($allocation['details'] ?? '') . ' - ' . ($allocation['invoiceNumber'] ?? ''),
                    'quantity' => 1,
                    'unit_price' => (float) str_replace(['₱', ','], '', $allocation['amount'] ?? '0'),
                    'amount' => (float) str_replace(['₱', ','], '', $allocation['amount'] ?? '0'),
                    'line_order' => $lineOrder++
                ]);
            }
        }

        // Other disbursements
        if (isset($data['cash_outflows']['otherDisbursements'])) {
            foreach ($data['cash_outflows']['otherDisbursements'] as $disbursement) {
                FormParticular::create([
                    'submission_id' => $submission->submission_id,
                    'item_type' => 'other_disbursement',
                    'description' => ($disbursement['details'] ?? '') . ' - ' . ($disbursement['invoiceNumber'] ?? ''),
                    'quantity' => 1,
                    'unit_price' => (float) str_replace(['₱', ','], '', $disbursement['amount'] ?? '0'),
                    'amount' => (float) str_replace(['₱', ','], '', $disbursement['amount'] ?? '0'),
                    'line_order' => $lineOrder++
                ]);
            }
        }

        // Contingency fund
        if (isset($data['cash_outflows']['contingencyFund'])) {
            foreach ($data['cash_outflows']['contingencyFund'] as $fund) {
                FormParticular::create([
                    'submission_id' => $submission->submission_id,
                    'item_type' => 'contingency_fund',
                    'description' => ($fund['details'] ?? '') . ' - ' . ($fund['invoiceNumber'] ?? ''),
                    'quantity' => 1,
                    'unit_price' => (float) str_replace(['₱', ','], '', $fund['amount'] ?? '0'),
                    'amount' => (float) str_replace(['₱', ','], '', $fund['amount'] ?? '0'),
                    'line_order' => $lineOrder++
                ]);
            }
        }
    }

    /**
     * Upload supporting documents
     */
    private function uploadSupportingDocuments($submission, $files)
    {
        foreach ($files as $file) {
            $originalName = $file->getClientOriginalName();
            $fileName = time() . '_' . $originalName;
            $filePath = $file->storeAs('cashflow_documents/' . $submission->submission_id, $fileName);

            FormDocument::create([
                'submission_id' => $submission->submission_id,
                'original_name' => $originalName,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'document_type' => 'supporting',
                'description' => 'Cash Flow Statement Supporting Document',
                'uploaded_by' => auth()->id()
            ]);
        }
    }
}
