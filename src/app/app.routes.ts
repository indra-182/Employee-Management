import { Routes } from '@angular/router';
import { authGuard } from '@app/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('@app/features/login/login').then((p) => p.Login),
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@/app/features/employee/list/employee-list').then((p) => p.EmployeeList),
      },
      {
        path: 'add',
        loadComponent: () =>
          import('@app/features/employee/add/employee-add').then((m) => m.EmployeeAdd),
      },
      {
        path: ':username',
        loadComponent: () =>
          import('@/app/features/employee/detail/employee-detail').then((p) => p.EmployeeDetail),
      },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
