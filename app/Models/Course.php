<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    // Explicitly define the table name
    protected $table = 'courses';

    // Define the custom primary key
    protected $primaryKey = 'CourseID';

    // Allow mass assignment for these fields
    protected $fillable = ['title', 'course_code'];

    /**
     * Get the students associated with the course.
     */
    public function students()
    {
        // One Course has many Students
        // We use the custom foreign key 'CourseID'
        return $this->hasMany(Student::class, 'CourseID', 'CourseID');
    }
}
