<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // e.g., 'pre_registration', 'queue_update', etc.
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional data like pre_reg id
            $table->boolean('is_read')->default(false);
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // Null for all admins
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
