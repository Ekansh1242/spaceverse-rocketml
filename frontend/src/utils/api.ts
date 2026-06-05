import axios from 'axios';
import { RocketInput, SimulationResult } from './types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function runSimulation(input: RocketInput): Promise<SimulationResult> {
  const response = await axios.post<SimulationResult>(`${BASE_URL}/simulate`, input, {
    timeout: 90000, // 90s — handles Render free tier cold start (~50s)
  });
  return response.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 60000 });
    return response.status === 200;
  } catch {
    return false;
  }
}
