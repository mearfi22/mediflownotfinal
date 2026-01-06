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
        Schema::table('medical_records', function (Blueprint $table) {
            // Admission Information
            $table->date('admission_date')->nullable()->after('visit_date');
            $table->time('admission_time')->nullable()->after('admission_date');
            $table->string('ward_room')->nullable()->after('admission_time');
            $table->text('admitting_remarks')->nullable()->after('ward_room');
            $table->text('admitting_diagnosis')->nullable()->after('admitting_remarks');
            $table->text('admitting_rod')->nullable()->after('admitting_diagnosis'); // Rule Out Diagnosis
            $table->string('consultant_on_deck')->nullable()->after('admitting_rod');
            $table->string('er_nurse_on_duty')->nullable()->after('consultant_on_deck');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropColumn([
                'admission_date',
                'admission_time',
                'ward_room',
                'admitting_remarks',
                'admitting_diagnosis',
                'admitting_rod',
                'consultant_on_deck',
                'er_nurse_on_duty',
            ]);
        });
    }
};
