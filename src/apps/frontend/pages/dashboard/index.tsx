import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, H2, VerticalStackLayout } from 'frontend/components';
import routes from 'frontend/constants/routes';

const Dashboard: React.FC = () => (
<div className="p-6">
    <VerticalStackLayout gap={6}>
        <H2>Dashboard</H2>
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <p className="mt-1 text-sm text-slate-500">Common tasks and shortcuts to get you started.</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <Link to={routes.TASKS}>
                    <Button>
                        <span className="mr-2 inline-flex -mt-0.5" aria-hidden>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />
                            </svg>
                        </span>
                        Manage Tasks
                    </Button>
                </Link>

                <div className="text-sm text-slate-500">or use the search to find items quickly</div>
            </div>
        </div>
    </VerticalStackLayout>
</div>
);

export default Dashboard;
