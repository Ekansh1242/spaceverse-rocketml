export interface RocketInput {
  thrust: number;
  burn_time: number;
  total_mass: number;
  drag_coeff: number;
  launch_angle: number;
  diameter: number;
  propellant_mass: number;
  wind_speed: number;
  rocket_length: number;
  fin_count: number;
  fin_span: number;
  chamber_pressure: number;
  propellant_type: string;
  nose_cone_type: string;
}

export interface SimulationResult {
  apogee: number;
  max_velocity: number;
  burnout_velocity: number;
  time_to_apogee: number;
  flight_time: number;
  downrange: number;
  static_margin: number;
  cg_position: number;
  cp_position: number;
  max_dynamic_pressure: number;
  mass_flow_rate: number;
  total_impulse: number;
  specific_impulse: number;
  chamber_pressure: number;
  c_star: number;
  thrust_coefficient: number;
  stability_status: string;
  delta_v: number;
  charts: {
    time: number[];
    altitude: number[];
    velocity: number[];
    acceleration: number[];
    mass: number[];
    dynamic_pressure: number[];
    thrust: number[];
    downrange: number[];
    cp: number[];
    cg: number[];
    stability_margin: number[];
  };
}

export interface SliderConfig {
  key: keyof RocketInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
}
