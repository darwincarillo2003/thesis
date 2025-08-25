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
        Schema::create('form_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->unsignedBigInteger('submission_id');
            $table->string('original_name');
            $table->string('file_name'); // Stored file name
            $table->string('file_path');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->string('document_type')->default('supporting'); // 'supporting', 'receipt', 'invoice', etc.
            $table->text('description')->nullable();
            $table->unsignedBigInteger('uploaded_by');
            $table->timestamps();

            $table->foreign('submission_id')->references('submission_id')->on('form_submissions')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('user_id')->on('users')->onDelete('cascade');
            
            $table->index(['submission_id', 'document_type']);
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_documents');
    }
};














