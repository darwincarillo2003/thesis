<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profiles', [ProfileController::class, 'index']);
    Route::post('/profiles/{id}/upload-picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::delete('/profiles/{id}/delete-picture', [ProfileController::class, 'deleteProfilePicture']);
    
    // Form Management Routes
    Route::prefix('forms')->group(function () {
        Route::get('/', [App\Http\Controllers\API\FormController::class, 'index']);
        Route::post('/', [App\Http\Controllers\API\FormController::class, 'store']);
        Route::get('/active', [App\Http\Controllers\API\FormController::class, 'activeForms']);
        Route::get('/{id}', [App\Http\Controllers\API\FormController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\API\FormController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\API\FormController::class, 'destroy']);
        Route::post('/{id}/duplicate', [App\Http\Controllers\API\FormController::class, 'duplicate']);
    });
    
    // Form Submission Routes
    Route::prefix('form-submissions')->group(function () {
        Route::get('/', [App\Http\Controllers\API\FormSubmissionController::class, 'index']);
        Route::post('/', [App\Http\Controllers\API\FormSubmissionController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\API\FormSubmissionController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\API\FormSubmissionController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\API\FormSubmissionController::class, 'destroy']);
        Route::post('/{id}/submit', [App\Http\Controllers\API\FormSubmissionController::class, 'submit']);
        Route::post('/{id}/approve', [App\Http\Controllers\API\FormSubmissionController::class, 'approve']);
        Route::post('/{id}/reject', [App\Http\Controllers\API\FormSubmissionController::class, 'reject']);
        Route::post('/{id}/return', [App\Http\Controllers\API\FormSubmissionController::class, 'returnForRevision']);
        Route::post('/{id}/upload-document', [App\Http\Controllers\API\FormSubmissionController::class, 'uploadDocument']);
    });
});
