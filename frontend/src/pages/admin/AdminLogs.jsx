import React, { useState } from 'react';
import { Search, Filter, Download, Clock } from 'lucide-react';

const AdminLogs = () => {
    // Mock Data
    const [logs] = useState([
        { id: 1, action: 'User Created', user: 'admin@inviewai.com', ip: '192.168.1.1', timestamp: '2025-12-17 14:30:22', status: 'Success' },
        { id: 2, action: 'AI Config Updated', user: 'admin@inviewai.com', ip: '192.168.1.1', timestamp: '2025-12-17 14:15:00', status: 'Success' },
        { id: 3, action: 'Login Attempt', user: 'unknown@test.com', ip: '45.22.11.90', timestamp: '2025-12-17 13:50:11', status: 'Failed' },
        { id: 4, action: 'Interview Deleted', user: 'manager@corp.com', ip: '10.0.0.5', timestamp: '2025-12-17 11:20:45', status: 'Success' },
        { id: 5, action: 'Export Data', user: 'admin@inviewai.com', ip: '192.168.1.1', timestamp: '2025-12-17 10:05:33', status: 'Success' },
    ]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
                    <p className="text-slate-500">Track system activities and security events.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 transition">
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by user or action..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-gray-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4">Action</th>
                            <th className="p-4">User</th>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-medium text-slate-800">{log.action}</td>
                                <td className="p-4 text-slate-600">{log.user}</td>
                                <td className="p-4 text-slate-500 font-mono text-xs">{log.ip}</td>
                                <td className="p-4 text-slate-500 flex items-center gap-2">
                                    <Clock size={14} /> {log.timestamp}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLogs;
