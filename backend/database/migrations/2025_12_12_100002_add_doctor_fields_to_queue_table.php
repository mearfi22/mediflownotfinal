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
        Schema::table('queue', function (Blueprint $table) {
            // Check if columns exist before adding them
            if (!Schema::hasColumn('queue', 'department_id')) {
                $table->unsignedBigInteger('department_id')->nullable()->after('queue_date');
            }

            if (!Schema::hasColumn('queue', 'doctor_id')) {
                $table->unsignedBigInteger('doctor_id')->nullable()->after('department_id');
            }
        });

        // Add foreign key constraints and indexes separately
        Schema::table('queue', function (Blueprint $table) {
            if (Schema::hasColumn('queue', 'department_id')) {
                // Check if foreign key exists before adding
                try {
                    $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist, ignore
                }

                // Check if index exists before adding
                try {
                    $table->index('department_id', 'idx_queue_department');
                } catch (\Exception $e) {
                    // Index might already exist, ignore
                }
            }

            if (Schema::hasColumn('queue', 'doctor_id')) {
                // Check if foreign key exists before adding
                try {
                    $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist, ignore
                }

                // Check if index exists before adding
                try {
                    $table->index('doctor_id', 'idx_queue_doctor');
                } catch (\Exception $e) {
                    // Index might already exist, ignore
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('queue', function (Blueprint $table) {
            if (Schema::hasColumn('queue', 'department_id')) {
                // Drop index if it exists
                try {
                    $table->dropIndex('idx_queue_department');
                } catch (\Exception $e) {
                    // Index might not exist, ignore
                }

                // Drop foreign key if it exists
                try {
                    $table->dropForeign(['department_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, ignore
                }

                $table->dropColumn('department_id');
            }

            if (Schema::hasColumn('queue', 'doctor_id')) {
                // Drop index if it exists
                try {
                    $table->dropIndex('idx_queue_doctor');
                } catch (\Exception $e) {
                    // Index might not exist, ignore
                }

                // Drop foreign key if it exists
                try {
                    $table->dropForeign(['doctor_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, ignore
                }

                $table->dropColumn('doctor_id');
            }
        });
    }
};
