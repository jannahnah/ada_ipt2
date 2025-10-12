<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;
    
    // Explicitly set the primary key name to match the migration
    protected $primaryKey = 'DepartmentID';
    
    // Mass assignable attributes
    protected $fillable = ['name', 'code'];

    /**
     * Get the students for the department.
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'DepartmentID', 'DepartmentID');
    }
}
