<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

if (! class_exists('CreateUsersTableAda')) {
    class CreateUsersTableAda extends Migration
    {
        public function up()
        {
            // If a users table already exists (for example from default Laravel installation),
            // skip creating it to avoid "table already exists" errors.
            if (Schema::hasTable('users')) {
                return;
            }

            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('username')->unique();
                $table->string('email')->unique();
                $table->string('password');
                $table->string('api_token', 100)->nullable()->unique();
                $table->timestamps();
            });
        }

        public function down()
        {
            Schema::dropIfExists('users');
        }
    }
}
