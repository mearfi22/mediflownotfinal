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
        Schema::create('pre_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('last_name', 255);
            $table->string('first_name', 255);
            $table->string('middle_name', 255)->nullable();
            $table->text('address');
            $table->string('contact_number', 20);
            $table->string('sex', 10);
            $table->string('civil_status', 50);
            $table->string('spouse_name', 255)->nullable();
            $table->date('date_of_birth');
            $table->string('age', 10);
            $table->string('birthplace', 255);
            $table->string('nationality', 100);
            $table->string('religion', 100)->nullable();
            $table->string('occupation', 255)->nullable();
            $table->text('reason_for_visit');
            $table->string('philhealth_id', 255)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pre_registrations');
    }
};
