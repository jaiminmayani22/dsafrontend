'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconEyeOff from '@/components/icon/icon-eye-off';
import IconEye from '@/components/icon/icon-eye';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import apis from '../../public/apis';
import { log } from 'console';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);  // Track loading state

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        setLoading(true);  // Set loading to true when the request starts

        try {
            const API = apis.userLogin;
            const response = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed. Please check your credentials.');
            }

            const data = await response.json();
            localStorage.setItem('authToken', data.token);
            router.push('/apps/contacts/');
        } catch (error) {
            setError('Login failed. Please try again.');
            console.error('There was an error!', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            {error && <div className="text-red-500">{error}</div>}
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        type="email"
                        placeholder="Enter Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <IconEyeOff /> : <IconEye />}
                    </span>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                disabled={loading}
            >
                {loading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;
