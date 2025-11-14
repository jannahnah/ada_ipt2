<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use Illuminate\Support\Str;

// For file handling
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index()
    {
        // Return an array of students (frontend expects an array)
        return response()->json(Student::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        // Accept both `Name` or `FirstName`/`LastName` from the frontend
        $payload = $request->all();

        // map incoming keys to DB columns
        $data = [];
        $data['student_id'] = $payload['StudentID'] ?? $payload['student_id'] ?? null;
        $data['first_name'] = $payload['FirstName'] ?? ($payload['Name'] ? explode(' ', $payload['Name'])[0] : null);
        $data['last_name'] = $payload['LastName'] ?? ($payload['Name'] ? implode(' ', array_slice(explode(' ', $payload['Name']), 1)) : null);
        $data['name'] = $payload['Name'] ?? trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
        $data['email'] = $payload['Email'] ?? $payload['email'] ?? null;
        $data['course'] = $payload['Course'] ?? $payload['course'] ?? null;
        $data['department'] = $payload['Department'] ?? $payload['department'] ?? null;
        $data['sex'] = $payload['Sex'] ?? null;
        $data['enrollment_date'] = $payload['EnrollmentDate'] ?? null;
        $data['address'] = $payload['Address'] ?? null;
        $data['phone_number'] = $payload['PhoneNumber'] ?? null;
        $data['profile_picture'] = $payload['ProfilePicture'] ?? null;
        $data['academic_year'] = $payload['AcademicYear'] ?? null;
    $data['year_level'] = $payload['YearLevel'] ?? $payload['year_level'] ?? null;
        $data['status'] = $payload['Status'] ?? null;
        $data['region'] = $payload['Region'] ?? null;
        $data['province'] = $payload['Province'] ?? null;
        $data['city'] = $payload['City'] ?? null;

        // If profile picture is a base64 data URL, save it to disk instead of storing huge base64 in the DB
        if (!empty($data['profile_picture']) && Str::startsWith($data['profile_picture'], 'data:')) {
            if (preg_match('/^data:(.*?);base64,(.*)$/', $data['profile_picture'], $matches)) {
                $mime = $matches[1];
                $b64 = $matches[2];
                $decoded = base64_decode($b64);
                // Prevent extremely large uploads from being saved into DB or disk accidentally
                $maxBytes = 50 * 1024 * 1024; // 50 MB guard
                if ($decoded === false || strlen($decoded) > $maxBytes) {
                    return response()->json(['message' => 'Uploaded image is too large or invalid'], 422);
                }
                $ext = 'png';
                if (strpos($mime, '/') !== false) {
                    $ext = explode('/', $mime)[1] ?? 'png';
                    // sanitize extension
                    $ext = preg_replace('/[^a-z0-9]/i', '', $ext);
                }
                $filename = 'stu_' . Str::random(12) . '.' . $ext;
                $relative = 'uploads/students/' . $filename;
                // ensure directory exists
                if (!file_exists(public_path('uploads/students'))) {
                    mkdir(public_path('uploads/students'), 0755, true);
                }
                file_put_contents(public_path($relative), $decoded);
                // store a public path (relative) to the saved file
                $data['profile_picture'] = '/' . $relative;
            }
        }

        $validated = validator($data, [
            'name' => 'required|string',
            'email' => 'nullable|email|unique:students,email',
            'student_id' => 'nullable|string|unique:students,student_id'
        ])->validate();

        // If no student_id supplied, auto-generate one using the academic year end (last two digits)
        if (empty($data['student_id'])) {
            $prefix = date('y');
            if (!empty($data['academic_year'])) {
                // try to extract the end year from formats like '2024-2025' or '2024/2025' or '2024'
                if (preg_match('/(\d{4})(?:[^0-9]+(\d{4}))?$/', $data['academic_year'], $m)) {
                    $endYear = isset($m[2]) && !empty($m[2]) ? $m[2] : $m[1];
                    $prefix = substr($endYear, -2);
                }
            }

            // Find highest existing student_id with this prefix and increment
            $like = $prefix . '%';
            $last = Student::where('student_id', 'like', $like)->orderBy('student_id', 'desc')->first();
            $nextSeq = 1;
            if ($last && preg_match('/^' . preg_quote($prefix, '/') . '(\d+)$/', $last->student_id, $mm)) {
                $nextSeq = intval($mm[1]) + 1;
            }
            $data['student_id'] = $prefix . str_pad($nextSeq, 8, '0', STR_PAD_LEFT);
        }

        $student = Student::create($data);
        return response()->json($student, 201);
    }

    public function show(Student $student)
    {
        return response()->json($student);
    }

    public function update(Request $request, Student $student)
    {
        $payload = $request->all();
        $data = [];
        if (array_key_exists('StudentID', $payload)) $data['student_id'] = $payload['StudentID'];
        if (array_key_exists('FirstName', $payload)) $data['first_name'] = $payload['FirstName'];
        if (array_key_exists('LastName', $payload)) $data['last_name'] = $payload['LastName'];
        if (array_key_exists('Name', $payload)) $data['name'] = $payload['Name'];
        if (array_key_exists('Email', $payload)) $data['email'] = $payload['Email'];
        if (array_key_exists('Course', $payload)) $data['course'] = $payload['Course'];
        if (array_key_exists('Department', $payload)) $data['department'] = $payload['Department'];
        if (array_key_exists('Sex', $payload)) $data['sex'] = $payload['Sex'];
        if (array_key_exists('EnrollmentDate', $payload)) $data['enrollment_date'] = $payload['EnrollmentDate'];
        if (array_key_exists('Address', $payload)) $data['address'] = $payload['Address'];
        if (array_key_exists('PhoneNumber', $payload)) $data['phone_number'] = $payload['PhoneNumber'];
        if (array_key_exists('ProfilePicture', $payload)) $data['profile_picture'] = $payload['ProfilePicture'];

        // If updating with a data URL image, save it to disk and set profile_picture to file path
        if (!empty($data['profile_picture']) && Str::startsWith($data['profile_picture'], 'data:')) {
            if (preg_match('/^data:(.*?);base64,(.*)$/', $data['profile_picture'], $matches)) {
                $mime = $matches[1];
                $b64 = $matches[2];
                $decoded = base64_decode($b64);
                $maxBytes = 50 * 1024 * 1024; // 50 MB guard
                if ($decoded === false || strlen($decoded) > $maxBytes) {
                    return response()->json(['message' => 'Uploaded image is too large or invalid'], 422);
                }
                $ext = 'png';
                if (strpos($mime, '/') !== false) {
                    $ext = explode('/', $mime)[1] ?? 'png';
                    $ext = preg_replace('/[^a-z0-9]/i', '', $ext);
                }
                $filename = 'stu_' . Str::random(12) . '.' . $ext;
                $relative = 'uploads/students/' . $filename;
                if (!file_exists(public_path('uploads/students'))) {
                    mkdir(public_path('uploads/students'), 0755, true);
                }
                file_put_contents(public_path($relative), $decoded);
                $data['profile_picture'] = '/' . $relative;
            }
        }
        if (array_key_exists('AcademicYear', $payload)) $data['academic_year'] = $payload['AcademicYear'];
    if (array_key_exists('YearLevel', $payload)) $data['year_level'] = $payload['YearLevel'];
        if (array_key_exists('Status', $payload)) $data['status'] = $payload['Status'];
        if (array_key_exists('Region', $payload)) $data['region'] = $payload['Region'];
        if (array_key_exists('Province', $payload)) $data['province'] = $payload['Province'];
        if (array_key_exists('City', $payload)) $data['city'] = $payload['City'];

        // Validate email unique except current record
        $rules = [
            'email' => 'nullable|email|unique:students,email,' . $student->id,
            'student_id' => 'nullable|string|unique:students,student_id,' . $student->id,
        ];
        validator($data, $rules)->validate();

        $student->update($data);
        return response()->json($student);
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(null, 204);
    }
}