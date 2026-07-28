<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('channel')->default('board');
            $table->string('title');
            $table->text('body');
            $table->timestamp('sent_at')->useCurrent();
            $table->string('audience')->default('all');
            $table->string('audience_id')->nullable();
            $table->string('audience_label')->nullable();
            $table->json('delivery_log')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
