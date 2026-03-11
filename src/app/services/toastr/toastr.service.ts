import { Injectable } from '@angular/core';
import { ToastrService as NgxToastr } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastrService {
  constructor(private ngx: NgxToastr) {}

  success(message: string, title?: string): void {
    this.ngx.success(message, title);
  }

  warning(message: string, title?: string): void {
    this.ngx.warning(message, title);
  }

  error(message: string, title?: string): void {
    this.ngx.error(message, title);
  }
}
