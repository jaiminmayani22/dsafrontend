'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import apis from '../../../public/apis';
import IconSave from '@/components/icon/icon-save';
import IconArrowForward from '@/components/icon/icon-arrow-forward';
import IconRestore from '@/components/icon/icon-restore';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEyeOff from '@/components/icon/icon-eye-off';
import IconEye from '@/components/icon/icon-eye';

const ComponentsAppsAuthentication = () => {
    const router = useRouter();
    const token = localStorage.getItem('authToken');
    if (!token) {
        router.push('/auth/boxed-signin');
    }

    const [item, setItem] = useState<any>([]);
    const [action, setAction] = useState<string>('');
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        email: '',
        otp: '',
        name: '',
        phoneNo: '',
    });
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        name: '',
        phoneNo: '',
    });

    const [passwordVisibility, setPasswordVisibility] = useState({
        currentPassword: false,
        newPassword: false,
        confirmNewPassword: false,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(apis.verifyToken, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (response.status === 401 && data.message === "Token expired! Please login again") {
                    showMessage(data.message, 'error');
                    router.push('/auth/boxed-signin');
                    throw new Error('Token expired');
                }
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                setItem(data.data);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    email: data.data.email,
                    name: data.data.name,
                    phoneNo: data.data.phoneNo,
                }));
            } catch (error) {
                console.error('Error fetching Data:', error);
            }
        };

        fetchData();
    }, []);

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const handleChangePassword = () => setAction('changePassword');
    const handleResetPassword = () => setAction('resetPassword');
    const handleEditProfile = () => setAction('editProfile');

    const handleSaveProfile = async () => {
        if (!validateProfile()) return;
        const payload = {
            name: formData.name,
            phoneNo: formData.phoneNo,
        };
        try {
            const response = await fetch(apis.updateUser, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.status === 401 && data.message === "Token expired! Please login again") {
                showMessage(data.message, 'error');
                router.push('/auth/boxed-signin');
            }
            if (!response.ok) {
                showMessage(data.message, 'error');
            } else {
                showMessage(data.message);
                setItem(data.data);
                localStorage.setItem('authToken', data.token);
                setFormData(prevFormData => ({
                    ...prevFormData,
                    email: data.data.email,
                    name: data.data.name,
                    phoneNo: data.data.phoneNo,
                }));
            }
        } catch (error) {
            showMessage('Error fetching Data', "error");
        }
    };

    const handleResetPasswordAction = () => {
        showMessage('Password reset link sent to your email!', 'success');
    };

    const validateChangePassword = () => {
        const newErrors = { ...errors };

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'Current password is required';
        } else {
            newErrors.currentPassword = '';
        }

        if (!formData.newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword === formData.currentPassword) {
            newErrors.newPassword = 'New password must be different from current password';
        } else {
            newErrors.newPassword = '';
        }

        if (!formData.confirmNewPassword) {
            newErrors.confirmNewPassword = 'Please confirm your new password';
        } else if (formData.confirmNewPassword !== formData.newPassword) {
            newErrors.confirmNewPassword = 'New Passwords do not match';
        } else {
            newErrors.confirmNewPassword = '';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== '');
    };

    const handleSubmitChangePassword = async () => {
        if (!validateChangePassword()) return;
        const payload = {
            oldPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmNewPassword
        };
        try {
            const response = await fetch(apis.resetPassword, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.status === 401 && data.message === "Token expired! Please login again") {
                showMessage(data.message, 'error');
                router.push('/auth/boxed-signin');
            }
            if (!response.ok) {
                showMessage(data.message, 'error');
            } else {
                showMessage('Password changed successfully, Please login Again!');
                router.push('/auth/boxed-signin');
            }
        } catch (error) {
            console.error('Error fetching Data:', error);
        }
    };

    const toggleVisibility = (field: keyof typeof passwordVisibility) => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const validateProfile = () => {
        const newErrors = { ...errors };

        if (!formData.name) {
            newErrors.name = 'Name is required.';
        } else {
            newErrors.name = '';
        }

        if (!formData.phoneNo) {
            newErrors.phoneNo = 'Phone number is required.';
        } else {
            newErrors.phoneNo = '';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error !== '');
    };

    return (
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
            <h2 className='text-xl font-semibold mb-4 px-4'>Welcome, {item?.name}</h2>
            <div className="flex space-x-4 p-4">
                <button
                    className="btn btn-primary px-4 py-2 text-sm"
                    onClick={handleChangePassword}
                >
                    Change Password
                </button>
                <button
                    className="btn btn-success px-4 py-2 text-sm"
                    onClick={handleEditProfile}
                >
                    Edit Profile
                </button>
            </div>

            {/* Conditional Form rendering */}
            {action === 'changePassword' && (
                <form className="space-y-5 p-4">
                    <div className="flex sm:flex-row flex-col space-x-4">
                        <label
                            htmlFor="currentPassword"
                            className="mb-2 sm:w-1/4 sm:mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Current Password
                        </label>
                        <div className="relative flex-1 sm:ml-2">
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type={passwordVisibility.currentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                placeholder="Enter Current Password"
                                onChange={(e) =>
                                    setFormData({ ...formData, currentPassword: e.target.value })
                                }
                                className="form-input w-full border-2 border-gray-300 rounded p-2"
                            />
                            {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword}</p>}
                            <button
                                type="button"
                                onClick={() => toggleVisibility("currentPassword")}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                            >
                                {passwordVisibility.currentPassword ? (
                                    <IconEyeOff className="w-5 h-5" />
                                ) : (
                                    <IconEye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex sm:flex-row flex-col space-x-4">
                        <label
                            htmlFor="newPassword"
                            className="mb-2 sm:w-1/4 sm:mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            New Password
                        </label>
                        <div className="relative flex-1 sm:ml-2">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={passwordVisibility.newPassword ? "text" : "password"}
                                value={formData.newPassword}
                                placeholder="Enter New Password"
                                onChange={(e) =>
                                    setFormData({ ...formData, newPassword: e.target.value })
                                }
                                className="form-input w-full border-2 border-gray-300 rounded p-2"
                            />
                            {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
                            <button
                                type="button"
                                onClick={() => toggleVisibility("newPassword")}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                            >
                                {passwordVisibility.newPassword ? (
                                    <IconEyeOff className="w-5 h-5" />
                                ) : (
                                    <IconEye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex sm:flex-row flex-col space-x-4">
                        <label
                            htmlFor="confirmNewPassword"
                            className="mb-2 sm:w-1/4 sm:mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Confirm New Password
                        </label>
                        <div className="relative flex-1 sm:ml-2">
                            <input
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                type={passwordVisibility.confirmNewPassword ? "text" : "password"}
                                value={formData.confirmNewPassword}
                                placeholder="Confirm New Password"
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmNewPassword: e.target.value })
                                }
                                className="form-input w-full border-2 border-gray-300 rounded p-2"
                            />
                            {errors.confirmNewPassword && <p className="text-sm text-red-600">{errors.confirmNewPassword}</p>}
                            <button
                                type="button"
                                onClick={() => toggleVisibility("confirmNewPassword")}
                                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                            >
                                {passwordVisibility.confirmNewPassword ? (
                                    <IconEyeOff className="w-5 h-5" />
                                ) : (
                                    <IconEye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmitChangePassword}
                        className="btn btn-success px-4 py-2 text-sm !mt-6 flex items-center space-x-2"
                    >
                        <IconSave className="w-5 h-5" />
                        <span>Save</span>
                    </button>
                </form>
            )}

            {action === 'editProfile' && (
                <form className="space-y-5 p-4">
                    <div className="flex sm:flex-row flex-col space-x-4">
                        <label
                            htmlFor="name"
                            className="mb-2 sm:w-1/4 sm:mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            placeholder="Enter your Name"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="form-input flex-1 sm:ml-2 border-2 border-gray-300 rounded p-2"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div className="flex sm:flex-row flex-col space-x-4">
                        <label
                            htmlFor="phoneNo"
                            className="mb-2 sm:w-1/4 sm:mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phoneNo"
                            name="phoneNo"
                            type="text"
                            value={formData.phoneNo}
                            placeholder="Enter Phone Number without +91"
                            maxLength={10}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) { // Allow only digits
                                    setFormData({ ...formData, phoneNo: value });
                                }
                            }}
                            className="form-input flex-1 sm:ml-2 border-2 border-gray-300 rounded p-2"
                        />
                        {errors.phoneNo && <p className="text-sm text-red-600">{errors.phoneNo}</p>}
                    </div>

                    <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="btn btn-success px-4 py-2 text-sm !mt-6 flex items-center space-x-2"
                    >
                        <IconSave className="w-5 h-5" />
                        <span>Save</span>
                    </button>
                </form>
            )}
        </div>
    );
};

export default ComponentsAppsAuthentication;
