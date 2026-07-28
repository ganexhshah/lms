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
        Schema::create('admissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('application_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->date('date_of_birth');
            $table->string('gender');
            $table->string('address');
            $table->string('city');
            $table->string('course');
            $table->string('preferred_batch')->nullable();
            $table->string('status')->default('lead');
            $table->string('source')->default('website');
            $table->text('lead_notes')->nullable();
            $table->date('next_follow_up')->nullable();
            $table->string('assigned_batch')->nullable();
            $table->uuid('assigned_batch_id')->nullable();
            $table->unsignedInteger('waiting_position')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->uuid('student_id')->nullable();
            $table->timestamps();

            $table->foreign('assigned_batch_id')->references('id')->on('batches')->nullOnDelete();
            $table->foreign('student_id')->references('id')->on('students')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
