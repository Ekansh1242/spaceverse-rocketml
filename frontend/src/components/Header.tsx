import React, { useState, useEffect } from 'react';
import { checkHealth } from '../utils/api';

const Header: React.FC = () => {
  const [online, setOnline] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    checkHealth().then(setOnline);
    const interval = setInterval(() => {
      setTime(new Date());
      checkHealth().then(setOnline);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const ts = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())} UTC`;

  return (
    <header style={{
      background: '#050B17',
      borderBottom: '1px solid #162035',
      padding: '0 24px',
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="#F4721E" strokeWidth="1.5" />
          <path d="M18 6 L21 17 L18 14 L15 17 Z" fill="#F4721E" />
          <circle cx="18" cy="19" r="3.5" fill="rgba(244,114,30,0.2)" stroke="#F4721E" strokeWidth="1" />
          <path d="M9 28 Q13 23 18 25 Q23 23 27 28" stroke="#4A8FC0" strokeWidth="1.2" fill="none" />
        </svg>
        <div>
          <div style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '15px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '0.06em',
            lineHeight: 1.15,
          }}>
            SPACEVERSE TECHNOLOGIES
          </div>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            color: '#5A7A9A',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}>
            RocketML — Flight Prediction Engine
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '10px', color: '#4A6A8A', letterSpacing: '0.08em' }}>
          {ts}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <div className={online ? 'blink' : ''} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: online ? '#00DC64' : '#FF3C3C',
            boxShadow: online ? '0 0 6px #00DC64' : '0 0 6px #FF3C3C',
          }} />
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '10px',
            color: online ? '#00DC64' : '#FF3C3C', letterSpacing: '0.14em',
          }}>
            {online ? 'SYSTEM ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div style={{
          background: '#F4721E', color: '#03070F',
          fontFamily: 'Orbitron, sans-serif', fontSize: '10px', fontWeight: 800,
          padding: '4px 10px', borderRadius: '3px', letterSpacing: '0.08em',
        }}>
          XGB
        </div>
      </div>
    </header>
  );
};

export default Header;
