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
        Schema::create('batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('course');
            $table->uuid('course_id')->nullable();
            $table->string('shift')->default('morning');
            $table->unsignedInteger('capacity')->default(0);
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('progress')->default(0);
            $table->string('trainer')->nullable();
            $table->uuid('trainer_id')->nullable();
            $table->string('room')->nullable();
            $table->string('status')->default('upcoming');
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
