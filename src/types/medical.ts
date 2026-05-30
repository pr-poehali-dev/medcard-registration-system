export interface User {
  id: string;
  login: string;
  password: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'registrar';
  createdAt: string;
}

export interface Patient {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  gender: 'male' | 'female';
  snils: string;
  policyOms: string;
  passport: string;
  address: string;
  phone: string;
  email: string;
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string;
  registeredAt: string;
}

export interface Staff {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  position: string;
  specialization: string;
  licenseNumber: string;
  snils: string;
  phone: string;
  email: string;
  hireDate: string;
  status: 'active' | 'inactive';
}

export interface Examination {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: string;
  complaints: string;
  anamnesis: string;
  objectiveStatus: string;
  diagnosis: string;
  icdCode: string;
  recommendations: string;
  prescriptions: string;
  nextVisit: string;
}

export interface MedicalCard {
  id: string;
  patientId: string;
  cardNumber: string;
  createdAt: string;
  examinations: Examination[];
}

export interface SickLeave {
  id: string;
  patientId: string;
  doctorId: string;
  number: string;
  issueDate: string;
  fromDate: string;
  toDate: string;
  diagnosis: string;
  icdCode: string;
  employer: string;
  reason: string;
  status: 'open' | 'closed' | 'extended';
}

export interface Certificate {
  id: string;
  patientId: string;
  doctorId: string;
  type: string;
  number: string;
  issueDate: string;
  purpose: string;
  content: string;
}
