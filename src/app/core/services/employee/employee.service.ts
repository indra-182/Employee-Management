import { Injectable, signal } from '@angular/core';
import { Employees } from '@app/shared/models/employee';
import { FIRST_NAMES, GROUPS, LAST_NAMES } from '@app/shared/utils/constants';

export interface FilterSearch {
  name: string;
  status: string;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
}

function generateEmployees(): Employees[] {
  const employees: Employees[] = [];
  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[i % 20];
    const lastName = LAST_NAMES[Math.floor(i / 20)];
    employees.push({
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
      birthDate: new Date(1970 + (i % 30), i % 12, (i % 28) + 1),
      basicSalary: 5_000_000 + i * 150_000,
      status: i % 3 === 0 ? 'Inactive' : 'Active',
      group: GROUPS[i % GROUPS.length],
      description: `Employee ${firstName} ${lastName} in the ${GROUPS[i % GROUPS.length]} department.`,
    });
  }
  return employees;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly employees = signal<Employees[]>(generateEmployees());
  readonly filterSearchState = signal<FilterSearch>({
    name: '',
    status: '',
    sortColumn: 'firstName',
    sortDirection: 'asc',
    currentPage: 1,
    pageSize: 10,
  });

  getAll(): Employees[] {
    return this.employees();
  }

  getByUsername(username: string): Employees | undefined {
    return this.employees().find((e) => e.username === username);
  }

  add(employee: Employees): void {
    this.employees.update((list) => [...list, employee]);
  }

  saveListState(state: FilterSearch): void {
    this.filterSearchState.set(state);
  }
}
