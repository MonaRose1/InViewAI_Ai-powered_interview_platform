import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import TopHeader from '../../components/TopHeader';

const InterviewerLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-textPrimary">
            <div className="flex-1 ml-64 flex flex-col">
                <TopHeader />
                <div className="p-8 flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
            <Sidebar role="interviewer" />
        </div>
    );
};

export default InterviewerLayout;
