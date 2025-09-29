import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

import {
  Button,
  Flex,
  FormControl,
  Input,
  ParagraphMedium,
  VerticalStackLayout,
} from 'frontend/components';
import { ButtonType } from 'frontend/types/button';
import { TaskService } from 'frontend/services';
import { Task } from 'frontend/types';
import { getAccessTokenFromStorage } from 'frontend/utils/storage-util';

type TaskFormValues = {
  title: string;
  description: string;
};

const taskValidationSchema = Yup.object({
  title: Yup.string().trim().required('Title is required'),
  description: Yup.string().trim().required('Description is required'),
});

type ApiErrorShape = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string' && error) {
    return error;
  }

  if (error && typeof error === 'object') {
    const { message, response } = error as ApiErrorShape;
    if (response?.data?.message) {
      return response.data.message;
    }
    if (message) {
      return message;
    }
  }

  return fallback;
};

const Tasks: React.FC = () => {
  const accessToken = useMemo(() => getAccessTokenFromStorage(), []);
  const taskService = useMemo(() => new TaskService(), []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!accessToken) {
      setTasks([]);
      setTaskCount(0);
      return;
    }

    setIsLoadingTasks(true);
    try {
      const response = await taskService.listTasks(accessToken);
      if (response.data) {
        setTasks(response.data.items);
        setTaskCount(response.data.totalCount);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load tasks.'));
    } finally {
      setIsLoadingTasks(false);
    }
  }, [accessToken, taskService]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const formik = useFormik<TaskFormValues>({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: taskValidationSchema,
    enableReinitialize: false,
    onSubmit: async (
      values: TaskFormValues,
      formikHelpers: FormikHelpers<TaskFormValues>,
    ) => {
      if (!accessToken) {
        toast.error('You need to be logged in to manage tasks.');
        return;
      }

      setIsSubmittingTask(true);
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
      };

      try {
        if (editingTaskId) {
          await taskService.updateTask(accessToken, editingTaskId, payload);
          toast.success('Task updated successfully.');
        } else {
          await taskService.createTask(accessToken, payload);
          toast.success('Task created successfully.');
    }

    formikHelpers.resetForm();
        setEditingTaskId(null);
        await fetchTasks();
      } catch (error) {
        toast.error(getErrorMessage(error, 'Unable to save task.'));
      } finally {
        setIsSubmittingTask(false);
      }
    },
  });

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    formik.setValues({ title: task.title, description: task.description });
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    formik.resetForm();
  };

  const handleDeleteTask = async (task: Task) => {
    if (!accessToken) {
      toast.error('You need to be logged in to manage tasks.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingTaskId(task.id);
    try {
      await taskService.deleteTask(accessToken, task.id);
      toast.success('Task deleted successfully.');
      await fetchTasks();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete task.'));
    } finally {
      setDeletingTaskId(null);
    }
  };

  const getFieldError = (field: keyof TaskFormValues) =>
    formik.touched[field] ? (formik.errors[field] as string) : '';

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-8 rounded-2xl border border-stroke bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Task Manager</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create tasks, keep them up to date, and clear the ones you no longer
            need.
          </p>
          {editingTaskId && (
            <p className="mt-2 text-sm font-medium text-primary">
              Editing existing task. Make your changes and save, or cancel to go
              back to creating a new one.
            </p>
          )}
        </div>
        <form onSubmit={formik.handleSubmit}>
          <VerticalStackLayout gap={5}>
            <FormControl label="Title" error={getFieldError('title')}>
              <Input
                name="title"
                placeholder="Add a short, descriptive title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmittingTask}
              />
            </FormControl>
            <FormControl
              label="Description"
              error={getFieldError('description')}
            >
              <textarea
                name="description"
                placeholder="Describe the work that needs to be done"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmittingTask}
                className="h-32 w-full rounded-lg border border-stroke bg-white p-4 text-sm outline-none transition focus:border-primary focus-visible:shadow-none"
              />
            </FormControl>
            <Flex alignItems="center" gap={3}>
              <div className="w-44">
                <Button
                  type={ButtonType.SUBMIT}
                  isLoading={isSubmittingTask}
                >
                  {editingTaskId ? 'Update task' : 'Add task'}
                </Button>
              </div>
              {editingTaskId && (
                <button
                  type="button"
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  onClick={handleCancelEdit}
                  disabled={isSubmittingTask}
                >
                  Cancel
                </button>
              )}
            </Flex>
          </VerticalStackLayout>
        </form>
      </div>

      <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Your tasks</h2>
          <span className="text-sm font-medium text-slate-500">
            Total: {taskCount}
          </span>
        </div>

        {isLoadingTasks ? (
          <ParagraphMedium>Loading tasks…</ParagraphMedium>
        ) : tasks.length === 0 ? (
          <ParagraphMedium>
            You haven’t created any tasks yet. Use the form above to add your
            first task.
          </ParagraphMedium>
        ) : (
          <ul className="flex flex-col gap-4">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-primary/40"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary transition hover:text-primary/80"
                      onClick={() => handleEditTask(task)}
                      disabled={deletingTaskId === task.id || isSubmittingTask}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-sm font-medium text-red-500 transition hover:text-red-400"
                      onClick={() => handleDeleteTask(task)}
                      disabled={deletingTaskId === task.id}
                    >
                      {deletingTaskId === task.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Tasks;
