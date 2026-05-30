const BASE = 'https://functions.poehali.dev/d22fa025-ab9d-4b00-b0dd-429a8729e021';

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data as T;
}

// Helpers
const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, 'POST', body);
const del = <T>(path: string) => request<T>(path, 'DELETE');

// ── Auth ──────────────────────────────────────────────────────────
export const apiLogin = (login: string, password: string) =>
  post<{ user: Record<string, string> }>('/auth/login', { login, password });

// ── Users ─────────────────────────────────────────────────────────
export const apiGetUsers = () => get<Record<string, string>[]>('/users');
export const apiCreateUser = (u: Record<string, string>) => post<Record<string, string>>('/users', u);
export const apiDeleteUser = (id: string) => del(`/users/${id}`);

// ── Patients ──────────────────────────────────────────────────────
export const apiGetPatients = () => get<Record<string, string>[]>('/patients');
export const apiSavePatient = (p: Record<string, string>) => post<Record<string, string>>('/patients', p);
export const apiDeletePatient = (id: string) => del(`/patients/${id}`);

// ── Staff ─────────────────────────────────────────────────────────
export const apiGetStaff = () => get<Record<string, string>[]>('/staff');
export const apiSaveStaff = (s: Record<string, string>) => post<Record<string, string>>('/staff', s);
export const apiDeleteStaff = (id: string) => del(`/staff/${id}`);

// ── Examinations ──────────────────────────────────────────────────
export const apiGetExaminations = () => get<Record<string, string>[]>('/examinations');
export const apiSaveExamination = (e: Record<string, string>) => post<Record<string, string>>('/examinations', e);
export const apiDeleteExamination = (id: string) => del(`/examinations/${id}`);

// ── Sick Leaves ───────────────────────────────────────────────────
export const apiGetSickLeaves = () => get<Record<string, string>[]>('/sick-leaves');
export const apiSaveSickLeave = (s: Record<string, string>) => post<Record<string, string>>('/sick-leaves', s);
export const apiDeleteSickLeave = (id: string) => del(`/sick-leaves/${id}`);

// ── Certificates ──────────────────────────────────────────────────
export const apiGetCertificates = () => get<Record<string, string>[]>('/certificates');
export const apiSaveCertificate = (c: Record<string, string>) => post<Record<string, string>>('/certificates', c);
export const apiDeleteCertificate = (id: string) => del(`/certificates/${id}`);
