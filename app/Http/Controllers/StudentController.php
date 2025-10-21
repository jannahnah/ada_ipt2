<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/students
     */
    public function index(Request $request)
    {
        // Eager load Course and Department to avoid N+1 query problem
        $query = Student::with(['course', 'department']);
        
        // --- Filtering and Searching (Based on URL query parameters) ---
        // For simplicity, local filtering is mostly used in the frontend now,
        // but this setup allows for server-side filtering later.
        
        $students = $query->latest('StudentID')->get();

        // Map the Eloquent data to the structure the React component expects
        $formattedStudents = $students->map(function ($student) {
            return [
                'id' => $student->StudentID, // Internal DB ID (primary key)
                'StudentID' => $student->StudentID, // Public Student ID (optional, can be same as id)
                'Name' => trim($student->FirstName . ' ' . $student->LastName), // Combined name
                'Course' => $student->course->title ?? 'N/A', // Course title
                'Department' => $student->department->name ?? 'N/A', // Department name
                'Status' => $student->Status,
                'CourseID' => $student->CourseID, // Include IDs for update/edit forms
                'DepartmentID' => $student->DepartmentID,
            ];
        });

        return response()->json($formattedStudents);
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/students
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'Name' => 'required|string|max:200',
            'CourseID' => 'required|exists:courses,CourseID',
            'DepartmentID' => 'required|exists:departments,DepartmentID',
            'Status' => 'required|string|max:20',
        ]);

        // Split the full name into first and last (simple approach)
        $names = explode(' ', trim($validated['Name']), 2);
        $firstName = $names[0];
        $lastName = $names[1] ?? '';

        $student = Student::create([
            'FirstName' => $firstName,
            'LastName' => $lastName,
            'EnrollmentDate' => Carbon::now()->toDateString(), // Set enrollment date to now
            'CourseID' => $validated['CourseID'],
            'DepartmentID' => $validated['DepartmentID'],
            'Status' => $validated['Status'],
            'Email' => strtolower(str_replace(' ', '.', $firstName . $lastName)) . rand(100,999) . '@campus.edu', // Mock unique email
        ]);

        // Return the newly created student record, formatted for the frontend
        $student->load(['course', 'department']);

        return response()->json([
            'id' => $student->StudentID,
            'StudentID' => $student->StudentID,
            'Name' => trim($student->FirstName . ' ' . $student->LastName),
            'Course' => $student->course->title ?? 'N/A',
            'Department' => $student->department->name ?? 'N/A',
            'Status' => $student->Status,
            'CourseID' => $student->CourseID,
            'DepartmentID' => $student->DepartmentID,
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/students/{id}
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'Name' => 'required|string|max:200',
            'CourseID' => 'required|exists:courses,CourseID',
            'DepartmentID' => 'required|exists:departments,DepartmentID',
            'Status' => 'required|string|max:20',
        ]);
        
        // Split the full name
        $names = explode(' ', trim($validated['Name']), 2);
        $firstName = $names[0];
        $lastName = $names[1] ?? '';

        $student->update([
            'FirstName' => $firstName,
            'LastName' => $lastName,
            'CourseID' => $validated['CourseID'],
            'DepartmentID' => $validated['DepartmentID'],
            'Status' => $validated['Status'],
        ]);

        // Return the updated student record
        $student->load(['course', 'department']);

        return response()->json([
            'id' => $student->StudentID,
            'StudentID' => $student->StudentID,
            'Name' => trim($student->FirstName . ' ' . $student->LastName),
            'Course' => $student->course->title ?? 'N/A',
            'Department' => $student->department->name ?? 'N/A',
            'Status' => $student->Status,
            'CourseID' => $student->CourseID,
            'DepartmentID' => $student->DepartmentID,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/students/{id}
     */
    public function destroy(Student $student)
    {
        $student->delete();

        // Return a 204 No Content response
        return response()->json(null, 204);
    }
}