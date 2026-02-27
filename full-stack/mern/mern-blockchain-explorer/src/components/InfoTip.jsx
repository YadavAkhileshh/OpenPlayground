import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { glossary } from '../utils/glossary';

export default function InfoTip({ field }) {
    const [show, setShow] = useState(false);
    const info = glossary[field];
    if (!info) return null;

    return (
        <span
            className="tooltip-trigger"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            style={{ marginLeft: 4 }}
        >
            <HelpCircle size={13} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
            {show && (
                <span className="tooltip-content" style={{ minWidth: 200, whiteSpace: 'normal' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 2, fontSize: '0.78rem' }}>
                        {info.title}
                    </strong>
                    {info.description}
                </span>
            )}
        </span>
    );
}
