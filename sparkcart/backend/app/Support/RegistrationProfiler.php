<?php

namespace App\Support;

class RegistrationProfiler
{
    /**
     * @var array<string, int|float>
     */
    private array $timings = [];

    public function reset(): void
    {
        $this->timings = [];
    }

    public function start(string $name): void
    {
        $this->timings[$name.'_started_at'] = hrtime(true);
    }

    public function finish(string $name): void
    {
        $startedAt = $this->timings[$name.'_started_at'] ?? hrtime(true);
        unset($this->timings[$name.'_started_at']);
        $this->timings[$name.'_ms'] = self::millisecondsBetween((int) $startedAt, hrtime(true));
    }

    public function set(string $name, int|float $milliseconds): void
    {
        $this->timings[$name.'_ms'] = round($milliseconds, 3);
    }

    public function get(string $name): float
    {
        return (float) ($this->timings[$name.'_ms'] ?? 0);
    }

    /**
     * @return array<string, int|float>
     */
    public function timings(): array
    {
        return array_filter(
            $this->timings,
            fn (string $name): bool => ! str_ends_with($name, '_started_at'),
            ARRAY_FILTER_USE_KEY,
        );
    }

    private static function millisecondsBetween(int $startedAt, int $finishedAt): float
    {
        return round(($finishedAt - $startedAt) / 1_000_000, 3);
    }
}
