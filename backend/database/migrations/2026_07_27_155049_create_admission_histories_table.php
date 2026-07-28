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
        Schema::create('admission_histories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('admission_id');
            $table->string('title');
            $table->text('detail')->nullable();
            $table->timestamp('date')->useCurrent();
            $table->timestamps();

            $table->foreign('admission_id')->references('id')->on('admissions')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_histories');
    }
};
