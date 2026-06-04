import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { SimulationResult } from '../utils/types';

interface Props { result: SimulationResult | null; }

type TabKey = 'altitude'|'velocity'|'acceleration'|'mass'|'dynpressure'|'thrust'|'downrange'|'cpcg'|'stability'|'trajectory';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'altitude',     label: 'Altitude'   },
  { key: 'velocity',     label: 'Velocity'   },
  { key: 'acceleration', label: 'Accel'      },
  { key: 'mass',         label: 'Mass'       },
  { key: 'dynpressure',  label: 'Dyn-Q'      },
  { key: 'thrust',       label: 'Thrust'     },
  { key: 'downrange',    label: 'Downrange'  },
  { key: 'cpcg',         label: 'CP / CG'    },
  { key: 'stability',    label: 'Stability'  },
  { key: 'trajectory',   label: 'Trajectory' },
];

const LAYOUT_BASE = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: '#050B17',
  font: { family: 'Rajdhani, sans-serif', color: '#5A7A9A', size: 11 },
  margin: { l: 55, r: 20, t: 28, b: 46 },
  xaxis: {
    gridcolor: '#0D1830', linecolor: '#0D1830', tickcolor: '#0D1830',
    tickfont: { color: '#5A7A9A', size: 10 },
    title: { font: { color: '#7A9ABB', size: 11 } },
    zerolinecolor: '#0D1830',
  },
  yaxis: {
    gridcolor: '#0D1830', linecolor: '#0D1830', tickcolor: '#0D1830',
    tickfont: { color: '#5A7A9A', size: 10 },
    title: { font: { color: '#7A9ABB', size: 11 } },
    zerolinecolor: '#0D1830',
  },
  legend: { bgcolor: 'transparent', font: { color: '#7A9ABB', size: 10, family: 'Orbitron, sans-serif' } },
  autosize: true,
};

const CFG = { displayModeBar: false, responsive: true };

const ORANGE = '#F4721E';
const BLUE   = '#4AB0FF';
const CYAN   = '#00E5FF';
const GREEN  = '#00DC64';
const PURPLE = '#AA77FF';
const YELLOW = '#FFD700';

