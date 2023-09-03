<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;
use Illuminate\Support\Facades\Lang;
use Illuminate\Pagination\PaginationTranslator;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        Cashier::ignoreMigrations();
//        $this->app->singleton(
//        // the original class
//            'vendor/brotzka/laravel-dotenv-editor/src/DotenvEditor.php',
//            // my custom class
//            'app/DotenvEditor.php'
//        );
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        if (app()->environment('remote') || env('FORCE_HTTPS',false)) {
            URL::forceScheme('https');
        }
        \Illuminate\Pagination\Paginator::useBootstrap();
        Schema::defaultStringLength(191);
      
    }
}
