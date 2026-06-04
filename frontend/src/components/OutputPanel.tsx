import React from 'react';
import { SimulationResult } from '../utils/types';

interface Props { result: SimulationResult | null; }

const OutputPanel: React.FC<Props> = ({ result }) => {
  const badge = (s: string) =>
    s === 'Stable' ? 'badge-stable' : s === 'Marginally Stable' ? 'badge-marginal' : 'badge-unstable';

  const Card = ({ label, value, unit, color = '#F4721E', big = false }: {
    label: string; value: string | number; unit: string; color?: string; big?: boolean;
  }) => (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color, fontSize: big ? '26px' : '17px' }}>{value}</div>
      <div className="stat-unit">{unit}</div>
    </div>
  );

  if (!result) {
    return (
      <div className="panel" style={{ height: '100%' }}>
        <div className="panel-header">Flight Predictions</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 40px)', gap: '10px' }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#1E3050', letterSpacing: '0.2em' }}>
            AWAITING LAUNCH COMMAND
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel" style={{ height: '100%', overflowY: 'auto' }}>
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <span>Flight Predictions</span>
        <span className={badge(result.stability_status)}>{result.stability_status}</span>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Apogee hero */}
        <div className="stat-card">
          <div className="stat-label">Apogee Altitude</div>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '30px', fontWeight: 800, color: '#F4721E', lineHeight: 1 }}>
            {result.apogee.toLocaleString()}
          </div>
          <div className="stat-unit">Metres AGL</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
          <Card label="Max Velocity" value={result.max_velocity.toFixed(1)} unit="m/s" />
          <Card label="Burnout Vel." value={result.burnout_velocity.toFixed(1)} unit="m/s" />
          <Card label="Time to Apogee" value={result.time_to_apogee.toFixed(1)} unit="seconds" />
          <Card label="Flight Time" value={result.flight_time.toFixed(1)} unit="seconds" />
          <Card label="Downrange" value={result.downrange.toFixed(2)} unit="km" />
          <Card label="Delta-V" value={result.delta_v.toFixed(0)} unit="m/s" />
        </div>

        <div className="section-divider">Combustion Parameters</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
          <Card label="Specific Impulse" value={result.specific_impulse} unit="s (Isp)" color="#4AB0FF" />
          <Card label="C* (C-Star)" value={result.c_star.toFixed(0)} unit="m/s" color="#4AB0FF" />
          <Card label="Thrust Coeff CF" value={result.thrust_coefficient.toFixed(3)} unit="dimensionless" color="#4AB0FF" />
          <Card label="Chamber Pressure" value={result.chamber_pressure} unit="bar" color="#4AB0FF" />
          <Card label="Total Impulse" value={result.total_impulse.toFixed(1)} unit="kN·s" color="#4AB0FF" />
          <Card label="Mass Flow Rate" value={result.mass_flow_rate.toFixed(2)} unit="kg/s" color="#4AB0FF" />
        </div>

        <div className="section-divider">Stability Analysis</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
          <Card label="Static Margin" value={result.static_margin.toFixed(2)} unit="calibers" color="#00DC64" />
          <Card label="Max Dynamic Q" value={result.max_dynamic_pressure.toFixed(2)} unit="kPa" color="#00DC64" />
          <Card label="CG Position" value={result.cg_position.toFixed(3)} unit="m from nose" color="#4AB0FF" />
          <Card label="CP Position" value={result.cp_position.toFixed(3)} unit="m from nose" color="#F4721E" />
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
