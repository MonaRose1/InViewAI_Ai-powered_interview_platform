import api from './api';

const getJobs = async () => {
    const response = await api.get('/jobs');
    return response.data;
};

const getJobById = async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
};

const createJob = async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
};

const updateJob = async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
};

const deleteJob = async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
};

const JobService = {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
};

export default JobService;
