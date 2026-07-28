<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_reminders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invoice_id');
            $table->timestamp('sent_at')->useCurrent();
            $table->string('channel')->default('email');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->foreign('invoice_id')->references('id')->on('payment_invoices')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_reminders');
    }
};
