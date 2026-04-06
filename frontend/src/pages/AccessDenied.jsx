import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useData } from '../context/DataContext';

const AccessDenied = () => {
    const { selectSection } = useData();

    return (
        <div style={{
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }} className="fade-in">
            <div className="glass-float" style={{
                width: '100px',
                height: '100px',
                background: '#fff1f2',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48',
                marginBottom: '2rem',
                border: '1px solid #fee2e2'
            }}>
                <ShieldAlert size={48} />
            </div>

            <h1 className="hero-gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>
                403 Access Denied
            </h1>

            <p style={{ color: '#64748b', maxWidth: '500px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                You do not have the necessary security clearances to access this tactical center.
                Please contact your system administrator if you believe this is an error.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    className="btn-primary"
                    onClick={() => selectSection('dashboard')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <LayoutDashboard size={18} /> Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;
