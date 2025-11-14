<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

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
            ['code' => 'ENG', 'name' => 'Engineering'],
            ['code' => 'BUS', 'name' => 'Business'],
            ['code' => 'SCI', 'name' => 'Sciences'],
            ['code' => 'HUM', 'name' => 'Humanities'],
        ];

        if (Schema::hasTable('departments')) {
            $hasCode = Schema::hasColumn('departments', 'code');
            $hasName = Schema::hasColumn('departments', 'name');

            foreach ($departments as $dept) {
                $key = [];
                $data = ['updated_at' => now(), 'created_at' => now()];

                if ($hasCode) {
                    $key['code'] = $dept['code'];
                    $data['code'] = $dept['code'];
                }
                if ($hasName) {
                    // use name as key when code isn't available
                    if (empty($key)) {
                        $key['name'] = $dept['name'];
                    }
                    $data['name'] = $dept['name'];
                }

                if (! empty($key)) {
                    DB::table('departments')->updateOrInsert($key, $data);
                }
            }
        }

        // --- 2. Courses ---
        $courses = [
            ['code' => 'CS101', 'name' => 'Computer Science 101'],
            ['code' => 'IT101', 'name' => 'Information Technology 101'],
        ];

        if (Schema::hasTable('courses')) {
            $hasCourseCode = Schema::hasColumn('courses', 'course_code');
            $hasCode = Schema::hasColumn('courses', 'code');
            $hasName = Schema::hasColumn('courses', 'name');
            $hasTitle = Schema::hasColumn('courses', 'title');
            $hasCourseName = Schema::hasColumn('courses', 'course_name');

            foreach ($courses as $course) {
                $key = [];
                $data = ['updated_at' => now(), 'created_at' => now()];

                // Prefer using a code-like column as the unique key
                if ($hasCourseCode) {
                    $key['course_code'] = $course['code'];
                    $data['course_code'] = $course['code'];
                } elseif ($hasCode) {
                    $key['code'] = $course['code'];
                    $data['code'] = $course['code'];
                }

                // Fill name/title/course_name only when those columns exist
                if ($hasName) {
                    if (empty($key)) $key['name'] = $course['name'];
                    $data['name'] = $course['name'];
                }
                if ($hasTitle) {
                    if (empty($key)) $key['title'] = $course['name'];
                    $data['title'] = $course['name'];
                }
                if ($hasCourseName) {
                    if (empty($key)) $key['course_name'] = $course['name'];
                    $data['course_name'] = $course['name'];
                }

                // If there's no suitable key column, skip this course to avoid errors
                if (empty($key)) {
                    continue;
                }

                // Only include columns that actually exist in $data (avoid null fields referencing non-existent columns)
                $filteredData = [];
                foreach ($data as $col => $val) {
                    if (Schema::hasColumn('courses', $col) || $col === 'updated_at' || $col === 'created_at') {
                        $filteredData[$col] = $val;
                    }
                }

                DB::table('courses')->updateOrInsert($key, $filteredData);
            }
        } else {
            // courses table missing — skip seeding courses
        }

        // --- build lookup maps for departments and courses (used by student inserts) ---
        $deptMap = [];
        if (Schema::hasTable('departments')) {
            // find an id column and a key column that actually exist
            $deptIdCol = null;
            foreach (['id','ID','DepartmentID','department_id','dept_id'] as $col) {
                if (Schema::hasColumn('departments', $col)) { $deptIdCol = $col; break; }
            }
            $deptKeyCol = null;
            foreach (['name','Name','department_name','dept_name','code','Code'] as $col) {
                if (Schema::hasColumn('departments', $col)) { $deptKeyCol = $col; break; }
            }
            if ($deptIdCol && $deptKeyCol) {
                $deptMap = DB::table('departments')->pluck($deptIdCol, $deptKeyCol)->toArray();
            } elseif ($deptIdCol) {
                // fallback: map id => id (not ideal, but prevents exceptions)
                $deptMap = DB::table('departments')->pluck($deptIdCol)->toArray();
            }
        }

        $courseMap = [];
        if (Schema::hasTable('courses')) {
            $courseIdCol = null;
            foreach (['id','ID','CourseID','course_id'] as $col) {
                if (Schema::hasColumn('courses', $col)) { $courseIdCol = $col; break; }
            }
            $courseKeyCol = null;
            foreach (['name','title','course_name','CourseName','code','course_code'] as $col) {
                if (Schema::hasColumn('courses', $col)) { $courseKeyCol = $col; break; }
            }
            if ($courseIdCol && $courseKeyCol) {
                $courseMap = DB::table('courses')->pluck($courseIdCol, $courseKeyCol)->toArray();
            } elseif ($courseIdCol) {
                $courseMap = DB::table('courses')->pluck($courseIdCol)->toArray();
            }
        }

        // --- Academic Years (Required for FK) ---
        if (Schema::hasTable('academic_years')) {
            // insert only if not exists
            if (! DB::table('academic_years')->where('year_name', '2024/2025')->exists()) {
                DB::table('academic_years')->insert([
                    'year_name' => '2024/2025',
                    'start_date' => Carbon::createFromDate(2024, 9, 1),
                    'end_date' => Carbon::createFromDate(2025, 6, 30),
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]);
            }

            // detect academic year id column name safely
            $academicYearIdCol = null;
            foreach (['id','ID','AcademicYearID','academic_year_id'] as $col) {
                if (Schema::hasColumn('academic_years', $col)) { $academicYearIdCol = $col; break; }
            }
            $academicYearID = $academicYearIdCol ? DB::table('academic_years')->where('year_name','2024/2025')->value($academicYearIdCol) : null;
        } else {
            $academicYearID = null;
        }

        // --- 4. Students (Mock Data) ---
        // Build students array using safe lookups from maps (coalesce to various keys)
        $students = [
            [
                'FirstName' => 'Alice',
                'LastName' => 'Johnson',
                'EnrollmentDate' => Carbon::createFromDate(2023, 9, 1),
                'Email' => 'alice.j@campus.edu',
                'Status' => 'Active',
                // try several possible keys that may exist in $deptMap/$courseMap
                'DepartmentID' => $deptMap['Engineering'] ?? $deptMap['ENG'] ?? $deptMap['engineering'] ?? null,
                'CourseID' => $courseMap['Computer Science 101'] ?? $courseMap['Computer Science'] ?? $courseMap['CS101'] ?? null,
                'AcademicYearID' => $academicYearID ?? null,
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'FirstName' => 'Bob',
                'LastName' => 'Williams',
                'EnrollmentDate' => Carbon::createFromDate(2023, 9, 1),
                'Email' => 'bob.w@campus.edu',
                'Status' => 'Active',
                'DepartmentID' => $deptMap['Business'] ?? $deptMap['BUS'] ?? null,
                'CourseID' => $courseMap['Information Technology 101'] ?? $courseMap['IT101'] ?? null,
                'AcademicYearID' => $academicYearID ?? null,
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
            [
                'FirstName' => 'Charlie',
                'LastName' => 'Brown',
                'EnrollmentDate' => Carbon::createFromDate(2022, 9, 1),
                'Email' => 'charlie.b@campus.edu',
                'Status' => 'On Leave',
                'DepartmentID' => $deptMap['Sciences'] ?? $deptMap['SCI'] ?? null,
                'CourseID' => $courseMap['Biology'] ?? null,
                'AcademicYearID' => $academicYearID ?? null,
                'created_at' => Carbon::now(), 'updated_at' => Carbon::now()
            ],
        ];

        // Insert students only if students table exists and there are items
        if (Schema::hasTable('students') && !empty($students)) {
            $insertRows = [];
            foreach ($students as $s) {
                $row = [];

                // map name fields
                if (Schema::hasColumn('students', 'first_name')) {
                    $row['first_name'] = $s['FirstName'] ?? ($s['first_name'] ?? null);
                } elseif (Schema::hasColumn('students', 'FirstName')) {
                    $row['FirstName'] = $s['FirstName'] ?? null;
                }

                if (Schema::hasColumn('students', 'last_name')) {
                    $row['last_name'] = $s['LastName'] ?? ($s['last_name'] ?? null);
                } elseif (Schema::hasColumn('students', 'LastName')) {
                    $row['LastName'] = $s['LastName'] ?? null;
                }

                // enrollment date
                if (Schema::hasColumn('students', 'enrollment_date')) {
                    $row['enrollment_date'] = $s['EnrollmentDate'] ?? ($s['enrollment_date'] ?? null);
                } elseif (Schema::hasColumn('students', 'EnrollmentDate')) {
                    $row['EnrollmentDate'] = $s['EnrollmentDate'] ?? null;
                }

                // email and status
                if (Schema::hasColumn('students', 'email')) {
                    $row['email'] = $s['Email'] ?? ($s['email'] ?? null);
                }
                if (Schema::hasColumn('students', 'status')) {
                    $row['status'] = $s['Status'] ?? ($s['status'] ?? null);
                }

                // map department/course/academic year IDs if present
                if (Schema::hasColumn('students', 'DepartmentID')) {
                    $row['DepartmentID'] = $s['DepartmentID'] ?? null;
                } elseif (Schema::hasColumn('students', 'department')) {
                    // students table may store department name/code in a string column
                    if (! empty($s['DepartmentID'])) {
                        $row['department'] = $s['DepartmentID'];
                    }
                }

                if (Schema::hasColumn('students', 'CourseID')) {
                    $row['CourseID'] = $s['CourseID'] ?? null;
                } elseif (Schema::hasColumn('students', 'course')) {
                    if (! empty($s['CourseID'])) {
                        $row['course'] = $s['CourseID'];
                    }
                }

                if (Schema::hasColumn('students', 'AcademicYearID')) {
                    $row['AcademicYearID'] = $s['AcademicYearID'] ?? null;
                } elseif (Schema::hasColumn('students', 'academic_year')) {
                    $row['academic_year'] = $s['AcademicYearID'] ?? ($s['academic_year'] ?? null);
                }

                // timestamps
                if (isset($s['created_at'])) $row['created_at'] = $s['created_at'];
                if (isset($s['updated_at'])) $row['updated_at'] = $s['updated_at'];

                // fallback: if email is missing but Email exists in table, try that
                if (empty($row) && is_array($s)) {
                    $row = $s;
                }

                // only insert non-empty rows
                if (! empty($row)) {
                    $insertRows[] = $row;
                }
            }

            if (! empty($insertRows)) {
                DB::table('students')->insert($insertRows);
            }
        }
    }
}
