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
        Schema::table('pre_registrations', function (Blueprint $table) {
            // Check if columns exist before adding them
            if (!Schema::hasColumn('pre_registrations', 'department_id')) {
                $table->unsignedBigInteger('department_id')->nullable()->after('philhealth_id');
            }

            if (!Schema::hasColumn('pre_registrations', 'doctor_id')) {
                $table->unsignedBigInteger('doctor_id')->nullable()->after('department_id');
            }
        });

        // Add foreign key constraints separately to avoid issues.
        // Only attempt to add foreign keys if the referenced tables exist
        // (this prevents InnoDB errno 150 when referenced tables are missing
        // or when table engines/column types differ).
        Schema::table('pre_registrations', function (Blueprint $table) {
            if (Schema::hasTable('departments') && Schema::hasColumn('pre_registrations', 'department_id')) {
                // Use exists check to avoid duplicate foreign key attempts
                $sm = Schema::getConnection()->getDoctrineSchemaManager();
                $tableForeignKeys = [];
                try {
                    $tableForeignKeys = $sm->listTableForeignKeys('pre_registrations');
                } catch (\Throwable $e) {
                    // ignore; inability to list keys means proceed cautiously
                }

                $alreadyHas = false;
                foreach ($tableForeignKeys as $fk) {
                    if (in_array('department_id', $fk->getLocalColumns())) {
                        $alreadyHas = true;
                        break;
                    }
                }

                if (! $alreadyHas) {
                    $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null');
                }
            }

            if (Schema::hasTable('doctors') && Schema::hasColumn('pre_registrations', 'doctor_id')) {
                $sm = Schema::getConnection()->getDoctrineSchemaManager();
                $tableForeignKeys = [];
                try {
                    $tableForeignKeys = $sm->listTableForeignKeys('pre_registrations');
                } catch (\Throwable $e) {
                    // ignore
                }

                $alreadyHas = false;
                foreach ($tableForeignKeys as $fk) {
                    if (in_array('doctor_id', $fk->getLocalColumns())) {
                        $alreadyHas = true;
                        break;
                    }
                }

                if (! $alreadyHas) {
                    $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('set null');
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pre_registrations', function (Blueprint $table) {
            if (Schema::hasColumn('pre_registrations', 'department_id')) {
                try {
                    $table->dropForeign(['department_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, ignore
                }
                $table->dropColumn('department_id');
            }

            if (Schema::hasColumn('pre_registrations', 'doctor_id')) {
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
