<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    // Explicitly set the primary key name to match the migration
    protected $primaryKey = 'CourseID';

    // Mass assignable attributes
    protected $fillable = ['title', 'course_code'];

    /**
     * Get the students for the course.
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'CourseID', 'CourseID');
    }
}
