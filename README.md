# 🚀 Spaceverse Technologies — RocketML 3.0

**Physics-Informed Aerospace Design & Flight Prediction Platform**

---

## Overview

RocketML 3.0 is a production-grade rocket simulation and ML prediction platform combining:
- Real-time physics simulation (RK45 ODE solver)
- Barrowman stability analysis (CP/CG)
- Full flight analytics dashboard (10 Plotly charts)
- 2D rocket SVG with CP/CG markers
- FastAPI backend · React + TypeScript frontend

---

## Input Parameters

| Parameter | Range | Unit |
|---|---|---|
| Thrust | 1 – 50 | kN |
| Burn Time | 1 – 30 | s |
| Total Mass | 100 – 500 | kg |
| Drag Coefficient | 0.1 – 1.0 | Cd |
| Launch Angle | 70 – 90 | ° |
| Diameter | 100 – 400 | mm |
| Propellant Mass | 50 – 300 | kg |
| Wind Speed | 0 – 50 | m/s |
| Rocket Length | 1 – 8 | m |
| Fin Count | 3 – 6 | fins |
| Fin Span | 50 – 500 | mm |
| Chamber Pressure | 10 – 150 | bar |
| Propellant Type | APCP / KNSB / HNIW / Custom | — |
| Nose Cone Type | Conical / Ogive / Von Karman | — |

## Output Parameters

- Apogee (m), Max Velocity (m/s), Burnout Velocity (m/s)
- Time to Apogee (s), Flight Time (s), Downrange (km)
- Static Margin (calibers), CG Position (m), CP Position (m)
- Max Dynamic Pressure (kPa), Mass Flow Rate (kg/s)
- Total Impulse (kN·s), Specific Impulse (s), C*, CF
- Delta-V (m/s), Stability Status

## Charts

1. Altitude vs Time
2. Velocity vs Time
3. Acceleration vs Time
4. Mass Depletion vs Time
5. Dynamic Pressure vs Time
6. Thrust Profile vs Time
7. Downrange vs Time
8. CP & CG Evolution vs Time
9. Stability Margin vs Time
10. Flight Trajectory (Altitude vs Downrange)

---

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed: VITE_API_URL=/api
npm run dev
```

Open: http://localhost:5173

---

## Docker

```bash
docker-compose up --build
```
Frontend: http://localhost:3000
Backend:  http://localhost:8000

---

## Render Deployment

1. Push this repo to GitHub.
2. In Render dashboard → New → Blueprint → select your repo.
3. Render will read `render.yaml` and deploy both services.
4. Update `VITE_API_URL` in Render frontend env vars to your backend URL.
5. Redeploy frontend after setting env var.

---

## Project Structure

```
rocketml/
├── backend/
│   ├── main.py              # FastAPI app + physics engine
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # Top nav with system status
│   │   │   ├── InputPanel.tsx     # All sliders and selects
│   │   │   ├── OutputPanel.tsx    # Results and stat cards
│   │   │   ├── RocketDiagram.tsx  # 2D SVG rocket with CP/CG
│   │   │   └── FlightCharts.tsx   # 10-tab Plotly dashboard
│   │   ├── utils/
│   │   │   ├── types.ts           # TypeScript interfaces
│   │   │   ├── api.ts             # Axios API calls
│   │   │   └── plotly.ts          # Chart theme config
│   │   ├── styles/
│   │   │   └── global.css         # Tailwind + custom CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Physics Engine

- **Trajectory**: `scipy.integrate.solve_ivp` with RK45, 1200 points
- **Atmospheric model**: Exponential decay `ρ = ρ₀·exp(−h/H)`
- **Drag**: `D = 0.5·ρ·V²·Cd·A`
- **Stability (Barrowman)**: Nose + fin CP contributions
- **Dynamic CG**: Updates with propellant burn fraction
- **Static Margin**: `SM = (CP − CG) / D`

---

© Spaceverse Technologies Pvt Ltd
