import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bottom: 0,
            backgroundColor: 'var(--pk-color-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--pk-color-bg)',
                borderRadius: 'var(--pk-radius-lg)',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 4px 6px var(--pk-color-shadow)'
            }}>
                <div className="modal-header" style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid var(--pk-color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: 'var(--pk-color-text-secondary)'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '1.5rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
