<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Form;
use App\Models\FormField;
use App\Models\FormWorkflow;

class SampleFormsSeeder extends Seeder
{
    public function run()
    {
        $this->createPettyCashVoucherForm();
        $this->createCashVoucherForm();
        $this->createAcknowledgementForm();
        $this->createCommunicationExpenseForm();
        $this->createTransportationExpenseForm();
        $this->createReimbursementForm();
        $this->createPayrollForm();
    }

    private function createPettyCashVoucherForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-01',
            'form_name' => 'Petty Cash Voucher',
            'description' => 'Form for petty cash disbursement requests',
            'is_active' => true,
            'settings' => [
                'show_petty_cash_status' => true,
                'monthly_limit' => 300.00,
                'auto_calculate_totals' => true
            ],
            'created_by' => 1
        ]);

        // Create fields for Petty Cash Voucher
        $fields = [
            [
                'field_name' => 'voucher_number',
                'field_label' => 'No.',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 1,
                'placeholder' => 'Enter voucher number'
            ],
            [
                'field_name' => 'date',
                'field_label' => 'Date',
                'field_type' => 'date',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'paid_to',
                'field_label' => 'Paid To',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3,
                'placeholder' => 'Name of payee'
            ],
            [
                'field_name' => 'particulars_table',
                'field_label' => 'Table of Particulars',
                'field_type' => 'table',
                'is_required' => true,
                'field_order' => 4,
                'field_options' => [
                    'columns' => [
                        ['name' => 'item', 'label' => 'ITEM', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'AMOUNT', 'type' => 'number']
                    ],
                    'allow_add_rows' => true,
                    'calculate_total' => true
                ]
            ],
            [
                'field_name' => 'approved_by',
                'field_label' => 'Approved By',
                'field_type' => 'text',
                'is_required' => false,
                'field_order' => 5
            ],
            [
                'field_name' => 'received_payment_by',
                'field_label' => 'Received Payment by',
                'field_type' => 'text',
                'is_required' => false,
                'field_order' => 6
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 7,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true,
                    'max_size' => 10240
                ]
            ]
        ];

        foreach ($fields as $index => $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }

        // Create workflow
        $workflowSteps = [
            ['role_name' => 'Prepared By', 'step_order' => 1, 'is_required' => true],
            ['role_name' => 'Approved By', 'step_order' => 2, 'is_required' => true],
            ['role_name' => 'Treasurer', 'step_order' => 3, 'is_required' => true]
        ];

        foreach ($workflowSteps as $step) {
            FormWorkflow::create(array_merge($step, [
                'form_id' => $form->form_id
            ]));
        }
    }

    private function createCashVoucherForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-02',
            'form_name' => 'Cash Voucher',
            'description' => 'General cash disbursement voucher',
            'is_active' => true,
            'settings' => ['auto_calculate_totals' => true],
            'created_by' => 1
        ]);

        $fields = [
            [
                'field_name' => 'voucher_number',
                'field_label' => 'No.',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 1
            ],
            [
                'field_name' => 'date',
                'field_label' => 'Date',
                'field_type' => 'date',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'paid_to',
                'field_label' => 'Paid to',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3
            ],
            [
                'field_name' => 'particulars_table',
                'field_label' => 'Table of Particulars',
                'field_type' => 'table',
                'is_required' => true,
                'field_order' => 4,
                'field_options' => [
                    'columns' => [
                        ['name' => 'item', 'label' => 'ITEM', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'AMOUNT', 'type' => 'number']
                    ],
                    'allow_add_rows' => true,
                    'calculate_total' => true
                ]
            ],
            [
                'field_name' => 'prepared_by',
                'field_label' => 'Prepared By',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 5
            ],
            [
                'field_name' => 'approved_by',
                'field_label' => 'Approved By',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 6
            ],
            [
                'field_name' => 'noted_by',
                'field_label' => 'Noted By',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 7
            ],
            [
                'field_name' => 'received_by',
                'field_label' => 'Received by',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 8
            ],
            [
                'field_name' => 'amount',
                'field_label' => 'Amount',
                'field_type' => 'number',
                'is_required' => true,
                'field_order' => 9
            ],
            [
                'field_name' => 'from',
                'field_label' => 'From',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 10
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 11,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true
                ]
            ]
        ];

        foreach ($fields as $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }

        // Workflow
        $workflowSteps = [
            ['role_name' => 'Prepared By', 'step_order' => 1, 'is_required' => true],
            ['role_name' => 'Approved By', 'step_order' => 2, 'is_required' => true],
            ['role_name' => 'Noted By', 'step_order' => 3, 'is_required' => true]
        ];

        foreach ($workflowSteps as $step) {
            FormWorkflow::create(array_merge($step, [
                'form_id' => $form->form_id
            ]));
        }
    }

    private function createAcknowledgementForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-03',
            'form_name' => 'Acknowledgement Form',
            'description' => 'Receipt acknowledgement form',
            'is_active' => true,
            'created_by' => 1
        ]);

        $fields = [
            [
                'field_name' => 'number',
                'field_label' => 'No.',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 1
            ],
            [
                'field_name' => 'date',
                'field_label' => 'Date',
                'field_type' => 'date',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'recipient_name',
                'field_label' => 'Recipient Name',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3,
                'placeholder' => 'Full name of recipient'
            ],
            [
                'field_name' => 'amount',
                'field_label' => 'Amount',
                'field_type' => 'number',
                'is_required' => true,
                'field_order' => 4
            ],
            [
                'field_name' => 'description',
                'field_label' => 'Description',
                'field_type' => 'textarea',
                'is_required' => true,
                'field_order' => 5,
                'placeholder' => 'Purpose and description of acknowledgement'
            ],
            [
                'field_name' => 'prepared_by_name',
                'field_label' => 'Prepared By (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 6
            ],
            [
                'field_name' => 'prepared_by_contact',
                'field_label' => 'Contact No.',
                'field_type' => 'text',
                'is_required' => false,
                'field_order' => 7
            ],
            [
                'field_name' => 'received_from_name',
                'field_label' => 'Received From (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 8
            ],
            [
                'field_name' => 'received_from_contact',
                'field_label' => 'Contact No.',
                'field_type' => 'text',
                'is_required' => false,
                'field_order' => 9
            ],
            [
                'field_name' => 'approved_by_name',
                'field_label' => 'Approved By (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 10
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 11,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true
                ]
            ]
        ];

        foreach ($fields as $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }

        // Simple workflow
        $workflowSteps = [
            ['role_name' => 'Prepared By', 'step_order' => 1, 'is_required' => true],
            ['role_name' => 'Approved By', 'step_order' => 2, 'is_required' => true]
        ];

        foreach ($workflowSteps as $step) {
            FormWorkflow::create(array_merge($step, [
                'form_id' => $form->form_id
            ]));
        }
    }

    private function createCommunicationExpenseForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-04',
            'form_name' => 'Communication Expense Form',
            'description' => 'Form for communication-related expenses',
            'is_active' => true,
            'settings' => ['auto_calculate_totals' => true],
            'created_by' => 1
        ]);

        $fields = [
            [
                'field_name' => 'communication_expenses',
                'field_label' => 'Communication Expenses',
                'field_type' => 'table',
                'is_required' => true,
                'field_order' => 1,
                'field_options' => [
                    'columns' => [
                        ['name' => 'date', 'label' => 'DATE', 'type' => 'date'],
                        ['name' => 'description', 'label' => 'DESCRIPTION', 'type' => 'text'],
                        ['name' => 'person_in_charge', 'label' => 'PERSON-IN-CHARGE', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'AMOUNT', 'type' => 'number']
                    ],
                    'allow_add_rows' => true,
                    'calculate_total' => true,
                    'min_rows' => 1
                ]
            ],
            [
                'field_name' => 'prepared_by',
                'field_label' => 'Prepared By (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'approved_by',
                'field_label' => 'Approved By (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 4,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true
                ]
            ]
        ];

        foreach ($fields as $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }

        $workflowSteps = [
            ['role_name' => 'Prepared By', 'step_order' => 1, 'is_required' => true],
            ['role_name' => 'Approved By', 'step_order' => 2, 'is_required' => true]
        ];

        foreach ($workflowSteps as $step) {
            FormWorkflow::create(array_merge($step, [
                'form_id' => $form->form_id
            ]));
        }
    }

    private function createTransportationExpenseForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-05',
            'form_name' => 'Transportation Expense Form',
            'description' => 'Form for transportation-related expenses',
            'is_active' => true,
            'settings' => ['auto_calculate_totals' => true],
            'created_by' => 1
        ]);

        $fields = [
            [
                'field_name' => 'transportation_expenses',
                'field_label' => 'Transportation Expenses',
                'field_type' => 'table',
                'is_required' => true,
                'field_order' => 1,
                'field_options' => [
                    'columns' => [
                        ['name' => 'date', 'label' => 'DATE', 'type' => 'date'],
                        ['name' => 'destination', 'label' => 'DESTINATION', 'type' => 'text'],
                        ['name' => 'person_in_charge', 'label' => 'PERSON-IN-CHARGE', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'AMOUNT', 'type' => 'number']
                    ],
                    'allow_add_rows' => true,
                    'calculate_total' => true
                ]
            ],
            [
                'field_name' => 'prepared_by',
                'field_label' => 'Prepared By (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'approved_by',
                'field_label' => 'Approved By (Name)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 4,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true
                ]
            ]
        ];

        foreach ($fields as $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }
    }

    private function createReimbursementForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-06',
            'form_name' => 'Reimbursement Form',
            'description' => 'Form for expense reimbursement requests',
            'is_active' => true,
            'settings' => ['auto_calculate_totals' => true],
            'created_by' => 1
        ]);

        $fields = [
            [
                'field_name' => 'number',
                'field_label' => 'No.',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 1
            ],
            [
                'field_name' => 'date',
                'field_label' => 'Date',
                'field_type' => 'date',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'purpose',
                'field_label' => 'Purpose',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3
            ],
            [
                'field_name' => 'reimbursement_expenses',
                'field_label' => 'Reimbursement Expenses',
                'field_type' => 'table',
                'is_required' => true,
                'field_order' => 4,
                'field_options' => [
                    'columns' => [
                        ['name' => 'date', 'label' => 'DATE', 'type' => 'date'],
                        ['name' => 'description', 'label' => 'DESCRIPTION', 'type' => 'text'],
                        ['name' => 'or_invoice_number', 'label' => 'OR/INVOICE #', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'AMOUNT', 'type' => 'number']
                    ],
                    'allow_add_rows' => true,
                    'calculate_total' => true
                ]
            ],
            [
                'field_name' => 'received_by',
                'field_label' => 'Received By',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 5
            ],
            [
                'field_name' => 'received_from_treasurer',
                'field_label' => 'Received From (Treasurer)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 6
            ],
            [
                'field_name' => 'approved_by',
                'field_label' => 'Approved By (President/Governor)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 7
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 8,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true
                ]
            ]
        ];

        foreach ($fields as $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }

        $workflowSteps = [
            ['role_name' => 'Prepared By', 'step_order' => 1, 'is_required' => true],
            ['role_name' => 'Treasurer', 'step_order' => 2, 'is_required' => true],
            ['role_name' => 'President', 'step_order' => 3, 'is_required' => true]
        ];

        foreach ($workflowSteps as $step) {
            FormWorkflow::create(array_merge($step, [
                'form_id' => $form->form_id
            ]));
        }
    }

    private function createPayrollForm()
    {
        $form = Form::create([
            'form_code' => 'FORM-07',
            'form_name' => 'Payroll Form',
            'description' => 'Payroll disbursement form',
            'is_active' => true,
            'settings' => ['auto_calculate_totals' => true],
            'created_by' => 1
        ]);

        $fields = [
            [
                'field_name' => 'activity',
                'field_label' => 'Activity',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 1
            ],
            [
                'field_name' => 'date_inclusive',
                'field_label' => 'Date/Inclusive Dates',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 2
            ],
            [
                'field_name' => 'purpose',
                'field_label' => 'Purpose',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 3
            ],
            [
                'field_name' => 'payroll_table',
                'field_label' => 'Payroll Information',
                'field_type' => 'table',
                'is_required' => true,
                'field_order' => 4,
                'field_options' => [
                    'columns' => [
                        ['name' => 'payee_name', 'label' => 'PAYEES (NAME)', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'AMOUNTS', 'type' => 'number'],
                        ['name' => 'signature', 'label' => 'SIGNATURES', 'type' => 'signature'],
                        ['name' => 'date_received', 'label' => 'DATE RECEIVED', 'type' => 'date']
                    ],
                    'allow_add_rows' => true,
                    'calculate_total' => true,
                    'total_label' => 'TOTAL AMOUNT DISPERSED'
                ]
            ],
            [
                'field_name' => 'disbursed_by_treasurer',
                'field_label' => 'Disbursed By (Treasurer)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 5
            ],
            [
                'field_name' => 'approved_by',
                'field_label' => 'Approved By (President/Governor)',
                'field_type' => 'text',
                'is_required' => true,
                'field_order' => 6
            ],
            [
                'field_name' => 'supporting_documents',
                'field_label' => 'Supporting Documents',
                'field_type' => 'file',
                'is_required' => true,
                'field_order' => 7,
                'field_options' => [
                    'accept' => '.pdf,.jpg,.jpeg,.png',
                    'multiple' => true
                ]
            ]
        ];

        foreach ($fields as $fieldData) {
            FormField::create(array_merge($fieldData, [
                'form_id' => $form->form_id
            ]));
        }

        $workflowSteps = [
            ['role_name' => 'Prepared By', 'step_order' => 1, 'is_required' => true],
            ['role_name' => 'Treasurer', 'step_order' => 2, 'is_required' => true],
            ['role_name' => 'President', 'step_order' => 3, 'is_required' => true]
        ];

        foreach ($workflowSteps as $step) {
            FormWorkflow::create(array_merge($step, [
                'form_id' => $form->form_id
            ]));
        }
    }
}






