<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_verify_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('certificate_id');
            $table->timestamp('verified_at')->useCurrent();
            $table->string('result')->default('valid');
            $table->timestamps();

            $table->foreign('certificate_id')->references('id')->on('certificates')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_verify_logs');
    }
};
