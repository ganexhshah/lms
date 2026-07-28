<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer_rating_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('trainer_id');
            $table->date('date');
            $table->decimal('score', 3, 2);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('trainer_id')->references('id')->on('trainers')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_rating_events');
    }
};
