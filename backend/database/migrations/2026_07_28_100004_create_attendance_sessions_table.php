<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('date');
            $table->string('batch');
            $table->uuid('batch_id')->nullable();
            $table->string('course');
            $table->unsignedInteger('present')->default(0);
            $table->unsignedInteger('absent')->default(0);
            $table->string('method')->default('manual');
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->foreign('batch_id')->references('id')->on('batches')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_sessions');
    }
};
