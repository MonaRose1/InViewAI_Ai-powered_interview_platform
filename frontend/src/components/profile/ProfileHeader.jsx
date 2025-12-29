import React, { useState, useRef } from 'react';
import { Camera, MapPin, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ImageCropModal from './ImageCropModal';

const ProfileHeader = ({ user }) => {
    const { updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 10MB before crop)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image size should be less than 10MB');
            return;
        }

        // Show crop modal
        setSelectedImage(file);
        setShowCropModal(true);
    };

    const handleCropComplete = async (croppedImageBase64) => {
        setShowCropModal(false);
        setUploading(true);

        try {
            // Convert base64 to file for multipart upload
            const response = await fetch(croppedImageBase64);
            const blob = await response.blob();
            const formData = new FormData();
            formData.append('avatar', blob, 'avatar.jpg');

            const { data } = await api.put('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(data);
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert('Failed to upload avatar. Please try again.');
        } finally {
            setUploading(false);
            setSelectedImage(null);
        }
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setSelectedImage(null);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden border-4 border-white shadow-md">
                        {user?.avatar ? (
                            <img
                                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = ''; // Fallback to initial
                                }}
                            />
                        ) : (
                            user?.name?.charAt(0)
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleAvatarClick}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 p-2 bg-secondary text-white rounded-full shadow-lg hover:bg-secondary/90 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                        <Camera size={14} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{user?.name}</h1>
                            <p className="text-slate-500 font-medium">{user?.email}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold uppercase tracking-wide border border-secondary/20">
                            {user?.role}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
                        {user?.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin size={16} />
                                <span>{user.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            <span>Joined {formatJoinDate(user?.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle size={16} />
                            <span>Active Status</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Crop Modal */}
            {showCropModal && selectedImage && (
                <ImageCropModal
                    imageFile={selectedImage}
                    onComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
};

export default ProfileHeader;
