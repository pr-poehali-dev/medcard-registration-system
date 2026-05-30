
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'doctor',
  created_at TEXT NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  birth_date TEXT DEFAULT '',
  gender TEXT DEFAULT 'male',
  snils TEXT DEFAULT '',
  policy_oms TEXT DEFAULT '',
  passport TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  blood_group TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  chronic_diseases TEXT DEFAULT '',
  registered_at TEXT NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT DEFAULT '',
  birth_date TEXT DEFAULT '',
  position TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  license_number TEXT DEFAULT '',
  snils TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  hire_date TEXT DEFAULT '',
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS examinations (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT DEFAULT '',
  type TEXT DEFAULT '',
  complaints TEXT DEFAULT '',
  anamnesis TEXT DEFAULT '',
  objective_status TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  icd_code TEXT DEFAULT '',
  recommendations TEXT DEFAULT '',
  prescriptions TEXT DEFAULT '',
  next_visit TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sick_leaves (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  number TEXT DEFAULT '',
  issue_date TEXT DEFAULT '',
  from_date TEXT DEFAULT '',
  to_date TEXT DEFAULT '',
  diagnosis TEXT DEFAULT '',
  icd_code TEXT DEFAULT '',
  employer TEXT DEFAULT '',
  reason TEXT DEFAULT '',
  status TEXT DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  type TEXT DEFAULT '',
  number TEXT DEFAULT '',
  issue_date TEXT DEFAULT '',
  purpose TEXT DEFAULT '',
  content TEXT DEFAULT ''
);

INSERT INTO users (id, login, password, name, role, created_at)
VALUES ('admin-001', 'admin', 'admin123', 'Администратор системы', 'admin', '2026-01-01')
ON CONFLICT (id) DO NOTHING;
