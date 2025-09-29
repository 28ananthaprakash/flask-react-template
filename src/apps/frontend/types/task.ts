import { JsonObject } from 'frontend/types/common-types';

export type TaskPayload = {
  title: string;
  description: string;
};

export class Task {
  id: string;
  accountId: string;
  title: string;
  description: string;

  constructor(json: JsonObject) {
    this.id = (json.id as string) ?? '';
    this.accountId = (json.account_id as string) ?? '';
    this.title = (json.title as string) ?? '';
    this.description = (json.description as string) ?? '';
  }
}

export class PaginationParams {
  page: number;
  size: number;
  offset: number;

  constructor(json: JsonObject) {
    this.page = (json.page as number) ?? 1;
    this.size = (json.size as number) ?? 0;
    this.offset = (json.offset as number) ?? 0;
  }
}

export class PaginatedTasks {
  items: Task[];
  paginationParams: PaginationParams;
  totalCount: number;
  totalPages: number;

  constructor(json: JsonObject) {
    const items = Array.isArray(json.items)
      ? (json.items as JsonObject[]).map((item) => new Task(item))
      : [];

    this.items = items;
    const paginationParams =
      (json.pagination_params as JsonObject | undefined) ?? {};

    this.paginationParams = new PaginationParams(paginationParams);
    this.totalCount = (json.total_count as number) ?? items.length;
    this.totalPages = (json.total_pages as number) ?? 1;
  }
}