// Animated mini chart for the empty space
const MiniAnimChart: React.FC<{ result: SimulationResult; tabKey: TabKey }> = ({ result, tabKey }) => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    setProgress(0);
    let start: number | null = null;
    const duration = 1800;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [result, tabKey]);

  const { charts: c } = result;
  const t = c.time;
  const n = Math.floor(t.length * progress);
  const tSlice = t.slice(0, Math.max(n, 2));

  let ySlice: number[] = [];
  let color = ORANGE;
  let yLabel = '';

  switch (tabKey) {
    case 'altitude':     ySlice = c.altitude.slice(0, tSlice.length);          color = ORANGE; yLabel = 'Alt (m)'; break;
    case 'velocity':     ySlice = c.velocity.slice(0, tSlice.length);          color = CYAN;   yLabel = 'Vel (m/s)'; break;
    case 'acceleration': ySlice = c.acceleration.slice(0, tSlice.length);      color = PURPLE; yLabel = 'Acc (m/s²)'; break;
    case 'mass':         ySlice = c.mass.slice(0, tSlice.length);              color = GREEN;  yLabel = 'Mass (kg)'; break;
    case 'dynpressure':  ySlice = c.dynamic_pressure.slice(0, tSlice.length);  color = YELLOW; yLabel = 'q (kPa)'; break;
    case 'thrust':       ySlice = c.thrust.map(v => v/1000).slice(0, tSlice.length); color = ORANGE; yLabel = 'F (kN)'; break;
    case 'downrange':    ySlice = c.downrange.slice(0, tSlice.length);         color = BLUE;   yLabel = 'DR (m)'; break;
    case 'cpcg':
      return (
        <Plot
          data={[
            { x: tSlice, y: c.cp.slice(0,tSlice.length), type:'scatter', mode:'lines', name:'CP', line:{color:ORANGE,width:2} },
            { x: tSlice, y: c.cg.slice(0,tSlice.length), type:'scatter', mode:'lines', name:'CG', line:{color:BLUE,width:2,dash:'dash'} },
          ]}
          layout={{ ...LAYOUT_BASE, height: 200, title: { text: 'CP & CG vs Time', font:{family:'Orbitron,sans-serif',size:10,color:'#5A7A9A'}, x:0.02 },
            xaxis:{...LAYOUT_BASE.xaxis,title:{text:'Time (s)',font:{color:'#5A7A9A',size:10}}},
            yaxis:{...LAYOUT_BASE.yaxis,title:{text:'Position (m)',font:{color:'#5A7A9A',size:10}}},
          }}
          config={CFG} style={{ width:'100%' }}
        />
      );
    case 'stability':
      return (
        <Plot
          data={[
            { x: tSlice, y: c.stability_margin.slice(0,tSlice.length), type:'scatter', mode:'lines', name:'Static Margin', line:{color:GREEN,width:2} },
            { x:[t[0],t[t.length-1]], y:[1.5,1.5], type:'scatter', mode:'lines', name:'Min Stable', line:{color:'#FF3C3C',width:1,dash:'dot'} },
          ]}
          layout={{ ...LAYOUT_BASE, height: 200, title: { text: 'Stability Margin vs Time', font:{family:'Orbitron,sans-serif',size:10,color:'#5A7A9A'}, x:0.02 },
            xaxis:{...LAYOUT_BASE.xaxis,title:{text:'Time (s)',font:{color:'#5A7A9A',size:10}}},
            yaxis:{...LAYOUT_BASE.yaxis,title:{text:'SM (cal)',font:{color:'#5A7A9A',size:10}}},
          }}
          config={CFG} style={{ width:'100%' }}
        />
      );
    case 'trajectory':
      return (
        <Plot
          data={[{
            x: c.downrange.slice(0,tSlice.length).map(v=>v/1000),
            y: c.altitude.slice(0,tSlice.length),
            type:'scatter', mode:'lines', name:'Trajectory',
            fill:'tozeroy', fillcolor:'rgba(0,229,255,0.05)',
            line:{color:CYAN,width:2},
          }]}
          layout={{ ...LAYOUT_BASE, height: 200, title: { text: 'Altitude vs Downrange', font:{family:'Orbitron,sans-serif',size:10,color:'#5A7A9A'}, x:0.02 },
            xaxis:{...LAYOUT_BASE.xaxis,title:{text:'Downrange (km)',font:{color:'#5A7A9A',size:10}}},
            yaxis:{...LAYOUT_BASE.yaxis,title:{text:'Altitude (m)',font:{color:'#5A7A9A',size:10}}},
          }}
          config={CFG} style={{ width:'100%' }}
        />
      );
    default: ySlice = c.altitude.slice(0, tSlice.length); color = ORANGE; yLabel = 'Alt (m)';
  }

  return (
    <Plot
      data={[{ x: tSlice, y: ySlice, type:'scatter', mode:'lines', name: yLabel, line:{color,width:2} }]}
      layout={{ ...LAYOUT_BASE, height: 200,
        title: { text: `${yLabel} — Live Simulation`, font:{family:'Orbitron,sans-serif',size:10,color:'#5A7A9A'}, x:0.02 },
        xaxis:{...LAYOUT_BASE.xaxis,title:{text:'Time (s)',font:{color:'#5A7A9A',size:10}}},
        yaxis:{...LAYOUT_BASE.yaxis,title:{text:yLabel,font:{color:'#5A7A9A',size:10}}},
      }}
      config={CFG} style={{ width:'100%' }}
    />
  );
};

