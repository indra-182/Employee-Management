import { Component, computed, inject, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Employees } from '@app/shared/models/employees';
import { EmployeeService } from '@/app/services/employee/employee.service';
import { ToastrService } from '@app/services/toastr/toastr.service';

@Component({
  selector: 'app-employee-list',
  imports: [RouterLink],
  templateUrl: './employee-list.html',
})
export class EmployeeList implements OnDestroy {
  private employeeService = inject(EmployeeService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceMs = 300; // ms

  filters = signal({
    searchName: this.employeeService.searchState().name,
    searchInput: this.employeeService.searchState().name,
    searchStatus: this.employeeService.searchState().status,
    sortColumn: 'firstName',
    sortDirection: 'asc' as 'asc' | 'desc',
    currentPage: 1,
    pageSize: 10,
  });

  filtered = computed(() => {
    let list = this.employeeService.getAll();
    const { searchName, searchStatus, sortColumn, sortDirection } = this.filters();
    const name = searchName.toLowerCase().trim();

    if (name) {
      list = list.filter(
        (e) =>
          e.firstName.toLowerCase().includes(name) ||
          e.lastName.toLowerCase().includes(name) ||
          e.username.toLowerCase().includes(name),
      );
    }
    if (searchStatus) {
      list = list.filter((e) => e.status === searchStatus);
    }

    const col = sortColumn as keyof Employees;
    const dir = sortDirection;
    return [...list].sort((a, b) => {
      const aVal = a[col];
      const bVal = b[col];
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  totalItems = computed(() => this.filtered().length);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.filters().pageSize) || 1);

  paged = computed(() => {
    const { currentPage, pageSize } = this.filters();
    const start = (currentPage - 1) * pageSize;
    return this.filtered().slice(start, start + pageSize);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.filters().currentPage;
    const max = 5;
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - Math.floor(max / 2));
    const end = Math.min(total, start + max - 1);
    start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  from = computed(() => {
    const { currentPage, pageSize } = this.filters();
    return this.totalItems() === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  });
  to = computed(() =>
    Math.min(this.filters().currentPage * this.filters().pageSize, this.totalItems()),
  );

  onSearchName(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.filters.update((f) => ({ ...f, searchInput: val, currentPage: 1 }));
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.filters.update((f) => ({ ...f, searchName: val }));
      this.saveSearch();
      this.searchDebounceTimer = null;
    }, this.debounceMs);
  }

  ngOnDestroy(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
  }

  onSearchStatus(event: Event): void {
    this.filters.update((f) => ({
      ...f,
      searchStatus: (event.target as HTMLSelectElement).value,
      currentPage: 1,
    }));
    this.saveSearch();
  }

  onPageSize(event: Event): void {
    this.filters.update((f) => ({
      ...f,
      pageSize: +(event.target as HTMLSelectElement).value,
      currentPage: 1,
    }));
  }

  toggleSort(column: string): void {
    this.filters.update((f) => ({
      ...f,
      sortColumn: column,
      sortDirection: f.sortColumn === column ? (f.sortDirection === 'asc' ? 'desc' : 'asc') : 'asc',
    }));
  }

  sortIcon(column: string): string {
    const { sortColumn, sortDirection } = this.filters();
    if (sortColumn !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  goToPage(page: number): void {
    this.filters.update((f) => ({ ...f, currentPage: page }));
  }

  viewDetail(employee: Employees): void {
    this.router.navigate(['/employees', employee.username]);
  }

  onEdit(event: Event, employee: Employees): void {
    event.stopPropagation();
    this.toastr.warning(`Edit action for ${employee.firstName} ${employee.lastName}`);
  }

  onDelete(event: Event, employee: Employees): void {
    event.stopPropagation();
    this.toastr.error(`Delete action for ${employee.firstName} ${employee.lastName}`);
  }

  private saveSearch(): void {
    const { searchName, searchStatus } = this.filters();
    this.employeeService.saveSearchState({ name: searchName, status: searchStatus });
  }
}
