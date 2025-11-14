<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Faculty;

class ReportController extends Controller
{
    public function studentReport(Request $request)
    {
        $course = $request->query('course');
        $query = Student::query();
        if ($course && $course !== 'All') {
            $query->where('course', $course);
        }

        $students = $query->orderBy('id', 'desc')->get();
        $generatedAt = now()->toDateTimeString();
        $summary = [
            'total' => $students->count(),
            'enrolled' => $students->where('status', 'Enrolled')->count(),
            'course' => $course ?: 'All',
            'status_breakdown' => $students->groupBy('status')->map->count()->toArray(),
            'generated_at' => $generatedAt,
        ];

        return response()->json([
            'students' => $students,
            'summary' => $summary,
        ]);
    }

    public function facultyReport(Request $request)
    {
        $department = $request->query('department');
        $query = Faculty::query();
        if ($department && $department !== 'All') {
            $query->where('department', $department);
        }

        $faculties = $query->orderBy('id', 'desc')->get();
        $generatedAt = now()->toDateTimeString();
        $summary = [
            'total' => $faculties->count(),
            'active' => $faculties->where('status', 'Active')->count(),
            'department' => $department ?: 'All',
            'departments' => $faculties->pluck('department')->filter()->unique()->values()->all(),
            'status_breakdown' => $faculties->groupBy('status')->map->count()->toArray(),
            'generated_at' => $generatedAt,
        ];

        return response()->json([
            'faculties' => $faculties,
            'summary' => $summary,
        ]);
    }
}
