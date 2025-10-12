<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Get the options for dropdowns (ID and Title).
     */
    public function options()
    {
        // Select only the ID and the title column, mapped to 'id' and 'name' for the frontend
        $courses = Course::all(['CourseID as id', 'title as name']);

        return response()->json($courses);
    }
}
