<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Client\ApplicationController;
use App\Http\Controllers\Client\DocumentController;
use App\Http\Controllers\Client\MessageController;
use App\Http\Controllers\Client\NotificationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\AdminApplicationController;
use App\Http\Controllers\Admin\AdminDocumentController;
use App\Http\Controllers\Admin\AdminMessageController;
use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Shared\ProductController;
use App\Http\Controllers\Shared\FaqController;
use App\Http\Controllers\Shared\QuoteController;
use App\Http\Controllers\Shared\ProfileController;
use App\Http\Controllers\Shared\AiController;

// ── Public routes ──────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::post('/auth/forgot-password',  [PasswordResetController::class, 'sendResetLink']);
Route::post('/auth/reset-password',   [PasswordResetController::class, 'reset']);

Route::get('/products',         [ProductController::class, 'index']);
Route::get('/products/{slug}',  [ProductController::class, 'show']);
Route::get('/faqs',             [FaqController::class, 'index']);
Route::post('/quotes',          [QuoteController::class, 'store']);

// ── Authenticated routes ────────────────────────────────────────
Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Profile
    Route::get('/profile',           [ProfileController::class, 'show']);
    Route::put('/profile',           [ProfileController::class, 'update']);
    Route::post('/profile/photo',    [ProfileController::class, 'uploadPhoto']);
    Route::put('/profile/password',  [ProfileController::class, 'changePassword']);

    // Notifications
    Route::get('/notifications',           [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all',  [NotificationController::class, 'markAllRead']);

    // ── CLIENT routes ───────────────────────────────────────────
    Route::middleware(['role:client'])->prefix('client')->group(function () {

        // Applications
        Route::get('/applications',            [ApplicationController::class, 'index']);
        Route::post('/applications',           [ApplicationController::class, 'store']);
        Route::get('/applications/{id}',       [ApplicationController::class, 'show']);
        Route::put('/applications/{id}',       [ApplicationController::class, 'update']);
        Route::delete('/applications/{id}',    [ApplicationController::class, 'destroy']);

        // Documents
        Route::get('/applications/{applicationId}/documents',       [DocumentController::class, 'index']);
        Route::post('/applications/{applicationId}/documents',      [DocumentController::class, 'upload']);
        Route::delete('/documents/{id}',                            [DocumentController::class, 'destroy']);
        Route::get('/documents/{id}/download',                      [DocumentController::class, 'download']);
        Route::post('/documents/{id}/ai-validate',                  [DocumentController::class, 'aiValidate']);

        // Messages (client side)
        Route::get('/messages/threads',           [MessageController::class, 'threads']);
        Route::post('/messages/threads',          [MessageController::class, 'createThread']);
        Route::get('/messages/threads/{id}',      [MessageController::class, 'threadMessages']);
        Route::post('/messages/threads/{id}',     [MessageController::class, 'sendMessage']);
        Route::put('/messages/threads/{id}/read', [MessageController::class, 'markThreadRead']);
    });

    // ── ADMIN routes ────────────────────────────────────────────
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Applications management
        Route::get('/applications',              [AdminApplicationController::class, 'index']);
        Route::get('/applications/{id}',         [AdminApplicationController::class, 'show']);
        Route::put('/applications/{id}/status',  [AdminApplicationController::class, 'updateStatus']);
        Route::put('/applications/{id}/premium', [AdminApplicationController::class, 'setPremium']);
        Route::post('/applications/{id}/notes',  [AdminApplicationController::class, 'addNote']);

        // Documents management
        Route::get('/documents',                  [AdminDocumentController::class, 'index']);
        Route::put('/documents/{id}/approve',     [AdminDocumentController::class, 'approve']);
        Route::put('/documents/{id}/reject',      [AdminDocumentController::class, 'reject']);
        Route::get('/documents/{id}/download',    [AdminDocumentController::class, 'download']);

        // Messages (admin side)
        Route::get('/messages/threads',            [AdminMessageController::class, 'threads']);
        Route::get('/messages/threads/{id}',       [AdminMessageController::class, 'threadMessages']);
        Route::post('/messages/threads/{id}',      [AdminMessageController::class, 'sendMessage']);
        Route::put('/messages/threads/{id}/read',  [AdminMessageController::class, 'markThreadRead']);

        // Calendar
        Route::get('/calendar',              [CalendarController::class, 'index']);
        Route::post('/calendar',             [CalendarController::class, 'store']);
        Route::put('/calendar/{id}',         [CalendarController::class, 'update']);
        Route::delete('/calendar/{id}',      [CalendarController::class, 'destroy']);
        Route::put('/calendar/{id}/toggle',  [CalendarController::class, 'toggle']);

        // Reports
        Route::get('/reports/summary',      [ReportController::class, 'summary']);
        Route::get('/reports/applications', [ReportController::class, 'applications']);
        Route::get('/reports/clients',      [ReportController::class, 'clients']);

        // Client management
        Route::get('/clients',           [DashboardController::class, 'clients']);
        Route::put('/clients/{id}/toggle', [DashboardController::class, 'toggleClient']);

        // Quotes
        Route::get('/quotes',                [QuoteController::class, 'index']);
        Route::put('/quotes/{id}/convert',   [QuoteController::class, 'convert']);
    });

    // AI endpoint (shared, auth required)
    Route::post('/ai/faq-answer', [AiController::class, 'faqAnswer']);
});
