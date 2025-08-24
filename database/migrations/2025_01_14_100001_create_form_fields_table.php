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
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id('field_id');
            $table->unsignedBigInteger('form_id');
            $table->string('field_name');
            $table->string('field_label');
            $table->enum('field_type', [
                'text', 'number', 'date', 'textarea', 'select', 
                'checkbox', 'radio', 'file', 'signature', 'table', 'calculation'
            ]);
            $table->boolean('is_required')->default(false);
            $table->integer('field_order')->default(0);
            $table->json('field_options')->nullable(); // For select/radio options, validation rules, calculation formulas
            $table->json('validation_rules')->nullable();
            $table->text('placeholder')->nullable();
            $table->text('help_text')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('form_id')->references('form_id')->on('forms')->onDelete('cascade');
            $table->index(['form_id', 'field_order']);
            $table->index(['form_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};








