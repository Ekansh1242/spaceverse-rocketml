import axios from 'axios';
import { RocketInput, SimulationResult } from './types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function runSimulation(input: RocketInput): Promise<SimulationResult> {
  const response = await axios.post<SimulationResult>(`${BASE_URL}/simulate`, input, {
    timeout: 30000,
  });
  return response.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}
