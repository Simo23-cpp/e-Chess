import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const gameGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (localStorage.getItem('isLogged') == "true" && localStorage.getItem("time") != "0") {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
