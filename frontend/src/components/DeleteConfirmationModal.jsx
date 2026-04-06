import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

const DeleteConfirmationModal = () => {
    const { showDeleteModal, setShowDeleteModal, deleteConfig, setDeleteConfig, confirmDelete, loading, closeModal } = useData();

    if (!showDeleteModal) return null;

    const isEmployee = deleteConfig.type === 'Employees';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }} onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '450px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'modalFadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                <style>
                    {`
                        @keyframes modalFadeIn {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}
                </style>

                {/* Header */}
                <div style={{
                    padding: '2rem 2rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        background: '#fef2f2',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1)'
                    }}>
                        <AlertTriangle size={36} />
                    </div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: '#1e293b',
                        margin: 0,
                        letterSpacing: '-0.02em'
                    }}>
                        Delete {deleteConfig.type}?
                    </h2>
                    <p style={{
                        color: '#64748b',
                        fontSize: '0.95rem',
                        marginTop: '0.5rem',
                        lineHeight: 1.5
                    }}>
                        Are you sure you want to delete <strong>{deleteConfig.name}</strong>? This action cannot be undone.
                    </p>
                </div>

                {/* Body */}
                <div style={{ padding: '0 2rem 2rem' }}>
                    {isEmployee && (
                        <div style={{ marginTop: '1rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: '#475569',
                                marginBottom: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Reason for Deletion <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                autoFocus
                                value={deleteConfig.reason}
                                onChange={(e) => setDeleteConfig({ ...deleteConfig, reason: e.target.value })}
                                placeholder="Please provide a reason for audit purposes..."
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '1rem',
                                    borderRadius: '16px',
                                    border: '2px solid #f1f5f9',
                                    background: '#f8fafc',
                                    fontSize: '0.95rem',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    resize: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--magenta)'}
                                onBlur={(e) => e.target.style.borderColor = '#f1f5f9'}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '2rem'
                    }}>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '16px',
                                border: '2px solid #f1f5f9',
                                background: 'white',
                                color: '#64748b',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            disabled={loading || (isEmployee && !deleteConfig.reason.trim())}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '16px',
                                border: 'none',
                                background: loading || (isEmployee && !deleteConfig.reason.trim()) ? '#cbd5e1' : '#ef4444',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                cursor: loading || (isEmployee && !deleteConfig.reason.trim()) ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: loading || (isEmployee && !deleteConfig.reason.trim()) ? 'none' : '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && !(isEmployee && !deleteConfig.reason.trim())) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 15px 20px -3px rgba(239, 68, 68, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = loading || (isEmployee && !deleteConfig.reason.trim()) ? 'none' : '0 10px 15px -3px rgba(239, 68, 68, 0.2)';
                            }}
                        >
                            {loading ? (
                                <div className="spinner" style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    <span>Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div >
    );
};

export default DeleteConfirmationModal;
