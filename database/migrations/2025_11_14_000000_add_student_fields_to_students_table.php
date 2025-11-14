<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddStudentFieldsToStudentsTable extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            if (! Schema::hasColumn('students', 'student_id')) {
                $table->string('student_id')->nullable()->unique()->after('id');
            }
            if (! Schema::hasColumn('students', 'first_name')) {
                $table->string('first_name')->nullable()->after('student_id');
            }
            if (! Schema::hasColumn('students', 'last_name')) {
                $table->string('last_name')->nullable()->after('first_name');
            }
            if (! Schema::hasColumn('students', 'sex')) {
                $table->string('sex')->nullable()->after('last_name');
            }
            if (! Schema::hasColumn('students', 'enrollment_date')) {
                $table->date('enrollment_date')->nullable()->after('sex');
            }
            if (! Schema::hasColumn('students', 'address')) {
                $table->text('address')->nullable()->after('enrollment_date');
            }
            if (! Schema::hasColumn('students', 'phone_number')) {
                $table->string('phone_number')->nullable()->after('address');
            }
            if (! Schema::hasColumn('students', 'profile_picture')) {
                $table->text('profile_picture')->nullable()->after('phone_number');
            }
            if (! Schema::hasColumn('students', 'academic_year')) {
                $table->string('academic_year')->nullable()->after('profile_picture');
            }
            if (! Schema::hasColumn('students', 'status')) {
                $table->string('status')->nullable()->default('Active')->after('academic_year');
            }
            if (! Schema::hasColumn('students', 'region')) {
                $table->string('region')->nullable()->after('status');
            }
            if (! Schema::hasColumn('students', 'province')) {
                $table->string('province')->nullable()->after('region');
            }
            if (! Schema::hasColumn('students', 'city')) {
                $table->string('city')->nullable()->after('province');
            }
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $cols = ['student_id','first_name','last_name','sex','enrollment_date','address','phone_number','profile_picture','academic_year','status','region','province','city'];
            foreach ($cols as $c) {
                if (Schema::hasColumn('students', $c)) {
                    $table->dropColumn($c);
                }
            }
        });
    }
}
