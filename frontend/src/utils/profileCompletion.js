/**
 * Calculate profile completion percentage based on user role
 * @param {Object} user - User object from database
 * @returns {Object} { percentage: number, missingFields: string[], completedFields: string[] }
 */
export const calculateProfileCompletion = (user) => {
    if (!user) return { percentage: 0, missingFields: [], completedFields: [] };

    const fields = {
        candidate: [
            { key: 'name', label: 'Full Name', check: () => !!user.name },
            { key: 'email', label: 'Email', check: () => !!user.email },
            { key: 'phone', label: 'Phone Number', check: () => !!user.phone },
            { key: 'location', label: 'Location', check: () => !!user.location },
            { key: 'bio', label: 'Bio', check: () => !!user.bio && user.bio.length > 20 },
            { key: 'avatar', label: 'Profile Picture', check: () => !!user.avatar },
            { key: 'resumeUrl', label: 'Resume', check: () => !!user.resumeUrl },
            { key: 'skills', label: 'Skills', check: () => user.skills && user.skills.length >= 3 },
            { key: 'topJobRoles', label: 'Preferred Roles', check: () => user.topJobRoles && user.topJobRoles.length >= 1 },
            { key: 'workType', label: 'Work Preference', check: () => !!user.workType },
        ],
        interviewer: [
            { key: 'name', label: 'Full Name', check: () => !!user.name },
            { key: 'email', label: 'Email', check: () => !!user.email },
            { key: 'phone', label: 'Phone Number', check: () => !!user.phone },
            { key: 'location', label: 'Location', check: () => !!user.location },
            { key: 'bio', label: 'Bio', check: () => !!user.bio && user.bio.length > 20 },
            { key: 'avatar', label: 'Profile Picture', check: () => !!user.avatar },
            { key: 'expertise', label: 'Expertise Areas', check: () => user.expertise && user.expertise.length >= 2 },
            { key: 'defaultDuration', label: 'Default Interview Duration', check: () => !!user.defaultDuration },
        ],
        admin: [
            { key: 'name', label: 'Full Name', check: () => !!user.name },
            { key: 'email', label: 'Email', check: () => !!user.email },
            { key: 'phone', label: 'Phone Number', check: () => !!user.phone },
            { key: 'location', label: 'Location', check: () => !!user.location },
            { key: 'bio', label: 'Bio', check: () => !!user.bio && user.bio.length > 20 },
            { key: 'avatar', label: 'Profile Picture', check: () => !!user.avatar },
        ]
    };

    const roleFields = fields[user.role] || fields.candidate;
    const completedFields = [];
    const missingFields = [];

    roleFields.forEach(field => {
        if (field.check()) {
            completedFields.push(field.label);
        } else {
            missingFields.push(field.label);
        }
    });

    const percentage = Math.round((completedFields.length / roleFields.length) * 100);

    return {
        percentage,
        completedFields,
        missingFields,
        totalFields: roleFields.length
    };
};

/**
 * Get completion status color
 */
export const getCompletionColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
};

/**
 * Get completion status background color
 */
export const getCompletionBgColor = (percentage) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

/**
 * Get completion message
 */
export const getCompletionMessage = (percentage) => {
    if (percentage === 100) return 'Your profile is complete! 🎉';
    if (percentage >= 90) return 'Almost there! Just a few more details.';
    if (percentage >= 70) return 'Good progress! Keep going.';
    if (percentage >= 50) return 'You\'re halfway there!';
    return 'Let\'s complete your profile to get started.';
};
