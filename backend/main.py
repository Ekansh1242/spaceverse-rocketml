from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy.integrate import solve_ivp
import math

app = FastAPI(title="Spaceverse Technologies RocketML API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROPELLANT_DB = {
    "APCP": {"exhaust_velocity": 2550, "density": 1.77, "isp": 250},
    "KNSB": {"exhaust_velocity": 1450, "density": 1.84, "isp": 145},
    "HNIW": {"exhaust_velocity": 2700, "density": 1.95, "isp": 265},
    "Custom": {"exhaust_velocity": 2000, "density": 1.80, "isp": 200},
}

class RocketInput(BaseModel):
    thrust: float
    burn_time: float
    total_mass: float
    drag_coeff: float
    launch_angle: float
    diameter: float
    propellant_mass: float
    wind_speed: float
    rocket_length: float
    fin_count: int
    fin_span: float
    chamber_pressure: float
    propellant_type: str
    nose_cone_type: str

def atmosphere(h):
    H = 8500.0
    rho0 = 1.225
    P0 = 101325.0
    T0 = 288.15
    rho = rho0 * math.exp(-h / H)
    P = P0 * math.exp(-h / H)
    T = max(T0 - 0.0065 * h, 216.65)
    return rho, P, T

def barrowman_cp(length_m, diameter_m, fin_count, fin_span_m, nose_type):
    d = max(diameter_m, 0.001)
    L = length_m
    s = fin_span_m
    n = fin_count
    if nose_type == "Conical":
        cn_nose = 2.0
        xn = L * 0.33
    elif nose_type == "Ogive":
        cn_nose = 2.0
        xn = L * 0.466
    else:
        cn_nose = 2.0
        xn = L * 0.5
    cn_fins = (4 * n * (s / d) ** 2) / (1 + math.sqrt(1 + (2 * s / d) ** 2))
    xf = L * 0.80
    cn_total = cn_nose + cn_fins
    cp = (cn_nose * xn + cn_fins * xf) / cn_total
    return cp, cn_total

def compute_cg(total_mass, propellant_mass, rocket_length, burn_fraction):
    dry_mass = max(total_mass - propellant_mass, 1.0)
    remaining_prop = propellant_mass * (1.0 - burn_fraction)
    current_mass = max(dry_mass + remaining_prop, 0.001)
    x_struct = rocket_length * 0.45
    x_prop = rocket_length * 0.55
    cg = (dry_mass * x_struct + remaining_prop * x_prop) / current_mass
    return cg, current_mass

