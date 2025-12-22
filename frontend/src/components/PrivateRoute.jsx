import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (role && user.role !== role) {
        // Redirect based on their actual role or to a 'not authorized' page
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
        if (user.role === 'interviewer') return <Navigate to="/interviewer/dashboard" />;
        if (user.role === 'candidate') return <Navigate to="/candidate/dashboard" />;

        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;
