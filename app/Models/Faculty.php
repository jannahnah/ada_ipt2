<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'faculty_id',
        'first_name',
        'last_name',
        'name',
        'email',
        'department',
        'position',
        'phone_number',
        'profile_picture',
        'status',
        'region',
        'province',
        'city'
    ];
}
