/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scissors, 
  MapPin, 
  House, 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  Sparkles, 
  Coffee, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  Phone, 
  Star, 
  Award, 
  X, 
  Shuffle, 
  Trash2, 
  UserPlus, 
  Eye, 
  EyeOff,
  Briefcase,
  AlertCircle,
  Leaf,
  Shield
} from "lucide-react";

import { Service, Barber, Client, Booking } from "./types";
import { SERVICES, BARBERS, GALLERY_ITEMS, TESTIMONIALS } from "./data";
import BarberDashboard from "./components/BarberDashboard";
import { 
  seedFirestoreIfEmpty, 
  listenToBookings, 
  listenToClients,
  listenToServices,
  saveBookingToFirestore,
  saveClientToFirestore,
  saveServiceToFirestore
} from "./lib/firebase";

// Dynamic Date Generator for realistic pre-seeded scheduling
const getRelativeDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const SEEDED_CLIENTS: Client[] = [
  {
    id: "cli-carlos",
    nome: "Carlos Eduardo",
    telefone: "(41) 99888-1234",
    email: "carlos@gmail.com",
    quantidade_visitas: 4,
    ultima_visita: getRelativeDate(-1),
    criado_em: new Date().toISOString()
  },
  {
    id: "cli-felipe",
    nome: "Felipe Mendes",
    telefone: "(41) 98777-4321",
    email: "felipe@gmail.com",
    quantidade_visitas: 2,
    ultima_visita: getRelativeDate(-1),
    criado_em: new Date().toISOString()
  },
  {
    id: "cli-bruno",
    nome: "Bruno Silva",
    telefone: "(41) 99122-3344",
    email: "bruno@gmail.com",
    quantidade_visitas: 7,
    ultima_visita: getRelativeDate(0),
    criado_em: new Date().toISOString()
  },
  {
    id: "cli-gustavo",
    nome: "Gustavo Rocha",
    telefone: "(41) 98833-4455",
    email: "gustavo@gmail.com",
    quantidade_visitas: 1,
    ultima_visita: getRelativeDate(0),
    criado_em: new Date().toISOString()
  },
  {
    id: "cli-thiago",
    nome: "Thiago Santos",
    telefone: "(41) 99200-5566",
    email: "thiago@gmail.com",
    quantidade_visitas: 5,
    ultima_visita: getRelativeDate(0),
    criado_em: new Date().toISOString()
  }
];

const SEEDED_BOOKINGS: Booking[] = [
  {
    id: "appt-1",
    id_cliente: "cli-carlos",
    id_servico: "svc-corte-tradicional",
    id_barbeiro: "barber-rodrigo",
    data: getRelativeDate(-1),
    horario: "14:00",
    status: "concluido",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-2",
    id_cliente: "cli-felipe",
    id_servico: "svc-barboterapia",
    id_barbeiro: "barber-luan",
    data: getRelativeDate(-1),
    horario: "16:30",
    status: "concluido",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-3",
    id_cliente: "cli-bruno",
    id_servico: "svc-combo-corte-barba",
    id_barbeiro: "barber-fernando",
    data: getRelativeDate(0),
    horario: "10:00",
    status: "agendado",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-4",
    id_cliente: "cli-gustavo",
    id_servico: "svc-corte-tradicional",
    id_barbeiro: "barber-rodrigo",
    data: getRelativeDate(0),
    horario: "11:30",
    status: "concluido",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-5",
    id_cliente: "cli-thiago",
    id_servico: "svc-platinado-nevou",
    id_barbeiro: "barber-emerson",
    data: getRelativeDate(0),
    horario: "15:00",
    status: "agendado",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-6",
    id_cliente: "cli-carlos",
    id_servico: "svc-acabamento",
    id_barbeiro: "barber-luan",
    data: getRelativeDate(0),
    horario: "17:00",
    status: "nao_compareceu",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-7",
    id_cliente: "cli-bruno",
    id_servico: "svc-corte-tradicional",
    id_barbeiro: "barber-fernando",
    data: getRelativeDate(1),
    horario: "09:30",
    status: "agendado",
    criado_em: new Date().toISOString()
  },
  {
    id: "appt-8",
    id_cliente: "cli-felipe",
    id_servico: "svc-combo-corte-barba",
    id_barbeiro: "barber-rodrigo",
    data: getRelativeDate(1),
    horario: "14:00",
    status: "agendado",
    criado_em: new Date().toISOString()
  }
];

