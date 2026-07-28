<?php

use App\Http\Controllers\Api\AdmissionController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\CanvaController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CommunicationController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\LandingController;
use App\Http\Controllers\Api\LearningController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PlacementController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TimetableController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);

// Canva OAuth callback (browser redirect — no Sanctum token)
Route::get('/canva/callback', [CanvaController::class, 'callback']);

// Public website (no auth)
Route::prefix('public')->group(function () {
    Route::get('landing', [PublicController::class, 'landing']);
    Route::get('courses', [PublicController::class, 'courses']);
    Route::get('courses/{course}', [PublicController::class, 'course']);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::patch('/profile', [AuthController::class, 'updateProfile']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('uploads', [UploadController::class, 'store']);

    // Canva Connect (ID cards + certificates)
    Route::get('canva/status', [CanvaController::class, 'status']);
    Route::post('canva/connect', [CanvaController::class, 'connect']);
    Route::delete('canva/connect', [CanvaController::class, 'disconnect']);
    Route::get('canva/designs', [CanvaController::class, 'latest']);
    Route::post('canva/id-cards/{student}', [CanvaController::class, 'generateIdCard']);
    Route::post('canva/certificates', [CanvaController::class, 'generateCertificate']);
    Route::post('canva/certificates/bulk', [CanvaController::class, 'generateCertificatesBulk']);

    // Students
    Route::get('students', [StudentController::class, 'index']);
    Route::post('students', [StudentController::class, 'store']);
    Route::get('students/{student}', [StudentController::class, 'show']);
    Route::put('students/{student}', [StudentController::class, 'update']);
    Route::patch('students/{student}', [StudentController::class, 'update']);
    Route::patch('students/{student}/photo', [StudentController::class, 'updatePhoto']);
    Route::post('students/{student}/emergency-contacts', [StudentController::class, 'storeEmergencyContact']);
    Route::put('students/{student}/emergency-contacts/{contact}', [StudentController::class, 'updateEmergencyContact']);
    Route::delete('students/{student}/emergency-contacts/{contact}', [StudentController::class, 'destroyEmergencyContact']);
    Route::post('students/{student}/documents', [StudentController::class, 'storeDocument']);
    Route::delete('students/{student}/documents/{document}', [StudentController::class, 'destroyDocument']);
    Route::post('students/{student}/issue-id-card', [StudentController::class, 'issueIdCard']);

    // Admissions
    Route::get('admissions', [AdmissionController::class, 'index']);
    Route::post('admissions', [AdmissionController::class, 'store']);
    Route::get('admissions/{admission}', [AdmissionController::class, 'show']);
    Route::put('admissions/{admission}', [AdmissionController::class, 'update']);
    Route::patch('admissions/{admission}', [AdmissionController::class, 'update']);
    Route::post('admissions/{admission}/approve', [AdmissionController::class, 'approve']);
    Route::post('admissions/{admission}/reject', [AdmissionController::class, 'reject']);
    Route::post('admissions/{admission}/assign-batch', [AdmissionController::class, 'assignBatch']);
    Route::post('admissions/{admission}/waiting-list', [AdmissionController::class, 'waitingList']);
    Route::post('admissions/{admission}/enroll', [AdmissionController::class, 'enroll']);

    // Courses
    Route::get('courses', [CourseController::class, 'index']);
    Route::post('courses', [CourseController::class, 'store']);
    Route::get('courses/{course}', [CourseController::class, 'show']);
    Route::put('courses/{course}', [CourseController::class, 'update']);
    Route::patch('courses/{course}', [CourseController::class, 'update']);
    Route::delete('courses/{course}', [CourseController::class, 'destroy']);
    Route::patch('courses/{course}/fees', [CourseController::class, 'updateFees']);
    Route::patch('courses/{course}/syllabus', [CourseController::class, 'updateSyllabus']);
    Route::patch('courses/{course}/trainers', [CourseController::class, 'updateTrainers']);
    Route::patch('courses/{course}/materials', [CourseController::class, 'updateMaterials']);

    // Batches
    Route::get('batches', [BatchController::class, 'index']);
    Route::post('batches', [BatchController::class, 'store']);
    Route::get('batches/{batch}', [BatchController::class, 'show']);
    Route::put('batches/{batch}', [BatchController::class, 'update']);
    Route::patch('batches/{batch}', [BatchController::class, 'update']);
    Route::delete('batches/{batch}', [BatchController::class, 'destroy']);
    Route::post('batches/{batch}/enroll-student', [BatchController::class, 'enrollStudent']);
    Route::post('batches/{batch}/remove-student', [BatchController::class, 'removeStudent']);
    Route::post('batches/{batch}/transfer-student', [BatchController::class, 'transferStudent']);

    // Trainers
    Route::get('trainers', [TrainerController::class, 'index']);
    Route::post('trainers', [TrainerController::class, 'store']);
    Route::get('trainers/{trainer}', [TrainerController::class, 'show']);
    Route::put('trainers/{trainer}', [TrainerController::class, 'update']);
    Route::patch('trainers/{trainer}', [TrainerController::class, 'update']);
    Route::delete('trainers/{trainer}', [TrainerController::class, 'destroy']);
    Route::post('trainers/{trainer}/schedule', [TrainerController::class, 'storeScheduleSlot']);
    Route::put('trainers/{trainer}/schedule/{slot}', [TrainerController::class, 'updateScheduleSlot']);
    Route::patch('trainers/{trainer}/schedule/{slot}', [TrainerController::class, 'updateScheduleSlot']);
    Route::delete('trainers/{trainer}/schedule/{slot}', [TrainerController::class, 'destroyScheduleSlot']);
    Route::post('trainers/{trainer}/salary', [TrainerController::class, 'storeSalary']);
    Route::delete('trainers/{trainer}/salary/{salary}', [TrainerController::class, 'destroySalary']);
    Route::post('trainers/{trainer}/ratings', [TrainerController::class, 'storeRating']);
    Route::delete('trainers/{trainer}/ratings/{rating}', [TrainerController::class, 'destroyRating']);

    // Attendance
    Route::get('attendance/sessions', [AttendanceController::class, 'index']);
    Route::post('attendance/sessions', [AttendanceController::class, 'store']);
    Route::get('attendance/sessions/{session}', [AttendanceController::class, 'show']);
    Route::put('attendance/sessions/{session}', [AttendanceController::class, 'update']);
    Route::patch('attendance/sessions/{session}', [AttendanceController::class, 'update']);
    Route::delete('attendance/sessions/{session}', [AttendanceController::class, 'destroy']);
    Route::put('attendance/sessions/{session}/records', [AttendanceController::class, 'markRecords']);
    Route::post('attendance/sessions/{session}/records', [AttendanceController::class, 'markRecords']);

    // Payments
    Route::get('payments/invoices', [PaymentController::class, 'index']);
    Route::post('payments/invoices', [PaymentController::class, 'store']);
    Route::get('payments/invoices/{invoice}', [PaymentController::class, 'show']);
    Route::put('payments/invoices/{invoice}', [PaymentController::class, 'update']);
    Route::patch('payments/invoices/{invoice}', [PaymentController::class, 'update']);
    Route::delete('payments/invoices/{invoice}', [PaymentController::class, 'destroy']);
    Route::post('payments/invoices/{invoice}/reminders', [PaymentController::class, 'sendReminder']);
    Route::post('payments/invoices/{invoice}/receipts', [PaymentController::class, 'logReceipt']);

    // Exams
    Route::get('exams', [ExamController::class, 'index']);
    Route::post('exams', [ExamController::class, 'store']);
    Route::get('exams/{exam}', [ExamController::class, 'show']);
    Route::put('exams/{exam}', [ExamController::class, 'update']);
    Route::patch('exams/{exam}', [ExamController::class, 'update']);
    Route::delete('exams/{exam}', [ExamController::class, 'destroy']);
    Route::put('exams/{exam}/grades', [ExamController::class, 'updateGrades']);
    Route::post('exams/{exam}/grades', [ExamController::class, 'updateGrades']);

    // Certificates (CRUD — Canva routes above remain intact)
    Route::get('certificates', [CertificateController::class, 'index']);
    Route::post('certificates', [CertificateController::class, 'store']);
    Route::get('certificates/{certificate}', [CertificateController::class, 'show']);
    Route::put('certificates/{certificate}', [CertificateController::class, 'update']);
    Route::patch('certificates/{certificate}', [CertificateController::class, 'update']);

    // Inventory
    Route::get('inventory/items', [InventoryController::class, 'index']);
    Route::post('inventory/items', [InventoryController::class, 'store']);
    Route::get('inventory/items/{item}', [InventoryController::class, 'show']);
    Route::put('inventory/items/{item}', [InventoryController::class, 'update']);
    Route::patch('inventory/items/{item}', [InventoryController::class, 'update']);
    Route::delete('inventory/items/{item}', [InventoryController::class, 'destroy']);
    Route::post('inventory/items/{item}/purchases', [InventoryController::class, 'storePurchase']);
    Route::post('inventory/items/{item}/usages', [InventoryController::class, 'storeUsage']);

    // Timetable
    Route::get('timetable/slots', [TimetableController::class, 'index']);
    Route::post('timetable/slots', [TimetableController::class, 'store']);
    Route::get('timetable/slots/{slot}', [TimetableController::class, 'show']);
    Route::put('timetable/slots/{slot}', [TimetableController::class, 'update']);
    Route::patch('timetable/slots/{slot}', [TimetableController::class, 'update']);
    Route::delete('timetable/slots/{slot}', [TimetableController::class, 'destroy']);

    // Learning
    Route::get('learning/items', [LearningController::class, 'index']);
    Route::post('learning/items', [LearningController::class, 'store']);
    Route::get('learning/items/{item}', [LearningController::class, 'show']);
    Route::put('learning/items/{item}', [LearningController::class, 'update']);
    Route::patch('learning/items/{item}', [LearningController::class, 'update']);
    Route::delete('learning/items/{item}', [LearningController::class, 'destroy']);

    // Placement
    Route::get('placement/employers', [PlacementController::class, 'indexEmployers']);
    Route::post('placement/employers', [PlacementController::class, 'storeEmployer']);
    Route::get('placement/employers/{employer}', [PlacementController::class, 'showEmployer']);
    Route::put('placement/employers/{employer}', [PlacementController::class, 'updateEmployer']);
    Route::patch('placement/employers/{employer}', [PlacementController::class, 'updateEmployer']);
    Route::delete('placement/employers/{employer}', [PlacementController::class, 'destroyEmployer']);
    Route::get('placement/placements', [PlacementController::class, 'indexPlacements']);
    Route::post('placement/placements', [PlacementController::class, 'storePlacement']);
    Route::get('placement/placements/{placement}', [PlacementController::class, 'showPlacement']);
    Route::put('placement/placements/{placement}', [PlacementController::class, 'updatePlacement']);
    Route::patch('placement/placements/{placement}', [PlacementController::class, 'updatePlacement']);
    Route::delete('placement/placements/{placement}', [PlacementController::class, 'destroyPlacement']);

    // Communication
    Route::get('communication/announcements', [CommunicationController::class, 'index']);
    Route::post('communication/announcements', [CommunicationController::class, 'store']);
    Route::get('communication/announcements/{announcement}', [CommunicationController::class, 'show']);
    Route::put('communication/announcements/{announcement}', [CommunicationController::class, 'update']);
    Route::patch('communication/announcements/{announcement}', [CommunicationController::class, 'update']);
    Route::delete('communication/announcements/{announcement}', [CommunicationController::class, 'destroy']);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications', [NotificationController::class, 'store']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // Landing CMS (admin)
    Route::get('landing', [LandingController::class, 'show']);
    Route::put('landing', [LandingController::class, 'update']);
    Route::patch('landing', [LandingController::class, 'update']);
});
