<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('course');
            $table->string('batch');
            $table->uuid('batch_id')->nullable();
            $table->string('type')->default('practical');
            $table->date('date');
            $table->unsignedInteger('pass_mark')->default(60);
            $table->string('status')->default('scheduled');
            $table->timestamps();

            $table->foreign('batch_id')->references('id')->on('batches')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
