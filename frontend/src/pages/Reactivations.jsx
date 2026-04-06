import React from 'react';
import GenericTable from '../components/GenericTable';
import { UserCheck, ShieldAlert, UserX, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import api from '../api';

const Reactivations = () => {
    const { showNotification, fetchData, user } = useData();
    const [selectedEmployee, setSelectedEmployee] = React.useState(null);
    const [reason, setReason] = React.useState('');
    const [isReactivating, setIsReactivating] = React.useState(false);

    const handleConfirmReactivate = async () => {
        if (!selectedEmployee || !reason.trim()) {
            showNotification('Please enter a reason for reactivation', 'error');
            return;
        }

        setIsReactivating(true);
        try {
            await api.post(`reactivations/${selectedEmployee.id}/reactivate`, { reason });
            showNotification('Account reactivated successfully', 'success');
            setSelectedEmployee(null);
            setReason('');
            fetchData();
        } catch (err) {
            showNotification('Failed to reactivate account', 'error');
        } finally {
            setIsReactivating(false);
        }
    };

    const renderTableData = (item) => (
        <>
            <td style={{ minWidth: '300px', padding: '1.5rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                        border: '1px solid rgba(225, 29, 72, 0.1)'
                    }}>
                        <UserX size={22} color="#e11d48" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                            {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontWeight: 600 }}>
                            <AlertCircle size={14} color="#94a3b8" /> {item.employee_code}
                        </div>
                    </div>
                </div>
            </td>
            <td style={{ padding: '1.5rem 1rem' }}>
                <span className="badge" style={{
                    color: '#e11d48',
                    background: '#fff1f2',
                    padding: '6px 14px',
                    borderRadius: '100px',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    border: '1px solid rgba(225, 29, 72, 0.1)'
                }}>
                    BLOCKED
                </span>
            </td>
            <td style={{ padding: '1.5rem 1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.9rem', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldAlert size={14} /> {item.failed_login_attempts || 3} Failed Attempts
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                        Automatic Lock Triggered
                    </div>
                </div>
            </td>
            <td style={{ padding: '1.5rem 1rem', textAlign: 'right' }}>
                <button
                    className="btn-primary"
                    style={{
                        padding: '10px 20px',
                        fontSize: '0.8rem',
                        background: '#059669',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setSelectedEmployee(item)}
                >
                    <UserCheck size={16} />
                    Reactivate User
                </button>
            </td>
        </>
    );

    return (
        <div className="fade-in scroll-container" style={{ paddingBottom: '3rem' }}>
            {/* ENHANCED HERO SECTION */}
            <div className="glass" style={{
                padding: '1rem 2rem',
                marginBottom: '1.25rem',
                borderRadius: '20px',
                background: 'linear-gradient(120deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: '6px solid #e11d48',
                boxShadow: 'var(--shadow-premium)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                        borderRadius: '14px',
                        boxShadow: '0 6px 15px rgba(225, 29, 72, 0.1)'
                    }}>
                        <ShieldAlert size={28} color="#e11d48" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span style={{ background: '#e11d48', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 800 }}>SECURITY ACTION</span>
                            <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>ACCOUNT REACTIVATION CENTER</span>
                        </div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Manage Blocked Accounts
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 500, maxWidth: '600px' }}>
                        </p>
                    </div>
                </div>
            </div>

            <div className="section-card" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                <GenericTable renderTableData={renderTableData} />
            </div>
            {/* REASON MODAL */}
            {selectedEmployee && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '1.5rem'
                }}>
                    <div className="glass" style={{
                        width: '100%',
                        maxWidth: '500px',
                        background: 'white',
                        borderRadius: '24px',
                        padding: '2rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'modalOpen 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '12px' }}>
                                <UserCheck size={24} color="#059669" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 800 }}>Reactivate Account</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>For {selectedEmployee.name}</p>
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px', display: 'block' }}>
                                Reason for Reactivation
                            </label>
                            <textarea
                                className="form-input"
                                placeholder="Enter the reason for reactivating this account..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    fontSize: '0.9rem',
                                    border: '2px solid #f1f5f9',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                                autoFocus
                            />
                            <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                This reason will be stored in the system audit logs.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
                            <button
                                className="form-input"
                                style={{ flex: 1, background: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                onClick={() => {
                                    setSelectedEmployee(null);
                                    setReason('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 2, background: '#059669', border: 'none', justifyContent: 'center' }}
                                onClick={handleConfirmReactivate}
                                disabled={isReactivating || !reason.trim()}
                            >
                                {isReactivating ? 'Processing...' : 'Confirm Reactivation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reactivations;
