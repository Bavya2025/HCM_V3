import React from 'react';

const BavyaSpinner = ({ label, size = 'default', minHeight = '60vh' }) => {
    if (size === 'small') {
        return (
            <div className="loading-spinner-container" style={{ width: '18px', height: '18px' }}>
                <div className="spinner-ring" style={{ width: '100%', height: '100%', borderWidth: '2px' }}></div>
                <div className="spinner-ring" style={{ width: '100%', height: '100%', borderWidth: '2px', animationDelay: '-0.3s' }}></div>
            </div>
        );
    }

    // Default 'large' / full page spinner
    const displayLabel = label === undefined ? "Processing..." : label;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            padding: '4rem 2rem',
            flex: 1,
            minHeight: minHeight,
            width: '100%'
        }}>
            <div className="loading-spinner-container" style={{ transform: 'scale(1.2)' }}>
                <div className="spinner-ring" style={{ borderTopColor: 'var(--primary)', borderLeftColor: 'var(--magenta)' }}></div>
                <div className="spinner-ring" style={{ animationDirection: 'reverse', borderTopColor: 'var(--magenta)', borderLeftColor: 'transparent', opacity: 0.5 }}></div>
                <div className="spinner-text" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'var(--primary)' }}>BAVYA</div>
            </div>
            {displayLabel && (
                <div className="glass" style={{
                    padding: '8px 24px',
                    borderRadius: '50px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: 'var(--primary)',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(136, 19, 55, 0.1)'
                }}>
                    <span className="pulse">{displayLabel}</span>
                </div>
            )}
        </div>
    );
};

export default BavyaSpinner;
