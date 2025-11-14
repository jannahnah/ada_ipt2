<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

if (! class_exists('CreateStudentsTable')) {
    class CreateStudentsTable extends Migration
    {
        public function up()
        {
            // If the students table already exists, skip creating it to avoid "table already exists" errors.
            if (Schema::hasTable('students')) {
                return;
            }

            Schema::create('students', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->nullable()->unique();
                $table->string('course')->nullable();
                $table->string('department')->nullable();
                $table->timestamps();
            });
        }

        public function down()
        {
            Schema::dropIfExists('students');
        }
    }
}
