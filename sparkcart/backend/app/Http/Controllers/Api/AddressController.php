<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Address\StoreAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get();

        return AddressResource::collection($addresses);
    }

    public function store(StoreAddressRequest $request): AddressResource
    {
        $user = $request->user();
        $validated = $request->validated();

        $address = DB::transaction(function () use ($user, $validated): Address {
            $makeDefault = (bool) ($validated['is_default'] ?? ! $user->addresses()->exists());

            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            return $user->addresses()->create([
                ...$validated,
                'is_default' => $makeDefault,
            ]);
        });

        return new AddressResource($address);
    }

    public function destroy(Request $request, Address $address): Response
    {
        abort_unless($address->user_id === $request->user()->id, 404);

        $address->delete();

        return response()->noContent();
    }
}
