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
        Schema::create('forms', function (Blueprint $table) {
            $table->id('form_id');
            $table->string('form_code')->unique();
            $table->string('form_name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable(); // For form-specific settings like auto-calculation, notifications
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('created_by')->references('user_id')->on('users')->onDelete('cascade');
            $table->index(['is_active', 'created_at']);
            $table->index('form_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('forms');
    }
};














