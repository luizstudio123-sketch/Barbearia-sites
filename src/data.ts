/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, Barber } from './types';

export const SERVICES: Service[] = [
  {
    id: "svc-corte-tradicional",
    nome: "Corte Tradicional",
    preco: 50.00,
    duracao_minutos: 30,
    ativo: true
  },
  {
    id: "svc-barboterapia",
    nome: "Barboterapia (Toalha Quente)",
    preco: 40.00,
    duracao_minutos: 30,
    ativo: true
  },
  {
    id: "svc-combo-corte-barba",
    nome: "Combo: Corte + Barba",
    preco: 80.00,
    duracao_minutos: 60,
    ativo: true
  },
  {
    id: "svc-acabamento",
    nome: "Acabamento (Pezinho/Linha)",
    preco: 20.00,
    duracao_minutos: 15,
    ativo: true
  },
  {
    id: "svc-platinado-nevou",
    nome: "Platinado / Nevou",
    preco: 120.00,
    duracao_minutos: 90,
    ativo: true
  }
];

export const BARBERS: Barber[] = [
  {
    id: "barber-luan",
    nome: "Luan (Sênior)",
    foto: "https://i.imgur.com/zp7G4Fe.jpg",
    ativo: true
  },
  {
    id: "barber-fernando",
    nome: "Fernando (Sênior)",
    foto: "https://i.imgur.com/95jdXC5.jpg",
    ativo: true
  },
  {
    id: "barber-emerson",
    nome: "Emerson (Sênior)",
    foto: "https://i.imgur.com/rl3r7Td.jpg",
    ativo: true
  },
  {
    id: "barber-rodrigo",
    nome: "Rodrigo (Sênior)",
    foto: "https://i.imgur.com/qMy4bm5.jpg",
    ativo: true
  }
];

export interface GalleryItem {
  id: string;
  nome: string;
  img: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    nome: "Degradê feito",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g2",
    nome: "Corte social",
    img: "https://i.imgur.com/XeaUxnc.jpg"
  },
  {
    id: "g3",
    nome: "Barba feita",
    img: "https://i.imgur.com/jMMw6D0.jpg"
  },
  {
    id: "g4",
    nome: "Estilo Moderno",
    img: "https://i.imgur.com/HuriUa7.jpg"
  },
  {
    id: "g5",
    nome: "Corte americano feito",
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g6",
    nome: "Corte degrade",
    img: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=600&h=600&fit=crop&q=80"
  }
];

export interface Testimonial {
  id: string;
  autor: string;
  texto: string;
  tempo: string;
  estrelas: number;
  foto: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    autor: "Rafael Souza",
    texto: "Cara, o atendimento aqui é sensacional. O Rodrigo mandou muito bem no meu degradê, o corte ficou perfeito e a cerveja tava gelada. Com certeza vou voltar!",
    tempo: "",
    estrelas: 5,
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&q=80"
  },
  {
    id: "t2",
    autor: "Lucas Mendes",
    texto: "Barbearia sensacional! Agendei pelo site e fui atendido exatamente no horário. O Luan é extremamente profissional e caprichoso. Nota 10!",
    tempo: "",
    estrelas: 5,
    foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&q=80"
  },
  {
    id: "t3",
    autor: "Bruno Oliveira",
    texto: "Melhor experiência que tive em Curitiba. O espaço é muito bonito e organizado, e o Fernando fez um trabalho impecável na minha barba. Recomendo muito.",
    tempo: "",
    estrelas: 5,
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80"
  },
  {
    id: "t4",
    autor: "Felipe Almeida",
    texto: "Fui por indicação de um amigo e não me arrependi. Os caras são fera demais, o corte ficou do jeito que eu queria e o preço é bem justo.",
    tempo: "",
    estrelas: 5,
    foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&h=120&fit=crop&q=80"
  },
  {
    id: "t5",
    autor: "Marcelo Costa",
    texto: "Lugar sensacional, galera super alto astral e o serviço é de altíssima qualidade. O Emerson me atendeu super bem. Virei cliente com certeza.",
    tempo: "",
    estrelas: 5,
    foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&q=80"
  },
  {
    id: "t6",
    autor: "Thiago Ramos",
    texto: "Excelente profissionalismo de toda a equipe. O ambiente é agradável, limpo e o corte de cabelo superou as expectativas. Parabéns!",
    tempo: "",
    estrelas: 5,
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&q=80"
  }
];