export default function App() {
  // Navigation tabs: 'inicio' | 'agendar' | 'meus-agendamentos' | 'localizacao' | 'dashboard'
  const [activeTab, setActiveTab] = useState<string>("inicio");
  
  // Local Database States
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem("dom_lucas_clientes");
    return saved ? JSON.parse(saved) : SEEDED_CLIENTS;
  });
  
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("dom_lucas_agendamentos");
    return saved ? JSON.parse(saved) : SEEDED_BOOKINGS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem("dom_lucas_servicos");
    return saved ? JSON.parse(saved) : SERVICES;
  });
  
  const [currentUser, setCurrentUser] = useState<Client | null>(() => {
    const saved = localStorage.getItem("dom_lucas_session");
    return saved ? JSON.parse(saved) : null;
  });

  // Barber authentication state and login credentials
  const [isBarberAuthenticated, setIsBarberAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("dom_lucas_barber_authenticated") === "true";
  });
  const [barberUsername, setBarberUsername] = useState("");
  const [barberPassword, setBarberPassword] = useState("");
  const [barberLoginError, setBarberLoginError] = useState("");
  const [showBarberPassword, setShowBarberPassword] = useState(false);

  // Business Hours Configuration
  const businessHours = {
    startHour: 9,
    endHour: 20, // Closes at 20:00
    intervalMinutes: 30
  };

  // State for dynamic shop open status
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // State for header logo loading fallback
  const [logoFailed, setLogoFailed] = useState<boolean>(false);

  // Synchronize state with Firestore in real-time
  useEffect(() => {
    // Seed Firestore with SEEDED_CLIENTS, SEEDED_BOOKINGS, and SERVICES if they are empty
    seedFirestoreIfEmpty(SEEDED_CLIENTS, SEEDED_BOOKINGS, SERVICES);

    // Set up real-time listener for bookings
    const unsubscribeBookings = listenToBookings((updatedBookings) => {
      setBookings(updatedBookings);
    });

    // Set up real-time listener for clients
    const unsubscribeClients = listenToClients((updatedClients) => {
      setClients(updatedClients);
    });

    // Set up real-time listener for services
    const unsubscribeServices = listenToServices((updatedServices) => {
      if (updatedServices.length > 0) {
        setServices(updatedServices);
      }
    });

    return () => {
      unsubscribeBookings();
      unsubscribeClients();
      unsubscribeServices();
    };
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem("dom_lucas_clientes", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem("dom_lucas_agendamentos", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("dom_lucas_servicos", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("dom_lucas_session", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("dom_lucas_session");
    }
  }, [currentUser]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Handle open hours calculation
  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const hour = now.getHours();
      // Aberto: Terça (2) a Sábado (6) e Segunda (1) das 09:00 às 20:00 (according to original file)
      // Note: original code says: "Aberto: Seg(1) a Sáb(6), das 7h às 19h" or "Terça a Sábado das 09:00 às 20:00"
      // Let's use Terça a Sábado das 09:00 às 20:00
      const isBarberDay = day >= 2 && day <= 6; // Tue to Sat
      const isBarberHour = hour >= 9 && hour < 20;
      setIsOpen(isBarberDay && isBarberHour);
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Wizard Booking States
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingBarber, setBookingBarber] = useState<Barber | { id: string; nome: string } | null>(null);
  const [bookingDate, setBookingDate] = useState<string>("");
  const [bookingTime, setBookingTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [pendingConfirm, setPendingConfirm] = useState<boolean>(false);

  // Modals & Interactivity
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const [lightboxItem, setLightboxItem] = useState<{ img: string; title: string } | null>(null);

  // Form Inputs
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  // Subtab for Appointments dashboard: 'futuros' | 'passados'
  const [appointmentsTab, setAppointmentsTab] = useState<"futuros" | "passados">("futuros");

  // Auto-scrolling Gallery Hook
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = galleryScrollRef.current;
    if (!container) return;

    let animationId: number;
    const speed = 0.8; // Butter-smooth continuous scrolling speed
    let scrollPosition = 0;

    const startScroll = () => {
      if (!container) return;
      
      scrollPosition += speed;
      container.scrollLeft = Math.floor(scrollPosition);
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 2) {
        scrollPosition = 1;
        container.scrollLeft = 1;
      }
      animationId = requestAnimationFrame(startScroll);
    };

    let isInteracting = false;
    const onStart = () => {
      isInteracting = true;
      cancelAnimationFrame(animationId);
    };
    const onEnd = () => {
      isInteracting = false;
      // Sync our float variable with the actual integer scroll position
      scrollPosition = container.scrollLeft;
      animationId = requestAnimationFrame(startScroll);
    };

    container.addEventListener("mouseenter", onStart);
    container.addEventListener("mouseleave", onEnd);
    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchend", onEnd, { passive: true });

    animationId = requestAnimationFrame(startScroll);

    return () => {
      cancelAnimationFrame(animationId);
      if (container) {
        container.removeEventListener("mouseenter", onStart);
        container.removeEventListener("mouseleave", onEnd);
        container.removeEventListener("touchstart", onStart);
        container.removeEventListener("touchend", onEnd);
      }
    };
  }, []);

  // ==========================================
  // AUTENTICAÇÃO HANDLERS
  // ==========================================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!loginEmail || !loginPassword) {
      setAuthError("Preencha todos os campos.");
      return;
    }

    const matchedUser = clients.find(
      (c) => c.email.toLowerCase() === loginEmail.toLowerCase() && c.senha === loginPassword
    );

    if (matchedUser) {
      setCurrentUser(matchedUser);
      setShowAuthModal(false);
      // Clear inputs
      setLoginEmail("");
      setLoginPassword("");
      
      // If user was booking and got interrupted, proceed to confirm booking
      if (pendingConfirm) {
        setPendingConfirm(false);
        // Step 5 is review, we let them view and proceed
      }
    } else {
      setAuthError("E-mail ou senha incorretos.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!regName || !regPhone || !regEmail || !regPassword) {
      setAuthError("Preencha todos os campos.");
      return;
    }

    if (regPassword.length < 6) {
      setAuthError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const emailExists = clients.some(
      (c) => c.email.toLowerCase() === regEmail.toLowerCase()
    );

    if (emailExists) {
      setAuthError("Este e-mail já está cadastrado.");
      return;
    }

    const newClient: Client = {
      id: "client_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
      nome: regName,
      telefone: regPhone,
      email: regEmail,
      senha: regPassword,
      quantidade_visitas: 0,
      ultima_visita: null,
      criado_em: new Date().toISOString()
    };

    saveClientToFirestore(newClient);
    setCurrentUser(newClient);
    setShowAuthModal(false);

    // Clear inputs
    setRegName("");
    setRegPhone("");
    setRegEmail("");
    setRegPassword("");
  };

  const handleLogout = () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
      setCurrentUser(null);
      setActiveTab("inicio");
    }
  };

  // ==========================================
  // WIZARD BOOKING LOGIC
  // ==========================================
  const selectService = (service: Service) => {
    setBookingService(service);
    setBookingStep(2);
  };

  const selectBarber = (barber: Barber | { id: string; nome: string }) => {
    setBookingBarber(barber);
    setBookingStep(3);
  };

  const validateAndProceedDate = () => {
    if (!bookingDate) {
      alert("Por favor, selecione uma data.");
      return;
    }

    const selectedDate = new Date(bookingDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("A data selecionada não pode ser anterior a hoje.");
      return;
    }

    const dayOfWeek = selectedDate.getDay();
    // 0 = Domingo, 1 = Segunda. Barbearia closes Sun & Mon
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      alert("A barbearia não funciona aos Domingos e Segundas-feiras. Por favor, selecione de Terça a Sábado!");
      return;
    }

    // Load available slots
    setIsLoadingSlots(true);
    setBookingStep(4);

    setTimeout(() => {
      calculateAvailableSlots(bookingDate);
      setIsLoadingSlots(false);
    }, 400);
  };

  const calculateAvailableSlots = (dateStr: string) => {
    if (!bookingService || !bookingBarber) return;

    const serviceDuration = bookingService.duracao_minutos;
    const barberId = bookingBarber.id;

    const dateNow = new Date();
    const currentMinutesNow = dateNow.getHours() * 60 + dateNow.getMinutes();

    // Check if selected date is today
    const selectedDate = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = selectedDate.getTime() === today.getTime();

    // Generate possible slots (e.g., from 09:00 to 20:00)
    let slots: string[] = [];
    const startMin = businessHours.startHour * 60; // 540
    const endMin = businessHours.endHour * 60; // 1200

    // Filter appointments on this day that are not canceled
    const activeBookings = bookings.filter(
      (b) => b.data === dateStr && b.status !== "cancelado"
    );

    // Map booked ranges for each barber
    // We compute the occupied ranges as [startMinutes, endMinutes]
    const occupiedRanges = activeBookings.map((b) => {
      const [h, m] = b.horario.split(":").map(Number);
      const start = h * 60 + m;
      // Find duration of the booked service (fallback to 30min)
      const service = services.find((s) => s.id === b.id_servico);
      const duration = service ? service.duracao_minutos : 30;
      return {
        barberId: b.id_barbeiro,
        start,
        end: start + duration
      };
    });

    for (let time = startMin; time < endMin; time += businessHours.intervalMinutes) {
      const hour = Math.floor(time / 60);
      const min = time % 60;
      const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      const slotStart = time;
      const slotEnd = time + serviceDuration;

      // Rule A: If today, block times that already passed (+ 15 minutes buffer)
      if (isToday && slotStart <= currentMinutesNow + 15) {
        continue;
      }

      // Rule B: Overlap checks
      if (barberId !== "sem_preferencia") {
        // Specific barber
        const isBusy = occupiedRanges.some(
          (range) =>
            range.barberId === barberId &&
            slotStart < range.end &&
            range.start < slotEnd
        );
        if (!isBusy) {
          slots.push(timeStr);
        }
      } else {
        // "Sem Preferência" means there has to be AT LEAST one barber free
        const freeBarbersCount = BARBERS.filter((barber) => {
          const isBusy = occupiedRanges.some(
            (range) =>
              range.barberId === barber.id &&
              slotStart < range.end &&
              range.start < slotEnd
          );
          return !isBusy;
        }).length;

        if (freeBarbersCount > 0) {
          slots.push(timeStr);
        }
      }
    }

    setAvailableSlots(slots);
  };

  const selectTime = (time: string) => {
    setBookingTime(time);
    setBookingStep(5);
  };

  const handleConfirmBooking = () => {
    if (!currentUser) {
      // Prompt auth
      setPendingConfirm(true);
      setAuthType("login");
      setShowAuthModal(true);
      return;
    }

    if (!bookingService || !bookingBarber || !bookingDate || !bookingTime) return;

    let assignedBarberId = bookingBarber.id;
    let assignedBarberName = bookingBarber.nome;

    // Handle No Preference allocation
    if (assignedBarberId === "sem_preferencia") {
      const activeBookings = bookings.filter(
        (b) => b.data === bookingDate && b.status !== "cancelado"
      );

      const [h, m] = bookingTime.split(":").map(Number);
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + bookingService.duracao_minutos;

      const occupiedRanges = activeBookings.map((b) => {
        const [bh, bm] = b.horario.split(":").map(Number);
        const start = bh * 60 + bm;
        const svc = services.find((s) => s.id === b.id_servico);
        const duration = svc ? svc.duracao_minutos : 30;
        return { barberId: b.id_barbeiro, start, end: start + duration };
      });

      // Find the first completely free barber
      const freeBarber = BARBERS.find((b) => {
        const isBusy = occupiedRanges.some(
          (range) =>
            range.barberId === b.id &&
            slotStart < range.end &&
            range.start < slotEnd
        );
        return !isBusy;
      });

      if (freeBarber) {
        assignedBarberId = freeBarber.id;
        assignedBarberName = freeBarber.nome;
      } else {
        alert("Desculpe, nenhum barbeiro está livre nesse horário. Por favor, escolha outro.");
        setBookingStep(4);
        return;
      }
    }

    const newBooking: Booking = {
      id: "appt_" + Date.now(),
      id_cliente: currentUser.id,
      id_servico: bookingService.id,
      id_barbeiro: assignedBarberId,
      data: bookingDate,
      horario: bookingTime,
      status: "agendado",
      criado_em: new Date().toISOString()
    };

    // Save Booking to Firestore
    saveBookingToFirestore(newBooking);

    // Save Client update to Firestore
    const updatedClient: Client = {
      ...currentUser,
      quantidade_visitas: currentUser.quantidade_visitas + 1,
      ultima_visita: new Date().toISOString()
    };
    saveClientToFirestore(updatedClient);

    // Sync currentUser state locally
    setCurrentUser(updatedClient);

    setBookingStep(6);
  };

  const handleCancelBooking = (apptId: string) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const target = bookings.find((b) => b.id === apptId);
      if (target) {
        saveBookingToFirestore({ ...target, status: "cancelado" });
      }
    }
  };

  const resetBookingFlow = () => {
    setBookingService(null);
    setBookingBarber(null);
    setBookingDate("");
    setBookingTime("");
    setBookingStep(1);
  };

  // Format YYYY-MM-DD to DD/MM/YYYY
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-height-screen bg-dark-bg text-zinc-300 font-body flex flex-col selection:bg-primary-gold selection:text-black">
      
      {/* ==========================================
          HEADER (DESKTOP)
          ========================================== */}
      <header className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-md border-b border-zinc-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex flex-col items-center cursor-pointer py-1" onClick={() => setActiveTab("inicio")}>
            {!logoFailed ? (
              <img 
                src="https://i.imgur.com/cHZIW7y.png" 
                alt="Barbearia Clube" 
                className="w-12 h-12 rounded-full object-cover border border-primary-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                onError={() => {
                  setLogoFailed(true);
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-primary-gold flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                <Scissors className="w-6 h-6 text-primary-gold transform rotate-90" />
              </div>
            )}
            <span className="font-heading text-xs font-bold tracking-[2px] text-primary-gold uppercase mt-1">
              Barbearia Clube
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab("inicio")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-heading tracking-wide uppercase transition-all duration-200 ${
                activeTab === "inicio"
                  ? "text-primary-gold bg-primary-gold/5 border-b-2 border-primary-gold"
                  : "text-zinc-400 hover:text-white border-b-2 border-transparent"
              }`}
            >
              <House className="w-4 h-4" />
              Início
            </button>
            <button
              onClick={() => { setActiveTab("agendar"); resetBookingFlow(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-heading tracking-wide uppercase transition-all duration-200 ${
                activeTab === "agendar"
                  ? "text-primary-gold bg-primary-gold/5 border-b-2 border-primary-gold"
                  : "text-zinc-400 hover:text-white border-b-2 border-transparent"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Agendar
            </button>
            <button
              onClick={() => setActiveTab("meus-agendamentos")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-heading tracking-wide uppercase transition-all duration-200 ${
                activeTab === "meus-agendamentos"
                  ? "text-primary-gold bg-primary-gold/5 border-b-2 border-primary-gold"
                  : "text-zinc-400 hover:text-white border-b-2 border-transparent"
              }`}
            >
              <Clock className="w-4 h-4" />
              Meus Agendamentos
            </button>
            <button
              onClick={() => setActiveTab("localizacao")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-heading tracking-wide uppercase transition-all duration-200 ${
                activeTab === "localizacao"
                  ? "text-primary-gold bg-primary-gold/5 border-b-2 border-primary-gold"
                  : "text-zinc-400 hover:text-white border-b-2 border-transparent"
              }`}
            >
              <MapPin className="w-4 h-4" />
              Como Chegar
            </button>
          </nav>

          {/* User Session Info / Logged-in Header Trigger */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-dark-card border border-zinc-800 rounded-full px-3 py-1.5 pl-4 shadow-sm">
                <span className="text-xs text-zinc-300 font-medium max-w-[120px] truncate">
                  {currentUser.nome.split(" ")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full hover:bg-zinc-800 text-red-400 hover:text-red-300 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthType("login"); setShowAuthModal(true); }}
                className="flex items-center gap-2 bg-primary-gold hover:bg-transparent text-black hover:text-primary-gold border border-primary-gold py-1.5 px-4 rounded text-xs font-heading font-bold uppercase transition-all duration-300 tracking-wider shadow-[0_2px_10px_rgba(212,175,55,0.15)]"
              >
                <User className="w-3.5 h-3.5" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN CONTAINER
          ========================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-24 md:pb-12">
        
        {/* ==========================================
            TAB: INÍCIO (HOMEPAGE)
            ========================================== */}
        {activeTab === "inicio" && (
          <div className="space-y-10">
            
            {/* HERO BANNER SECTION */}
            <div 
              className="relative rounded-2xl overflow-hidden border border-zinc-900 min-h-[500px] flex flex-col items-center justify-center text-center p-6 bg-cover bg-center shadow-[inset_0_0_120px_rgba(0,0,0,0.95)]"
              style={{ 
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(18,18,18,0.95)), url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1600&h=1000&fit=crop&q=80')` 
              }}
            >
              {/* Extra gradient tint for contrast */}
              <div className="absolute inset-0 bg-black/35 z-0" />

              <div className="max-w-2xl z-10 flex flex-col items-center space-y-6">
                
                {/* Status bar inside the hero card so the image goes above it */}
                <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-black/70 backdrop-blur-md border border-zinc-800/85 rounded-full w-fit shadow-lg">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'} animate-pulse`} />
                  <span className={`font-heading text-xs font-bold tracking-widest ${isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOpen ? 'ABERTO AGORA' : 'FECHADO AGORA'}
                  </span>
                </div>

                <div className="space-y-3 flex flex-col items-center">
                  <span className="text-primary-gold font-heading text-[10px] xs:text-xs sm:text-sm tracking-[2px] xs:tracking-[3px] sm:tracking-[4px] font-bold uppercase whitespace-nowrap block">
                    ESTILO | QUALIDADE | PRECISÃO
                  </span>
                  <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-none">
                    SEU CORTE,<br />SUA REGRA
                  </h1>
                  <p className="text-zinc-300 max-w-lg text-sm sm:text-base font-light">
                    Chega de sair da barbearia insatisfeito.
                  </p>
                </div>

                {/* Spacing above the button block, and layout side-by-side as requested */}
                <div className="pt-2 w-full flex flex-col items-center gap-4">
                  
                  {/* Slow pulsing phrase: 👇Toque e agende seu hórario */}
                  <motion.p 
                    animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1, 0.98] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-primary-gold font-heading text-sm sm:text-base tracking-wider font-semibold uppercase flex items-center gap-1.5"
                  >
                    👇 Toque e agende seu horário
                  </motion.p>
                  
                  {/* Side-by-side CTA buttons on desktop and mobile */}
                  <div className="flex flex-row items-center justify-center gap-3.5 w-full max-w-md px-1">
                    <motion.button 
                      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(212,175,55,0.6)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setActiveTab("agendar"); resetBookingFlow(); }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-primary-gold to-amber-500 text-black py-4 px-3 sm:px-5 rounded-xl font-heading font-extrabold text-xs sm:text-sm tracking-wider uppercase cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] border-none"
                    >
                      <Scissors className="w-4 h-4 transform rotate-90" />
                      Agendar Horário
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.05, borderColor: "#ffffff", backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("localizacao")}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 text-white border-2 border-zinc-700 py-4 px-3 sm:px-5 rounded-xl font-heading font-extrabold text-xs sm:text-sm tracking-wider uppercase cursor-pointer transition-all duration-300"
                    >
                      <span>Como Chegar 📍</span>
                    </motion.button>
                  </div>

                  {/* Premium Stats Row */}
                  <div className="w-full max-w-xl mt-6 bg-zinc-950/20 backdrop-blur-xs rounded-xl py-4 px-2 sm:px-6">
                    <div className="flex items-center justify-between">
                      
                      {/* Stat 1 */}
                      <div className="flex-1 flex flex-col items-center text-center px-1">
                        <div className="flex items-center gap-1 justify-center">
                          <span className="font-serif text-2xl sm:text-3xl font-medium text-primary-gold tracking-tight">4.9</span>
                          <span className="text-primary-gold text-lg sm:text-xl">★</span>
                        </div>
                        <span className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold mt-1">
                          AVALIAÇÕES
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="w-[1px] h-10 bg-primary-gold/20 self-center" />

                      {/* Stat 2 */}
                      <div className="flex-1 flex flex-col items-center text-center px-1">
                        <span className="font-serif text-2xl sm:text-3xl font-medium text-primary-gold tracking-tight">
                          +9
                        </span>
                        <span className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold mt-1">
                          Anos de Barbearia
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="w-[1px] h-10 bg-primary-gold/20 self-center" />

                      {/* Stat 3 */}
                      <div className="flex-1 flex flex-col items-center text-center px-1">
                        <span className="font-serif text-2xl sm:text-3xl font-medium text-primary-gold tracking-tight">
                          4
                        </span>
                        <span className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold mt-1">
                          Profissionais Elite
                        </span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* PREMIUM FEATURES BAR - EXACT STYLE FROM IMAGE */}
            <div className="w-full bg-zinc-950/65 backdrop-blur-md rounded-2xl border border-zinc-900/85 shadow-2xl py-7 px-1 sm:px-6 -mt-10 sm:-mt-14 relative z-20">
              <div className="grid grid-cols-4 divide-x divide-primary-gold/15">
                
                {/* Column 1 */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary-gold mb-2" />
                  <h4 className="font-serif text-xs xs:text-sm sm:text-xl md:text-2xl text-primary-gold font-medium tracking-wide">
                    Mercês
                  </h4>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs tracking-[0.1em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold mt-1.5 whitespace-nowrap">
                    CURITIBA, PR
                  </span>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4">
                  <Scissors className="w-5 h-5 sm:w-6 sm:h-6 text-primary-gold mb-2" />
                  <h4 className="font-serif text-xs xs:text-sm sm:text-xl md:text-2xl text-primary-gold font-medium tracking-wide">
                    Barba & Corte
                  </h4>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4">
                  <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary-gold mb-2" />
                  <h4 className="font-serif text-xs xs:text-sm sm:text-xl md:text-2xl text-primary-gold font-medium tracking-wide">
                    Massoterapia
                  </h4>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs tracking-[0.1em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold mt-1.5 whitespace-nowrap">
                    RELAXAMENTO
                  </span>
                </div>

                {/* Column 4 */}
                <div className="flex flex-col items-center justify-center text-center px-1 sm:px-4">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-gold mb-2" />
                  <h4 className="font-serif text-xs xs:text-sm sm:text-xl md:text-2xl text-primary-gold font-medium tracking-wide">
                    Seg–Sáb
                  </h4>
                  <span className="text-[7px] xs:text-[8px] sm:text-[10px] md:text-xs tracking-[0.1em] sm:tracking-[0.2em] text-zinc-500 uppercase font-bold mt-1.5 whitespace-nowrap">
                    HORÁRIOS FLEXÍVEIS
                  </span>
                </div>

              </div>
            </div>

            {/* GALLERY SECTION */}
            <section className="space-y-6">
              <div className="text-center">
                <span className="text-primary-gold font-heading text-xs tracking-[3px] uppercase font-bold">GALERIA DE ESTILOS</span>
                <h2 className="font-heading text-3xl font-extrabold text-white uppercase mt-1">Nossos Cortes</h2>
                <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
              </div>

              {/* Seamless Auto-Scrolling Row */}
              <div className="relative w-full overflow-hidden py-2">
                {/* Fade overlays on the sides for a premium aesthetic */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

                {/* The Scrolling Container */}
                <div 
                  ref={galleryScrollRef}
                  className="flex overflow-x-auto gap-4 py-2 px-4 scrollbar-none select-none"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {/* Duplicated 6 items for continuous scroll */}
                  {[...GALLERY_ITEMS, ...GALLERY_ITEMS, ...GALLERY_ITEMS].map((item, idx) => (
                    <div 
                      key={`${item.id}-${idx}`}
                      onClick={() => setLightboxItem({ img: item.img, title: "" })}
                      className="relative w-48 xs:w-56 sm:w-64 aspect-square rounded-2xl overflow-hidden border border-zinc-900/80 cursor-pointer group shadow-xl flex-shrink-0 transition-all duration-300 hover:border-primary-gold/30"
                    >
                      <img 
                        src={item.img} 
                        alt="Corte" 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* OUR TEAM ELITE SECTION */}
            <section className="space-y-8 pt-8 border-t border-zinc-900/60">
              <div className="text-center">
                <span className="text-primary-gold font-heading text-xs tracking-[3px] uppercase font-bold">Conheça quem vai te atender</span>
                <h2 className="font-heading text-3xl font-extrabold text-white uppercase mt-1">Nosso Time de Elite</h2>
                <p className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                  4 profissionais apaixonados pelo que fazem. Décadas de experiência combinadas para oferecer o melhor da barbearia em Curitiba.
                </p>
                <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                
                {/* Team Member 1: Luan */}
                <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl overflow-hidden flex flex-col group shadow-lg hover:border-primary-gold/20 transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src="https://i.imgur.com/zp7G4Fe.jpg" 
                      alt="Luan" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent h-28" />
                    {/* Golden overlay label */}
                    <div className="absolute bottom-4 left-4 bg-[#ab8e66] text-black text-[10px] tracking-widest font-extrabold px-3.5 py-2 uppercase font-heading rounded-xs shadow-md">
                      BARBEIRO SÊNIOR
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif text-white font-bold text-lg sm:text-xl tracking-wide uppercase mt-1">
                      LUAN
                    </h3>
                    <span className="text-primary-gold text-[10px] font-bold tracking-widest uppercase mt-1">
                      BARBEIRO SÊNIOR
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-[#ab8e66] text-xs sm:text-sm font-medium">
                      <Award className="w-4 h-4 text-primary-gold" />
                      <span>7 Anos de Experiência</span>
                    </div>
                  </div>
                </div>

                {/* Team Member 2: Fernando */}
                <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl overflow-hidden flex flex-col group shadow-lg hover:border-primary-gold/20 transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src="https://i.imgur.com/95jdXC5.jpg" 
                      alt="Fernando" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent h-28" />
                    {/* Golden overlay label */}
                    <div className="absolute bottom-4 left-4 bg-[#ab8e66] text-black text-[10px] tracking-widest font-extrabold px-3.5 py-2 uppercase font-heading rounded-xs shadow-md">
                      BARBEIRO SÊNIOR
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif text-white font-bold text-lg sm:text-xl tracking-wide uppercase mt-1">
                      FERNANDO
                    </h3>
                    <span className="text-primary-gold text-[10px] font-bold tracking-widest uppercase mt-1">
                      BARBEIRO SÊNIOR
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-[#ab8e66] text-xs sm:text-sm font-medium">
                      <Award className="w-4 h-4 text-primary-gold" />
                      <span>24 Anos de Experiência</span>
                    </div>
                  </div>
                </div>

                {/* Team Member 3: Emerson */}
                <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl overflow-hidden flex flex-col group shadow-lg hover:border-primary-gold/20 transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src="https://i.imgur.com/rl3r7Td.jpg" 
                      alt="Emerson" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent h-28" />
                    {/* Golden overlay label */}
                    <div className="absolute bottom-4 left-4 bg-[#ab8e66] text-black text-[10px] tracking-widest font-extrabold px-3.5 py-2 uppercase font-heading rounded-xs shadow-md">
                      BARBEIRO SÊNIOR
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif text-white font-bold text-lg sm:text-xl tracking-wide uppercase mt-1">
                      EMERSON
                    </h3>
                    <span className="text-primary-gold text-[10px] font-bold tracking-widest uppercase mt-1">
                      BARBEIRO SÊNIOR
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-[#ab8e66] text-xs sm:text-sm font-medium">
                      <Award className="w-4 h-4 text-primary-gold" />
                      <span>9 Anos de Experiência</span>
                    </div>
                  </div>
                </div>

                {/* Team Member 4: Rodrigo */}
                <div className="bg-[#0b0c10] border border-zinc-900 rounded-xl overflow-hidden flex flex-col group shadow-lg hover:border-primary-gold/20 transition-all duration-300">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src="https://i.imgur.com/qMy4bm5.jpg" 
                      alt="Rodrigo" 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent h-28" />
                    {/* Golden overlay label */}
                    <div className="absolute bottom-4 left-4 bg-[#ab8e66] text-black text-[10px] tracking-widest font-extrabold px-3.5 py-2 uppercase font-heading rounded-xs shadow-md">
                      BARBEIRO SÊNIOR
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif text-white font-bold text-lg sm:text-xl tracking-wide uppercase mt-1">
                      RODRIGO
                    </h3>
                    <span className="text-primary-gold text-[10px] font-bold tracking-widest uppercase mt-1">
                      BARBEIRO SÊNIOR
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-[#ab8e66] text-xs sm:text-sm font-medium">
                      <Award className="w-4 h-4 text-primary-gold" />
                      <span>10 Anos de Experiência</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section className="space-y-8 pb-8">
              <div className="text-center">
                <span className="text-primary-gold font-heading text-xs tracking-[3px] uppercase font-bold">AVALIAÇÕES REAIS</span>
                <h2 className="font-heading text-3xl font-extrabold text-white uppercase mt-1">O Que Dizem Sobre Nós</h2>
                <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
              </div>

              {/* General Rating Badge */}
              <div className="bg-gradient-to-br from-primary-gold/10 to-transparent border border-primary-gold/20 rounded-2xl p-6 max-w-md mx-auto text-center space-y-3 shadow-lg">
                <div className="flex items-center justify-center gap-1 text-primary-gold text-lg">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-primary-gold" />)}
                </div>
                <h3 className="font-heading text-4xl font-extrabold text-primary-gold leading-none">
                  4.9 <span className="text-zinc-500 text-lg font-light">/ 5</span>
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm font-light">
                  A melhor barbearia de Curitiba — Baseado em mais de 280 avaliações.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t) => (
                  <div 
                    key={t.id} 
                    className="bg-dark-card border border-zinc-900 rounded-xl p-6 flex flex-col justify-between hover:border-primary-gold/20 transition-all duration-300 shadow-md"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-0.5 text-primary-gold">
                        {[...Array(t.estrelas)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary-gold" />)}
                      </div>
                      <p className="text-zinc-300 text-xs sm:text-sm font-light italic leading-relaxed">
                        "{t.texto}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3 border-t border-zinc-850 pt-4 mt-6">
                      <img 
                        src={t.foto} 
                        alt={t.autor}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                      />
                      <div>
                        <h4 className="text-white text-xs font-bold font-heading uppercase">{t.autor}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CALL TO ACTION SECTION */}
            <section className="pt-8 pb-4">
              <div 
                className="relative rounded-2xl overflow-hidden border border-zinc-900/85 p-8 sm:p-12 text-center bg-cover bg-center shadow-2xl mb-8"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(10,10,10,0.95), rgba(15,15,15,0.85)), url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&fit=crop&q=80')`
                }}
              >
                <div className="absolute inset-0 bg-black/40 z-0" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                  <span className="text-primary-gold font-heading text-xs tracking-[4px] uppercase font-bold block">
                    Pronto para uma transformação?
                  </span>
                  
                  <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                    Agende seu horário agora
                  </h2>
                  
                  <p className="text-zinc-300 text-sm sm:text-base font-light leading-relaxed max-w-lg mx-auto">
                    Fale diretamente com a gente. Escolha o profissional, o serviço e o horário ideal. Resposta rápida, atendimento VIP.
                  </p>

                  <div className="pt-4">
                    <motion.a
                      href="https://wa.me/554130149413?text=Olá! Gostaria de agendar um horário."
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212,175,55,0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-primary-gold to-amber-500 text-black font-heading font-extrabold text-sm tracking-wider uppercase px-8 py-4 rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.25)] transition-all duration-300 cursor-pointer font-bold no-underline"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.661.988 3.291 1.472 4.96 1.473 5.433 0 9.851-4.388 9.855-9.782.002-2.614-1.011-5.071-2.855-6.918-1.844-1.847-4.295-2.864-6.911-2.865-5.438 0-9.855 4.388-9.86 9.782-.002 1.838.484 3.633 1.411 5.2l-.934 3.41 3.483-.909zm10.518-7.142c-.29-.145-1.716-.845-1.982-.941-.266-.096-.46-.145-.653.145-.193.29-.747.942-.916 1.135-.169.193-.338.217-.628.072-.29-.145-1.226-.452-2.335-1.442-.864-.77-1.447-1.721-1.616-2.011-.169-.29-.018-.447.127-.591.131-.13.29-.338.435-.507.145-.169.193-.29.29-.483.097-.193.048-.361-.024-.507-.072-.145-.653-1.573-.895-2.152-.236-.569-.475-.491-.653-.5-.169-.008-.362-.01-.556-.01-.193 0-.507.072-.772.361-.266.29-1.013.99-1.013 2.415 0 1.424 1.037 2.8 1.181 2.993.145.193 2.041 3.117 4.944 4.373.69.299 1.229.478 1.648.611.693.22 1.325.19 1.824.115.557-.084 1.716-.7 1.958-1.374.242-.675.242-1.254.17-1.374-.073-.12-.266-.193-.556-.339z"/>
                      </svg>
                      AGENDAR AGORA
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* INFORMATION BLOCK */}
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-10 text-left">
                {/* Left Column: Address, Phone and Socials */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-gold" />
                      Onde Estamos
                    </h3>
                    <div className="text-zinc-300 text-sm leading-relaxed font-light">
                      <p className="font-bold text-base text-primary-gold mb-1">Barbearia Clube</p>
                      <p>Barbearia</p>
                      <p>Clube</p>
                      <p>Rua Jacarezinho, 21</p>
                      <p className="mt-1">Mercês — Curitiba, PR</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary-gold" />
                      Contato
                    </h3>
                    <div className="text-zinc-300 text-sm font-light space-y-1">
                      <p className="hover:text-primary-gold transition-colors duration-200">
                        <a href="tel:4130149413" className="flex items-center gap-2">
                          (41) 3014-9413
                        </a>
                      </p>
                      <p className="hover:text-primary-gold transition-colors duration-200">
                        <a href="tel:4130149413" className="flex items-center gap-2">
                          (41) 3014-9413
                        </a>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider mb-3">
                      Redes Sociais
                    </h3>
                    <div className="flex items-center gap-4">
                      {/* Instagram Icon */}
                      <motion.a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(212,175,55,0.15)" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary-gold hover:border-primary-gold/40 transition-colors"
                        title="Siga no Instagram"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </motion.a>

                      {/* WhatsApp Icon */}
                      <motion.a
                        href="https://wa.me/554130149413?text=Olá! Gostaria de agendar um horário."
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(212,175,55,0.15)" }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary-gold hover:border-primary-gold/40 transition-colors"
                        title="Fale no WhatsApp"
                      >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.661.988 3.291 1.472 4.96 1.473 5.433 0 9.851-4.388 9.855-9.782.002-2.614-1.011-5.071-2.855-6.918-1.844-1.847-4.295-2.864-6.911-2.865-5.438 0-9.855 4.388-9.86 9.782-.002 1.838.484 3.633 1.411 5.2l-.934 3.41 3.483-.909zm10.518-7.142c-.29-.145-1.716-.845-1.982-.941-.266-.096-.46-.145-.653.145-.193.29-.747.942-.916 1.135-.169.193-.338.217-.628.072-.29-.145-1.226-.452-2.335-1.442-.864-.77-1.447-1.721-1.616-2.011-.169-.29-.018-.447.127-.591.131-.13.29-.338.435-.507.145-.169.193-.29.29-.483.097-.193.048-.361-.024-.507-.072-.145-.653-1.573-.895-2.152-.236-.569-.475-.491-.653-.5-.169-.008-.362-.01-.556-.01-.193 0-.507.072-.772.361-.266.29-1.013.99-1.013 2.415 0 1.424 1.037 2.8 1.181 2.993.145.193 2.041 3.117 4.944 4.373.69.299 1.229.478 1.648.611.693.22 1.325.19 1.824.115.557-.084 1.716-.7 1.958-1.374.242-.675.242-1.254.17-1.374-.073-.12-.266-.193-.556-.339z"/>
                        </svg>
                      </motion.a>
                    </div>
                  </div>
                </div>

                {/* Right Column: Horários de Atendimento */}
                <div className="space-y-4">
                  <h3 className="font-heading font-extrabold text-xl text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3 sm:pb-4">
                    <Clock className="w-5 h-5 text-primary-gold" />
                    Horários de Atendimento
                  </h3>
                  <div className="divide-y divide-zinc-900 text-sm font-light">
                    <div className="flex justify-between py-2.5">
                      <span className="text-zinc-400">Segunda-feira</span>
                      <span className="text-white font-medium">13h00 — 19h00</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-zinc-400">Terça a Sexta</span>
                      <span className="text-white font-medium">09h00 — 19h00</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-zinc-400">Sábado</span>
                      <span className="text-white font-medium">09h00 — 17h00</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-zinc-400">Domingo</span>
                      <span className="text-red-400 font-bold uppercase text-xs tracking-wider">Fechado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Agendar Button linking to WhatsApp */}
              <div className="text-center pt-8">
                <motion.a
                  href="https://wa.me/554130149413?text=Olá! Gostaria de agendar um horário."
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(212,175,55,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-primary-gold to-amber-500 text-black font-heading font-extrabold text-sm tracking-wider uppercase px-8 py-4 rounded-xl shadow-[0_4px_15px_rgba(212,175,55,0.25)] transition-all duration-300 cursor-pointer font-bold no-underline"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.661.988 3.291 1.472 4.96 1.473 5.433 0 9.851-4.388 9.855-9.782.002-2.614-1.011-5.071-2.855-6.918-1.844-1.847-4.295-2.864-6.911-2.865-5.438 0-9.855 4.388-9.86 9.782-.002 1.838.484 3.633 1.411 5.2l-.934 3.41 3.483-.909zm10.518-7.142c-.29-.145-1.716-.845-1.982-.941-.266-.096-.46-.145-.653.145-.193.29-.747.942-.916 1.135-.169.193-.338.217-.628.072-.29-.145-1.226-.452-2.335-1.442-.864-.77-1.447-1.721-1.616-2.011-.169-.29-.018-.447.127-.591.131-.13.29-.338.435-.507.145-.169.193-.29.29-.483.097-.193.048-.361-.024-.507-.072-.145-.653-1.573-.895-2.152-.236-.569-.475-.491-.653-.5-.169-.008-.362-.01-.556-.01-.193 0-.507.072-.772.361-.266.29-1.013.99-1.013 2.415 0 1.424 1.037 2.8 1.181 2.993.145.193 2.041 3.117 4.944 4.373.69.299 1.229.478 1.648.611.693.22 1.325.19 1.824.115.557-.084 1.716-.7 1.958-1.374.242-.675.242-1.254.17-1.374-.073-.12-.266-.193-.556-.339z"/>
                  </svg>
                  AGENDAR AGORA
                </motion.a>
              </div>
            </section>

          </div>
        )}

        {/* ==========================================
            TAB: AGENDAR (WIZARD STEPS)
            ========================================== */}
        {activeTab === "agendar" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-extrabold text-white uppercase">Agendar Atendimento</h2>
              <p className="text-zinc-400 text-xs sm:text-sm">Siga as etapas para garantir seu horário</p>
              <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
            </div>

            {/* Wizard progress indicators */}
            <div className="relative flex items-center justify-between px-2 max-w-lg mx-auto">
              {/* Progress Line */}
              <div className="absolute left-6 right-6 top-4.5 h-[2px] bg-zinc-800 z-0">
                <div 
                  className="h-full bg-primary-gold transition-all duration-300" 
                  style={{ width: `${((bookingStep - 1) / 4) * 100}%` }}
                />
              </div>

              {[1, 2, 3, 4, 5].map((step) => {
                const stepLabels = ["Serviço", "Barbeiro", "Data", "Horário", "Revisão"];
                const isActive = bookingStep === step;
                const isCompleted = bookingStep > step;

                return (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs border transition-all duration-300 ${
                        isActive 
                          ? "bg-dark-card border-primary-gold text-primary-gold shadow-[0_0_10px_rgba(212,175,55,0.2)]" 
                          : isCompleted 
                            ? "bg-primary-gold border-primary-gold text-black" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-500"
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4 stroke-[3px]" /> : step}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] tracking-wide uppercase font-semibold mt-2 ${
                      isActive ? "text-primary-gold" : isCompleted ? "text-zinc-300" : "text-zinc-600"
                    }`}>
                      {stepLabels[step - 1]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Steps Container */}
            <div className="bg-dark-card border border-zinc-900 rounded-2xl p-6 sm:p-10 shadow-xl min-h-[380px] flex flex-col justify-between">
              
              {/* STEP 1: SELECT SERVICE */}
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
                    <Scissors className="w-5 h-5 text-primary-gold transform rotate-90" />
                    <h3 className="font-heading text-xl font-bold text-white uppercase">Selecione o Serviço</h3>
                  </div>

                  <div className="space-y-3">
                    {services.map((s) => (
                      <div 
                        key={s.id}
                        onClick={() => selectService(s)}
                        className={`border rounded-xl p-5 flex items-center justify-between cursor-pointer transition-all duration-200 group ${
                          bookingService?.id === s.id 
                            ? "border-primary-gold bg-primary-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.05)]" 
                            : "border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-heading text-lg font-bold text-white uppercase tracking-wide group-hover:text-primary-gold transition-colors">{s.nome}</h4>
                          <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-light">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            {s.duracao_minutos} min
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-heading text-xl font-bold text-primary-gold">
                            R$ {s.preco.toFixed(2).replace(".", ",")}
                          </span>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            bookingService?.id === s.id 
                              ? "bg-primary-gold border-primary-gold text-black" 
                              : "border-zinc-800 text-transparent"
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT BARBER */}
              {bookingStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
                    <User className="w-5 h-5 text-primary-gold" />
                    <h3 className="font-heading text-xl font-bold text-white uppercase">Selecione o Barbeiro</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sem Preferência */}
                    <div 
                      onClick={() => selectBarber({ id: "sem_preferencia", nome: "Sem Preferência" })}
                      className={`border rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[160px] ${
                        bookingBarber?.id === "sem_preferencia"
                          ? "border-primary-gold bg-primary-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                          : "border-zinc-850 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                        <Shuffle className="w-8 h-8" />
                      </div>
                      <h4 className="font-heading text-base font-bold text-white uppercase">Sem Preferência</h4>
                      <p className="text-[10px] text-zinc-500 font-light mt-1 max-w-[200px]">
                        Seleciona automaticamente o primeiro barbeiro livre no horário
                      </p>
                    </div>

                    {/* Barber cards */}
                    {BARBERS.map((b) => (
                      <div 
                        key={b.id}
                        onClick={() => selectBarber(b)}
                        className={`border rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[160px] ${
                          bookingBarber?.id === b.id
                            ? "border-primary-gold bg-primary-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                            : "border-zinc-850 hover:border-zinc-700 bg-zinc-950/40"
                        }`}
                      >
                        <img 
                          src={b.foto} 
                          alt={b.nome} 
                          className={`w-16 h-16 rounded-full object-cover border-2 mb-3 transition-transform duration-350 ${
                            bookingBarber?.id === b.id ? "border-primary-gold scale-105" : "border-zinc-800"
                          }`}
                        />
                        <h4 className="font-heading text-base font-bold text-white uppercase">{b.nome}</h4>
                        <span className="text-[10px] text-zinc-500 font-light mt-1 uppercase tracking-wider">Profissional Premium</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-start border-t border-zinc-850 pt-6 mt-4">
                    <button 
                      onClick={() => setBookingStep(1)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs uppercase font-heading font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Voltar para Serviços
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT DATE */}
              {bookingStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
                    <Calendar className="w-5 h-5 text-primary-gold" />
                    <h3 className="font-heading text-xl font-bold text-white uppercase">Selecione o Dia</h3>
                  </div>

                  <div className="max-w-md mx-auto space-y-5">
                    <div className="space-y-2">
                      <label className="text-zinc-400 font-heading text-xs tracking-wider uppercase font-bold">Data do Atendimento</label>
                      <input 
                        type="date" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-zinc-950 border border-zinc-850 text-white rounded-xl p-4 focus:outline-none focus:border-primary-gold text-sm tracking-wide transition-colors"
                      />
                    </div>

                    <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 space-y-2">
                      <h5 className="font-heading text-xs text-primary-gold tracking-wider uppercase font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Informações Úteis
                      </h5>
                      <ul className="text-[11px] text-zinc-500 space-y-1 font-light leading-relaxed list-disc list-inside">
                        <li>Funcionamos de <strong>Terça a Sábado das 09:00 às 20:00</strong>.</li>
                        <li>Estacionamento gratuito na frente para clientes.</li>
                        <li>Domingos e Segundas-feiras a barbearia permanece <strong>fechada</strong>.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-850 pt-6 mt-4">
                    <button 
                      onClick={() => setBookingStep(2)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs uppercase font-heading font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    <button 
                      onClick={validateAndProceedDate}
                      className="flex items-center gap-1.5 bg-primary-gold hover:bg-primary-gold/90 text-black py-2.5 px-5 rounded font-heading font-bold text-xs uppercase transition-all"
                    >
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: SELECT HOUR */}
              {bookingStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary-gold" />
                      <h3 className="font-heading text-xl font-bold text-white uppercase">Selecione o Horário</h3>
                    </div>
                    <span className="text-zinc-500 text-[10px] sm:text-xs font-light bg-zinc-950 px-3 py-1 rounded border border-zinc-900">
                      Dia: <strong className="text-zinc-300">{formatDateDisplay(bookingDate)}</strong>
                    </span>
                  </div>

                  {isLoadingSlots ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-primary-gold">
                      <div className="w-8 h-8 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
                      <span className="font-heading text-xs uppercase tracking-widest text-zinc-400">Analisando Agenda...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                      <h4 className="font-heading text-base font-bold text-white uppercase">Sem horários disponíveis</h4>
                      <p className="text-zinc-500 text-xs font-light max-w-xs mx-auto">
                        Infelizmente não há mais horários disponíveis com o profissional nesta data. Tente outra data ou barbeiro.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-zinc-500 text-xs font-light text-center">
                        Selecione um dos horários disponíveis abaixo:
                      </p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => selectTime(slot)}
                            className="bg-zinc-950 hover:bg-primary-gold hover:text-black border border-zinc-850 hover:border-primary-gold rounded-lg py-2.5 px-1 text-center font-heading text-base font-bold transition-all text-zinc-300"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-start border-t border-zinc-850 pt-6 mt-4">
                    <button 
                      onClick={() => setBookingStep(3)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs uppercase font-heading font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW TICKET */}
              {bookingStep === 5 && bookingService && bookingBarber && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-zinc-850 pb-4">
                    <Briefcase className="w-5 h-5 text-primary-gold" />
                    <h3 className="font-heading text-xl font-bold text-white uppercase">Revise seu Agendamento</h3>
                  </div>

                  {/* Vintage styled paper Ticket */}
                  <div className="relative bg-[#fbf9f3] text-zinc-800 rounded-lg p-6 sm:p-8 max-w-sm mx-auto shadow-2xl border border-[#ece3d3] before:absolute before:left-0 before:right-0 before:h-2 before:bg-[radial-gradient(circle_at_10px_-5px,transparent_10px,#fbf9f3_11px)] before:-top-1.5 after:absolute after:left-0 after:right-0 after:h-2 after:bg-[radial-gradient(circle_at_10px_13px,transparent_10px,#fbf9f3_11px)] after:-bottom-1.5">
                    <div className="text-center space-y-1 mb-6">
                      <h4 className="font-heading text-xl font-black text-zinc-700 tracking-[3px] uppercase">TICKET CLUBE</h4>
                      <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Comprovante de Reserva</p>
                      <div className="border-t border-dashed border-zinc-300 pt-2" />
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">SERVIÇO:</span>
                        <span className="font-bold text-zinc-800 uppercase">{bookingService.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">DURAÇÃO:</span>
                        <span className="font-bold text-zinc-800">{bookingService.duracao_minutos} minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">BARBEIRO:</span>
                        <span className="font-bold text-zinc-800 uppercase">{bookingBarber.nome}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">DATA:</span>
                        <span className="font-bold text-zinc-800">{formatDateDisplay(bookingDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">HORÁRIO:</span>
                        <span className="font-bold text-zinc-800">{bookingTime}h</span>
                      </div>
                      
                      <div className="border-t border-zinc-250 my-3" />
                      
                      <div className="flex justify-between items-center py-1">
                        <span className="text-zinc-700 font-extrabold text-xs uppercase tracking-widest">VALOR TOTAL:</span>
                        <span className="font-heading text-3xl font-black text-[#ab7a24]">
                          R$ {bookingService.preco.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>

                    <div className="text-center space-y-2 mt-8">
                      <p className="text-[9px] text-zinc-400 leading-tight">
                        O pagamento será realizado diretamente no balcão da barbearia após o serviço.
                      </p>
                      <div className="font-mono text-zinc-800 text-lg tracking-widest select-none leading-none pt-2 opacity-80">
                        |||||||||||||||||||||||||||||||||
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-850 pt-6 mt-6">
                    <button 
                      onClick={() => setBookingStep(4)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs uppercase font-heading font-bold"
                    >
                      <ChevronLeft className="w-4 h-4" /> Alterar Hora
                    </button>
                    <button 
                      onClick={handleConfirmBooking}
                      className="flex items-center gap-1.5 bg-primary-gold hover:bg-primary-gold/90 text-black py-2.5 px-6 rounded font-heading font-bold text-xs uppercase transition-all shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
                    >
                      Confirmar Reserva <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: BOOKING SUCCESS */}
              {bookingStep === 6 && bookingService && bookingBarber && (
                <div className="py-6 text-center space-y-8 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                    <Check className="w-8 h-8 stroke-[3px]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-heading text-3xl font-extrabold text-white uppercase">Agendamento Confirmado!</h3>
                    <p className="text-zinc-400 text-sm font-light max-w-md mx-auto">
                      Seu horário foi reservado com sucesso e está agendado no nosso sistema. Esperamos por você!
                    </p>
                  </div>

                  <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 max-w-sm mx-auto text-left space-y-2.5 text-xs">
                    <p className="border-b border-zinc-900 pb-2 text-zinc-300 flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider font-semibold">Serviço:</span> 
                      <strong className="text-primary-gold uppercase font-bold">{bookingService.nome}</strong>
                    </p>
                    <p className="border-b border-zinc-900 pb-2 text-zinc-300 flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider font-semibold">Barbeiro:</span> 
                      <strong className="text-zinc-300 uppercase font-bold">{bookingBarber.nome}</strong>
                    </p>
                    <p className="text-zinc-300 flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wider font-semibold">Data & Hora:</span> 
                      <strong className="text-zinc-300 uppercase font-bold">
                        {formatDateDisplay(bookingDate)} às {bookingTime}h
                      </strong>
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setActiveTab("meus-agendamentos")}
                      className="bg-primary-gold hover:bg-primary-gold/90 text-black font-heading font-bold text-xs py-2.5 px-5 rounded uppercase transition-all shadow-md"
                    >
                      Ver Meus Agendamentos
                    </button>
                    <button
                      onClick={resetBookingFlow}
                      className="border border-zinc-850 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300 font-heading font-bold text-xs py-2.5 px-5 rounded uppercase transition-all"
                    >
                      Fazer Outra Reserva
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: MEUS AGENDAMENTOS
            ========================================== */}
        {activeTab === "meus-agendamentos" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-extrabold text-white uppercase">Meus Agendamentos</h2>
              <p className="text-zinc-400 text-xs sm:text-sm">Consulte e gerencie seus horários reservados</p>
              <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
            </div>

            {currentUser ? (
              <div className="space-y-6">
                
                {/* Appointments inner sub-tabs */}
                <div className="flex border-b border-zinc-900 gap-4">
                  <button
                    onClick={() => setAppointmentsTab("futuros")}
                    className={`font-heading text-base tracking-wider uppercase font-bold py-3 px-1 border-b-2 transition-all ${
                      appointmentsTab === "futuros"
                        ? "text-primary-gold border-primary-gold"
                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                    }`}
                  >
                    Próximos Horários
                  </button>
                  <button
                    onClick={() => setAppointmentsTab("passados")}
                    className={`font-heading text-base tracking-wider uppercase font-bold py-3 px-1 border-b-2 transition-all ${
                      appointmentsTab === "passados"
                        ? "text-primary-gold border-primary-gold"
                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                    }`}
                  >
                    Histórico de Visitas
                  </button>
                </div>

                {/* Dashboard Lists */}
                <div className="space-y-4">
                  {(() => {
                    const userAppts = bookings.filter((b) => b.id_cliente === currentUser.id);
                    
                    // Sort chronologically
                    userAppts.sort((a, b) => {
                      if (a.data !== b.data) return a.data.localeCompare(b.data);
                      return a.horario.localeCompare(b.horario);
                    });

                    const nowStr = new Date().toISOString().split("T")[0];
                    const hourNow = `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`;

                    const splitList = userAppts.filter((b) => {
                      const isFutureDate = b.data > nowStr;
                      const isToday = b.data === nowStr;
                      const isFutureTime = b.horario >= hourNow;
                      const isUpcoming = (isFutureDate || (isToday && isFutureTime)) && b.status === "agendado";
                      
                      return appointmentsTab === "futuros" ? isUpcoming : !isUpcoming;
                    });

                    if (splitList.length === 0) {
                      return (
                        <div className="bg-dark-card border border-zinc-900 rounded-xl p-10 text-center space-y-4">
                          <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
                          <div>
                            <h4 className="font-heading text-base font-bold text-white uppercase">
                              Nenhum agendamento encontrado
                            </h4>
                            <p className="text-zinc-500 text-xs font-light max-w-xs mx-auto mt-1">
                              {appointmentsTab === "futuros"
                                ? "Você não tem horários reservados para os próximos dias."
                                : "Nenhum histórico ou cancelamento registrado até o momento."}
                            </p>
                          </div>
                          {appointmentsTab === "futuros" && (
                            <button
                              onClick={() => { setActiveTab("agendar"); resetBookingFlow(); }}
                              className="bg-primary-gold hover:bg-primary-gold/90 text-black py-2.5 px-5 rounded font-heading font-bold text-xs uppercase transition-all shadow-md mx-auto"
                            >
                              Agendar Agora
                            </button>
                          )}
                        </div>
                      );
                    }

                    return splitList.map((appt) => {
                      const service = services.find((s) => s.id === appt.id_servico);
                      const barber = BARBERS.find((b) => b.id === appt.id_barbeiro);
                      
                      return (
                        <div 
                          key={appt.id}
                          className="bg-dark-card border border-zinc-900 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-zinc-850 transition-colors shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                              <img 
                                src={barber?.foto || "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=200&h=200&fit=crop"} 
                                alt={barber?.nome} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-heading text-lg font-bold text-white uppercase">{service?.nome || "Serviço"}</h4>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-500 text-[11px] font-light">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-zinc-500" />
                                  Barbeiro: <strong className="text-zinc-400 font-semibold">{barber?.nome || "Profissional"}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-zinc-500" />
                                  Dia: <strong className="text-zinc-400 font-semibold">{formatDateDisplay(appt.data)}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-500" />
                                  Horário: <strong className="text-zinc-400 font-semibold">{appt.horario}h</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-zinc-850 pt-3 sm:pt-0">
                            <span className={`text-[10px] uppercase font-semibold tracking-wider py-1 px-2.5 rounded border ${
                              appt.status === "agendado"
                                ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                                : appt.status === "concluido"
                                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                  : "bg-red-500/10 border-red-500/25 text-red-400"
                            }`}>
                              {appt.status}
                            </span>
                            {appt.status === "agendado" && appointmentsTab === "futuros" && (
                              <button
                                onClick={() => handleCancelBooking(appt.id)}
                                className="flex items-center gap-1 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-[10px] font-heading font-bold uppercase py-1 px-3 rounded transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>
            ) : (
              // Locked Out state
              <div className="bg-dark-card border border-zinc-900 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-primary-gold/10 border border-primary-gold/20 flex items-center justify-center text-primary-gold mx-auto shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-bold text-white uppercase">Acesse sua Conta</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed max-w-sm mx-auto">
                    Para visualizar seus agendamentos passados, históricos de cortes ou gerenciar futuras reservas, conecte-se com sua conta.
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => { setAuthType("login"); setShowAuthModal(true); }}
                    className="bg-primary-gold hover:bg-primary-gold/90 text-black font-heading font-bold text-xs py-2.5 px-6 rounded uppercase transition-all shadow-md"
                  >
                    Fazer Login
                  </button>
                  <button
                    onClick={() => { setAuthType("register"); setShowAuthModal(true); }}
                    className="border border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 text-zinc-300 font-heading font-bold text-xs py-2.5 px-6 rounded uppercase transition-all"
                  >
                    Criar Conta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB: LOCALIZAÇÃO (MAP & DETAILS)
            ========================================== */}
        {activeTab === "localizacao" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-left">
            <div className="text-center">
              <h2 className="font-heading text-3xl font-extrabold text-white uppercase">Como Chegar</h2>
              <p className="text-zinc-400 text-xs sm:text-sm">Veja nossa localização no mapa e venha nos visitar</p>
              <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Maps embed */}
              <div className="md:col-span-7 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 shadow-xl">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.47352825838!2d-49.2965416!3d-25.4224056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce40915664be3%3A0xc3f95e28a5cf570f!2sR.%20Jacarezinho%2C%2021%20-%20Merc%C3%AAs%2C%20Curitiba%20-%20PR%2C%2080710-150!5e0!3m2!1spt-BR!2sbr!4v1688383920000!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="400" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Location details card */}
              <div className="md:col-span-5 bg-dark-card border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Endereço</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed">
                      Rua Jacarezinho, 21 — Mercês, Curitiba - PR, CEP 80710-150
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">WhatsApp / Telefone</h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-light">
                      (41) 3014-9413
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-gold/10 flex items-center justify-center text-primary-gold flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 w-full">
                    <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">Horários</h3>
                    <div className="text-zinc-400 text-xs sm:text-sm font-light space-y-1">
                      <p className="flex justify-between">
                        <span>Segunda-feira:</span>
                        <strong className="text-zinc-300">13h00 — 19h00</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Terça a Sexta:</span>
                        <strong className="text-zinc-300">09h00 — 19h00</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Sábado:</span>
                        <strong className="text-zinc-300">09h00 — 17h00</strong>
                      </p>
                      <p className="flex justify-between text-red-400">
                        <span>Domingo:</span>
                        <strong>Fechado</strong>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB: PORTAL DO BARBEIRO (DASHBOARD)
            ========================================== */}
        {activeTab === "dashboard" && (
          !isBarberAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto my-12"
            >
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-3xl p-8 shadow-2xl text-left space-y-6">
                <div className="text-center space-y-2">
                  <div className="mx-auto w-16 h-16 bg-primary-gold/10 border border-primary-gold/20 rounded-full flex items-center justify-center text-primary-gold mb-3 shadow-[0_0_15px_rgba(212,175,55,0.1)] animate-pulse">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-black text-white uppercase tracking-wider">Acesso Restrito</h3>
                  <p className="text-zinc-400 text-xs font-light">
                    Portal exclusivo para barbeiros e administração.
                  </p>
                  <div className="w-12 h-0.5 bg-primary-gold mx-auto mt-3 rounded" />
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (barberUsername.trim().toLowerCase() === "admin" && barberPassword === "1234") {
                    setIsBarberAuthenticated(true);
                    sessionStorage.setItem("dom_lucas_barber_authenticated", "true");
                    setBarberUsername("");
                    setBarberPassword("");
                    setBarberLoginError("");
                  } else {
                    setBarberLoginError("Usuário ou senha incorretos.");
                  }
                }} className="space-y-4">
                  {barberLoginError && (
                    <div className="p-3.5 bg-red-950/40 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{barberLoginError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest font-bold block">
                      Usuário / Código
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: admin"
                      value={barberUsername}
                      onChange={(e) => setBarberUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-800 text-white focus:outline-none transition-colors font-light"
                    />
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest font-bold block">
                      Senha de Acesso
                    </label>
                    <div className="relative">
                      <input
                        type={showBarberPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={barberPassword}
                        onChange={(e) => setBarberPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-850 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-800 text-white focus:outline-none transition-colors font-light"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBarberPassword(!showBarberPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                      >
                        {showBarberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary-gold hover:bg-primary-gold/90 text-black font-heading font-extrabold text-xs tracking-wider uppercase px-6 py-4 rounded-xl transition-all shadow-md cursor-pointer border-none mt-2"
                  >
                    <Lock className="w-4 h-4" />
                    Entrar no Painel
                  </button>
                </form>

                <div className="text-center text-[10px] text-zinc-600 bg-zinc-950/40 p-3.5 border border-zinc-900/60 rounded-xl space-y-1">
                  <p className="font-semibold uppercase tracking-wider text-zinc-500">Acesso de Demonstração</p>
                  <p>Código: <strong className="text-zinc-400 font-mono">admin</strong> &nbsp;|&nbsp; Senha: <strong className="text-zinc-400 font-mono">1234</strong></p>
                </div>
              </div>
            </motion.div>
          ) : (
            <BarberDashboard
              bookings={bookings}
              setBookings={setBookings}
              clients={clients}
              setClients={setClients}
              barbers={BARBERS}
              services={services}
              setServices={setServices}
              onBackToClient={() => {
                setIsBarberAuthenticated(false);
                sessionStorage.removeItem("dom_lucas_barber_authenticated");
                setActiveTab("inicio");
              }}
            />
          )
        )}

      </main>

      {/* ==========================================
          MOBILE BOTTOM NAVIGATION TAB BAR (Exclusiva mobile)
          ========================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-card border-t border-zinc-900 flex items-center justify-around z-40 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("inicio")}
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-zinc-500 transition-colors ${
            activeTab === "inicio" ? "text-primary-gold" : ""
          }`}
        >
          <House className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-heading">Início</span>
        </button>
        <button
          onClick={() => { setActiveTab("agendar"); resetBookingFlow(); }}
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-zinc-500 transition-colors ${
            activeTab === "agendar" ? "text-primary-gold" : ""
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-heading">Agendar</span>
        </button>
        <button
          onClick={() => setActiveTab("meus-agendamentos")}
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-zinc-500 transition-colors ${
            activeTab === "meus-agendamentos" ? "text-primary-gold" : ""
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-heading">Reservas</span>
        </button>
        <button
          onClick={() => setActiveTab("localizacao")}
          className={`flex flex-col items-center justify-center gap-1 w-1/4 h-full text-zinc-500 transition-colors ${
            activeTab === "localizacao" ? "text-primary-gold" : ""
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[9px] uppercase font-bold tracking-widest font-heading">Contato</span>
        </button>
      </nav>

      {/* ==========================================
          FOOTER GERAL
          ========================================== */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-10 text-center text-xs text-zinc-500 space-y-3 mt-auto mb-16 md:mb-0">
        <p>&copy; {new Date().getFullYear()} Barbearia Clube. Todos os direitos reservados.</p>
        <p className="font-heading uppercase tracking-widest text-[9px] text-zinc-600">
          Feito com 💈 e estilo premium para o bairro.
        </p>
        <div className="pt-2 border-t border-zinc-900/40 max-w-xs mx-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="text-[10px] uppercase font-heading tracking-widest text-zinc-600 hover:text-primary-gold transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <Shield className="w-3.5 h-3.5 text-primary-gold/60" /> Portal do Barbeiro 🔒
          </button>
        </div>
      </footer>

      {/* ==========================================
          MODAL: AUTENTICAÇÃO (LOGIN / REGISTRO)
          ========================================== */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAuthModal(false); setPendingConfirm(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-card border border-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold text-white uppercase">
                  {authType === "login" ? "Acessar Conta" : "Criar Nova Conta"}
                </h3>
                <button 
                  onClick={() => { setShowAuthModal(false); setPendingConfirm(false); }}
                  className="p-1 rounded-full hover:bg-zinc-850 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <div className="p-6 space-y-5">
                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-2 px-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authType === "login" ? (
                  /* LOGIN FORM */
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-heading text-[10px] tracking-wider uppercase font-bold">E-mail</label>
                      <input 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="exemplo@email.com" 
                        required
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-heading text-[10px] tracking-wider uppercase font-bold">Senha</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Digite sua senha" 
                          required
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary-gold transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary-gold hover:bg-primary-gold/90 text-black py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-all mt-2 flex items-center justify-center gap-2"
                    >
                      Entrar <ChevronRight className="w-4.5 h-4.5" />
                    </button>
                    
                    <p className="text-center text-xs text-zinc-500 font-light mt-4">
                      Não tem uma conta?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setAuthType("register"); setAuthError(""); }}
                        className="text-primary-gold font-bold hover:underline"
                      >
                        Cadastre-se aqui
                      </button>
                    </p>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-heading text-[10px] tracking-wider uppercase font-bold">Nome Completo</label>
                      <input 
                        type="text" 
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nome Sobrenome" 
                        required
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-heading text-[10px] tracking-wider uppercase font-bold">Telefone / WhatsApp</label>
                      <input 
                        type="tel" 
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="(11) 99999-9999" 
                        required
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-heading text-[10px] tracking-wider uppercase font-bold">E-mail</label>
                      <input 
                        type="email" 
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="exemplo@email.com" 
                        required
                        className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-gold transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-zinc-400 font-heading text-[10px] tracking-wider uppercase font-bold">Crie uma Senha</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres" 
                          required
                          minLength={6}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary-gold transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary-gold hover:bg-primary-gold/90 text-black py-3 rounded-xl font-heading font-bold text-sm uppercase tracking-wide transition-all mt-2 flex items-center justify-center gap-1.5"
                    >
                      Criar Conta <UserPlus className="w-4 h-4" />
                    </button>
                    
                    <p className="text-center text-xs text-zinc-500 font-light mt-4">
                      Já tem uma conta?{" "}
                      <button 
                        type="button" 
                        onClick={() => { setAuthType("login"); setAuthError(""); }}
                        className="text-primary-gold font-bold hover:underline"
                      >
                        Acesse aqui
                      </button>
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL: LIGHTBOX (GALERIA DETALHES)
          ========================================== */}
      <AnimatePresence>
        {lightboxItem && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxItem(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.93 }}
              className="relative max-w-2xl w-full flex flex-col items-center z-10"
            >
              <button 
                onClick={() => setLightboxItem(null)}
                className="absolute -top-12 right-0 text-white hover:text-primary-gold font-bold text-lg flex items-center gap-1.5 uppercase transition-colors"
              >
                <X className="w-5 h-5" /> Fechar
              </button>

              <img 
                src={lightboxItem.img} 
                alt={lightboxItem.title} 
                className="max-h-[70vh] rounded-2xl object-contain border border-zinc-900 shadow-2xl"
              />
              
              {lightboxItem.title && (
                <h4 className="font-heading text-xl tracking-[2px] font-extrabold text-primary-gold uppercase mt-6">
                  {lightboxItem.title}
                </h4>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
