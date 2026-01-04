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
        Schema::create('queue_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('queue_id')->constrained('queue')->onDelete('cascade');
            $table->foreignId('from_doctor_id')->nullable()->constrained('doctors')->onDelete('set null');
            $table->foreignId('to_doctor_id')->nullable()->constrained('doctors')->onDelete('set null');
            $table->foreignId('from_department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('to_department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->text('reason')->nullable();
            $table->foreignId('transferred_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue_transfers');
    }
};
