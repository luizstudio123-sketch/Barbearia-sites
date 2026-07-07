import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  writeBatch,
  query
} from "firebase/firestore";
import { Client, Booking, Service } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBYzJA5U7zsXSci7S4eezdFRLSTZweuCV8",
  authDomain: "gen-lang-client-0690354812.firebaseapp.com",
  projectId: "gen-lang-client-0690354812",
  storageBucket: "gen-lang-client-0690354812.firebasestorage.app",
  messagingSenderId: "698943074373",
  appId: "1:698943074373:web:c135fc18d549095605b32c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID from our config
export const db = getFirestore(app, "ai-studio-barbeariaclube-1d9cf544-f73f-4e7c-b97d-758785970978");

// Collection names
const CLIENTS_COLL = "clientes";
const BOOKINGS_COLL = "agendamentos";
const SERVICES_COLL = "servicos";

// Helper to save a single booking to Firestore
export async function saveBookingToFirestore(booking: Booking) {
  try {
    const docRef = doc(db, BOOKINGS_COLL, booking.id);
    await setDoc(docRef, booking);
  } catch (error) {
    console.error("Erro ao salvar agendamento no Firestore:", error);
  }
}

// Helper to save a single client to Firestore
export async function saveClientToFirestore(client: Client) {
  try {
    const docRef = doc(db, CLIENTS_COLL, client.id);
    await setDoc(docRef, client);
  } catch (error) {
    console.error("Erro ao salvar cliente no Firestore:", error);
  }
}

// Helper to save a single service to Firestore
export async function saveServiceToFirestore(service: Service) {
  try {
    const docRef = doc(db, SERVICES_COLL, service.id);
    await setDoc(docRef, service);
  } catch (error) {
    console.error("Erro ao salvar serviço no Firestore:", error);
  }
}

// Seed initial data if Firestore is empty
export async function seedFirestoreIfEmpty(
  defaultClients: Client[], 
  defaultBookings: Booking[],
  defaultServices?: Service[]
) {
  try {
    const clientsSnap = await getDocs(collection(db, CLIENTS_COLL));
    if (clientsSnap.empty && defaultClients.length > 0) {
      console.log("Seeding clients to Firestore...");
      const batch = writeBatch(db);
      defaultClients.forEach((client) => {
        const ref = doc(db, CLIENTS_COLL, client.id);
        batch.set(ref, client);
      });
      await batch.commit();
    }

    const bookingsSnap = await getDocs(collection(db, BOOKINGS_COLL));
    if (bookingsSnap.empty && defaultBookings.length > 0) {
      console.log("Seeding bookings to Firestore...");
      const batch = writeBatch(db);
      defaultBookings.forEach((booking) => {
        const ref = doc(db, BOOKINGS_COLL, booking.id);
        batch.set(ref, booking);
      });
      await batch.commit();
    }

    if (defaultServices && defaultServices.length > 0) {
      const servicesSnap = await getDocs(collection(db, SERVICES_COLL));
      if (servicesSnap.empty) {
        console.log("Seeding services to Firestore...");
        const batch = writeBatch(db);
        defaultServices.forEach((service) => {
          const ref = doc(db, SERVICES_COLL, service.id);
          batch.set(ref, service);
        });
        await batch.commit();
      }
    }
  } catch (error) {
    console.error("Erro ao semear dados no Firestore:", error);
  }
}

// Set up real-time listener for bookings
export function listenToBookings(onUpdate: (bookings: Booking[]) => void) {
  const q = query(collection(db, BOOKINGS_COLL));
  return onSnapshot(q, (snapshot) => {
    const bookings: Booking[] = [];
    snapshot.forEach((doc) => {
      bookings.push(doc.data() as Booking);
    });
    onUpdate(bookings);
  }, (error) => {
    console.error("Erro ao ouvir agendamentos no Firestore:", error);
  });
}

// Set up real-time listener for clients
export function listenToClients(onUpdate: (clients: Client[]) => void) {
  const q = query(collection(db, CLIENTS_COLL));
  return onSnapshot(q, (snapshot) => {
    const clients: Client[] = [];
    snapshot.forEach((doc) => {
      clients.push(doc.data() as Client);
    });
    onUpdate(clients);
  }, (error) => {
    console.error("Erro ao ouvir clientes no Firestore:", error);
  });
}

// Set up real-time listener for services
export function listenToServices(onUpdate: (services: Service[]) => void) {
  const q = query(collection(db, SERVICES_COLL));
  return onSnapshot(q, (snapshot) => {
    const services: Service[] = [];
    snapshot.forEach((doc) => {
      services.push(doc.data() as Service);
    });
    onUpdate(services);
  }, (error) => {
    console.error("Erro ao ouvir serviços no Firestore:", error);
  });
}
