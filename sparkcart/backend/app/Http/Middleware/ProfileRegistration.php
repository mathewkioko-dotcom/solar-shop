<?php

namespace App\Http\Middleware;

use App\Support\RegistrationProfiler;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ProfileRegistration
{
    public function __construct(private readonly RegistrationProfiler $profiler)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $this->profiler->reset();
        $this->profiler->start('middleware_total');

        $response = $next($request);
        $this->profiler->finish('middleware_total');

        $this->profiler->start('profile_log');
        Log::info('Registration performance profile', [
            'route' => $request->path(),
            'status' => $response->getStatusCode(),
            'timings_ms' => $this->profiler->timings(),
        ]);
        $this->profiler->finish('profile_log');
        $this->profiler->set(
            'response_release',
            $this->profiler->get('middleware_total') + $this->profiler->get('profile_log'),
        );

        $response->headers->set('Server-Timing', $this->serverTiming($this->profiler->timings()));

        return $response;
    }

    /**
     * @param  array<string, int|float>  $profile
     */
    private function serverTiming(array $profile): string
    {
        return collect($profile)
            ->reject(fn (mixed $value, string $name): bool => (
                str_ends_with($name, '_started_at') || ! is_numeric($value)
            ))
            ->map(fn (int|float $value, string $name): string => (
                str_replace('_', '-', $name).';dur='.$value
            ))
            ->implode(', ');
    }
}
