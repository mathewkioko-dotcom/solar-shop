<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class OptionalSanctumAuthentication
{
    public function handle(Request $request, Closure $next): Response
    {
        $authorization = trim((string) $request->header('Authorization'));
        $user = Auth::guard('sanctum')->user();

        if ($authorization !== '' && $user === null) {
            return new JsonResponse([
                'message' => 'The supplied authentication token is invalid or has expired.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($user !== null) {
            Auth::setUser($user);
        }

        $request->setUserResolver(static fn () => $user);

        return $next($request);
    }
}
