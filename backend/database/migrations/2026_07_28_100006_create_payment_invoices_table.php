<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('number')->unique();
            $table->string('student');
            $table->uuid('student_id')->nullable();
            $table->string('course');
            $table->unsignedInteger('amount')->default(0);
            $table->unsignedInteger('paid')->default(0);
            $table->date('due_date');
            $table->string('status')->default('partial');
            $table->unsignedInteger('discount')->default(0);
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_invoices');
    }
};
