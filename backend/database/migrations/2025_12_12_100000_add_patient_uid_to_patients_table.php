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
        Schema::table('patients', function (Blueprint $table) {
            $table->string('patient_uid')->nullable()->unique()->after('id');
        });

        // Populate existing records with UUIDs
        DB::statement("UPDATE patients SET patient_uid = UUID() WHERE patient_uid IS NULL");

        // Make the column non-nullable
        Schema::table('patients', function (Blueprint $table) {
            $table->string('patient_uid')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('patient_uid');
        });
    }
};
