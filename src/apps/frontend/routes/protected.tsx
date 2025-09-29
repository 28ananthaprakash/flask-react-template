import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import routes from 'frontend/constants/routes';
import { useAccountContext, useAuthContext } from 'frontend/contexts';
import { NotFound, Tasks } from 'frontend/pages';
import AppLayout from 'frontend/pages/app-layout/app-layout';
import { AsyncError } from 'frontend/types';

const App = () => {
  const { getAccountDetails } = useAccountContext();
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    getAccountDetails().catch((err: AsyncError) => {
      toast.error(err.message);
      logout();
      navigate(routes.LOGIN);
    });
  }, [getAccountDetails, logout, navigate]);

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const tasksRoutePath = routes.TASKS.startsWith('/')
  ? routes.TASKS.slice(1)
  : routes.TASKS;

export const protectedRoutes = [
  {
    path: '',
    element: <App />,
    children: [
      { index: true, element: <Navigate to={routes.TASKS} replace /> },
      { path: tasksRoutePath, element: <Tasks /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