@app.post("/simulate")
def simulate(inp: RocketInput):
    if inp.burn_time <= 0:
        raise HTTPException(status_code=400, detail="burn_time must be > 0")
    if inp.total_mass <= 0:
        raise HTTPException(status_code=400, detail="total_mass must be > 0")
    if inp.propellant_mass <= 0:
        raise HTTPException(status_code=400, detail="propellant_mass must be > 0")
    if inp.propellant_mass >= inp.total_mass:
        raise HTTPException(status_code=400, detail="propellant_mass must be less than total_mass")
    if inp.diameter <= 0:
        raise HTTPException(status_code=400, detail="diameter must be > 0")

    thrust_N = inp.thrust * 1000
    d_m = inp.diameter / 1000.0
    fs_m = inp.fin_span / 1000.0
    A_ref = math.pi * (d_m / 2) ** 2
    g0 = 9.81
    angle_rad = math.radians(inp.launch_angle)
    prop_data = PROPELLANT_DB.get(inp.propellant_type, PROPELLANT_DB["APCP"])
    Ve = prop_data["exhaust_velocity"]
    isp = prop_data["isp"]
    m_dot = inp.propellant_mass / max(inp.burn_time, 0.001)
    total_impulse = thrust_N * inp.burn_time
    m_final = max(inp.total_mass - inp.propellant_mass, 1.0)
    delta_v = Ve * math.log(inp.total_mass / m_final) if m_final > 0 else 0
    c_star = (inp.chamber_pressure * 1e5 * A_ref) / thrust_N if thrust_N > 0 else 0
    nozzle_exit_area = A_ref * 0.8
    Pe = inp.chamber_pressure * 1e5 * 0.12
    Pa0 = 101325.0
    CF = (thrust_N - (Pe - Pa0) * nozzle_exit_area) / (inp.chamber_pressure * 1e5 * A_ref) if A_ref > 0 else 1.5
    CP_pos, _ = barrowman_cp(inp.rocket_length, d_m, inp.fin_count, fs_m, inp.nose_cone_type)
    CG_init, _ = compute_cg(inp.total_mass, inp.propellant_mass, inp.rocket_length, 0.0)
    SM = (CP_pos - CG_init) / d_m if d_m > 0 else 0
    stability = "Stable" if SM > 1.5 else ("Marginally Stable" if SM > 0.5 else "Unstable")
    t_end = 150.0
    t_eval = np.linspace(0, t_end, 1200)

    def dynamics(t, y):
        alt, vx, vy, mass = y
        if alt < 0:
            return [0, 0, 0, 0]
        rho, P, _ = atmosphere(max(alt, 0))
        v_total = math.sqrt(vx**2 + vy**2)
        drag = 0.5 * rho * v_total**2 * inp.drag_coeff * A_ref if v_total > 0 else 0
        wind_drag = 0.5 * rho * inp.wind_speed**2 * inp.drag_coeff * A_ref * 0.3
        if t <= inp.burn_time and mass > m_final:
            thrust_x = thrust_N * math.cos(angle_rad)
            thrust_y = thrust_N * math.sin(angle_rad)
            mdot = -m_dot
        else:
            thrust_x = 0
            thrust_y = 0
            mdot = 0
        if v_total > 0:
            drag_x = -drag * vx / v_total + wind_drag
            drag_y = -drag * vy / v_total
        else:
            drag_x = wind_drag
            drag_y = 0
        ax = (thrust_x + drag_x) / mass
        ay = (thrust_y + drag_y) / mass - g0
        return [vy, ax, ay, mdot]

    y0 = [0.0, 0.0, 0.1, inp.total_mass]
    sol = solve_ivp(dynamics, [0, t_end], y0, t_eval=t_eval, max_step=0.2, method='RK45')

    alt_arr = np.maximum(sol.y[0], 0)
    vx_arr = sol.y[1]
    vy_arr = sol.y[2]
    mass_arr = sol.y[3]
    v_arr = np.sqrt(vx_arr**2 + vy_arr**2)
    t_arr = sol.t

    apogee_idx = np.argmax(alt_arr)
    apogee = float(alt_arr[apogee_idx])
    max_vel = float(np.max(v_arr))
    burnout_idx = min(int(inp.burn_time * 1200 / t_end), len(v_arr) - 1)
    burnout_vel = float(v_arr[burnout_idx])

    acc_arr = np.gradient(v_arr, t_arr)
    dyn_press = np.array([0.5 * atmosphere(max(h, 0))[0] * v**2 for h, v in zip(alt_arr, v_arr)])
    max_q = float(np.max(dyn_press))

    thrust_profile = np.where(t_arr <= inp.burn_time, thrust_N, 0.0)
    downrange = np.cumsum(np.abs(np.gradient(vx_arr * t_arr, t_arr)))

    burn_fracs = np.clip(t_arr / max(inp.burn_time, 0.001), 0, 1)
    cp_arr = np.array([barrowman_cp(inp.rocket_length, d_m, inp.fin_count, fs_m, inp.nose_cone_type)[0] for _ in t_arr])
    cg_arr = np.array([compute_cg(inp.total_mass, inp.propellant_mass, inp.rocket_length, bf)[0] for bf in burn_fracs])
    sm_arr = (cp_arr - cg_arr) / d_m if d_m > 0 else np.zeros_like(cp_arr)

    t_apogee = float(t_arr[apogee_idx])
    flight_time = float(t_arr[-1])
    downrange_max = float(np.max(downrange)) if len(downrange) > 0 else apogee * 0.3

    subsample = 10
    return {
        "apogee": round(apogee, 2),
        "max_velocity": round(max_vel, 2),
        "burnout_velocity": round(burnout_vel, 2),
        "time_to_apogee": round(t_apogee, 2),
        "flight_time": round(flight_time, 2),
        "downrange": round(downrange_max / 1000, 3),
        "static_margin": round(float(SM), 3),
        "cg_position": round(float(CG_init), 3),
        "cp_position": round(float(CP_pos), 3),
        "max_dynamic_pressure": round(max_q / 1000, 3),
        "mass_flow_rate": round(m_dot, 3),
        "total_impulse": round(total_impulse / 1000, 2),
        "specific_impulse": isp,
        "chamber_pressure": inp.chamber_pressure,
        "c_star": round(c_star, 1),
        "thrust_coefficient": round(abs(CF), 3),
        "stability_status": stability,
        "delta_v": round(delta_v, 1),
        "charts": {
            "time": t_arr[::subsample].tolist(),
            "altitude": alt_arr[::subsample].tolist(),
            "velocity": v_arr[::subsample].tolist(),
            "acceleration": acc_arr[::subsample].tolist(),
            "mass": mass_arr[::subsample].tolist(),
            "dynamic_pressure": (dyn_press[::subsample] / 1000).tolist(),
            "thrust": thrust_profile[::subsample].tolist(),
            "downrange": downrange[::subsample].tolist(),
            "cp": cp_arr[::subsample].tolist(),
            "cg": cg_arr[::subsample].tolist(),
            "stability_margin": sm_arr[::subsample].tolist(),
        }
    }

@app.get("/health")
def health():
    return {"status": "online", "system": "Spaceverse Technologies RocketML"}
