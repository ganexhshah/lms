<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('canva_connections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('token_type')->default('Bearer');
            $table->text('scope')->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('canva_designs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // id_card | certificate
            $table->uuid('student_id')->nullable();
            $table->string('subject_key')->nullable(); // e.g. course name / cert number
            $table->string('canva_design_id');
            $table->string('edit_url', 2048)->nullable();
            $table->string('view_url', 2048)->nullable();
            $table->string('export_url', 2048)->nullable();
            $table->string('cdn_url', 2048)->nullable();
            $table->string('status')->default('created');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['type', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('canva_designs');
        Schema::dropIfExists('canva_connections');
    }
};
