import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../api';

const MAX_LENGTH = 30;
const PASSWORD_MAX_LENGTH = 12;
// Only allow letters, numbers, @ and hyphen
const USERNAME_REGEX = /^[a-zA-Z0-9@\-]*$/;

const Login = () => {
    const { login, error: authError, passwordResetRequired = false } = useData();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [resetData, setResetData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [fieldErrors, setFieldErrors] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [mode, setMode] = useState('login');
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

    // Username: only allow alphanumeric, @, hyphen — strip others in real time
    const handleUsernameChange = (e) => {
        const raw = e.target.value;
        const filtered = raw.replace(/[^a-zA-Z0-9@\-]/g, '');

        if (filtered.length > MAX_LENGTH) {
            setFieldErrors(prev => ({ ...prev, username: `Username cannot exceed ${MAX_LENGTH} characters.` }));
            return;
        }

        setFieldErrors(prev => {
            const next = { ...prev };
            if (raw !== filtered) next.username = 'Only letters, numbers, @ and - are allowed.';
            else if (filtered.length === 0) next.username = 'Username is required.';
            else next.username = '';

            if (filtered.toLowerCase().includes('admin') && next.password === 'Password must be at least 8 characters.') {
                next.password = '';
            }
            return next;
        });

        setCredentials(prev => ({ ...prev, username: filtered.slice(0, MAX_LENGTH) }));
    };

    // Password: max length only, no paste
    const handlePasswordChange = (e) => {
        const val = e.target.value;
        if (val.length > PASSWORD_MAX_LENGTH) {
            setFieldErrors(prev => ({ ...prev, password: `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.` }));
            return;
        }
        const isAdmin = credentials.username.toLowerCase().includes('admin');
        let pwdErr = '';
        if (val.length === 0) {
            pwdErr = 'Password is required.';
        } else if (val.length < 8 && !isAdmin) {
            pwdErr = 'Password must be at least 8 characters.';
        }
        setFieldErrors(prev => ({ ...prev, password: pwdErr }));
        setCredentials(prev => ({ ...prev, password: val }));
    };

    const blockPaste = (e) => {
        e.preventDefault();
        setFieldErrors(prev => ({ ...prev, password: 'Pasting is not allowed in the password field.' }));
    };

    const validateForm = () => {
        const errors = {};
        if (!credentials.username.trim()) {
            errors.username = 'Username is required.';
        } else if (!USERNAME_REGEX.test(credentials.username)) {
            errors.username = 'Only letters, numbers, @ and - are allowed.';
        } else if (credentials.username.length > MAX_LENGTH) {
            errors.username = `Username cannot exceed ${MAX_LENGTH} characters.`;
        }
        const isAdmin = credentials.username.toLowerCase().includes('admin');
        if (!credentials.password) {
            errors.password = 'Password is required.';
        } else if (credentials.password.length < 8 && !isAdmin) {
            errors.password = 'Password must be at least 8 characters.';
        } else if (credentials.password.length > PASSWORD_MAX_LENGTH) {
            errors.password = `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`;
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode !== 'login') return; // Prevent ghost submits
        if (!validateForm()) return;
        setLoading(true);
        setError('');
        try {
            await login(credentials.username, credentials.password);
        } catch (err) {
            let msg = 'Login failed. Please check your credentials.';
            if (err && typeof err === 'object') {
                msg = err.message || err.error || err.detail || err.details || msg;
            } else if (typeof err === 'string') {
                msg = err;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (resetData.newPassword !== resetData.confirmPassword) { setError('New passwords do not match'); return; }
        const pwd = resetData.newPassword;
        if (pwd.length < 8 || pwd.length > 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd) || !/[!@#$%^&*]/.test(pwd)) {
            setError('Password must be 8-12 chars with Uppercase, Number, and Special Char'); return;
        }
        setLoading(true); setError('');
        try {
            await api.post('auth/change-password/', { old_password: resetData.oldPassword, new_password: resetData.newPassword });
            setSuccessMsg('Password changed successfully! Redirecting...');
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            setError(err.error || err.message || 'Failed to change password');
            setLoading(false);
        }
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await api.post('auth/request-reset-otp/', { username: forgotUsername });
            setSuccessMsg(res.message); setMode('forgot-verify');
        } catch (err) { setError(err.error || 'Failed to send OTP'); }
        finally { setLoading(false); }
    };

    const handleForgotVerify = (e) => { e.preventDefault(); setMode('forgot-reset'); };

    const handleForgotReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            await api.post('auth/reset-password-otp/', { username: forgotUsername, otp, new_password: newPassword });
            setSuccessMsg('Password reset successful! You can now login.');
            setTimeout(() => { setMode('login'); setSuccessMsg(''); }, 2000);
        } catch (err) { setError(err.error || 'Reset failed'); }
        finally { setLoading(false); }
    };

    const inputStyle = (hasError) => ({
        width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px',
        border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
        background: hasError ? '#fef2f2' : '#f8fafc', fontSize: '0.95rem',
        outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
    });

    const fieldErrStyle = {
        color: '#ef4444', fontSize: '0.78rem', fontWeight: 600,
        marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px'
    };

    // ---- Password Reset Required Screen ----
    if (passwordResetRequired) {
        return (
            <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '430px', padding: '3rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '60px', height: '60px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#ef4444' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Secure Your Account</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please set a new password to continue.</p>
                    </div>
                    {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
                    {successMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>}
                    <form onSubmit={handleResetSubmit}>
                        {[{ label: 'Current Password', key: 'oldPassword' }, { label: 'New Password', key: 'newPassword' }, { label: 'Confirm New Password', key: 'confirmPassword' }].map(({ label, key }) => (
                            <div key={key} className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label>{label}</label>
                                <input type="password" value={resetData[key]}
                                    onChange={(e) => setResetData({ ...resetData, [key]: e.target.value })}
                                    onPaste={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()}
                                    maxLength={PASSWORD_MAX_LENGTH}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }} required />
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: '#ef4444' }}>{loading ? 'Updating...' : 'Set New Password'}</button>
                    </form>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        return (
            <>
                <form onSubmit={handleForgotRequest} style={{ display: mode === 'forgot-request' ? 'block' : 'none' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, color: '#1e293b' }}>Forgot Password?</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Enter your username or employee code to receive an OTP.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Username / Code</label>
                        <input type="text" className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                            value={forgotUsername} onChange={(e) => setForgotUsername(e.target.value)} required placeholder="EMP-00001" maxLength={MAX_LENGTH} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary)', marginBottom: '1rem' }}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
                    <button type="button" onClick={(e) => { e.preventDefault(); setMode('login'); }} style={{ width: '100%', background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Back to Login</button>
                </form>

                <form onSubmit={handleForgotVerify} style={{ display: mode === 'forgot-verify' ? 'block' : 'none' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, color: '#1e293b' }}>Verify OTP</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Enter the 6-digit code sent to your registered email.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>6-Digit OTP</label>
                        <input type="text" maxLength={6} className="form-input" style={{ width: '100%', padding: '12px', borderRadius: '12px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 700 }}
                            value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="000000" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary)' }}>Verify &amp; Continue</button>
                </form>

                <form onSubmit={handleForgotReset} style={{ display: mode === 'forgot-reset' ? 'block' : 'none' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontWeight: 800, color: '#1e293b' }}>Set New Password</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Your new password must be secure.</p>
                    </div>
                    {[{ label: 'New Password', val: newPassword, set: setNewPassword }, { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword }].map(({ label, val, set }) => (
                        <div key={label} className="form-group" style={{ marginBottom: '1.25rem' }}>
                            <label>{label}</label>
                            <input type="password" maxLength={PASSWORD_MAX_LENGTH} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                value={val} onChange={(e) => set(e.target.value)}
                                onPaste={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()} onCut={(e) => e.preventDefault()} required />
                        </div>
                    ))}
                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', background: 'var(--primary)' }}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                </form>

                {/* ---- Main Login Form ---- */}
                <form onSubmit={handleSubmit} noValidate style={{ display: mode === 'login' ? 'block' : 'none' }}>
                    {/* Username */}
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                            Username
                            <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.73rem', marginLeft: '8px' }}>
                            </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: fieldErrors.username ? '#ef4444' : '#94a3b8' }}>
                                <User size={18} />
                            </div>
                            <input
                                id="login-username"
                                type="text"
                                style={inputStyle(!!fieldErrors.username)}
                                placeholder="EMP-00001"
                                value={credentials.username}
                                onChange={handleUsernameChange}
                                maxLength={MAX_LENGTH}
                                autoComplete="username"
                            />
                        </div>
                        {fieldErrors.username && (
                            <div style={fieldErrStyle}><AlertCircle size={13} /> {fieldErrors.username}</div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                            Password
                            <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.73rem', marginLeft: '8px' }}>
                            </span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: fieldErrors.password ? '#ef4444' : '#94a3b8' }}>
                                <Lock size={18} />
                            </div>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                style={{ ...inputStyle(!!fieldErrors.password), paddingRight: '48px' }}
                                placeholder="••••••••••••"
                                value={credentials.password}
                                onChange={handlePasswordChange}
                                onPaste={blockPaste}
                                onCopy={(e) => e.preventDefault()}
                                onCut={(e) => e.preventDefault()}
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPassword(v => !v)}
                                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                                tabIndex={-1}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <div style={fieldErrStyle}><AlertCircle size={13} /> {fieldErrors.password}</div>
                        )}
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                        <button type="button" onClick={() => setMode('forgot-request')} style={{ background: 'transparent', border: 'none', color: '#be185d', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Forgot Password?</button>
                    </div>
                    <button type="submit" disabled={loading}
                        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #be185d 0%, #f43f5e 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                        {loading ? 'Authenticating...' : <><span>Sign In Dashboard</span><ArrowRight size={18} /></>}
                    </button>
                </form>
            </>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
            <style>{shakeAnimation}</style>
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '430px', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', borderRadius: '50%', opacity: 0.1, background: 'linear-gradient(135deg, #FF6B6B 0%, #facc15 100%)' }} />
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <img src="/Bavya.png" alt="Bavya Logo" style={{ width: '40px', height: '40px' }} />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>BAVYA HRMS</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Secure System Administration</p>
                </div>
                {(error || authError) && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                        <AlertCircle size={16} /> {error || authError}
                    </div>
                )}
                {successMsg && (
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{successMsg}</div>
                )}
                {renderContent()}
                <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.8rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                    <span>&copy; Powered by</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src="/Bavya.png" alt="" style={{ width: '20px' }} />
                        <span style={{ color: '#475569', fontWeight: 700 }}>BAVYA</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
