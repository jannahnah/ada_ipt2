<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    // Explicitly set the primary key name to match the migration
    protected $primaryKey = 'StudentID';

    /**
     * The attributes that are mass assignable.
     * Note: I'm assuming Name on the frontend maps to FirstName/LastName in the DB.
     */
    protected $fillable = [
        'FirstName', 
        'LastName',
        'Sex',
        'EnrollmentDate',
        'Address',
        'PhoneNumber',
        'Email',
        'Status',
        'ProfilePicture',
        'DepartmentID',
        'CourseID',
        'AcademicYearID'
    ];
    
    // Casts for date fields
    protected $casts = [
        'EnrollmentDate' => 'date',
    ];

    /**
     * Get the course that the student belongs to.
     */
    public function course()
    {
        return $this->belongsTo(Course::class, 'CourseID', 'CourseID');
    }

    /**
     * Get the department that the student belongs to.
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentID', 'DepartmentID');
    }
}
