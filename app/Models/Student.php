<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    
    // 1. Specify the table name (Laravel often pluralizes, but good to be explicit)
    protected $table = 'students'; 

    // 2. Define the custom primary key
    protected $primaryKey = 'StudentID'; 
    
    // 3. Prevent Laravel from assuming the primary key is an auto-incrementing integer (if you used BigInt/unsignedBigInteger)
    public $incrementing = true; // Use 'false' only if StudentID is manually assigned

    // 4. Define mass assignable fields
    protected $fillable = [
        'FirstName',
        'LastName',
        'Sex',
        'EnrollmentDate',
        'DepartmentID',
        'Address',
        'PhoneNumber',
        'Email',
        'Status',
        'CourseID',
        'AcademicYearID',
        'ProfilePicture',
    ];

    // Optional: Define relationships for easy data retrieval

    // Relationship to Department
    public function department()
    {
        return $this->belongsTo(Department::class, 'DepartmentID', 'DepartmentID');
    }

    // Relationship to Course
    public function course()
    {
        return $this->belongsTo(Course::class, 'CourseID', 'CourseID');
    }
    
    // Relationship to AcademicYear
    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'AcademicYearID', 'AcademicYearID');
    }
}