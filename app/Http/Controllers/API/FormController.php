<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FormController extends Controller
{
    /**
     * Get paginated list of forms
     */
    public function index(Request $request)
    {
        $perPage = min(50, (int) $request->query('per_page', 15));
        $search = trim((string) $request->query('search', ''));

        $query = Form::query()
            ->with(['creator:user_id,email', 'creator.profile:user_id,first_name,last_name'])
            ->withCount(['fields', 'submissions']);

        if ($search !== '') {
            $query->search($search);
        }

        // Sorting
        $sortField = $request->query('sort_field', 'created_at');
        $sortDirection = $request->query('sort_direction', 'desc');
        
        if (in_array($sortField, ['form_code', 'form_name', 'created_at', 'updated_at'])) {
            $query->orderBy($sortField, $sortDirection);
        }

        $forms = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => [
                'forms' => $forms,
            ],
        ]);
    }

    /**
     * Store a new form
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_code' => 'required|string|max:50|unique:forms,form_code',
            'form_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'fields' => 'required|array|min:1',
            'fields.*.type' => 'required|in:' . implode(',', FormField::$fieldTypes),
            'fields.*.label' => 'required|string|max:255',
            'fields.*.required' => 'boolean',
            'fields.*.order' => 'integer|min:0',
            'workflow' => 'array',
            'workflow.*.role' => 'required|string',
            'workflow.*.order' => 'required|integer|min:0',
            'workflow.*.required' => 'boolean'
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
            // Create form
            $form = Form::create([
                'form_code' => $request->form_code,
                'form_name' => $request->form_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true,
                'created_by' => auth()->id()
            ]);

            // Create fields
            foreach ($request->fields as $index => $fieldData) {
                FormField::create([
                    'form_id' => $form->form_id,
                    'field_name' => str_replace(' ', '_', strtolower($fieldData['label'])),
                    'field_label' => $fieldData['label'],
                    'field_type' => $fieldData['type'],
                    'is_required' => $fieldData['required'] ?? false,
                    'field_order' => $fieldData['order'] ?? $index,
                    'field_options' => $fieldData['options'] ?? null,
                    'validation_rules' => $fieldData['validation'] ?? null,
                    'placeholder' => $fieldData['placeholder'] ?? null,
                    'help_text' => $fieldData['help_text'] ?? null
                ]);
            }

            // Create workflow steps
            if ($request->workflow) {
                foreach ($request->workflow as $stepData) {
                    FormWorkflow::create([
                        'form_id' => $form->form_id,
                        'role_name' => $stepData['role'],
                        'step_order' => $stepData['order'],
                        'is_required' => $stepData['required'] ?? true,
                        'step_description' => $stepData['description'] ?? null
                    ]);
                }
            }

            DB::commit();

            $form->load(['fields', 'workflow', 'creator']);

            return response()->json([
                'success' => true,
                'message' => 'Form created successfully',
                'data' => ['form' => $form]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific form
     */
    public function show($id)
    {
        $form = Form::with(['fields.ordered', 'workflow.ordered', 'creator'])
                   ->find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Form not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => ['form' => $form]
        ]);
    }

    /**
     * Update a form
     */
    public function update(Request $request, $id)
    {
        $form = Form::find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Form not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'form_code' => 'required|string|max:50|unique:forms,form_code,' . $id . ',form_id',
            'form_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'fields' => 'required|array|min:1',
            'fields.*.type' => 'required|in:' . implode(',', FormField::$fieldTypes),
            'fields.*.label' => 'required|string|max:255',
            'fields.*.required' => 'boolean',
            'fields.*.order' => 'integer|min:0',
            'workflow' => 'array',
            'workflow.*.role' => 'required|string',
            'workflow.*.order' => 'required|integer|min:0',
            'workflow.*.required' => 'boolean'
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
            // Update form
            $form->update([
                'form_code' => $request->form_code,
                'form_name' => $request->form_name,
                'description' => $request->description,
                'is_active' => $request->is_active ?? true
            ]);

            // Delete existing fields and workflow
            $form->fields()->delete();
            $form->workflow()->delete();

            // Recreate fields
            foreach ($request->fields as $index => $fieldData) {
                FormField::create([
                    'form_id' => $form->form_id,
                    'field_name' => str_replace(' ', '_', strtolower($fieldData['label'])),
                    'field_label' => $fieldData['label'],
                    'field_type' => $fieldData['type'],
                    'is_required' => $fieldData['required'] ?? false,
                    'field_order' => $fieldData['order'] ?? $index,
                    'field_options' => $fieldData['options'] ?? null,
                    'validation_rules' => $fieldData['validation'] ?? null,
                    'placeholder' => $fieldData['placeholder'] ?? null,
                    'help_text' => $fieldData['help_text'] ?? null
                ]);
            }

            // Recreate workflow steps
            if ($request->workflow) {
                foreach ($request->workflow as $stepData) {
                    FormWorkflow::create([
                        'form_id' => $form->form_id,
                        'role_name' => $stepData['role'],
                        'step_order' => $stepData['order'],
                        'is_required' => $stepData['required'] ?? true,
                        'step_description' => $stepData['description'] ?? null
                    ]);
                }
            }

            DB::commit();

            $form->load(['fields', 'workflow']);

            return response()->json([
                'success' => true,
                'message' => 'Form updated successfully',
                'data' => ['form' => $form]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a form
     */
    public function destroy($id)
    {
        $form = Form::find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Form not found'
            ], 404);
        }

        // Check if form has submissions
        if ($form->submissions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete form with existing submissions'
            ], 422);
        }

        try {
            $form->delete();

            return response()->json([
                'success' => true,
                'message' => 'Form deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active forms for submission
     */
    public function activeForms()
    {
        $forms = Form::active()
                    ->with(['fields' => function ($query) {
                        $query->active()->ordered();
                    }, 'workflow.ordered'])
                    ->select(['form_id', 'form_code', 'form_name', 'description'])
                    ->get();

        return response()->json([
            'success' => true,
            'data' => ['forms' => $forms]
        ]);
    }

    /**
     * Duplicate a form
     */
    public function duplicate($id)
    {
        $originalForm = Form::with(['fields', 'workflow'])->find($id);

        if (!$originalForm) {
            return response()->json([
                'success' => false,
                'message' => 'Form not found'
            ], 404);
        }

        DB::beginTransaction();
        
        try {
            // Create new form
            $newForm = Form::create([
                'form_code' => $originalForm->form_code . '_COPY',
                'form_name' => $originalForm->form_name . ' (Copy)',
                'description' => $originalForm->description,
                'is_active' => false, // Start as inactive
                'created_by' => auth()->id()
            ]);

            // Copy fields
            foreach ($originalForm->fields as $field) {
                FormField::create([
                    'form_id' => $newForm->form_id,
                    'field_name' => $field->field_name,
                    'field_label' => $field->field_label,
                    'field_type' => $field->field_type,
                    'is_required' => $field->is_required,
                    'field_order' => $field->field_order,
                    'field_options' => $field->field_options,
                    'validation_rules' => $field->validation_rules,
                    'placeholder' => $field->placeholder,
                    'help_text' => $field->help_text
                ]);
            }

            // Copy workflow
            foreach ($originalForm->workflow as $step) {
                FormWorkflow::create([
                    'form_id' => $newForm->form_id,
                    'role_name' => $step->role_name,
                    'step_order' => $step->step_order,
                    'is_required' => $step->is_required,
                    'step_description' => $step->step_description
                ]);
            }

            DB::commit();

            $newForm->load(['fields', 'workflow']);

            return response()->json([
                'success' => true,
                'message' => 'Form duplicated successfully',
                'data' => ['form' => $newForm]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to duplicate form',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}






