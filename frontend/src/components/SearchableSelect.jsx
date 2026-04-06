import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({
    options = [],
    value = '',
    onChange,
    placeholder = 'Select option...',
    className = '',
    icon: Icon = null,
    required = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.id || opt.value) === String(value));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt => {
        const label = (opt.name || opt.label || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return label.startsWith(search);
    });

    const handleSelect = (option) => {
        onChange({ target: { value: option.id || option.value } });
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`premium-select-container ${className}`} ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <div
                className={`premium-input ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '3.5rem',
                    opacity: disabled ? 0.6 : 1
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                    {Icon && <Icon className="premium-input-icon" size={18} style={{ position: 'static', transform: 'none', color: isOpen ? 'var(--primary)' : '#94a3b8' }} />}
                    <span style={{
                        color: selectedOption ? '#1e293b' : '#94a3b8',
                        fontWeight: selectedOption ? 600 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {selectedOption ? (selectedOption.name || selectedOption.label) : placeholder}
                    </span>
                </div>
                <ChevronDown size={18} color="#94a3b8" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
            </div>

            {/* Hidden Input for Form Validation */}
            <input
                type="text"
                value={value || ''}
                required={required}
                onChange={() => { }} // Controlled but silent
                style={{
                    opacity: 0,
                    width: 0,
                    height: 0,
                    position: 'absolute',
                    pointerEvents: 'none'
                }}
            />

            {isOpen && (
                <div className="glass" style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    padding: '8px',
                    maxHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px 8px 32px',
                                borderRadius: '8px',
                                border: '1px solid #f1f5f9',
                                background: '#f8fafc',
                                fontSize: '0.85rem',
                                outline: 'none'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id || opt.value}
                                    onClick={() => handleSelect(opt)}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: String(opt.id || opt.value) === String(value) ? 700 : 500,
                                        background: String(opt.id || opt.value) === String(value) ? 'var(--primary-light)' : 'transparent',
                                        color: String(opt.id || opt.value) === String(value) ? 'var(--primary)' : '#1e293b',
                                        transition: 'all 0.2s',
                                        marginBottom: '2px'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = String(opt.id || opt.value) === String(value) ? 'var(--primary-light)' : '#f8fafc'}
                                    onMouseLeave={(e) => e.target.style.background = String(opt.id || opt.value) === String(value) ? 'var(--primary-light)' : 'transparent'}
                                >
                                    {opt.name || opt.label}
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
