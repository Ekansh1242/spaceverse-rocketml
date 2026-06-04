import React from 'react';
import { SimulationResult } from '../utils/types';

interface Props {
  result: SimulationResult | null;
  rocketLength: number;
  diameter: number;
}

const RocketDiagram: React.FC<Props> = ({ result, rocketLength, diameter }) => {
  const W = 620;
  const H = 230;
  const ML = 50; const MR = 50; const MT = 55; const MB = 38;
  const rW = W - ML - MR;
  const half = Math.min(52, (diameter / 400) * 65 + 25);
  const rY = H / 2 + 4;

  const noseLen = rW * 0.17;
  const bodyStart = ML + noseLen;
  const bodyEnd = ML + rW * 0.80;
  const bodyLen = bodyEnd - bodyStart;
  const finH = half * 0.65;
  const nozzleW = rW * 0.055;

  const cpFrac = result ? Math.min(result.cp_position / Math.max(rocketLength, 0.1), 0.98) : 0.62;
  const cgFrac = result ? Math.min(result.cg_position / Math.max(rocketLength, 0.1), 0.98) : 0.42;
  const cpX = ML + cpFrac * rW;
  const cgX = ML + cgFrac * rW;

  const clampedCgX = Math.max(bodyStart + 10, Math.min(bodyEnd - 10, cgX));
  const clampedCpX = Math.max(bodyStart + 10, Math.min(bodyEnd - 10, cpX));

  const stable = result?.stability_status === 'Stable';
  const marginal = result?.stability_status === 'Marginally Stable';

  return (
    <div className="panel">
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <span>CP / CG Rocket Diagram</span>
        {result && (
          <span className={stable ? 'badge-stable' : marginal ? 'badge-marginal' : 'badge-unstable'}>
            {result.stability_status}
          </span>
        )}
      </div>

      <div style={{ padding: '10px 16px 8px' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D1830" />
              <stop offset="100%" stopColor="#050B17" />
            </linearGradient>
          </defs>

          {/* NOSE CONE */}
          <polygon
            points={`
              ${ML},${rY}
              ${ML + noseLen * 0.15},${rY - half}
              ${bodyStart},${rY - half}
              ${bodyStart},${rY + half}
              ${ML + noseLen * 0.15},${rY + half}
            `}
            fill="url(#bodyGrad)" stroke="#3A6A9A" strokeWidth="1.5"
          />

          {/* BODY */}
          <rect x={bodyStart} y={rY - half} width={bodyLen} height={half * 2}
            fill="url(#bodyGrad)" stroke="#1E3050" strokeWidth="1.5" />
          <rect x={bodyStart} y={rY - half} width={bodyLen} height={3} fill="#F4721E" opacity="0.35" />
          {[0.33, 0.66].map(f => (
            <line key={f}
              x1={bodyStart + bodyLen * f} y1={rY - half}
              x2={bodyStart + bodyLen * f} y2={rY + half}
              stroke="#162035" strokeWidth="1" strokeDasharray="4,4" />
          ))}

          {/* FINS */}
          <polygon
            points={`${bodyEnd - rW*0.10},${rY+half} ${bodyEnd},${rY+half} ${bodyEnd-rW*0.02},${rY+half+finH} ${bodyEnd-rW*0.14},${rY+half+finH*0.6}`}
            fill="#050B17" stroke="#F4721E" strokeWidth="1.5" />
          <polygon
            points={`${bodyEnd - rW*0.10},${rY-half} ${bodyEnd},${rY-half} ${bodyEnd-rW*0.02},${rY-half-finH} ${bodyEnd-rW*0.14},${rY-half-finH*0.6}`}
            fill="#050B17" stroke="#F4721E" strokeWidth="1.5" />

          {/* NOZZLE */}
          <polygon
            points={`${bodyEnd},${rY-half*0.55} ${bodyEnd},${rY+half*0.55} ${bodyEnd+nozzleW},${rY+half*0.78} ${bodyEnd+nozzleW},${rY-half*0.78}`}
            fill="#070E1C" stroke="#3A5A7A" strokeWidth="1.5" />

          {result && (
            <>
              <ellipse cx={bodyEnd+nozzleW+10} cy={rY} rx={18} ry={half*0.35} fill="#F4721E" opacity="0.18" />
              <ellipse cx={bodyEnd+nozzleW+5} cy={rY} rx={8} ry={half*0.18} fill="#FFD700" opacity="0.45" />
            </>
          )}



          {!result && (
            <text x={W/2} y={rY-half-16}
              textAnchor="middle" fill="#1E3050" fontSize="9" fontFamily="Orbitron, sans-serif">
              RUN SIMULATION TO DISPLAY CP / CG
            </text>
          )}

          {/* CG MARKER — above body */}
          {result && (
            <>
              <line x1={clampedCgX} y1={rY-half-32} x2={clampedCgX} y2={rY-half}
                stroke="#4AB0FF" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8" />
              <polygon
                points={`${clampedCgX-5},${rY-half-8} ${clampedCgX+5},${rY-half-8} ${clampedCgX},${rY-half-1}`}
                fill="#4AB0FF" />
              <circle cx={clampedCgX} cy={rY} r="5" fill="#4AB0FF" />
              <circle cx={clampedCgX} cy={rY} r="9" fill="none" stroke="#4AB0FF" strokeWidth="1" opacity="0.4" />
              <rect x={clampedCgX-16} y={rY-half-52} width="32" height="18" rx="3"
                fill="#050B17" stroke="#4AB0FF" strokeWidth="1" />
              <text x={clampedCgX} y={rY-half-40}
                textAnchor="middle" fill="#4AB0FF" fontSize="9" fontFamily="Orbitron, sans-serif" fontWeight="700">
                CG
              </text>
            </>
          )}

          {/* CP MARKER — below body */}
          {result && (
            <>
              <line x1={clampedCpX} y1={rY+half} x2={clampedCpX} y2={rY+half+32}
                stroke="#F4721E" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.8" />
              <polygon
                points={`${clampedCpX-5},${rY+half+8} ${clampedCpX+5},${rY+half+8} ${clampedCpX},${rY+half+1}`}
                fill="#F4721E" />
              <circle cx={clampedCpX} cy={rY} r="5" fill="#F4721E" />
              <circle cx={clampedCpX} cy={rY} r="9" fill="none" stroke="#F4721E" strokeWidth="1" opacity="0.4" />
              <rect x={clampedCpX-16} y={rY+half+34} width="32" height="18" rx="3"
                fill="#050B17" stroke="#F4721E" strokeWidth="1" />
              <text x={clampedCpX} y={rY+half+46}
                textAnchor="middle" fill="#F4721E" fontSize="9" fontFamily="Orbitron, sans-serif" fontWeight="700">
                CP
              </text>
            </>
          )}

          {result && Math.abs(clampedCpX-clampedCgX) > 8 && (
            <line x1={clampedCgX} y1={rY} x2={clampedCpX} y2={rY}
              stroke="#00DC64" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
          )}
        </svg>

        {/* Legend — on its own row, well spaced */}
        <div style={{
          display: 'flex',
          gap: '28px',
          justifyContent: 'center',
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid #0A1220',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4AB0FF', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#4AB0FF', whiteSpace: 'nowrap' }}>
              CG{result ? ` = ${result.cg_position.toFixed(3)} m` : ''}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F4721E', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#F4721E', whiteSpace: 'nowrap' }}>
              CP{result ? ` = ${result.cp_position.toFixed(3)} m` : ''}
            </span>
          </div>
          {result && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '14px', height: '2px', background: '#00DC64', flexShrink: 0 }} />
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#00DC64', whiteSpace: 'nowrap' }}>
                SM = {result.static_margin.toFixed(2)} cal
              </span>
            </div>
          )}
          {result && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#5A7A9A', whiteSpace: 'nowrap' }}>
                L = {rocketLength.toFixed(2)} m
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RocketDiagram;
