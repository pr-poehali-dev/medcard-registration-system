import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Patient, Staff, Examination, MedicalCard, SickLeave, Certificate } from '@/types/medical';

interface MedStore {
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  staff: Staff[];
  examinations: Examination[];
  medicalCards: MedicalCard[];
  sickLeaves: SickLeave[];
  certificates: Certificate[];

  login: (login: string, password: string) => boolean;
  logout: () => void;
  registerUser: (user: Omit<User, 'id' | 'createdAt'>) => void;

  addPatient: (p: Omit<Patient, 'id' | 'registeredAt'>) => void;
  updatePatient: (id: string, p: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  addStaff: (s: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, s: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  addExamination: (e: Omit<Examination, 'id'>) => void;
  updateExamination: (id: string, e: Partial<Examination>) => void;
  deleteExamination: (id: string) => void;

  addSickLeave: (s: Omit<SickLeave, 'id'>) => void;
  updateSickLeave: (id: string, s: Partial<SickLeave>) => void;
  deleteSickLeave: (id: string) => void;

  addCertificate: (c: Omit<Certificate, 'id'>) => void;
  deleteCertificate: (id: string) => void;

  getPatientCard: (patientId: string) => MedicalCard | undefined;
  ensurePatientCard: (patientId: string) => string;
}

const genId = () => Math.random().toString(36).slice(2, 10).toUpperCase();

const defaultAdmin: User = {
  id: 'admin-001',
  login: 'admin',
  password: 'admin123',
  name: 'Администратор системы',
  role: 'admin',
  createdAt: '2026-01-01',
};

export const useMedStore = create<MedStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [defaultAdmin],
      patients: [],
      staff: [],
      examinations: [],
      medicalCards: [],
      sickLeaves: [],
      certificates: [],

      login: (login, password) => {
        const user = get().users.find(u => u.login === login && u.password === password);
        if (user) { set({ currentUser: user }); return true; }
        return false;
      },

      logout: () => set({ currentUser: null }),

      registerUser: (userData) => {
        const user: User = { ...userData, id: genId(), createdAt: new Date().toISOString().split('T')[0] };
        set(s => ({ users: [...s.users, user] }));
      },

      addPatient: (p) => {
        const patient: Patient = { ...p, id: genId(), registeredAt: new Date().toISOString().split('T')[0] };
        set(s => ({ patients: [...s.patients, patient] }));
        get().ensurePatientCard(patient.id);
      },

      updatePatient: (id, p) => set(s => ({ patients: s.patients.map(x => x.id === id ? { ...x, ...p } : x) })),
      deletePatient: (id) => set(s => ({ patients: s.patients.filter(x => x.id !== id) })),

      addStaff: (s) => set(st => ({ staff: [...st.staff, { ...s, id: genId() }] })),
      updateStaff: (id, s) => set(st => ({ staff: st.staff.map(x => x.id === id ? { ...x, ...s } : x) })),
      deleteStaff: (id) => set(s => ({ staff: s.staff.filter(x => x.id !== id) })),

      addExamination: (e) => {
        const exam: Examination = { ...e, id: genId() };
        set(s => ({ examinations: [...s.examinations, exam] }));
        const cardId = get().ensurePatientCard(e.patientId);
        set(s => ({
          medicalCards: s.medicalCards.map(c =>
            c.id === cardId ? { ...c, examinations: [...c.examinations, exam] } : c
          )
        }));
      },

      updateExamination: (id, e) => set(s => ({ examinations: s.examinations.map(x => x.id === id ? { ...x, ...e } : x) })),
      deleteExamination: (id) => set(s => ({ examinations: s.examinations.filter(x => x.id !== id) })),

      addSickLeave: (sl) => set(s => ({ sickLeaves: [...s.sickLeaves, { ...sl, id: genId() }] })),
      updateSickLeave: (id, sl) => set(s => ({ sickLeaves: s.sickLeaves.map(x => x.id === id ? { ...x, ...sl } : x) })),
      deleteSickLeave: (id) => set(s => ({ sickLeaves: s.sickLeaves.filter(x => x.id !== id) })),

      addCertificate: (c) => set(s => ({ certificates: [...s.certificates, { ...c, id: genId() }] })),
      deleteCertificate: (id) => set(s => ({ certificates: s.certificates.filter(x => x.id !== id) })),

      getPatientCard: (patientId) => get().medicalCards.find(c => c.patientId === patientId),

      ensurePatientCard: (patientId) => {
        const existing = get().medicalCards.find(c => c.patientId === patientId);
        if (existing) return existing.id;
        const newCard: MedicalCard = {
          id: genId(),
          patientId,
          cardNumber: 'МК-' + genId(),
          createdAt: new Date().toISOString().split('T')[0],
          examinations: [],
        };
        set(s => ({ medicalCards: [...s.medicalCards, newCard] }));
        return newCard.id;
      },
    }),
    { name: 'medcenter-storage' }
  )
);