<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timetable_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('day', 30);
            $table->string('time', 50);
            $table->string('course');
            $table->string('batch');
            $table->uuid('batch_id')->nullable();
            $table->string('trainer');
            $table->uuid('trainer_id')->nullable();
            $table->string('room');
            $table->timestamps();

            $table->foreign('batch_id')->references('id')->on('batches')->nullOnDelete();
            $table->foreign('trainer_id')->references('id')->on('trainers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timetable_slots');
    }
};
