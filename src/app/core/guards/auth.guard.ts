import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }
  if (state.url === '' || state.url === '/') {
    router.navigateByUrl(auth.getHomeRoute());
    return false;
  }
  return true;
};
