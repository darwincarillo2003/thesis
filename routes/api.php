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
    Route::put('/users/{id}', [AuthController::class, 'updateUser']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/profiles', [ProfileController::class, 'index']);
    Route::post('/profiles/{id}/upload-picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::delete('/profiles/{id}/delete-picture', [ProfileController::class, 'deleteProfilePicture']);
    Route::put('/profiles/{id}', [ProfileController::class, 'updateProfile']);
    
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
    
    // Cash Flow Statement Routes
    Route::prefix('cashflow')->group(function () {
        Route::get('/form', [App\Http\Controllers\API\CashFlowController::class, 'getForm']);
        Route::post('/', [App\Http\Controllers\API\CashFlowController::class, 'store']);
        Route::post('/{id}/submit', [App\Http\Controllers\API\CashFlowController::class, 'submit']);
        Route::get('/coa-review', [App\Http\Controllers\API\CashFlowController::class, 'getForCOAReview']);
        Route::get('/{id}', [App\Http\Controllers\API\CashFlowController::class, 'show']);
        Route::post('/{id}/approve', [App\Http\Controllers\API\CashFlowController::class, 'approve']);
        Route::post('/{id}/reject', [App\Http\Controllers\API\CashFlowController::class, 'reject']);
        Route::post('/{id}/return', [App\Http\Controllers\API\CashFlowController::class, 'returnForRevision']);
    });

    // Event Management Routes
    Route::prefix('events')->group(function () {
        Route::get('/', [App\Http\Controllers\API\EventController::class, 'index']);
        Route::post('/', [App\Http\Controllers\API\EventController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\API\EventController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\API\EventController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\API\EventController::class, 'destroy']);
        Route::get('/organizations/list', [App\Http\Controllers\API\EventController::class, 'getOrganizations']);
    });

    // Role Management Routes
    Route::prefix('roles')->group(function () {
        Route::get('/', [App\Http\Controllers\API\RoleController::class, 'index']);
        Route::post('/', [App\Http\Controllers\API\RoleController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\API\RoleController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\API\RoleController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\API\RoleController::class, 'destroy']);
    });

    // Organization Management Routes
    Route::prefix('organizations')->group(function () {
        Route::get('/', [App\Http\Controllers\API\OrganizationController::class, 'index']);
        Route::post('/', [App\Http\Controllers\API\OrganizationController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\API\OrganizationController::class, 'show']);
        Route::put('/{id}', [App\Http\Controllers\API\OrganizationController::class, 'update']);
        Route::delete('/{id}', [App\Http\Controllers\API\OrganizationController::class, 'destroy']);
    });

    // Dashboard Statistics Routes
    Route::get('/dashboard/stats', [App\Http\Controllers\API\DashboardController::class, 'getStats']);
    Route::get('/dashboard/student-org/stats', [App\Http\Controllers\API\DashboardController::class, 'getStudentOrgStats']);
    Route::get('/dashboard/student-org/submissions', [App\Http\Controllers\API\DashboardController::class, 'getStudentOrgSubmissions']);
    Route::delete('/dashboard/student-org/submissions/{id}', [App\Http\Controllers\API\DashboardController::class, 'deleteSubmission']);
});
