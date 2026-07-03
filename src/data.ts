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
    id: "barber-lucas",
    nome: "Lucas Silva (Mestre)",
    foto: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=400&h=400&fit=crop&q=80",
    ativo: true
  },
  {
    id: "barber-andre",
    nome: "André Santos (Clássico)",
    foto: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop&q=80",
    ativo: true
  },
  {
    id: "barber-thiago",
    nome: "Thiago Rocha (Moderno)",
    foto: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop&q=80",
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
    nome: "Skin Fade",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g2",
    nome: "Pompadour Clássico",
    img: "https://images.unsplash.com/photo-1605497746444-13065b9934ad?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g3",
    nome: "Barba Esculpida",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g4",
    nome: "Textured Crop",
    img: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g5",
    nome: "Slick Back",
    img: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g6",
    nome: "Low Taper Fade",
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g7",
    nome: "Corte Social",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&h=600&fit=crop&q=80"
  },
  {
    id: "g8",
    nome: "Degradê + Barba",
    img: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=600&h=600&fit=crop&q=80"
  }
];

export interface Testimonial {
  id: string;
  autor: string;
  texto: string;
  tempo: string;
  estrelas: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    autor: "Rafael Souza",
    texto: "Melhor barbearia que já fui. O atendimento é de primeira e o corte dura muito mais tempo. Virei cliente fiel!",
    tempo: "Cliente desde 2024",
    estrelas: 5
  },
  {
    id: "t2",
    autor: "Lucas Mendes",
    texto: "O ambiente é muito top. Você chega lá e já se sente bem. O barbeiro entendeu exatamente o corte que eu queria.",
    tempo: "Cliente desde 2023",
    estrelas: 5
  },
  {
    id: "t3",
    autor: "Bruno Oliveira",
    texto: "Fiz o combo de corte + barba e saí de lá outro homem. A navalha quente é outro nível. Super recomendo!",
    tempo: "Cliente desde 2024",
    estrelas: 5
  },
  {
    id: "t4",
    autor: "Felipe Almeida",
    texto: "Agendei pelo site em 1 minuto, cheguei no horário e não esperei nada. Praticidade total. O corte ficou impecável.",
    tempo: "Cliente desde 2025",
    estrelas: 5
  },
  {
    id: "t5",
    autor: "Marcelo Costa",
    texto: "Meu filho de 12 anos adora cortar lá. O barbeiro tem paciência e faz exatamente o que ele pede. Nota 10.",
    tempo: "Cliente desde 2023",
    estrelas: 5
  },
  {
    id: "t6",
    autor: "Thiago Ramos",
    texto: "Já passei por várias barbearias na região e essa é disparada a melhor. Preço justo, corte perfeito e ambiente maneiro.",
    tempo: "Cliente desde 2024",
    estrelas: 5
  }
];
