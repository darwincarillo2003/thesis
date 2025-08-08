<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRolesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id('role_id');
            $table->string('role_name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
        
        // Add foreign key constraint to users table
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('role_id')->references('role_id')->on('roles')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Drop foreign key constraint first
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
        });
        
        Schema::dropIfExists('roles');
    }
}
