import React from 'react';
import { RocketInput } from '../utils/types';

interface Props {
  inputs: RocketInput;
  onChange: (key: keyof RocketInput, value: number | string) => void;
  onSimulate: () => void;
  loading: boolean;
}

interface SliderDef {
  key: keyof RocketInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
}

const SLIDERS: SliderDef[] = [
  { key: 'thrust',           label: 'Thrust',       unit: 'kN',  min: 1,   max: 50,  step: 0.5,  decimals: 1 },
  { key: 'burn_time',        label: 'Burn Time',    unit: 's',   min: 1,   max: 30,  step: 0.5,  decimals: 1 },
  { key: 'total_mass',       label: 'Total Mass',   unit: 'kg',  min: 100, max: 500, step: 5,    decimals: 0 },
  { key: 'drag_coeff',       label: 'Drag Coeff',   unit: 'Cd',  min: 0.1, max: 1.0, step: 0.01, decimals: 2 },
  { key: 'launch_angle',     label: 'Launch Angle', unit: '°',   min: 70,  max: 90,  step: 1,    decimals: 0 },
  { key: 'diameter',         label: 'Diameter',     unit: 'mm',  min: 100, max: 400, step: 5,    decimals: 0 },
  { key: 'propellant_mass',  label: 'Propellant',   unit: 'kg',  min: 50,  max: 300, step: 5,    decimals: 0 },
  { key: 'wind_speed',       label: 'Wind Speed',   unit: 'm/s', min: 0,   max: 50,  step: 1,    decimals: 0 },
  { key: 'rocket_length',    label: 'Length',       unit: 'm',   min: 1,   max: 8,   step: 0.1,  decimals: 1 },
  { key: 'fin_span',         label: 'Fin Span',     unit: 'mm',  min: 50,  max: 500, step: 10,   decimals: 0 },
  { key: 'chamber_pressure', label: 'Chamber P.',   unit: 'bar', min: 10,  max: 150, step: 5,    decimals: 0 },
];

const InputPanel: React.FC<Props> = ({ inputs, onChange, onSimulate, loading }) => {
  return (
    <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">Input Parameters</div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {SLIDERS.map((s) => {
          const val = inputs[s.key] as number;
          return (
            <div className="input-row" key={s.key}>
              <div className="input-label">{s.label}</div>
              <input
                type="range"
                className="input-slider"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => onChange(s.key, parseFloat(e.target.value))}
              />
              <input
                type="number"
                className="input-number"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val.toFixed(s.decimals)}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v)) onChange(s.key, Math.min(s.max, Math.max(s.min, v)));
                }}
              />
              <span className="input-unit">{s.unit}</span>
            </div>
          );
        })}

        {/* Fin Count */}
        <div className="input-row">
          <div className="input-label">Fin Count</div>
          <input
            type="range"
            className="input-slider"
            min={3} max={6} step={1}
            value={inputs.fin_count}
            onChange={(e) => onChange('fin_count', parseInt(e.target.value))}
          />
          <input
            type="number"
            className="input-number"
            min={3} max={6} step={1}
            value={inputs.fin_count}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) onChange('fin_count', Math.min(6, Math.max(3, v)));
            }}
          />
          <span className="input-unit">fins</span>
        </div>

        {/* Propellant Type */}
        <div className="input-row">
          <div className="input-label">Propellant</div>
          <select
            className="select-input"
            style={{ gridColumn: '2 / 5' }}
            value={inputs.propellant_type}
            onChange={(e) => onChange('propellant_type', e.target.value)}
          >
            {['APCP', 'KNSB', 'HNIW', 'Custom'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Nose Cone */}
        <div className="input-row" style={{ borderBottom: 'none' }}>
          <div className="input-label">Nose Cone</div>
          <select
            className="select-input"
            style={{ gridColumn: '2 / 5' }}
            value={inputs.nose_cone_type}
            onChange={(e) => onChange('nose_cone_type', e.target.value)}
          >
            {['Conical', 'Ogive', 'Von Karman'].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <button className="launch-btn" onClick={onSimulate} disabled={loading}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{
                display: 'inline-block', width: '13px', height: '13px',
                border: '2px solid #03070F', borderTopColor: 'transparent',
                borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              }} />
              Simulating...
            </span>
          ) : '▶  Launch Prediction'}
        </button>
        <div style={{ marginTop: '7px', textAlign: 'center', fontFamily: 'Rajdhani, sans-serif', fontSize: '11px', color: '#3A5A7A' }}>
          Physics-informed simulation · ML-accelerated
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
