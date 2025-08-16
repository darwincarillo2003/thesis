<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id('submission_id');
            $table->unsignedBigInteger('form_id');
            $table->string('submission_code')->unique(); // Generated unique code for tracking
            $table->unsignedBigInteger('submitted_by');
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'returned'])->default('draft');
            $table->json('form_data'); // Stores all field values as JSON
            $table->decimal('total_amount', 15, 2)->nullable(); // For forms with calculations
            $table->text('remarks')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('current_approver_id')->nullable();
            $table->integer('workflow_step')->default(0);
            $table->timestamps();

            $table->foreign('form_id')->references('form_id')->on('forms')->onDelete('cascade');
            $table->foreign('submitted_by')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('current_approver_id')->references('user_id')->on('users')->onDelete('set null');
            
            $table->index(['form_id', 'status']);
            $table->index(['submitted_by', 'status']);
            $table->index(['current_approver_id', 'status']);
            $table->index('submission_code');
            $table->index('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
