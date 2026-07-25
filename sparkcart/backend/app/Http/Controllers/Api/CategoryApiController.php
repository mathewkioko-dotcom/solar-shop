<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Category::query()
                ->select(['id', 'name', 'slug'])
                ->orderBy('name')
                ->get()
        );
    }
}
