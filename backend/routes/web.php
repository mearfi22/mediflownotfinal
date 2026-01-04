<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Add named route for login to fix the error
Route::get('/login', function () {
    return response()->json(['message' => 'API Login endpoint is at /api/login']);
})->name('login');