const FlightCharts: React.FC<Props> = ({ result }) => {
  const [tab, setTab] = useState<TabKey>('altitude');

  const layout = (title: string, xT: string, yT: string, extra?: object) => ({
    ...LAYOUT_BASE,
    title: { text: title, font:{family:'Orbitron,sans-serif',size:10,color:'#5A7A9A'}, x:0.02 },
    xaxis: { ...LAYOUT_BASE.xaxis, title:{text:xT,font:{color:'#5A7A9A',size:10}} },
    yaxis: { ...LAYOUT_BASE.yaxis, title:{text:yT,font:{color:'#5A7A9A',size:10}} },
    height: 300,
    ...extra,
  });

  const renderMain = () => {
    if (!result) return null;
    const { charts: c } = result;
    const t = c.time;
    const line = (x:number[], y:number[], color:string, name:string, dash?:string) => ({
      x, y, type:'scatter' as const, mode:'lines' as const, name,
      line:{color,width:2,dash:dash||'solid'},
    });

    switch (tab) {
      case 'altitude':     return <Plot data={[line(t,c.altitude,ORANGE,'Altitude (m)')]}            layout={layout('Altitude vs Time','Time (s)','Altitude (m)')}            config={CFG} style={{width:'100%'}} />;
      case 'velocity':     return <Plot data={[line(t,c.velocity,CYAN,'Velocity (m/s)')]}            layout={layout('Velocity vs Time','Time (s)','Velocity (m/s)')}            config={CFG} style={{width:'100%'}} />;
      case 'acceleration': return <Plot data={[line(t,c.acceleration,PURPLE,'Accel (m/s²)')]}        layout={layout('Acceleration vs Time','Time (s)','Acceleration (m/s²)')}    config={CFG} style={{width:'100%'}} />;
      case 'mass':         return <Plot data={[line(t,c.mass,GREEN,'Mass (kg)')]}                    layout={layout('Mass Depletion vs Time','Time (s)','Mass (kg)')}            config={CFG} style={{width:'100%'}} />;
      case 'dynpressure':  return <Plot data={[line(t,c.dynamic_pressure,YELLOW,'q (kPa)')]}         layout={layout('Dynamic Pressure vs Time','Time (s)','q (kPa)')}            config={CFG} style={{width:'100%'}} />;
      case 'thrust':       return <Plot data={[{x:t,y:c.thrust.map(v=>v/1000),type:'scatter',mode:'lines',name:'Thrust (kN)',fill:'tozeroy',fillcolor:'rgba(244,114,30,0.12)',line:{color:ORANGE,width:2}}]}  layout={layout('Thrust Profile vs Time','Time (s)','Thrust (kN)')} config={CFG} style={{width:'100%'}} />;
      case 'downrange':    return <Plot data={[line(t,c.downrange,BLUE,'Downrange (m)')]}            layout={layout('Downrange vs Time','Time (s)','Downrange (m)')}             config={CFG} style={{width:'100%'}} />;
      case 'cpcg':         return <Plot data={[line(t,c.cp,ORANGE,'CP (m)'),line(t,c.cg,BLUE,'CG (m)','solid','dash')]} layout={{...layout('CP & CG Evolution vs Time','Time (s)','Position (m)'),legend:{...LAYOUT_BASE.legend,x:0.7,y:0.9}}} config={CFG} style={{width:'100%'}} />;
      case 'stability':    return <Plot data={[line(t,c.stability_margin,GREEN,'SM (cal)'),{x:[t[0],t[t.length-1]],y:[1.5,1.5],type:'scatter',mode:'lines',name:'Min Stable',line:{color:'#FF3C3C',width:1,dash:'dot'}}]} layout={{...layout('Stability Margin vs Time','Time (s)','Static Margin (cal)'),legend:{...LAYOUT_BASE.legend,x:0.6,y:0.9}}} config={CFG} style={{width:'100%'}} />;
      case 'trajectory':   return <Plot data={[{x:c.downrange.map(v=>v/1000),y:c.altitude,type:'scatter',mode:'lines',name:'Flight Path',fill:'tozeroy',fillcolor:'rgba(0,229,255,0.05)',line:{color:CYAN,width:2}}]} layout={layout('Trajectory — Altitude vs Downrange','Downrange (km)','Altitude (m)')} config={CFG} style={{width:'100%'}} />;
    }
  };

  if (!result) {
    return (
      <div className="panel">
        <div className="panel-header">Flight Analytics Dashboard</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'320px' }}>
          <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'9px', color:'#1E3050', letterSpacing:'0.2em' }}>
            NO FLIGHT DATA — RUN SIMULATION
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">Flight Analytics Dashboard</div>

      {/* Tab bar */}
      <div style={{ display:'flex', flexWrap:'wrap', borderBottom:'1px solid #162035', background:'#050B17', paddingLeft:'8px' }}>
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${tab===t.key?'active':''}`} onClick={()=>setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main chart */}
      <div style={{ padding:'8px' }}>
        {renderMain()}
      </div>

      {/* Animated mini-chart — the empty space fix */}
      <div style={{ padding:'0 8px 8px', borderTop:'1px solid #0A1220' }}>
        <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'8px', color:'#3A5A7A', letterSpacing:'0.18em', padding:'8px 4px 4px' }}>
          LIVE SIMULATION REPLAY
        </div>
        <MiniAnimChart result={result} tabKey={tab} />
      </div>
    </div>
  );
};

export default FlightCharts;
