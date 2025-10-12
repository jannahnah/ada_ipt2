<?php
// <-- START of file

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentsTable extends Migration // <-- Class definition
{
    public function up()
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id('StudentID');

            // Student Information Fields
            $table->string('FirstName', 100);
            $table->string('LastName', 100);
            $table->char('Sex', 1)->nullable();
            $table->date('EnrollmentDate');

            $table->string('Address', 255)->nullable();
            $table->string('PhoneNumber', 20)->nullable();
            $table->string('Email', 100)->unique();
            $table->string('Status', 20)->default('Active');
            $table->string('ProfilePicture', 255)->nullable();

            // CORRECTED FOREIGN KEY DEFINITIONS:
            $table->foreignId('DepartmentID')
                ->nullable()
                ->constrained('departments', 'DepartmentID')
                ->onDelete('set null');

            $table->foreignId('CourseID')
                ->nullable()
                ->constrained('courses', 'CourseID')
                ->onDelete('set null');

            $table->foreignId('AcademicYearID')
                ->nullable()
                ->constrained('academic_years', 'AcademicYearID')
                ->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('students');
    }
}
// <-- END of file