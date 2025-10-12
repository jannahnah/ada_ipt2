<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCoursesTable extends Migration
{
    public function up()
    {
        Schema::create('courses', function (Blueprint $table) {
            // This MUST match the column referenced in the students table
            $table->id('CourseID'); 
            
            $table->string('title', 150);
            $table->string('course_code', 10)->unique();
            // Optional: You could even link a course back to a department here
            // $table->foreignId('DepartmentID')->constrained('departments', 'DepartmentID'); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courses');
    }
}