<?php

namespace App\Http\Controllers;

class DepartmentController extends Controller
{
    public function options()
    {
        $departments = [
            ['id' => 'sci', 'name' => 'Science'],
            ['id' => 'arts', 'name' => 'Arts'],
            ['id' => 'bus', 'name' => 'Business'],
        ];

        return response()->json($departments);
    }
}
