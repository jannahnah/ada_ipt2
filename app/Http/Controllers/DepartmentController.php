<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Get the options for dropdowns (ID and Name).
     */
    public function options()
    {
        // Select only the ID and the name column, mapped to 'id' and 'name' for the frontend
        $departments = Department::all(['DepartmentID as id', 'name']);
        
        return response()->json($departments);
    }
}
