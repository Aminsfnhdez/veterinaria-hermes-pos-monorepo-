import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'pos',
    canActivate: [authGuard],
    loadComponent: () => import('./pos/components/sale-point/sale-point.component')
      .then(m => m.SalePointComponent)
  },
  {
    path: 'inventory',
    canActivate: [authGuard],
    canActivateChild: [roleGuard],
    data: { roles: ['ADMIN', 'VENDEDOR'] },
    children: [
      {
        path: 'products',
        loadComponent: () => import('./inventory/components/inventory-list/inventory-list.component')
          .then(m => m.InventoryListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./inventory/components/product-form/product-form.component')
          .then(m => m.ProductFormComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'products/:id/edit',
        loadComponent: () => import('./inventory/components/product-form/product-form.component')
          .then(m => m.ProductFormComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'alerts',
        loadComponent: () => import('./inventory/components/alerts-dashboard/alerts-dashboard.component')
          .then(m => m.AlertsDashboardComponent),
        data: { roles: ['ADMIN'] }
      },
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'invoices',
    canActivate: [authGuard],
    canActivateChild: [roleGuard],
    data: { roles: ['ADMIN', 'VENDEDOR'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./invoices/components/invoice-list/invoice-list.component')
          .then(m => m.InvoiceListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./invoices/components/invoice-view/invoice-view.component')
          .then(m => m.InvoiceViewComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'pos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pos'
  }
];