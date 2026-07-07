<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restricts a route to the given roles. `admin` implicitly includes super admins.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        abort_if($user === null, 401);

        $allowed = in_array($user->role, $roles, true)
            || (in_array(User::ROLE_ADMIN, $roles, true) && $user->role === User::ROLE_SUPER_ADMIN);

        abort_unless($allowed, 403, 'You do not have the required role to perform this action.');

        return $next($request);
    }
}
