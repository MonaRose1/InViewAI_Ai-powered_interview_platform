import api from './api';

const getAssignedInterviews = async () => {
    const response = await api.get('/interviews');
    return response.data;
};

const getPendingApplications = async () => {
    const response = await api.get('/applications');
    return response.data;
};

const getInterviewDetails = async (id) => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
};

const updateInterviewStatus = async (id, status) => {
    const response = await api.put(`/interviews/${id}/status`, { status });
    return response.data;
};

const scheduleInterview = async (applicationId, scheduledTime) => {
    const response = await api.post('/interviews', { applicationId, scheduledTime });
    return response.data;
};

const getNotes = async () => {
    const response = await api.get('/notes');
    return response.data;
};

const createNote = async (noteData) => {
    const response = await api.post('/notes', noteData);
    return response.data;
};

const updateNote = async (id, noteData) => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
};

const deleteNote = async (id) => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
};

const updateApplicationStatus = async (id, status) => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
};

const InterviewerService = {
    getAssignedInterviews,
    getPendingApplications,
    getInterviewDetails,
    updateInterviewStatus,
    scheduleInterview,
    getNotes,
    createNote,
    updateNote,
    deleteNote,
    updateApplicationStatus
};

export default InterviewerService;
