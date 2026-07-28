<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_receipts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('invoice_id');
            $table->timestamp('downloaded_at')->useCurrent();
            $table->unsignedInteger('amount')->default(0);
            $table->timestamps();

            $table->foreign('invoice_id')->references('id')->on('payment_invoices')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_receipts');
    }
};
