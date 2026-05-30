import { create } from 'zustand';
import type { User, Patient, Staff, Examination, MedicalCard, SickLeave, Certificate } from '@/types/medical';
import {
  apiLogin, apiGetUsers, apiCreateUser, apiDeleteUser,
  apiGetPatients, apiSavePatient, apiDeletePatient,
  apiGetStaff, apiSaveStaff, apiDeleteStaff,
  apiGetExaminations, apiSaveExamination, apiDeleteExamination,
  apiGetSickLeaves, apiSaveSickLeave, apiDeleteSickLeave,
  apiGetCertificates, apiSaveCertificate, apiDeleteCertificate,
} from '@/api/client';

const genId = () => Math.random().toString(36).slice(2, 10).toUpperCase();

// DB row → frontend object mappers
const mapUser = (r: Record<string, string>): User => ({
  id: r.id, login: r.login, password: r.password,
  name: r.name, role: r.role as User['role'], createdAt: r.created_at,
});
const mapPatient = (r: Record<string, string>): Patient => ({
  id: r.id, lastName: r.last_name, firstName: r.first_name, middleName: r.middle_name,
  birthDate: r.birth_date, gender: r.gender as 'male' | 'female', snils: r.snils,
  policyOms: r.policy_oms, passport: r.passport, address: r.address, phone: r.phone,
  email: r.email, bloodGroup: r.blood_group, allergies: r.allergies,
  chronicDiseases: r.chronic_diseases, registeredAt: r.registered_at,
});
const mapStaff = (r: Record<string, string>): Staff => ({
  id: r.id, lastName: r.last_name, firstName: r.first_name, middleName: r.middle_name,
  birthDate: r.birth_date, position: r.position, specialization: r.specialization,
  licenseNumber: r.license_number, snils: r.snils, phone: r.phone, email: r.email,
  hireDate: r.hire_date, status: r.status as 'active' | 'inactive',
});
const mapExamination = (r: Record<string, string>): Examination => ({
  id: r.id, patientId: r.patient_id, doctorId: r.doctor_id, date: r.date, time: r.time,
  type: r.type, complaints: r.complaints, anamnesis: r.anamnesis,
  objectiveStatus: r.objective_status, diagnosis: r.diagnosis, icdCode: r.icd_code,
  recommendations: r.recommendations, prescriptions: r.prescriptions, nextVisit: r.next_visit,
});
const mapSickLeave = (r: Record<string, string>): SickLeave => ({
  id: r.id, patientId: r.patient_id, doctorId: r.doctor_id, number: r.number,
  issueDate: r.issue_date, fromDate: r.from_date, toDate: r.to_date,
  diagnosis: r.diagnosis, icdCode: r.icd_code, employer: r.employer,
  reason: r.reason, status: r.status as SickLeave['status'],
});
const mapCertificate = (r: Record<string, string>): Certificate => ({
  id: r.id, patientId: r.patient_id, doctorId: r.doctor_id,
  type: r.type, number: r.number, issueDate: r.issue_date,
  purpose: r.purpose, content: r.content,
});

interface MedStore {
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  staff: Staff[];
  examinations: Examination[];
  medicalCards: MedicalCard[];
  sickLeaves: SickLeave[];
  certificates: Certificate[];
  loading: boolean;

  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadAll: () => Promise<void>;

