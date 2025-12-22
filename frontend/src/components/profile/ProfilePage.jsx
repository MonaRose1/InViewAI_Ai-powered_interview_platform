import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from './ProfileHeader';
import ProfileCompletionBanner from './ProfileCompletionBanner';
import PersonalInfoTab from './PersonalInfoTab';
import SecurityTab from './SecurityTab';
import CandidateGoalsTab from './CandidateGoalsTab';
import InterviewerSettingsTab from './InterviewerSettingsTab';

const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');

    const tabs = [
        { id: 'personal', label: 'Personal Info' },
        ...(user?.role === 'candidate' ? [{ id: 'goals', label: 'Career Goals' }] : []),
        ...(user?.role === 'interviewer' ? [{ id: 'interviewer', label: 'Interviewer Settings' }] : []),
        { id: 'security', label: 'Security' },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <ProfileHeader user={user} />

            {/* Profile Completion Banner */}
            <ProfileCompletionBanner user={user} onNavigateToTab={setActiveTab} />

            {/* Tabs Navigation */}
            <div className="flex items-center gap-6 border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-sm font-medium transition relative whitespace-nowrap ${activeTab === tab.id
                            ? 'text-secondary'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-t-full"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'personal' && <PersonalInfoTab user={user} />}
                {activeTab === 'goals' && <CandidateGoalsTab user={user} />}
                {activeTab === 'interviewer' && <InterviewerSettingsTab user={user} />}
                {activeTab === 'security' && <SecurityTab user={user} />}
            </div>
        </div>
    );
};

export default ProfilePage;
