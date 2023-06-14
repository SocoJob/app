<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerifyUser
{

    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && !auth()->user()->is_verified) {
            // Redirige al perfil del usuario o a cualquier otra ruta que desees
       
            return redirect()->route('candidate.profile');
        }
        return $next($request);
    }
}
