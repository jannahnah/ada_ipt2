<?php

use Illuminate\Support\Facades\Route;


Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');

Route::get('/students/dashboard', function () {
    return view('students.index'); // Points to resources/views/students/index.blade.php
});

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


