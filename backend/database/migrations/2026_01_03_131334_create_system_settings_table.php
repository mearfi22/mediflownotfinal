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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('hospital_name', 255)->default('MediQueue Hospital');
            $table->text('hospital_address')->nullable();
            $table->string('hospital_phone', 50)->nullable();
            $table->string('hospital_email', 100)->nullable();
            $table->string('hospital_logo', 255)->nullable();
            $table->time('working_hours_start')->default('08:00:00');
            $table->time('working_hours_end')->default('17:00:00');
            $table->integer('average_consultation_minutes')->default(15);
            $table->string('timezone', 50)->default('Asia/Manila');
            $table->boolean('auto_approve_preregistration')->default(false);
            $table->string('queue_number_prefix', 10)->default('Q');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
