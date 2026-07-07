import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scissors, 
  MapPin, 
  House, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Check, 
  X, 
  Trash2, 
  Search, 
  Plus, 
  Shield, 
  Sliders, 
  AlertCircle,
  Sparkles,
  Share2,
  Copy,
  TrendingUp,
  Users,
  Coins
} from "lucide-react";
import { Service, Barber, Client, Booking } from "../types";
import { saveBookingToFirestore, saveClientToFirestore, saveServiceToFirestore } from "../lib/firebase";

interface BarberDashboardProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  barbers: Barber[];
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onBackToClient: () => void;
}

export default function BarberDashboard({
  bookings,
  setBookings,
  clients,
  setClients,
  barbers,
  services,
  setServices,
  onBackToClient
}: BarberDashboardProps) {
  // Local state for filters
  const [selectedBarber, setSelectedBarber] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Active dashboard view tab
  const [activeSubTab, setActiveSubTab] = useState<"agenda" | "walkin" | "equipe" | "clientes" | "servicos">("agenda");

  // Form states for manual Walk-in booking
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInService, setWalkInService] = useState(services[0]?.id || "");
  const [walkInBarber, setWalkInBarber] = useState(barbers[0]?.id || "");
  const [walkInTime, setWalkInTime] = useState("10:00");
  const [walkInDate, setWalkInDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [walkInSuccess, setWalkInSuccess] = useState(false);
  const [walkInError, setWalkInError] = useState("");

  // New Client Search Query
  const [clientSearch, setClientSearch] = useState("");

  // New Service states
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30");
  const [serviceSuccess, setServiceSuccess] = useState(false);
  const [serviceError, setServiceError] = useState("");

  // Copied share feedback
  const [shareCopied, setShareCopied] = useState(false);

  // Barbers availability mock toggle state
  const [barberStatus, setBarberStatus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    barbers.forEach((b) => {
      initial[b.id] = b.ativo;
    });
    return initial;
  });

  // Toggle barber availability
  const handleToggleBarber = (barberId: string) => {
    setBarberStatus((prev) => ({
      ...prev,
      [barberId]: !prev[barberId]
    }));
  };

  // Status handlers
  const handleUpdateStatus = (bookingId: string, newStatus: Booking["status"]) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const updatedBooking: Booking = { ...booking, status: newStatus };
    saveBookingToFirestore(updatedBooking);

    // If moving to completed, we can increment client visits
    if (newStatus === "concluido" && booking.status !== "concluido") {
      const client = clients.find((c) => c.id === booking.id_cliente);
      if (client) {
        const updatedClient: Client = {
          ...client,
          quantidade_visitas: client.quantidade_visitas + 1,
          ultima_visita: new Date().toISOString().split("T")[0]
        };
        saveClientToFirestore(updatedClient);
      }
    }
  };

  // Walk-in client submission
  const handleCreateWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      setWalkInError("Por favor, preencha o nome do cliente.");
      return;
    }

    // Find or create Client
    const normalizedPhone = walkInPhone.replace(/\D/g, "");
    let client = clients.find(
      (c) => c.nome.toLowerCase() === walkInName.trim().toLowerCase() || (normalizedPhone && c.telefone.replace(/\D/g, "") === normalizedPhone)
    );

    let clientId = client?.id;

    if (!client) {
      clientId = "cli_walkin_" + Date.now();
      const newClient: Client = {
        id: clientId,
        nome: walkInName.trim(),
        telefone: walkInPhone.trim() || "(41) 99999-9999",
        email: `${walkInName.trim().toLowerCase().replace(/\s+/g, "")}@walkin.com`,
        quantidade_visitas: 1,
        ultima_visita: walkInDate,
        criado_em: new Date().toISOString()
      };
      saveClientToFirestore(newClient);
    }

    // Create Booking
    const newBooking: Booking = {
      id: "appt_walkin_" + Date.now(),
      id_cliente: clientId!,
      id_servico: walkInService,
      id_barbeiro: walkInBarber,
      data: walkInDate,
      horario: walkInTime,
      status: "agendado",
      criado_em: new Date().toISOString()
    };

    saveBookingToFirestore(newBooking);
    setWalkInSuccess(true);
    setWalkInError("");
    
    // Reset form fields
    setWalkInName("");
    setWalkInPhone("");
    setTimeout(() => {
      setWalkInSuccess(false);
      setActiveSubTab("agenda");
    }, 2000);
  };

  // Helper to resolve client info
  const getClientInfo = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) return client;
    // Fallback if missing
    return {
      nome: "Cliente Avulso",
      telefone: "(Sem número)",
      email: ""
    };
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Date filter
    if (selectedDate && b.data !== selectedDate) return false;

    // Barber filter
    if (selectedBarber !== "todos" && b.id_barbeiro !== selectedBarber) return false;

    // Status filter
    if (selectedStatus !== "todos" && b.status !== selectedStatus) return false;

    // Search query (client name or phone)
    if (searchQuery) {
      const client = getClientInfo(b.id_cliente);
      const nameMatch = client.nome.toLowerCase().includes(searchQuery);
      const phoneMatch = client.telefone.includes(searchQuery);
      if (!nameMatch && !phoneMatch) return false;
    }

    return true;
  });

  // Sort filtered bookings by time chronologically
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return a.horario.localeCompare(b.horario);
  });

  // Calculate high-level stats for selected date & barber
  const statsBookings = bookings.filter((b) => {
    if (selectedDate && b.data !== selectedDate) return false;
    if (selectedBarber !== "todos" && b.id_barbeiro !== selectedBarber) return false;
    return true;
  });

  // TODAY'S BOOKINGS & STATS
  const todayStr = new Date().toISOString().split("T")[0];
  const bookingsToday = bookings.filter((b) => b.data === todayStr);
  const completedToday = bookingsToday.filter((b) => b.status === "concluido");
  const pendingToday = bookingsToday.filter((b) => b.status === "agendado");
  const absentToday = bookingsToday.filter((b) => b.status === "nao_compareceu");

  const revenueToday = completedToday.reduce((sum, b) => {
    const svc = services.find((s) => s.id === b.id_servico);
    return sum + (svc?.preco || 0);
  }, 0);

  const projectedRevenueToday = pendingToday.reduce((sum, b) => {
    const svc = services.find((s) => s.id === b.id_servico);
    return sum + (svc?.preco || 0);
  }, 0);

  // THIS MONTH'S BOOKINGS & STATS
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  const bookingsMonth = bookings.filter((b) => b.data.startsWith(currentMonthPrefix));
  const completedMonth = bookingsMonth.filter((b) => b.status === "concluido");
  const pendingMonth = bookingsMonth.filter((b) => b.status === "agendado");
  const absentMonth = bookingsMonth.filter((b) => b.status === "nao_compareceu");

  const revenueMonth = completedMonth.reduce((sum, b) => {
    const svc = services.find((s) => s.id === b.id_servico);
    return sum + (svc?.preco || 0);
  }, 0);

  const handleCopyShareLink = () => {
    const link = "https://barbeariaclub.netlify.app/";
    navigator.clipboard.writeText(link).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }).catch((err) => {
      console.error("Erro ao copiar link:", err);
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn text-zinc-100 max-w-7xl mx-auto px-1 sm:px-4 pb-16">
      
      {/* HEADER PORTAL BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-zinc-950 via-[#0b0c10] to-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-2xl gap-6">
        <div className="space-y-1.5 text-left flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary-gold/10 text-primary-gold text-[10px] font-heading font-bold uppercase tracking-[3px] px-2.5 py-1 rounded-full border border-primary-gold/20 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Painel de Controle
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
            Portal da Equipe Dom Lucas
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-light">
            Gerenciamento em tempo real de horários, faturamento e fluxo de clientes.
          </p>
        </div>
        
        {/* SHARE SITE ACTION SECTION */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-zinc-950/60 border border-zinc-900/80 rounded-xl px-4 py-2 flex items-center justify-between gap-3 text-left">
            <div className="space-y-0.5">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Link para Clientes</span>
              <p className="text-xs font-mono text-zinc-300">barbeariaclub.netlify.app</p>
            </div>
            <button
              onClick={handleCopyShareLink}
              className={`p-2 rounded-lg transition-all ${
                shareCopied 
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40" 
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700"
              } border`}
              title="Copiar Link"
            >
              {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={onBackToClient}
            className="flex items-center justify-center gap-2 border border-zinc-800 hover:border-zinc-700 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 font-heading font-bold text-xs py-3 px-5 rounded-xl uppercase transition-all duration-200"
          >
            <House className="w-4 h-4" />
            Ir para o Site
          </button>
        </div>
      </div>

      {/* METRICS GRID - DIARIO E MENSAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* DAILY BOOKINGS CARD */}
        <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-1 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-12 h-12 text-primary-gold" />
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-heading uppercase tracking-wider block">Agendamentos Hoje</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-white font-heading">{bookingsToday.length}</span>
            <span className="text-[10px] text-zinc-500 font-light">({pendingToday.length} pendentes)</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-light pt-2 border-t border-zinc-900/60 flex justify-between">
            <span>Concluídos: <strong className="text-emerald-400">{completedToday.length}</strong></span>
            <span>Faltas: <strong className="text-red-400">{absentToday.length}</strong></span>
          </div>
        </div>

        {/* DAILY REVENUE CARD */}
        <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-1 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Coins className="w-12 h-12 text-emerald-400" />
          </div>
          <span className="text-[10px] sm:text-xs text-emerald-400/80 font-heading uppercase tracking-wider block">Faturamento Hoje</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-zinc-500">R$</span>
            <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-heading">
              {revenueToday.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-light pt-2 border-t border-zinc-900/60">
            Projetado: <strong>R$ {(revenueToday + projectedRevenueToday).toFixed(2).replace(".", ",")}</strong>
          </p>
        </div>

        {/* MONTHLY BOOKINGS CARD */}
        <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-1 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-12 h-12 text-blue-400" />
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-heading uppercase tracking-wider block">Agendamentos no Mês</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-white font-heading">{bookingsMonth.length}</span>
            <span className="text-[10px] text-zinc-500 font-light">({pendingMonth.length} ativos)</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-light pt-2 border-t border-zinc-900/60 flex justify-between">
            <span>Atendidos: <strong className="text-blue-400">{completedMonth.length}</strong></span>
            <span>Faltas: <strong className="text-zinc-500">{absentMonth.length}</strong></span>
          </div>
        </div>

        {/* MONTHLY REVENUE CARD */}
        <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-5 shadow-lg space-y-1 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-amber-400" />
          </div>
          <span className="text-[10px] sm:text-xs text-amber-400/85 font-heading uppercase tracking-wider block">Faturamento no Mês</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-zinc-500">R$</span>
            <span className="text-2xl sm:text-4xl font-black text-amber-400 font-heading">
              {revenueMonth.toFixed(2).replace(".", ",")}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-light pt-2 border-t border-zinc-900/60">
            Faturamento acumulado de serviços concluídos este mês.
          </p>
        </div>

      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-zinc-900 gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("agenda")}
          className={`flex items-center gap-2 px-5 py-3.5 font-heading text-xs tracking-wider uppercase font-extrabold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeSubTab === "agenda"
              ? "text-primary-gold border-primary-gold bg-primary-gold/5"
              : "text-zinc-400 hover:text-white border-transparent bg-transparent"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Agenda de Serviços
        </button>
        <button
          onClick={() => setActiveSubTab("walkin")}
          className={`flex items-center gap-2 px-5 py-3.5 font-heading text-xs tracking-wider uppercase font-extrabold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeSubTab === "walkin"
              ? "text-primary-gold border-primary-gold bg-primary-gold/5"
              : "text-zinc-400 hover:text-white border-transparent bg-transparent"
          }`}
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento (Balcão)
        </button>
        <button
          onClick={() => setActiveSubTab("equipe")}
          className={`flex items-center gap-2 px-5 py-3.5 font-heading text-xs tracking-wider uppercase font-extrabold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeSubTab === "equipe"
              ? "text-primary-gold border-primary-gold bg-primary-gold/5"
              : "text-zinc-400 hover:text-white border-transparent bg-transparent"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Equipe e Status
        </button>
        <button
          onClick={() => setActiveSubTab("clientes")}
          className={`flex items-center gap-2 px-5 py-3.5 font-heading text-xs tracking-wider uppercase font-extrabold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeSubTab === "clientes"
              ? "text-primary-gold border-primary-gold bg-primary-gold/5"
              : "text-zinc-400 hover:text-white border-transparent bg-transparent"
          }`}
        >
          <Users className="w-4 h-4" />
          Clientes Cadastrados
        </button>
        <button
          onClick={() => setActiveSubTab("servicos")}
          className={`flex items-center gap-2 px-5 py-3.5 font-heading text-xs tracking-wider uppercase font-extrabold border-b-2 transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeSubTab === "servicos"
              ? "text-primary-gold border-primary-gold bg-primary-gold/5"
              : "text-zinc-400 hover:text-white border-transparent bg-transparent"
          }`}
        >
          <Scissors className="w-4 h-4" />
          Gerenciar Serviços
        </button>
      </div>

      {/* SUB-TABS VIEWS */}
      <AnimatePresence mode="wait">
        
        {/* SUB-TAB 1: AGENDA DE SERVICOS */}
        {activeSubTab === "agenda" && (
          <motion.div
            key="agenda"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* SEARCH AND FILTERS PANEL */}
            <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-5 shadow-md space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                
                {/* Search query */}
                <div className="space-y-1.5 text-left">
                  <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Buscar Cliente</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Nome ou telefone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-600 focus:outline-none text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Date Filter */}
                <div className="space-y-1.5 text-left">
                  <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Data da Agenda</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                  />
                </div>

                {/* Barber Filter */}
                <div className="space-y-1.5 text-left">
                  <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Profissional</label>
                  <select
                    value={selectedBarber}
                    onChange={(e) => setSelectedBarber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                  >
                    <option value="todos">Todos os Barbeiros</option>
                    {barbers.map((b) => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5 text-left">
                  <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="agendado">Agendados</option>
                    <option value="concluido">Concluídos</option>
                    <option value="nao_compareceu">Não Compareceram</option>
                    <option value="cancelado">Cancelados</option>
                  </select>
                </div>

              </div>
            </div>

            {/* APPOINTMENTS LIST CONTAINER */}
            <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl overflow-hidden shadow-xl text-left">
              <div className="px-5 py-4 border-b border-zinc-900 bg-zinc-950/40 flex justify-between items-center">
                <h3 className="font-heading font-extrabold text-sm text-white uppercase tracking-wider">
                  Listagem de Agendamentos ({sortedBookings.length})
                </h3>
                <span className="text-zinc-500 text-xs font-mono">
                  {selectedDate ? selectedDate.split("-").reverse().join("/") : "Todas as Datas"}
                </span>
              </div>

              {sortedBookings.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto" />
                  <div>
                    <h4 className="font-heading text-base font-bold text-white uppercase">Nenhum agendamento listado</h4>
                    <p className="text-zinc-500 text-xs font-light max-w-xs mx-auto mt-1">
                      Não encontramos reservas correspondentes aos filtros selecionados.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900">
                  {sortedBookings.map((appt) => {
                    const client = getClientInfo(appt.id_cliente);
                    const service = services.find((s) => s.id === appt.id_servico);
                    const barber = barbers.find((b) => b.id === appt.id_barbeiro);

                    return (
                      <div 
                        key={appt.id} 
                        className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-zinc-900/10 transition-colors"
                      >
                        {/* Time & Client info */}
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col items-center justify-center font-heading flex-shrink-0 text-center shadow-inner">
                            <span className="text-lg font-black text-primary-gold leading-none">{appt.horario}</span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-wider">Hora</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-white font-heading font-extrabold text-sm sm:text-base uppercase flex items-center gap-2">
                              {client.nome}
                              {appt.id_cliente.includes("walkin") && (
                                <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[8px] uppercase font-bold px-1.5 py-0.5 rounded">Balcão</span>
                              )}
                            </h4>
                            
                            <p className="text-zinc-400 text-xs font-light flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-zinc-600" />
                              <a href={`tel:${client.telefone.replace(/\D/g, "")}`} className="hover:text-primary-gold transition-colors">{client.telefone}</a>
                            </p>
                            
                            {/* Service and Barber badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] px-2.5 py-1 rounded-md font-medium uppercase">
                                ✂️ {service?.nome || "Serviço"} — R$ {service?.preco.toFixed(2).replace(".", ",")}
                              </span>
                              <span className="bg-zinc-950 border border-zinc-900 text-zinc-400 text-[10px] px-2.5 py-1 rounded-md font-medium uppercase">
                                🧔 Barbeiro: {barber?.nome.split(" ")[0] || "Sem Pref."}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge & Management controls */}
                        <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 border-zinc-900/60 pt-3 sm:pt-0">
                          
                          {/* Status Badge */}
                          <div>
                            {appt.status === "agendado" && (
                              <span className="bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-bold font-heading uppercase tracking-wide px-3 py-1 rounded-full">
                                Agendado
                              </span>
                            )}
                            {appt.status === "concluido" && (
                              <span className="bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold font-heading uppercase tracking-wide px-3 py-1 rounded-full">
                                Concluído
                              </span>
                            )}
                            {appt.status === "nao_compareceu" && (
                              <span className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold font-heading uppercase tracking-wide px-3 py-1 rounded-full">
                                Não Compareceu
                              </span>
                            )}
                            {appt.status === "cancelado" && (
                              <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold font-heading uppercase tracking-wide px-3 py-1 rounded-full">
                                Cancelado
                              </span>
                            )}
                          </div>

                          {/* Quick Actions (only for pending schedule) */}
                          {appt.status === "agendado" && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "concluido")}
                                className="p-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800/40 hover:border-emerald-700/60 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                                title="Concluir Serviço"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "nao_compareceu")}
                                className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
                                title="Marcar falta"
                              >
                                <User className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt.id, "cancelado")}
                                className="p-2 bg-red-950/40 hover:bg-red-950 border border-red-900/30 hover:border-red-900/60 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                title="Cancelar Agendamento"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {/* Actions if completed / missed to allow rolling back if mistake */}
                          {appt.status !== "agendado" && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "agendado")}
                              className="text-zinc-500 hover:text-zinc-300 text-[10px] underline uppercase tracking-wider font-bold"
                            >
                              Reativar Horário
                            </button>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-TAB 2: REGISTRAR WALK-IN (MANUAL) */}
        {activeSubTab === "walkin" && (
          <motion.div
            key="walkin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-xl text-left space-y-6">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">
                  Agendar Cliente Balcão (Walk-in)
                </h3>
                <p className="text-zinc-400 text-xs font-light mt-1">
                  Use esse formulário para agendar clientes diretamente do balcão ou que ligaram solicitando reserva imediata.
                </p>
                <div className="w-12 h-0.5 bg-primary-gold mt-3 rounded" />
              </div>

              {walkInSuccess ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base font-heading uppercase">Cliente Agendado com Sucesso!</h4>
                    <p className="text-zinc-400 text-xs font-light mt-1">
                      Agendamento inserido na lista da equipe. Retornando para a agenda...
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleCreateWalkIn} className="space-y-4">
                  
                  {walkInError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{walkInError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Client Name */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Nome do Cliente *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pedro Henrique"
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-700 focus:outline-none text-white transition-colors"
                      />
                    </div>

                    {/* Client Phone */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Telefone de Contato</label>
                      <input
                        type="tel"
                        placeholder="Ex: (41) 99999-9999"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-700 focus:outline-none text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Service selection */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Serviço Desejado</label>
                      <select
                        value={walkInService}
                        onChange={(e) => setWalkInService(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nome} — R$ {s.preco.toFixed(2).replace(".", ",")}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Barber selection */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Barbeiro Responsável</label>
                      <select
                        value={walkInBarber}
                        onChange={(e) => setWalkInBarber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                      >
                        {barbers.map((b) => (
                          <option key={b.id} value={b.id}>{b.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date select */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Data do Atendimento</label>
                      <input
                        type="date"
                        value={walkInDate}
                        onChange={(e) => setWalkInDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                      />
                    </div>

                    {/* Time select */}
                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">Horário</label>
                      <select
                        value={walkInTime}
                        onChange={(e) => setWalkInTime(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                      >
                        {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"].map((time) => (
                          <option key={time} value={time}>{time}h</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 text-right">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-primary-gold hover:bg-primary-gold/90 text-black font-heading font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer border-none"
                    >
                      <Plus className="w-4 h-4" />
                      Inserir Agendamento
                    </button>
                  </div>

                </form>
              )}
            </div>
          </motion.div>
        )}

        {/* SUB-TAB 3: EQUIPE E STATUS */}
        {activeSubTab === "equipe" && (
          <motion.div
            key="equipe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          >
            {barbers.map((b) => {
              const active = barberStatus[b.id] ?? true;
              const barberBookings = bookings.filter(
                (book) => book.id_barbeiro === b.id && book.data === selectedDate && book.status === "agendado"
              );

              return (
                <div 
                  key={b.id} 
                  className={`bg-[#0b0c10] border rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-300 ${
                    active ? "border-zinc-900 hover:border-primary-gold/20" : "border-zinc-900/50 opacity-60"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={b.foto} 
                        alt={b.nome} 
                        referrerPolicy="no-referrer"
                        className={`w-14 h-14 rounded-full object-cover border-2 transition-colors duration-300 ${
                          active ? "border-primary-gold" : "border-zinc-800"
                        }`}
                      />
                      <div>
                        <h4 className="font-heading font-extrabold text-base text-white uppercase">{b.nome}</h4>
                        <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest block">Barbeiro Sênior</span>
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900/60 space-y-1">
                      <div className="flex justify-between text-xs font-light text-zinc-400">
                        <span>Horários hoje ({selectedDate.split("-").reverse().join("/")}):</span>
                        <strong className="text-white">{barberBookings.length} agendados</strong>
                      </div>
                      <div className="flex gap-1 pt-2 flex-wrap">
                        {barberBookings.length === 0 ? (
                          <span className="text-[10px] text-zinc-600 italic">Nenhum horário hoje</span>
                        ) : (
                          barberBookings.map((bk) => (
                            <span key={bk.id} className="bg-primary-gold/10 border border-primary-gold/20 text-primary-gold text-[9px] font-bold px-1.5 py-0.5 rounded">
                              {bk.horario}h
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-900 pt-4 mt-5">
                    <span className="text-xs font-light text-zinc-400">Disponibilidade hoje:</span>
                    <button
                      onClick={() => handleToggleBarber(b.id)}
                      className={`px-3 py-1.5 rounded-lg font-heading text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                        active 
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900" 
                          : "bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-950"
                      }`}
                    >
                      {active ? "🟢 Disponível" : "🔴 Fora de Escala"}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* SUB-TAB 4: CLIENTES CADASTRADOS */}
        {activeSubTab === "clientes" && (
          <motion.div
            key="clientes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 text-left"
          >
            <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">
                    Clientes Cadastrados
                  </h3>
                  <p className="text-zinc-400 text-xs font-light mt-1">
                    Visualize o histórico de visitas e informações de contato de todos os clientes registrados.
                  </p>
                  <div className="w-12 h-0.5 bg-primary-gold mt-3 rounded" />
                </div>
                
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-600">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar nome ou telefone..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-xs placeholder-zinc-700 focus:outline-none text-white transition-colors"
                  />
                </div>
              </div>

              {/* Clients Grid */}
              {(() => {
                const searchLower = clientSearch.toLowerCase();
                const filteredClients = clients.filter((c) => {
                  return c.nome.toLowerCase().includes(searchLower) || c.telefone.includes(searchLower) || (c.email && c.email.toLowerCase().includes(searchLower));
                });

                if (filteredClients.length === 0) {
                  return (
                    <div className="py-12 text-center text-zinc-500 text-sm italic">
                      Nenhum cliente encontrado para "{clientSearch}"
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((c) => {
                      // Count total bookings for this client
                      const clientBookingsCount = bookings.filter((b) => b.id_cliente === c.id).length;
                      const completedCount = bookings.filter((b) => b.id_cliente === c.id && b.status === "concluido").length;
                      
                      // Determine client category
                      let badge = "Bronze";
                      let badgeStyle = "bg-zinc-900 text-zinc-400 border-zinc-800";
                      if (completedCount >= 6) {
                        badge = "VIP Ouro";
                        badgeStyle = "bg-amber-400/10 text-amber-400 border-amber-400/20";
                      } else if (completedCount >= 3) {
                        badge = "Frequente Prata";
                        badgeStyle = "bg-zinc-300/10 text-zinc-300 border-zinc-300/20";
                      }

                      return (
                        <div 
                          key={c.id}
                          className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800/80 transition-colors flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-heading font-extrabold text-white text-base truncate uppercase pr-2">
                                {c.nome}
                              </h4>
                              <span className={`text-[9px] font-heading font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                                {badge}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs font-light text-zinc-400">
                              <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                                <span>{c.telefone}</span>
                              </p>
                              {c.email && (
                                <p className="flex items-center gap-2">
                                  <span className="text-zinc-600 font-bold font-mono">@</span>
                                  <span className="truncate">{c.email}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-900 text-center">
                            <div className="bg-zinc-900/40 rounded-lg p-2 border border-zinc-900/60">
                              <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Visitas</span>
                              <strong className="text-sm font-heading font-extrabold text-white">{completedCount}</strong>
                              <span className="text-[8px] text-zinc-500 block">({clientBookingsCount} total)</span>
                            </div>
                            <div className="bg-zinc-900/40 rounded-lg p-2 border border-zinc-900/60 flex flex-col justify-center">
                              <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Última Visita</span>
                              <strong className="text-[11px] font-heading font-extrabold text-zinc-300 mt-1">
                                {c.ultima_visita ? c.ultima_visita.split("-").reverse().join("/") : "Sem registro"}
                              </strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

            </div>
          </motion.div>
        )}

        {/* SUB-TAB 5: GERENCIAR SERVIÇOS */}
        {activeSubTab === "servicos" && (
          <motion.div
            key="servicos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left"
          >
            {/* Form Column */}
            <div className="lg:col-span-1">
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">
                    Novo Serviço
                  </h3>
                  <p className="text-zinc-400 text-xs font-light mt-1">
                    Adicione um novo serviço de barbearia oferecido aos clientes.
                  </p>
                  <div className="w-12 h-0.5 bg-primary-gold mt-3 rounded" />
                </div>

                {serviceSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl p-5 text-center space-y-2"
                  >
                    <Check className="w-8 h-8 mx-auto text-emerald-400 bg-emerald-500/10 p-1 border border-emerald-400/20 rounded-full" />
                    <h4 className="font-bold text-sm font-heading uppercase">Serviço Adicionado!</h4>
                    <p className="text-zinc-400 text-xs font-light">
                      O serviço já está disponível para agendamento.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newServiceName.trim()) {
                      setServiceError("O nome do serviço é obrigatório.");
                      return;
                    }
                    const priceVal = parseFloat(newServicePrice.replace(",", "."));
                    if (isNaN(priceVal) || priceVal <= 0) {
                      setServiceError("Preço inválido.");
                      return;
                    }

                    const newService: Service = {
                      id: "svc-" + Date.now(),
                      nome: newServiceName.trim(),
                      preco: priceVal,
                      duracao_minutos: parseInt(newServiceDuration, 10) || 30,
                      ativo: true
                    };

                    setServices((prev) => [...prev, newService]);
                    saveServiceToFirestore(newService);

                    setNewServiceName("");
                    setNewServicePrice("");
                    setNewServiceDuration("30");
                    setServiceError("");
                    setServiceSuccess(true);
                    setTimeout(() => setServiceSuccess(false), 3000);
                  }} className="space-y-4">
                    {serviceError && (
                      <div className="p-3 bg-red-950/40 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{serviceError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">
                        Nome do Serviço *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Alinhamento de Barba"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-700 focus:outline-none text-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">
                          Preço (R$) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 35,00"
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm placeholder-zinc-700 focus:outline-none text-white transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-zinc-500 text-[10px] uppercase font-heading tracking-widest block font-bold">
                          Duração *
                        </label>
                        <select
                          value={newServiceDuration}
                          onChange={(e) => setNewServiceDuration(e.target.value)}
                          className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 focus:border-primary-gold rounded-xl text-sm focus:outline-none text-white transition-colors"
                        >
                          <option value="15">15 minutos</option>
                          <option value="30">30 minutos</option>
                          <option value="45">45 minutos</option>
                          <option value="60">1 hora</option>
                          <option value="90">1h30</option>
                          <option value="120">2 horas</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary-gold hover:bg-primary-gold/90 text-black font-heading font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 rounded-xl transition-all shadow-md cursor-pointer border-none"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Serviço
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Services List Column */}
            <div className="lg:col-span-2">
              <div className="bg-[#0b0c10] border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">
                    Serviços Oferecidos
                  </h3>
                  <p className="text-zinc-400 text-xs font-light mt-1">
                    Ative, desative ou visualize as informações de todos os serviços de barbearia registrados.
                  </p>
                  <div className="w-12 h-0.5 bg-primary-gold mt-3 rounded" />
                </div>

                <div className="space-y-3">
                  {services.map((s) => {
                    return (
                      <div 
                        key={s.id}
                        className={`bg-zinc-950 border rounded-xl p-5 flex items-center justify-between transition-all duration-300 ${
                          s.ativo ? "border-zinc-900" : "border-zinc-950 opacity-50"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-heading font-extrabold text-base text-white uppercase">{s.nome}</h4>
                          <div className="flex gap-4 text-xs font-light text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-600" />
                              {s.duracao_minutos} min
                            </span>
                            <span className="text-primary-gold font-bold">
                              R$ {s.preco.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>

                        <div>
                          <button
                            onClick={() => {
                              const updatedServices = services.map((item) => {
                                if (item.id === s.id) {
                                  const updated = { ...item, ativo: !item.ativo };
                                  saveServiceToFirestore(updated);
                                  return updated;
                                  }
                                return item;
                              });
                              setServices(updatedServices);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-heading text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                              s.ativo 
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900" 
                                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-850"
                            }`}
                          >
                            {s.ativo ? "🟢 Ativo" : "⚫ Inativo"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
