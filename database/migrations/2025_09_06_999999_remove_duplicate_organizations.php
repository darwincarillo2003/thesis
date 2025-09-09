<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove duplicate organizations based on organization_name
        // Keep only the first occurrence (lowest ID)
        
        $duplicates = DB::select("
            SELECT organization_name, COUNT(*) as count
            FROM organizations 
            GROUP BY organization_name 
            HAVING COUNT(*) > 1
        ");
        
        foreach ($duplicates as $duplicate) {
            // Get all organizations with this name
            $orgs = DB::select("
                SELECT organization_id 
                FROM organizations 
                WHERE organization_name = ? 
                ORDER BY organization_id ASC
            ", [$duplicate->organization_name]);
            
            // Remove all except the first one
            $idsToDelete = array_slice(array_column($orgs, 'organization_id'), 1);
            
            if (!empty($idsToDelete)) {
                // First, remove any user_organization relationships for duplicates
                DB::table('user_organizations')
                    ->whereIn('organization_id', $idsToDelete)
                    ->delete();
                
                // Then remove the duplicate organizations
                DB::table('organizations')
                    ->whereIn('organization_id', $idsToDelete)
                    ->delete();
            }
        }
        
        // Add unique constraint to prevent future duplicates
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->unique('organization_name');
            });
        } catch (\Exception $e) {
            // Index might already exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the unique constraint
        try {
            Schema::table('organizations', function (Blueprint $table) {
                $table->dropUnique(['organization_name']);
            });
        } catch (\Exception $e) {
            // Index might not exist, ignore
        }
    }
};




