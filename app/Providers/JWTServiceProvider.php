<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class JWTServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Configure JWT settings if needed
        config([
            'jwt.ttl' => 60 * 24, // 1 day
            'jwt.refresh_ttl' => 60 * 24 * 30, // 30 days
        ]);
    }
}
