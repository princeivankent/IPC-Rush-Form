<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiToken extends Model
{
    protected $fillable = [
        'user_id', 'token', 'revoked', 'expires_at'
    ];
}
