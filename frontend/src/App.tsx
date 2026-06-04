import React, { useState } from 'react';
import { RocketInput, SimulationResult } from './utils/types';
import { runSimulation } from './utils/api';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import RocketDiagram from './components/RocketDiagram';
import FlightCharts from './components/FlightCharts';

const DEFAULT_INPUTS: RocketInput = {
  thrust: 23,
  burn_time: 13,
  total_mass: 350,
  drag_coeff: 0.45,
  launch_angle: 87,
  diameter: 250,
  propellant_mass: 140,
  wind_speed: 5,
  rocket_length: 3.4,
  fin_count: 4,
  fin_span: 200,
  chamber_pressure: 51,
  propellant_type: 'APCP',
  nose_cone_type: 'Ogive',
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<RocketInput>(DEFAULT_INPUTS);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof RocketInput, value: number | string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runSimulation(inputs);
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Simulation failed. Check backend connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050A14', display: 'flex', flexDirection: 'column' }}>
      <Header />

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
          padding: '10px 24px', fontFamily: 'Rajdhani, sans-serif', fontSize: '13px',
          color: '#FF4444', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Main layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gridTemplateRows: 'auto 1fr',
        gap: '12px',
        padding: '12px',
        maxWidth: '1600px',
        width: '100%',
        margin: '0 auto',
      }}>

        {/* Left column: Inputs + Output */}
        <div style={{
          gridColumn: '1',
          gridRow: '1 / 3',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: 0,
        }}>
          <div style={{ flex: '1 1 auto', minHeight: 0, maxHeight: '520px' }}>
            <InputPanel
              inputs={inputs}
              onChange={handleChange}
              onSimulate={handleSimulate}
              loading={loading}
            />
          </div>
          <div style={{ flex: '1 1 auto', minHeight: 0 }}>
            <OutputPanel result={result} />
          </div>
        </div>

        {/* Right top: Rocket Diagram */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <RocketDiagram
            result={result}
            rocketLength={inputs.rocket_length}
            diameter={inputs.diameter}
          />
        </div>

        {/* Right bottom: Charts */}
        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <FlightCharts result={result} />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #1A2540',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#2A3550', letterSpacing: '0.15em' }}>
          © SPACEVERSE TECHNOLOGIES PVT LTD — ROCKETML 3.0
        </div>
        <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '11px', color: '#2A3550' }}>
          Physics-Informed · Barrowman Stability · RK45 Trajectory
        </div>
      </div>
    </div>
  );
};

export default App;
