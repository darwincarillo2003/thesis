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
        Schema::create('form_signatures', function (Blueprint $table) {
            $table->id('signature_id');
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('user_id');
            $table->string('role_name'); // The role this person is signing as
            $table->integer('workflow_step');
            $table->enum('action', ['approved', 'rejected', 'returned', 'noted']);
            $table->text('comments')->nullable();
            $table->text('signature_data')->nullable(); // Base64 encoded signature image
            $table->timestamp('signed_at');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->foreign('submission_id')->references('submission_id')->on('form_submissions')->onDelete('cascade');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->unique(['submission_id', 'workflow_step', 'user_id']);
            $table->index(['submission_id', 'workflow_step']);
            $table->index(['user_id', 'signed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_signatures');
    }
};
