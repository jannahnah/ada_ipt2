<?php

namespace App\Http\Controllers;

class CourseController extends Controller
{
    public function options()
    {
        // Replace with DB-driven values if needed
        $courses = [
            ['id' => 'cs', 'name' => 'Computer Science'],
            ['id' => 'it', 'name' => 'Information Technology'],
            ['id' => 'eng', 'name' => 'Engineering'],
        ];

        return response()->json($courses);
    }
}
