import api from './api';

const applyForJob = async (jobId, additionalData = {}) => {
    // Mock CV URL for now
    const cvUrl = "https://example.com/resume.pdf";
    const response = await api.post('/applications', {
        jobId,
        cvUrl,
        ...additionalData
    });
    return response.data;
};

const getMyApplications = async () => {
    const response = await api.get('/applications/my');
    return response.data;
};

const getMyInterviews = async () => {
    const response = await api.get('/interviews/candidate');
    return response.data;
};

const ApplicationService = {
    applyForJob,
    getMyApplications,
    getMyInterviews
};

export default ApplicationService;
