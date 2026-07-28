<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('placements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('student');
            $table->uuid('student_id')->nullable();
            $table->string('employer');
            $table->uuid('employer_id')->nullable();
            $table->string('role');
            $table->date('interview_date')->nullable();
            $table->string('status')->default('applied');
            $table->string('cv_name')->nullable();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->nullOnDelete();
            $table->foreign('employer_id')->references('id')->on('employers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('placements');
    }
};
