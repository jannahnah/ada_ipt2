<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;
    
    // Allow mass assignment for these profile fields
    protected $fillable = [
        'fname',
        'lname',
        'email',
        'phone',
        'address',
        'age',
        'gender',
    ];
    
}