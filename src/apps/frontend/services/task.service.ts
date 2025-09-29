import APIService from 'frontend/services/api.service';
import { AccessToken, ApiResponse } from 'frontend/types';
import { JsonObject } from 'frontend/types/common-types';
import {
  PaginatedTasks,
  Task,
  TaskPayload,
} from 'frontend/types/task';

export default class TaskService extends APIService {
  private getAuthHeaders(accessToken: AccessToken) {
    return {
      Authorization: `Bearer ${accessToken.token}`,
    };
  }

  private getTasksUrl(accessToken: AccessToken, taskId?: string) {
    const taskPath = taskId ? `/tasks/${taskId}` : '/tasks';
    return `/accounts/${accessToken.accountId}${taskPath}`;
  }

  async listTasks(
    accessToken: AccessToken,
    params?: { page?: number; size?: number },
  ): Promise<ApiResponse<PaginatedTasks>> {
    const query: Record<string, number> = {};
    if (params?.page) {
      query.page = params.page;
    }
    if (params?.size) {
      query.size = params.size;
    }

    const response = await this.apiClient.get<JsonObject>(
      this.getTasksUrl(accessToken),
      {
        headers: this.getAuthHeaders(accessToken),
        params: query,
      },
    );

    return new ApiResponse(new PaginatedTasks(response.data as JsonObject));
  }

  async createTask(
    accessToken: AccessToken,
    payload: TaskPayload,
  ): Promise<ApiResponse<Task>> {
    const response = await this.apiClient.post<JsonObject>(
      this.getTasksUrl(accessToken),
      payload,
      {
        headers: this.getAuthHeaders(accessToken),
      },
    );

    return new ApiResponse(new Task(response.data as JsonObject));
  }

  async updateTask(
    accessToken: AccessToken,
    taskId: string,
    payload: TaskPayload,
  ): Promise<ApiResponse<Task>> {
    const response = await this.apiClient.patch<JsonObject>(
      this.getTasksUrl(accessToken, taskId),
      payload,
      {
        headers: this.getAuthHeaders(accessToken),
      },
    );

    return new ApiResponse(new Task(response.data as JsonObject));
  }

  async deleteTask(
    accessToken: AccessToken,
    taskId: string,
  ): Promise<ApiResponse<void>> {
    await this.apiClient.delete(this.getTasksUrl(accessToken, taskId), {
      headers: this.getAuthHeaders(accessToken),
    });

    return new ApiResponse();
  }
}
