<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EmployerResource;
use App\Http\Resources\PlacementResource;
use App\Models\Employer;
use App\Models\Placement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlacementController extends Controller
{
    public function indexEmployers(): JsonResponse
    {
        return EmployerResource::collection(
            Employer::query()->latest('created_at')->get()
        )->response();
    }

    public function storeEmployer(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contact' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $employer = Employer::create([
            'name' => $data['name'],
            'contact' => $data['contact'] ?? '',
            'email' => $data['email'] ?? '',
            'city' => $data['city'] ?? '',
        ]);

        return (new EmployerResource($employer))->response()->setStatusCode(201);
    }

    public function showEmployer(Employer $employer): JsonResponse
    {
        return (new EmployerResource($employer))->response();
    }

    public function updateEmployer(Request $request, Employer $employer): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'contact' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $map = [
            'name' => 'name',
            'contact' => 'contact',
            'email' => 'email',
            'city' => 'city',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $employer->update($payload);

        return (new EmployerResource($employer->fresh()))->response();
    }

    public function destroyEmployer(Employer $employer): JsonResponse
    {
        $employer->delete();

        return response()->json(['data' => null]);
    }

    public function indexPlacements(Request $request): JsonResponse
    {
        $query = Placement::query()->latest('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return PlacementResource::collection($query->get())->response();
    }

    public function storePlacement(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student' => ['required', 'string', 'max:255'],
            'studentId' => ['nullable', 'uuid', 'exists:students,id'],
            'employer' => ['required', 'string', 'max:255'],
            'employerId' => ['nullable', 'uuid', 'exists:employers,id'],
            'role' => ['required', 'string', 'max:255'],
            'interviewDate' => ['nullable', 'date'],
            'status' => ['required', 'in:applied,interview,offered,placed,rejected'],
            'cvName' => ['nullable', 'string', 'max:255'],
        ]);

        $placement = Placement::create([
            'student' => $data['student'],
            'student_id' => $data['studentId'] ?? null,
            'employer' => $data['employer'],
            'employer_id' => $data['employerId'] ?? null,
            'role' => $data['role'],
            'interview_date' => $data['interviewDate'] ?? null,
            'status' => $data['status'],
            'cv_name' => $data['cvName'] ?? null,
        ]);

        return (new PlacementResource($placement))->response()->setStatusCode(201);
    }

    public function showPlacement(Placement $placement): JsonResponse
    {
        return (new PlacementResource($placement))->response();
    }

    public function updatePlacement(Request $request, Placement $placement): JsonResponse
    {
        $data = $request->validate([
            'student' => ['sometimes', 'string', 'max:255'],
            'studentId' => ['sometimes', 'nullable', 'uuid', 'exists:students,id'],
            'employer' => ['sometimes', 'string', 'max:255'],
            'employerId' => ['sometimes', 'nullable', 'uuid', 'exists:employers,id'],
            'role' => ['sometimes', 'string', 'max:255'],
            'interviewDate' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', 'in:applied,interview,offered,placed,rejected'],
            'cvName' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $map = [
            'student' => 'student',
            'studentId' => 'student_id',
            'employer' => 'employer',
            'employerId' => 'employer_id',
            'role' => 'role',
            'interviewDate' => 'interview_date',
            'status' => 'status',
            'cvName' => 'cv_name',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $placement->update($payload);

        return (new PlacementResource($placement->fresh()))->response();
    }

    public function destroyPlacement(Placement $placement): JsonResponse
    {
        $placement->delete();

        return response()->json(['data' => null]);
    }
}
