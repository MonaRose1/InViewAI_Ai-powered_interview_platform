import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const InterviewerAvailability = () => {
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showAddSlot, setShowAddSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({ start: '', end: '' });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const { data } = await api.get('/interviewer/schedule');
            setAvailability(data.availability || {});
        } catch (error) {
            console.error('Failed to fetch availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = (day) => {
        setSelectedDay(day);
        setShowAddSlot(true);
        setNewSlot({ start: '09:00', end: '17:00' });
    };

    const handleSaveSlot = () => {
        if (!newSlot.start || !newSlot.end) {
            alert('Please select both start and end times');
            return;
        }

        const daySlots = availability[selectedDay] || [];
        setAvailability({
            ...availability,
            [selectedDay]: [...daySlots, newSlot]
        });
        setShowAddSlot(false);
        setNewSlot({ start: '', end: '' });
    };

    const handleRemoveSlot = (day, index) => {
        const daySlots = availability[day] || [];
        setAvailability({
            ...availability,
            [day]: daySlots.filter((_, i) => i !== index)
        });
    };

    const handleSaveAvailability = async () => {
        setSaving(true);
        try {
            await api.put('/interviewer/schedule', { availability });
            alert('Availability saved successfully!');
        } catch (error) {
            console.error('Failed to save availability:', error);
            alert('Failed to save availability. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-secondary animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Availability Schedule</h1>
                    <p className="text-slate-600">Set your weekly availability for interviews</p>
                </div>
                <button
                    onClick={handleSaveAvailability}
                    disabled={saving}
                    className="px-6 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary/90 transition shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Schedule
                        </>
                    )}
                </button>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-4">
                {daysOfWeek.map((day) => {
                    const daySlots = availability[day] || [];

                    return (
                        <motion.div
                            key={day}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <CalendarIcon size={20} className="text-secondary" />
                                    {day}
                                </h3>
                                <button
                                    onClick={() => handleAddSlot(day)}
                                    className="px-4 py-2 text-secondary hover:bg-secondary/10 rounded-lg transition font-medium flex items-center gap-2 text-sm"
                                >
                                    <Plus size={16} />
                                    Add Time Slot
                                </button>
                            </div>

                            {/* Time Slots */}
                            {daySlots.length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No availability set for this day</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {daySlots.map((slot, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-secondary/5 border border-secondary/20 rounded-lg group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-secondary" />
                                                <span className="font-medium text-slate-700">
                                                    {slot.start} - {slot.end}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveSlot(day, index)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Add Slot Modal */}
            {showAddSlot && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h2 className="text-xl font-bold text-slate-800 mb-4">
                            Add Time Slot - {selectedDay}
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Start Time
                                </label>
                                <input
                                    type="time"
                                    value={newSlot.start}
                                    onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={newSlot.end}
                                    onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddSlot(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-slate-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSlot}
                                className="flex-1 px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition"
                            >
                                Add Slot
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default InterviewerAvailability;
