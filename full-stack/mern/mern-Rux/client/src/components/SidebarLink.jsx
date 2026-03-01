import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarLink = ({ to, icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: isActive ? 'hsla(var(--text-primary) / 0.05)' : 'transparent',
            color: isActive ? 'hsl(var(--accent-cyan))' : 'hsla(var(--text-secondary))',
            textDecoration: 'none',
            transition: 'all 0.2s'
        })}
    >
        {icon}
        <span style={{ fontWeight: '500' }}>{label}</span>
    </NavLink>
);

export default SidebarLink;
