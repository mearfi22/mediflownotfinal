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
            if (!Schema::hasColumn('queue', 'priority')) {
                $table->enum('priority', ['regular', 'senior', 'pwd', 'emergency'])->default('regular')->after('status');
            }
            if (!Schema::hasColumn('queue', 'estimated_wait_minutes')) {
                $table->integer('estimated_wait_minutes')->nullable()->after('priority');
            }
        });

        // Add average consultation time to doctors table
        Schema::table('doctors', function (Blueprint $table) {
            if (!Schema::hasColumn('doctors', 'avg_consultation_minutes')) {
                $table->integer('avg_consultation_minutes')->default(15)->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('queue', function (Blueprint $table) {
            $table->dropColumn(['priority', 'estimated_wait_minutes']);
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('avg_consultation_minutes');
        });
    }
};
