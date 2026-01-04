<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, temporarily expand the enum to include both old and new values
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'serving', 'served', 'attending', 'attended', 'skipped') DEFAULT 'waiting'");

        // Migrate existing data
        DB::statement("UPDATE queue SET status = 'attending' WHERE status = 'serving'");
        DB::statement("UPDATE queue SET status = 'attended' WHERE status = 'served'");

        // Now remove the old values from the enum
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'attending', 'attended', 'skipped') DEFAULT 'waiting'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to old status names
        DB::statement("UPDATE queue SET status = 'serving' WHERE status = 'attending'");
        DB::statement("UPDATE queue SET status = 'served' WHERE status = 'attended'");
        DB::statement("ALTER TABLE queue MODIFY COLUMN status ENUM('waiting', 'serving', 'served', 'skipped') DEFAULT 'waiting'");
    }
};
