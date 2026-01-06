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
        // Drop the existing foreign key constraint
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });

        // Re-add the foreign key without cascade delete (restrict instead)
        Schema::table('medical_records', function (Blueprint $table) {
            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->onDelete('restrict'); // Prevent deletion if medical records exist
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the cascade delete behavior
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });

        Schema::table('medical_records', function (Blueprint $table) {
            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->onDelete('cascade');
        });
    }
};
