import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const session = await storageService.getSession();

  if (session && session.isLoggedIn) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};