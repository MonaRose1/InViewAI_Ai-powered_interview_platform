import React, { useState } from 'react';
import { FileText, Database, Users, Download, Loader2 } from 'lucide-react';
import api from '../../services/api';

const AdminExports = () => {
    const [loading, setLoading] = useState({});

    const handleExport = async (type, format) => {
        const key = `${type}-${format}`;
        setLoading({ ...loading, [key]: true });

        try {
            const response = await api.get(`/admin/export/${type}`, {
                params: { format },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const timestamp = new Date().toISOString().split('T')[0];
            const extension = format === 'csv' ? 'csv' : 'pdf';
            link.setAttribute('download', `${type}_${timestamp}.${extension}`);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Failed to export ${type}. Please try again.`);
        } finally {
            setLoading({ ...loading, [key]: false });
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Data Export Center</h1>
            <p className="text-slate-500 mb-8">Download system data for backup or reporting purposes.</p>

            <div className="grid md:grid-cols-3 gap-6">
                <ExportCard
                    title="Interview Results"
                    desc="Export all completed interview scores and transcripts."
                    icon={<FileText size={24} className="text-secondary" />}
                    onExport={(format) => handleExport('interviews', format)}
                    loading={loading}
                    type="interviews"
                />
                <ExportCard
                    title="Candidate Data"
                    desc="Download candidate profiles and application history."
                    icon={<Users size={24} className="text-purple-500" />}
                    onExport={(format) => handleExport('candidates', format)}
                    loading={loading}
                    type="candidates"
                />
                <ExportCard
                    title="Applications"
                    desc="Export all job applications and their status."
                    icon={<Database size={24} className="text-slate-500" />}
                    onExport={(format) => handleExport('applications', format)}
                    loading={loading}
                    type="applications"
                />
            </div>
        </div>
    );
};

const ExportCard = ({ title, desc, icon, onExport, loading, type }) => {
    const isLoadingCSV = loading[`${type}-csv`];
    const isLoadingPDF = loading[`${type}-pdf`];

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="mb-4 p-3 bg-slate-50 rounded-lg w-fit">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-6 h-10">{desc}</p>

            <div className="flex gap-2">
                <button
                    onClick={() => onExport('csv')}
                    disabled={isLoadingCSV}
                    className="flex-1 py-2 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingCSV ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Download size={16} />
                    )}
                    CSV
                </button>
                <button
                    onClick={() => onExport('pdf')}
                    disabled={isLoadingPDF}
                    className="flex-1 py-2 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingPDF ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Download size={16} />
                    )}
                    PDF
                </button>
            </div>
        </div>
    );
};

export default AdminExports;
