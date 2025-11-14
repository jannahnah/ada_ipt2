<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

class AuthController extends Controller
{
    // POST /api/auth/login
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'nullable|string',
            'email' => 'nullable|email',
            'password' => 'required|string',
        ]);

        $providedUsername = $request->input('username');
        $providedEmail = $request->input('email');

        if (empty($providedUsername) && empty($providedEmail)) {
            return response()->json(['message' => 'username or email required'], 422);
        }

        $query = User::query();
        if (Schema::hasColumn('users', 'username')) {
            $query->where(function ($q) use ($providedUsername, $providedEmail) {
                if ($providedUsername) {
                    $q->where('username', $providedUsername);
                }
                if ($providedEmail) {
                    $q->orWhere('email', $providedEmail);
                } elseif ($providedUsername) {
                    $q->orWhere('email', $providedUsername);
                }
            });
        } else {
            $emailToSearch = $providedEmail ?: $providedUsername;
            $query->where('email', $emailToSearch);
        }

        $user = $query->first();

        // Debug logging to help determine why login fails (safe: no plaintext passwords)
        if (! $user) {
            Log::warning('Auth attempt failed — user not found', [
                'identifier' => $providedUsername ?: $providedEmail,
                'ip' => $request->ip(),
                'agent' => $request->header('User-Agent'),
            ]);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! Hash::check($request->password, $user->password)) {
            Log::warning('Auth attempt failed — bad password', [
                'user_id' => $user->id,
                'email' => $user->email,
                'username_exists' => Schema::hasColumn('users', 'username') ? $user->username : null,
                'identifier' => $providedUsername ?: $providedEmail,
                'ip' => $request->ip(),
                'agent' => $request->header('User-Agent'),
            ]);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // success
        $token = bin2hex(random_bytes(40));
        $user->api_token = $token;
        $user->save();

        Log::info('Auth successful', ['user_id' => $user->id, 'email' => $user->email]);

        return response()->json([
            'token' => $token,
            'user' => $user->makeHidden(['password'])->toArray(),
        ]);
    }

    // POST /api/auth/register
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'api_token' => bin2hex(random_bytes(40)),
        ]);

        return response()->json([
            'token' => $user->api_token,
            'user' => $user->makeHidden(['password'])->toArray(),
        ], 201);
    }

    // GET /api/auth/verify
    public function verify(Request $request)
    {
        $auth = $request->header('Authorization', '') ?: $request->query('token', '');
        $token = str_starts_with($auth, 'Bearer ') ? substr($auth, 7) : $auth;

        if (! $token) {
            return response()->json(['message' => 'Token required'], 401);
        }

        $user = User::where('api_token', $token)->first();
        if (! $user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        return response()->json(['user' => $user->makeHidden(['password'])]);
    }
}