  registerUser: (u: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addPatient: (p: Omit<Patient, 'id' | 'registeredAt'>) => Promise<void>;
  updatePatient: (id: string, p: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;

  addStaff: (s: Omit<Staff, 'id'>) => Promise<void>;
  updateStaff: (id: string, s: Partial<Staff>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;

  addExamination: (e: Omit<Examination, 'id'>) => Promise<void>;
  updateExamination: (id: string, e: Partial<Examination>) => Promise<void>;
  deleteExamination: (id: string) => Promise<void>;

  addSickLeave: (s: Omit<SickLeave, 'id'>) => Promise<void>;
  updateSickLeave: (id: string, s: Partial<SickLeave>) => Promise<void>;
  deleteSickLeave: (id: string) => Promise<void>;

  addCertificate: (c: Omit<Certificate, 'id'>) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;

  getPatientCard: (patientId: string) => MedicalCard | undefined;
  ensurePatientCard: (patientId: string) => string;
}

const buildCards = (patients: Patient[], examinations: Examination[]): MedicalCard[] =>
  patients.map(p => ({
    id: 'card-' + p.id,
    patientId: p.id,
    cardNumber: 'МК-' + p.id.slice(0, 6),
    createdAt: p.registeredAt,
    examinations: examinations.filter(e => e.patientId === p.id),
  }));

export const useMedStore = create<MedStore>()((set, get) => ({
  currentUser: null,
  users: [],
  patients: [],
  staff: [],
  examinations: [],
  medicalCards: [],
  sickLeaves: [],
  certificates: [],
  loading: false,

  login: async (login, password) => {
    try {
      const { user } = await apiLogin(login, password);
      const mapped = mapUser(user);
      set({ currentUser: mapped });
      await get().loadAll();
      return true;
    } catch {
      return false;
    }
  },

  logout: () => set({
    currentUser: null, users: [], patients: [], staff: [],
    examinations: [], medicalCards: [], sickLeaves: [], certificates: [],
  }),

  loadAll: async () => {
    set({ loading: true });
    const [users, patients, staff, examinations, sickLeaves, certificates] = await Promise.all([
      apiGetUsers().then(r => r.map(mapUser)),
      apiGetPatients().then(r => r.map(mapPatient)),
      apiGetStaff().then(r => r.map(mapStaff)),
      apiGetExaminations().then(r => r.map(mapExamination)),
      apiGetSickLeaves().then(r => r.map(mapSickLeave)),
      apiGetCertificates().then(r => r.map(mapCertificate)),
    ]);
    set({ users, patients, staff, examinations, sickLeaves, certificates, loading: false,
      medicalCards: buildCards(patients, examinations) });
  },

  registerUser: async (userData) => {
    const id = genId();
    const createdAt = new Date().toISOString().split('T')[0];
    await apiCreateUser({ id, login: userData.login, password: userData.password, name: userData.name, role: userData.role, createdAt });
    const user: User = { ...userData, id, createdAt };
    set(s => ({ users: [...s.users, user] }));
  },

  deleteUser: async (id) => {
    await apiDeleteUser(id);
    set(s => ({ users: s.users.filter(u => u.id !== id) }));
  },

  addPatient: async (p) => {
    const id = genId();
    const registeredAt = new Date().toISOString().split('T')[0];
    const patient: Patient = { ...p, id, registeredAt };
    await apiSavePatient({
      id, lastName: p.lastName, firstName: p.firstName, middleName: p.middleName,
      birthDate: p.birthDate, gender: p.gender, snils: p.snils, policyOms: p.policyOms,
      passport: p.passport, address: p.address, phone: p.phone, email: p.email,
      bloodGroup: p.bloodGroup, allergies: p.allergies, chronicDiseases: p.chronicDiseases,
      registeredAt,
    });
    set(s => {
      const patients = [...s.patients, patient];
      return { patients, medicalCards: buildCards(patients, s.examinations) };
    });
  },

  updatePatient: async (id, p) => {
    const cur = get().patients.find(x => x.id === id);
    if (!cur) return;
    const updated = { ...cur, ...p };
    await apiSavePatient({
      id, lastName: updated.lastName, firstName: updated.firstName, middleName: updated.middleName,
      birthDate: updated.birthDate, gender: updated.gender, snils: updated.snils, policyOms: updated.policyOms,
      passport: updated.passport, address: updated.address, phone: updated.phone, email: updated.email,
      bloodGroup: updated.bloodGroup, allergies: updated.allergies, chronicDiseases: updated.chronicDiseases,
      registeredAt: updated.registeredAt,
    });
    set(s => {
      const patients = s.patients.map(x => x.id === id ? updated : x);
      return { patients, medicalCards: buildCards(patients, s.examinations) };
    });
  },

  deletePatient: async (id) => {
    await apiDeletePatient(id);
    set(s => {
      const patients = s.patients.filter(x => x.id !== id);
      return { patients, medicalCards: buildCards(patients, s.examinations) };
    });
  },

  addStaff: async (s) => {
    const id = genId();
    const member: Staff = { ...s, id };
    await apiSaveStaff({
      id, lastName: s.lastName, firstName: s.firstName, middleName: s.middleName,
      birthDate: s.birthDate, position: s.position, specialization: s.specialization,
      licenseNumber: s.licenseNumber, snils: s.snils, phone: s.phone, email: s.email,
      hireDate: s.hireDate, status: s.status,
    });
    set(st => ({ staff: [...st.staff, member] }));
  },

  updateStaff: async (id, s) => {
    const cur = get().staff.find(x => x.id === id);
    if (!cur) return;
    const updated = { ...cur, ...s };
    await apiSaveStaff({
      id, lastName: updated.lastName, firstName: updated.firstName, middleName: updated.middleName,
      birthDate: updated.birthDate, position: updated.position, specialization: updated.specialization,
      licenseNumber: updated.licenseNumber, snils: updated.snils, phone: updated.phone, email: updated.email,
      hireDate: updated.hireDate, status: updated.status,
    });
    set(st => ({ staff: st.staff.map(x => x.id === id ? updated : x) }));
  },

  deleteStaff: async (id) => {
    await apiDeleteStaff(id);
    set(s => ({ staff: s.staff.filter(x => x.id !== id) }));
  },

  addExamination: async (e) => {
    const id = genId();
    const exam: Examination = { ...e, id };
    await apiSaveExamination({
      id, patientId: e.patientId, doctorId: e.doctorId, date: e.date, time: e.time,
      type: e.type, complaints: e.complaints, anamnesis: e.anamnesis,
      objectiveStatus: e.objectiveStatus, diagnosis: e.diagnosis, icdCode: e.icdCode,
      recommendations: e.recommendations, prescriptions: e.prescriptions, nextVisit: e.nextVisit,
    });
    set(s => {
      const examinations = [...s.examinations, exam];
      return { examinations, medicalCards: buildCards(s.patients, examinations) };
    });
  },

  updateExamination: async (id, e) => {
    const cur = get().examinations.find(x => x.id === id);
    if (!cur) return;
    const updated = { ...cur, ...e };
    await apiSaveExamination({
      id, patientId: updated.patientId, doctorId: updated.doctorId, date: updated.date,
      time: updated.time, type: updated.type, complaints: updated.complaints,
      anamnesis: updated.anamnesis, objectiveStatus: updated.objectiveStatus,
      diagnosis: updated.diagnosis, icdCode: updated.icdCode,
      recommendations: updated.recommendations, prescriptions: updated.prescriptions,
      nextVisit: updated.nextVisit,
    });
    set(s => {
      const examinations = s.examinations.map(x => x.id === id ? updated : x);
      return { examinations, medicalCards: buildCards(s.patients, examinations) };
    });
  },

  deleteExamination: async (id) => {
    await apiDeleteExamination(id);
    set(s => {
      const examinations = s.examinations.filter(x => x.id !== id);
      return { examinations, medicalCards: buildCards(s.patients, examinations) };
    });
  },

  addSickLeave: async (sl) => {
    const id = genId();
    const item: SickLeave = { ...sl, id };
    await apiSaveSickLeave({
      id, patientId: sl.patientId, doctorId: sl.doctorId, number: sl.number,
      issueDate: sl.issueDate, fromDate: sl.fromDate, toDate: sl.toDate,
      diagnosis: sl.diagnosis, icdCode: sl.icdCode, employer: sl.employer,
      reason: sl.reason, status: sl.status,
    });
    set(s => ({ sickLeaves: [...s.sickLeaves, item] }));
  },

  updateSickLeave: async (id, sl) => {
    const cur = get().sickLeaves.find(x => x.id === id);
    if (!cur) return;
    const updated = { ...cur, ...sl };
    await apiSaveSickLeave({
      id, patientId: updated.patientId, doctorId: updated.doctorId, number: updated.number,
      issueDate: updated.issueDate, fromDate: updated.fromDate, toDate: updated.toDate,
      diagnosis: updated.diagnosis, icdCode: updated.icdCode, employer: updated.employer,
      reason: updated.reason, status: updated.status,
    });
    set(s => ({ sickLeaves: s.sickLeaves.map(x => x.id === id ? updated : x) }));
  },

  deleteSickLeave: async (id) => {
    await apiDeleteSickLeave(id);
    set(s => ({ sickLeaves: s.sickLeaves.filter(x => x.id !== id) }));
  },

  addCertificate: async (c) => {
    const id = genId();
    const item: Certificate = { ...c, id };
    await apiSaveCertificate({
      id, patientId: c.patientId, doctorId: c.doctorId, type: c.type,
      number: c.number, issueDate: c.issueDate, purpose: c.purpose, content: c.content,
    });
    set(s => ({ certificates: [...s.certificates, item] }));
  },

  deleteCertificate: async (id) => {
    await apiDeleteCertificate(id);
    set(s => ({ certificates: s.certificates.filter(x => x.id !== id) }));
  },

  getPatientCard: (patientId) => get().medicalCards.find(c => c.patientId === patientId),

  ensurePatientCard: (patientId) => {
    const existing = get().medicalCards.find(c => c.patientId === patientId);
    return existing ? existing.id : 'card-' + patientId;
  },
}));
