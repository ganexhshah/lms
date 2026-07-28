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
        Schema::create('batch_transfers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('student_id');
            $table->uuid('from_batch_id')->nullable();
            $table->uuid('to_batch_id');
            $table->text('note')->nullable();
            $table->timestamp('date')->useCurrent();
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->cascadeOnDelete();
            $table->foreign('from_batch_id')->references('id')->on('batches')->nullOnDelete();
            $table->foreign('to_batch_id')->references('id')->on('batches')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_transfers');
    }
};
