import React, { useState } from 'react';
import { Upload, Building, Palette, Save } from 'lucide-react';

const OrganizationSettings = () => {
    const [orgData, setOrgData] = useState({
        name: 'InViewAI Inc.',
        website: 'https://inviewai.com',
        logo: null
    });

    const handleChange = (e) => {
        setOrgData({ ...orgData, [e.target.name]: e.target.value });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Organization Settings</h1>
            <p className="text-slate-500 mb-8">Manage your company details.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
                {/* Logo Upload */}
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Upload size={18} className="text-secondary" /> Company Logo
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-slate-400">
                            {orgData.logo ? <img src={orgData.logo} alt="Logo" className="w-full h-full object-contain" /> : <Building size={32} />}
                        </div>
                        <div>
                            <button className="px-4 py-2 bg-white border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition mb-2">
                                Upload New Logo
                            </button>
                            <p className="text-xs text-slate-500">Recommended size: 512x512px. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* Company Details */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                name="name"
                                value={orgData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                        <input
                            type="url"
                            name="website"
                            value={orgData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => alert("Organization settings saved successfully!")}
                        className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition flex items-center gap-2 shadow-sm"
                    >
                        <Save size={18} /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizationSettings;
