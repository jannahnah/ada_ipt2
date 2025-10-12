<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    // READ: Fetch all students
    public function index()
    {
        // Load students and eager load related data (Department, Course)
        $students = Student::with(['department', 'course'])->get();
        return response()->json($students);
    }

    // CREATE: Store a new student
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'FirstName' => 'required|string|max:100',
            'LastName' => 'required|string|max:100',
            'Email' => 'required|email|unique:students,Email|max:100',
            'EnrollmentDate' => 'required|date',
            'DepartmentID' => 'nullable|exists:departments,DepartmentID',
            'CourseID' => 'nullable|exists:courses,CourseID',
            'AcademicYearID' => 'nullable|exists:academic_years,AcademicYearID',
            // ... add validation for other fields
        ]);

        $student = Student::create($validatedData);
        return response()->json([
            'message' => 'Student created successfully.',
            'student' => $student
        ], 201); // 201 Created
    }

    // READ: Fetch a specific student
    public function show(Student $student)
    {
        // Return the student with related data
        return response()->json($student->load(['department', 'course']));
    }

    // UPDATE: Update the specified student
    public function update(Request $request, Student $student)
    {
        $validatedData = $request->validate([
            'FirstName' => 'sometimes|required|string|max:100',
            'LastName' => 'sometimes|required|string|max:100',
            'Email' => 'sometimes|required|email|unique:students,Email,' . $student->StudentID . ',StudentID|max:100',
            // ... include all updateable fields
        ]);
        
        $student->update($validatedData);
        return response()->json(['message' => 'Student updated successfully.', 'student' => $student]);
    }

    // DELETE: Remove the specified student
    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(['message' => 'Student deleted successfully.'], 204); // 204 No Content
    }
}