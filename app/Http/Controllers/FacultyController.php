<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Faculty;
use Illuminate\Support\Str;

class FacultyController extends Controller
{
    public function index()
    {
        return response()->json(Faculty::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $payload = $request->all();
        $data = [];
        $data['faculty_id'] = $payload['FacultyID'] ?? $payload['faculty_id'] ?? null;
        $data['first_name'] = $payload['FirstName'] ?? ($payload['Name'] ? explode(' ', $payload['Name'])[0] : null);
        $data['last_name'] = $payload['LastName'] ?? ($payload['Name'] ? implode(' ', array_slice(explode(' ', $payload['Name']), 1)) : null);
        $data['name'] = $payload['Name'] ?? trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
        $data['email'] = $payload['Email'] ?? $payload['email'] ?? null;
        $data['department'] = $payload['Department'] ?? null;
        $data['position'] = $payload['Position'] ?? null;
        $data['phone_number'] = $payload['PhoneNumber'] ?? null;
        $data['profile_picture'] = $payload['ProfilePicture'] ?? null;
        // Handle base64 image upload: save to public/uploads/faculties and store path
        if (!empty($data['profile_picture']) && Str::startsWith($data['profile_picture'], 'data:')) {
            if (preg_match('/^data:(.*?);base64,(.*)$/', $data['profile_picture'], $m)) {
                $mime = $m[1];
                $b64 = $m[2];
                $decoded = base64_decode($b64);
                $maxBytes = 50 * 1024 * 1024; // 50MB guard
                if ($decoded === false || strlen($decoded) > $maxBytes) {
                    return response()->json(['message' => 'Uploaded image is too large or invalid'], 422);
                }
                $ext = 'png';
                if (strpos($mime, '/') !== false) $ext = preg_replace('/[^a-z0-9]/i', '', explode('/', $mime)[1] ?? 'png');
                $fname = 'fac_' . Str::random(12) . '.' . $ext;
                $relative = 'uploads/faculties/' . $fname;
                if (!file_exists(public_path('uploads/faculties'))) mkdir(public_path('uploads/faculties'), 0755, true);
                file_put_contents(public_path($relative), $decoded);
                $data['profile_picture'] = '/' . $relative;
            }
        }
        $data['status'] = $payload['Status'] ?? null;
        $data['region'] = $payload['Region'] ?? null;
        $data['province'] = $payload['Province'] ?? null;
        $data['city'] = $payload['City'] ?? null;

        $faculty = Faculty::create($data);
        return response()->json($faculty, 201);
    }

    public function show(Faculty $faculty)
    {
        return response()->json($faculty);
    }

    public function update(Request $request, Faculty $faculty)
    {
        $payload = $request->all();
        $data = [];
        if (array_key_exists('FirstName', $payload)) $data['first_name'] = $payload['FirstName'];
        if (array_key_exists('LastName', $payload)) $data['last_name'] = $payload['LastName'];
        if (array_key_exists('Name', $payload)) $data['name'] = $payload['Name'];
        if (array_key_exists('Email', $payload)) $data['email'] = $payload['Email'];
        if (array_key_exists('Department', $payload)) $data['department'] = $payload['Department'];
        if (array_key_exists('Position', $payload)) $data['position'] = $payload['Position'];
        if (array_key_exists('PhoneNumber', $payload)) $data['phone_number'] = $payload['PhoneNumber'];
        if (array_key_exists('ProfilePicture', $payload)) $data['profile_picture'] = $payload['ProfilePicture'];
        if (!empty($data['profile_picture']) && Str::startsWith($data['profile_picture'], 'data:')) {
            if (preg_match('/^data:(.*?);base64,(.*)$/', $data['profile_picture'], $m)) {
                $mime = $m[1];
                $b64 = $m[2];
                $decoded = base64_decode($b64);
                $maxBytes = 50 * 1024 * 1024;
                if ($decoded === false || strlen($decoded) > $maxBytes) {
                    return response()->json(['message' => 'Uploaded image is too large or invalid'], 422);
                }
                $ext = 'png';
                if (strpos($mime, '/') !== false) $ext = preg_replace('/[^a-z0-9]/i', '', explode('/', $mime)[1] ?? 'png');
                $fname = 'fac_' . Str::random(12) . '.' . $ext;
                $relative = 'uploads/faculties/' . $fname;
                if (!file_exists(public_path('uploads/faculties'))) mkdir(public_path('uploads/faculties'), 0755, true);
                file_put_contents(public_path($relative), $decoded);
                $data['profile_picture'] = '/' . $relative;
            }
        }
        if (array_key_exists('Status', $payload)) $data['status'] = $payload['Status'];
        if (array_key_exists('Region', $payload)) $data['region'] = $payload['Region'];
        if (array_key_exists('Province', $payload)) $data['province'] = $payload['Province'];
        if (array_key_exists('City', $payload)) $data['city'] = $payload['City'];

        $faculty->update($data);
        return response()->json($faculty);
    }

    public function destroy(Faculty $faculty)
    {
        $faculty->delete();
        return response()->json(null, 204);
    }
}
