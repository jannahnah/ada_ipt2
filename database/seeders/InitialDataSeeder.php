<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // --- 1. Departments ---
        $departments = [
            ['name' => 'Engineering', 'code' => 'ENG', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Business', 'code' => 'BUS', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Sciences', 'code' => 'SCI', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Humanities', 'code' => 'HUM', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ];
        DB::table('departments')->insert($departments);
        
        $deptMap = DB::table('departments')->pluck('DepartmentID', 'name')->toArray();

        // --- 2. Courses ---
        $courses = [
            ['title' => 'Computer Science', 'course_code' => 'CS101', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['title' => 'Business Administration', 'course_code' => 'BA201', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['title' => 'Biology', 'course_code' => 'BIO301', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['title' => 'Psychology', 'course_code' => 'PSY401', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ];
        DB::table('courses')->insert($courses);
        
        $courseMap = DB::table('courses')->pluck('CourseID', 'title')->toArray();

        // --- 3. Academic Years (Required for FK) ---
        DB::table('academic_years')->insert([
            'year_name' => '2024/2025',
            'start_date' => Carbon::createFromDate(2024, 9, 1),
            'end_date' => Carbon::createFromDate(2025, 6, 30),
            'created_at' => Carbon::now(), 
            'updated_at' => Carbon::now()
        ]);
        $academicYearID = DB::table('academic_years')->where('year_name', '2024/2025')->value('AcademicYearID');

        // --- 4. Students (Mock Data) ---
        $students = [
            [
                'FirstName' => 'Alice',
                'LastName' => 'Johnson',
                'EnrollmentDate' => Carbon::createFromDate(2023, 9, 1),
                'Email' => 'alice.j@campus.edu',
                'Status' => 'Active',
                'DepartmentID' => $deptMap['Engineering'],
                'CourseID' => $courseMap['Computer Science'],
                'AcademicYearID' => $academicYearID,
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'FirstName' => 'Bob',
                'LastName' => 'Williams',
                'EnrollmentDate' => Carbon::createFromDate(2023, 9, 1),
                'Email' => 'bob.w@campus.edu',
                'Status' => 'Active',
                'DepartmentID' => $deptMap['Business'],
                'CourseID' => $courseMap['Business Administration'],
                'AcademicYearID' => $academicYearID,
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'FirstName' => 'Charlie',
                'LastName' => 'Brown',
                'EnrollmentDate' => Carbon::createFromDate(2022, 9, 1),
                'Email' => 'charlie.b@campus.edu',
                'Status' => 'On Leave',
                'DepartmentID' => $deptMap['Sciences'],
                'CourseID' => $courseMap['Biology'],
                'AcademicYearID' => $academicYearID,
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
        ];
        DB::table('students')->insert($students);
    }
}
