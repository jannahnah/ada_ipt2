<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;
    
    // Explicitly define the table name
    protected $table = 'departments';
    
    // Define the custom primary key
    protected $primaryKey = 'DepartmentID';
    
    // Allow mass assignment for these fields
    protected $fillable = ['name', 'code'];
    
    /**
     * Get the students associated with the department.
     */
    public function students()
    {
        // One Department has many Students
        // We use the custom foreign key 'DepartmentID'
        return $this->hasMany(Student::class, 'DepartmentID', 'DepartmentID');
    }
}
