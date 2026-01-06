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
        // First, add 'no_show' to the ENUM
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'attending', 'attended', 'skipped', 'no_show') DEFAULT 'waiting'");

        // Update existing 'skipped' records to 'no_show'
        DB::statement("UPDATE queue SET status = 'no_show' WHERE status = 'skipped'");

        // Remove 'skipped' from the ENUM
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'attending', 'attended', 'no_show') DEFAULT 'waiting'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add 'skipped' back to the ENUM
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'attending', 'attended', 'no_show', 'skipped') DEFAULT 'waiting'");

        // Update 'no_show' records back to 'skipped'
        DB::statement("UPDATE queue SET status = 'skipped' WHERE status = 'no_show'");

        // Remove 'no_show' from the ENUM
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'attending', 'attended', 'skipped') DEFAULT 'waiting'");
    }
};
