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
        Schema::create('form_particulars', function (Blueprint $table) {
            $table->id('particular_id');
            $table->unsignedBigInteger('submission_id');
            $table->string('item_type'); // 'expense', 'payroll', 'item', etc.
            $table->string('description');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('amount', 15, 2);
            $table->string('account_code')->nullable();
            $table->text('remarks')->nullable();
            $table->json('additional_data')->nullable(); // For flexible data storage
            $table->integer('line_order')->default(0);
            $table->timestamps();

            $table->foreign('submission_id')->references('submission_id')->on('form_submissions')->onDelete('cascade');
            $table->index(['submission_id', 'item_type']);
            $table->index(['submission_id', 'line_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_particulars');
    }
};
