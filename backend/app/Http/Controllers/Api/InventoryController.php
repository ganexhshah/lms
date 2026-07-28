<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryItemResource;
use App\Http\Resources\InventoryPurchaseResource;
use App\Http\Resources\InventoryUsageResource;
use App\Models\InventoryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = InventoryItem::query()
            ->with(['purchases', 'usage'])
            ->latest('created_at');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        return InventoryItemResource::collection($query->get())->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:beans,milk,syrups,cups,machines,other'],
            'stock' => ['nullable', 'integer'],
            'unit' => ['required', 'string', 'max:50'],
            'minStock' => ['nullable', 'integer', 'min:0'],
            'lastPurchase' => ['nullable', 'date'],
        ]);

        $item = InventoryItem::create([
            'name' => $data['name'],
            'category' => $data['category'],
            'stock' => $data['stock'] ?? 0,
            'unit' => $data['unit'],
            'min_stock' => $data['minStock'] ?? 0,
            'last_purchase' => $data['lastPurchase'] ?? null,
        ]);

        return (new InventoryItemResource($item->load(['purchases', 'usage'])))->response()->setStatusCode(201);
    }

    public function show(InventoryItem $item): JsonResponse
    {
        return (new InventoryItemResource($item->load(['purchases', 'usage'])))->response();
    }

    public function update(Request $request, InventoryItem $item): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'in:beans,milk,syrups,cups,machines,other'],
            'stock' => ['sometimes', 'integer'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'minStock' => ['sometimes', 'integer', 'min:0'],
            'lastPurchase' => ['sometimes', 'nullable', 'date'],
        ]);

        $map = [
            'name' => 'name',
            'category' => 'category',
            'stock' => 'stock',
            'unit' => 'unit',
            'minStock' => 'min_stock',
            'lastPurchase' => 'last_purchase',
        ];

        $payload = [];
        foreach ($map as $inputKey => $column) {
            if (array_key_exists($inputKey, $data)) {
                $payload[$column] = $data[$inputKey];
            }
        }

        $item->update($payload);

        return (new InventoryItemResource($item->fresh()->load(['purchases', 'usage'])))->response();
    }

    public function destroy(InventoryItem $item): JsonResponse
    {
        $item->delete();

        return response()->json(['data' => null]);
    }

    public function storePurchase(Request $request, InventoryItem $item): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'qty' => ['required', 'integer', 'min:1'],
            'unitCost' => ['required', 'integer', 'min:0'],
            'note' => ['nullable', 'string'],
        ]);

        $purchase = DB::transaction(function () use ($item, $data) {
            $purchase = $item->purchases()->create([
                'date' => $data['date'],
                'qty' => $data['qty'],
                'unit_cost' => $data['unitCost'],
                'note' => $data['note'] ?? '',
            ]);

            $item->update([
                'stock' => $item->stock + $data['qty'],
                'last_purchase' => $data['date'],
            ]);

            return $purchase;
        });

        return (new InventoryPurchaseResource($purchase))->response()->setStatusCode(201);
    }

    public function storeUsage(Request $request, InventoryItem $item): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'qty' => ['required', 'integer', 'min:1'],
            'batch' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
        ]);

        if ($item->stock < $data['qty']) {
            throw ValidationException::withMessages([
                'qty' => ['Insufficient stock for this usage.'],
            ]);
        }

        $usage = DB::transaction(function () use ($item, $data) {
            $usage = $item->usage()->create([
                'date' => $data['date'],
                'qty' => $data['qty'],
                'batch' => $data['batch'] ?? '',
                'note' => $data['note'] ?? '',
            ]);

            $item->update(['stock' => $item->stock - $data['qty']]);

            return $usage;
        });

        return (new InventoryUsageResource($usage))->response()->setStatusCode(201);
    }
}
