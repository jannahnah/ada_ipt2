<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
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

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Public profile routes
Route::post('/register', [ProfileController::class, 'store']);
Route::get('/profiles', [ProfileController::class, 'index']);

// Single profile routes for show, update and delete
Route::get('/profiles/{profile}', [ProfileController::class, 'show']);
Route::put('/profiles/{profile}', [ProfileController::class, 'update']);
Route::delete('/profiles/{profile}', [ProfileController::class, 'destroy']);

// This defines the resourceful routes for the REST API
Route::resource('students', StudentController::class);

// Utility routes to fetch options for dropdowns (Courses and Departments)
Route::get('/courses/options', [CourseController::class, 'options']);
Route::get('/departments/options', [DepartmentController::class, 'options']);

Route::middleware('auth:api')->group(function () {
    
});