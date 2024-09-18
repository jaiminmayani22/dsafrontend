'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconUser from '@/components/icon/icon-user';
import { useRouter } from 'next/navigation';
import React, { useState }  from 'react';
import IconPhoneCall from '../icon/icon-phone-call';
import apis from '../../public/apis';

const ComponentsAuthRegisterForm = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !phoneNo || !password) {
            setError('All fields are required.');
            return;
        }

        try {
            const API = apis.userSignUp;

            const response = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, phoneNo, password }),
            });

            if (!response.ok) {
                throw new Error('Signup failed. Please try again.');
            }

            const data = await response.json();

            setSuccess('Signup successful! Redirecting...');
            localStorage.setItem('authToken', data.token);
            router.push('/');
        } catch (error) {
            setError('Signup failed. Please try again.');
            console.error('There was an error!', error);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Name">Name</label>
                <div className="relative text-white-dark">
                    <input id="Name" type="text" placeholder="Enter Name" className="form-input ps-10 placeholder:text-white-dark" value={name} onChange={(e) => setName(e.target.value)}/>
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input id="Email" type="email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark" value={email} onChange={(e) => setEmail(e.target.value)}/>
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="PhoneNo">Phone No</label>
                <div className="relative text-white-dark">
                    <input id="Number" type="number" placeholder="Enter Number" className="form-input ps-10 placeholder:text-white-dark" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)}/>
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconPhoneCall fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input id="Password" type="password" placeholder="Enter Password" className="form-input ps-10 placeholder:text-white-dark" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                Sign Up
            </button>
            <br />
        </form>
    );
};

export default ComponentsAuthRegisterForm;
