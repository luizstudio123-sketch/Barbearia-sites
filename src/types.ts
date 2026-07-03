/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  nome: string;
  preco: number;
  duracao_minutos: number;
  ativo: boolean;
}

export interface Barber {
  id: string;
  nome: string;
  foto: string;
  ativo: boolean;
}

export interface Client {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  senha?: string;
  quantidade_visitas: number;
  ultima_visita: string | null;
  criado_em: string;
}

export interface Booking {
  id: string;
  id_cliente: string;
  id_servico: string;
  id_barbeiro: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  status: 'agendado' | 'concluido' | 'cancelado' | 'nao_compareceu';
  criado_em: string;
}

export interface BusinessHours {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
}
