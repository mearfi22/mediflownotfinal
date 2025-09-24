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
        Schema::create('queue', function (Blueprint $table) {
            $table->id();
            $table->integer('queue_number');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->text('reason_for_visit');
            $table->enum('status', ['waiting', 'serving', 'served', 'skipped'])->default('waiting');
            $table->timestamp('called_at')->nullable();
            $table->timestamp('served_at')->nullable();
            $table->date('queue_date')->default(now());
            $table->timestamps();
            
            $table->unique(['queue_number', 'queue_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queue');
    }
};
