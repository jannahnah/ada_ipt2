<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddYearLevelToStudentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('students') && !Schema::hasColumn('students', 'year_level')) {
            Schema::table('students', function (Blueprint $table) {
                $table->string('year_level')->nullable()->after('academic_year');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('students') && Schema::hasColumn('students', 'year_level')) {
            Schema::table('students', function (Blueprint $table) {
                $table->dropColumn('year_level');
            });
        }
    }
}
