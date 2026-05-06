export interface CapacidadeRow {
  cenario: number;
  clientes_por_hora: number;
  clientes_simultaneos_estimados: number;
  lambda_por_minuto: number;
  maior_espera: number;
  tempo_medio_espera: number;
  tempo_medio_total: number;
  utilizacao: number;
}

export interface HorarioRow {
  faixa: string;
  clientes_por_hora: number;
  clientes_simultaneos_estimados: number;
  lambda_por_minuto: number;
  maior_espera: number;
  tempo_medio_espera: number;
  tempo_medio_total: number;
  utilizacao: number;
}

export interface IntegradaRow {
  cliente: number;
  hora_chegada: number;
  inicio_atendimento: number;
  fim_atendimento: number;
  intervalo_chegada: number;
  tempo_espera_fila: number;
  tempo_servico: number;
  tempo_total_sistema: number;
}

export interface SimulacaoResponse {
  csv: {
    analise_capacidade: { arquivo: string; registros: CapacidadeRow[] };
    analise_horarios: { arquivo: string; registros: HorarioRow[] };
    simulacao_integrada: { arquivo: string; origem_registros: string; registros: IntegradaRow[] };
  };
}

export const API_URL = "/api/simulacao?usar_selenium=true";
const DIRECT_API_URL = "https://simular-requerimentos.onrender.com/api/simulacao?usar_selenium=true";

export async function fetchSimulacao(): Promise<SimulacaoResponse> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return await res.json();
  } catch (err) {
    const res = await fetch(DIRECT_API_URL);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return await res.json();
  }
}

