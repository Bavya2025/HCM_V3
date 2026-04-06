import React from 'react';
import { AlertCircle, X, HelpCircle, AlertTriangle } from 'lucide-react';
import { useData } from '../context/DataContext';

const CancelConfirmationModal = () => {
    const { showCancelModal, setShowCancelModal, confirmCancel } = useData();

    if (!showCancelModal) return null;

    return (
        <div className="modal-overlay active" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                borderRadius: '24px',
                background: '#ffffff',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative'
            }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#fff1f2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    color: '#e11d48',
                }}>
                    <HelpCircle size={32} strokeWidth={2.5} />
                </div>

                <h2 style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    marginBottom: '0.75rem'
                }}>Discard Changes?</h2>

                <p style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    marginBottom: '2rem'
                }}>
                    You have unsaved information in the form. Are you sure you want to cancel? This action cannot be undone.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        className="btn-secondary"
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            fontWeight: 700,
                            background: '#ffffff',
                            color: '#475569',
                            border: '2px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#f8fafc';
                            e.target.style.borderColor = '#94a3b8';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#ffffff';
                            e.target.style.borderColor = '#cbd5e1';
                        }}
                        onClick={() => setShowCancelModal(false)}
                    >
                        Keep Editing
                    </button>
                    <button
                        className="btn-primary"
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '14px',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #e11d48, #be185d)',
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(190, 24, 93, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={confirmCancel}
                    >
                        Yes, Discard
                    </button>
                </div>

                <button
                    style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#64748b',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => setShowCancelModal(false)}
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default CancelConfirmationModal;
