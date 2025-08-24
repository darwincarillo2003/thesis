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
        Schema::create('form_workflow', function (Blueprint $table) {
            $table->id('workflow_id');
            $table->unsignedBigInteger('form_id');
            $table->string('role_name'); // 'Prepared By', 'Approved By', etc.
            $table->integer('step_order');
            $table->boolean('is_required')->default(true);
            $table->text('step_description')->nullable();
            $table->json('conditions')->nullable(); // For conditional workflow steps
            $table->timestamps();

            $table->foreign('form_id')->references('form_id')->on('forms')->onDelete('cascade');
            $table->unique(['form_id', 'step_order']);
            $table->index(['form_id', 'step_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_workflow');
    }
};








