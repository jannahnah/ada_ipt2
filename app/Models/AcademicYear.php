<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    // Explicitly define the table name
    protected $table = 'academic_years';

    // Define the custom primary key
    protected $primaryKey = 'AcademicYearID';

    // Allow mass assignment for these fields
    protected $fillable = ['year_name', 'start_date', 'end_date'];

    /**
     * Get the students associated with the academic year.
     */
    public function students()
    {
        // One AcademicYear has many Students
        // We use the custom foreign key 'AcademicYearID'
        return $this->hasMany(Student::class, 'AcademicYearID', 'AcademicYearID');
    }
}
