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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('role')->default('Administrator')->after('phone');
            $table->string('institution')->nullable()->after('role');
            $table->boolean('notify_fees')->default(true)->after('institution');
            $table->boolean('notify_stock')->default(true)->after('notify_fees');
            $table->boolean('notify_absences')->default(true)->after('notify_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'role',
                'institution',
                'notify_fees',
                'notify_stock',
                'notify_absences',
            ]);
        });
    }
};
