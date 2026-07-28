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
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('student_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->date('date_of_birth');
            $table->string('gender');
            $table->string('address');
            $table->string('city');
            $table->string('course');
            $table->string('batch');
            $table->string('status')->default('active');
            $table->date('enrolled_at');
            $table->string('photo_url')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('nationality')->nullable();
            $table->boolean('id_card_issued')->default(false);
            $table->timestamp('id_card_issued_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
