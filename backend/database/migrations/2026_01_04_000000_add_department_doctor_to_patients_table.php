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
        Schema::table('patients', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('reason_for_visit')->constrained('departments')->onDelete('set null');
            $table->foreignId('doctor_id')->nullable()->after('department_id')->constrained('doctors')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropForeign(['doctor_id']);
            $table->dropColumn(['department_id', 'doctor_id']);
        });
    }
};
