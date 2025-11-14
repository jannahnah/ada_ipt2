<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/auth/verify', [AuthController::class, 'verify']); // expects Bearer token

// Public profile routes
Route::post('/register', [ProfileController::class, 'store']);
Route::get('/profiles', [ProfileController::class, 'index']);

// Single profile routes for show, update and delete
Route::get('/profiles/{profile}', [ProfileController::class, 'show']);
Route::put('/profiles/{profile}', [ProfileController::class, 'update']);
Route::delete('/profiles/{profile}', [ProfileController::class, 'destroy']);

// This defines the resourceful routes for the REST API
Route::apiResource('students', \App\Http\Controllers\StudentController::class);
// Faculty resource
Route::apiResource('faculties', \App\Http\Controllers\FacultyController::class);

// Utility routes to fetch options for dropdowns (Courses and Departments)
Route::get('/courses/options', [CourseController::class, 'options']);
Route::get('/departments/options', [DepartmentController::class, 'options']);

// Reports rely on the student and faculty models
Route::get('/reports/students', [ReportController::class, 'studentReport']);
Route::get('/reports/faculties', [ReportController::class, 'facultyReport']);

// Debug: list users (only in local environment)
Route::get('/debug/users', function () {
    if (! app()->environment('local')) {
        abort(403);
    }
    return \App\Models\User::select('id','name','email','username','api_token','created_at')->get();
});

Route::middleware('auth:api')->group(function () {
    // protected routes can be added here (example)
});