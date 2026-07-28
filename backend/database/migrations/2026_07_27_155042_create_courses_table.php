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
        Schema::create('courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_weeks')->default(0);
            $table->unsignedInteger('duration_hours')->default(0);
            $table->string('level')->default('beginner');
            $table->string('status')->default('draft');
            $table->unsignedBigInteger('fee')->default(0);
            $table->unsignedInteger('installments')->default(1);
            $table->text('discount_notes')->nullable();
            $table->json('syllabus')->nullable();
            $table->json('trainers')->nullable();
            $table->json('materials')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
