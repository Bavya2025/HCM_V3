import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../api';

const Login = () => {
    const { login, error: authError, passwordResetRequired = false } = useData();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [resetData, setResetData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // Core States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Forgot Password Flow States
    const [mode, setMode] = useState('login'); // login, forgot-request, forgot-verify, forgot-reset
    const [forgotUsername, setForgotUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const shakeAnimation = `
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
    `;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(credentials.username, credentials.password);
        } catch (err) {
            let errorMessage = 'Login failed. Please check your credentials.';
            if (err && typeof err === 'object') {
                errorMessage = err.message || err.error || err.detail || err.details || errorMessage;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (resetData.newPassword !== resetData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        const pwd = resetData.newPassword;
        if (pwd.length < 8 || pwd.length > 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[!@#$%^&*]/.test(pwd)) {
            setError("Password must be 8-12 chars with Uppercase, Number, and Special Char");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('auth/change-password/', {
                old_password: resetData.oldPassword,
                new_password: resetData.newPassword
            });
            setSuccessMsg("Password changed successfully! Redirecting...");
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            setError(err.error || err.message || "Failed to change password");
            setLoading(false);
        }
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('auth/request-reset-otp/', { username: forgotUsername });
            setSuccessMsg(res.message);
            setMode('forgot-verify');
        } catch (err) {
            setError(err.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotVerify = async (e) => {
        e.preventDefault();
        setMode('forgot-reset');
    };

    const handleForgotReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('auth/reset-password-otp/', {
                username: forgotUsername,
                otp: otp,
                new_password: newPassword
            });
            setSuccessMsg("Password reset successful! You can now login.");
            setTimeout(() => {
                setMode('login');
                setSuccessMsg('');
            }, 2000);
        } catch (err) {
            setError(err.error || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    if (passwordResetRequired) {
        return (
            <div style={{
                display: 'flex', height: '100vh', width: '100vw', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif"
            }}>
                <div style={{
                    background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    width: '100%', maxWidth: '430px', padding: '3rem', position: 'relative'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '60px', height: '60px', background: '#fef2f2', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444'
                        }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Secure Your Account</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please set a new password to continue.</p>
                    </div>
                    {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                    {successMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}
                    <form onSubmit={handleResetSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}><label>Current Password</label>
                            <input type="password" value={resetData.oldPassword} onChange={(e) => setResetData({ ...resetData, oldPassword: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.25rem' }}><label>New Password</label>
                            <input type="password" value={resetData.newPassword} onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}><label>Confirm New Password</label>
                            <input type="password" value={resetData.confirmPassword} onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: '#ef4444' }}>{loading ? 'Updating...' : 'Set New Password'}</button>
                    </form>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (mode === 'forgot-request') {
            return (
                <form onSubmit={handleForgotRequest}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, color: '#1e293b' }}>Forgot Password?</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Enter your username or employee code to receive an OTP.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Username / Code</label>
                        <input type="text" className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }} value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} required placeholder="EMP-00001" />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary)', marginBottom: '1rem' }}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
                    <button type="button" onClick={() => setMode('login')} style={{ width: '100%', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Back to Login</button>
                </form>
            );
        }

        if (mode === 'forgot-verify') {
            return (
                <form onSubmit={handleForgotVerify}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, color: '#1e293b' }}>Verify OTP</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Enter the 6-digit code sent to your registered email.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>6-Digit OTP</label>
                        <input type="text" maxLength={6} className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '12px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 700 }} value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="000000" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary)' }}>Verify & Continue</button>
                </form>
            );
        }

        if (mode === 'forgot-reset') {
            return (
                <form onSubmit={handleForgotReset}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, color: '#1e293b' }}>Set New Password</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Your new password must be secure.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}><label>New Password</label>
                        <input type="password" style={{ width: '100%', padding: '12px', borderRadius: '12px' }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}><label>Confirm Password</label>
                        <input type="password" style={{ width: '100%', padding: '12px', borderRadius: '12px' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary)' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                </form>
            );
        }

        return (
            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Username</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><User size={18} /></div>
                        <input type="text" style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} placeholder="EMP-00001" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} required />
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Lock size={18} /></div>
                        <input type="password" style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }} placeholder="••••••••••••" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} required />
                    </div>
                </div>
                <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                    <button type="button" onClick={() => setMode('forgot-request')} style={{ background: 'transparent', border: 'none', color: '#be185d', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Forgot Password?</button>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #be185d 0%, #f43f5e 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loading ? 'Authenticating...' : <>Sign In Dashboard <ArrowRight size={18} /></>}
                </button>
            </form>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
            <style>{shakeAnimation}</style>
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '430px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', opacity: 0.1, background: 'linear-gradient(135deg, #FF6B6B 0%, #facc15 100%)' }}></div>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><img src="/Bavya.png" alt="Bavya Logo" style={{ width: '40px', height: '40px' }} /></div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>BAVYA HRMS</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Secure System Administration</p>
                </div>
                {(error || authError) && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>{error || authError}</div>}
                {successMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}
                {renderContent()}
                <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <span>&copy; Powered by</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><img src="/Bavya.png" alt="" style={{ width: '20px' }} /><span style={{ color: '#475569', fontWeight: 700 }}>BAVYA</span></div>
                </div>
            </div>
        </div>
    );
};

export default Login;
