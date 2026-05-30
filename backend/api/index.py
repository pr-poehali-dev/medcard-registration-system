"""
МедЦентр — основной API для работы с медицинскими данными.
Поддерживает CRUD для пациентов, сотрудников, осмотров, больничных, справок и пользователей.
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    qs = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    # Route: /health
    if path == '/health':
        return ok({'status': 'ok'})

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # ── AUTH ─────────────────────────────────────────────────────
        if path == '/auth/login' and method == 'POST':
            cur.execute("SELECT * FROM users WHERE login = %s AND password = %s", (body.get('login'), body.get('password')))
            user = cur.fetchone()
            if not user:
                return err('Неверный логин или пароль', 401)
            return ok({'user': dict(user)})

        # ── USERS ─────────────────────────────────────────────────────
        elif path == '/users':
            if method == 'GET':
                cur.execute("SELECT * FROM users ORDER BY created_at")
                return ok([dict(r) for r in cur.fetchall()])
            elif method == 'POST':
                d = body
                cur.execute(
                    "INSERT INTO users (id, login, password, name, role, created_at) VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT (id) DO NOTHING RETURNING *",
                    (d['id'], d['login'], d['password'], d['name'], d['role'], d['createdAt'])
                )
                conn.commit()
                return ok(dict(cur.fetchone()) if cur.rowcount else {})

        elif path.startswith('/users/') and method == 'DELETE':
            uid = path.split('/')[-1]
            cur.execute("DELETE FROM users WHERE id = %s", (uid,))
            conn.commit()
            return ok({'deleted': uid})

        # ── PATIENTS ──────────────────────────────────────────────────
        elif path == '/patients':
            if method == 'GET':
                cur.execute("SELECT * FROM patients ORDER BY registered_at DESC")
                return ok([dict(r) for r in cur.fetchall()])
            elif method == 'POST':
                d = body
                cur.execute("""
                    INSERT INTO patients (id, last_name, first_name, middle_name, birth_date, gender,
                        snils, policy_oms, passport, address, phone, email, blood_group, allergies,
                        chronic_diseases, registered_at)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO UPDATE SET
                        last_name=EXCLUDED.last_name, first_name=EXCLUDED.first_name,
                        middle_name=EXCLUDED.middle_name, birth_date=EXCLUDED.birth_date,
                        gender=EXCLUDED.gender, snils=EXCLUDED.snils, policy_oms=EXCLUDED.policy_oms,
                        passport=EXCLUDED.passport, address=EXCLUDED.address, phone=EXCLUDED.phone,
                        email=EXCLUDED.email, blood_group=EXCLUDED.blood_group,
                        allergies=EXCLUDED.allergies, chronic_diseases=EXCLUDED.chronic_diseases
                    RETURNING *
                """, (d['id'], d['lastName'], d['firstName'], d.get('middleName',''),
                      d.get('birthDate',''), d.get('gender','male'), d.get('snils',''),
                      d.get('policyOms',''), d.get('passport',''), d.get('address',''),
                      d.get('phone',''), d.get('email',''), d.get('bloodGroup',''),
                      d.get('allergies',''), d.get('chronicDiseases',''), d.get('registeredAt','')))
                conn.commit()
                return ok(dict(cur.fetchone()))

        elif path.startswith('/patients/') and method == 'DELETE':
            pid = path.split('/')[-1]
            cur.execute("DELETE FROM patients WHERE id = %s", (pid,))
            conn.commit()
            return ok({'deleted': pid})

        # ── STAFF ─────────────────────────────────────────────────────
        elif path == '/staff':
            if method == 'GET':
                cur.execute("SELECT * FROM staff ORDER BY last_name")
                return ok([dict(r) for r in cur.fetchall()])
            elif method == 'POST':
                d = body
                cur.execute("""
                    INSERT INTO staff (id, last_name, first_name, middle_name, birth_date,
                        position, specialization, license_number, snils, phone, email, hire_date, status)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO UPDATE SET
                        last_name=EXCLUDED.last_name, first_name=EXCLUDED.first_name,
                        middle_name=EXCLUDED.middle_name, birth_date=EXCLUDED.birth_date,
                        position=EXCLUDED.position, specialization=EXCLUDED.specialization,
                        license_number=EXCLUDED.license_number, snils=EXCLUDED.snils,
                        phone=EXCLUDED.phone, email=EXCLUDED.email, hire_date=EXCLUDED.hire_date,
                        status=EXCLUDED.status
                    RETURNING *
                """, (d['id'], d['lastName'], d['firstName'], d.get('middleName',''),
                      d.get('birthDate',''), d.get('position',''), d.get('specialization',''),
                      d.get('licenseNumber',''), d.get('snils',''), d.get('phone',''),
                      d.get('email',''), d.get('hireDate',''), d.get('status','active')))
                conn.commit()
                return ok(dict(cur.fetchone()))

        elif path.startswith('/staff/') and method == 'DELETE':
            sid = path.split('/')[-1]
            cur.execute("DELETE FROM staff WHERE id = %s", (sid,))
            conn.commit()
            return ok({'deleted': sid})

        # ── EXAMINATIONS ──────────────────────────────────────────────
        elif path == '/examinations':
            if method == 'GET':
                cur.execute("SELECT * FROM examinations ORDER BY date DESC, time DESC")
                return ok([dict(r) for r in cur.fetchall()])
            elif method == 'POST':
                d = body
                cur.execute("""
                    INSERT INTO examinations (id, patient_id, doctor_id, date, time, type,
                        complaints, anamnesis, objective_status, diagnosis, icd_code,
                        recommendations, prescriptions, next_visit)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO UPDATE SET
                        patient_id=EXCLUDED.patient_id, doctor_id=EXCLUDED.doctor_id,
                        date=EXCLUDED.date, time=EXCLUDED.time, type=EXCLUDED.type,
                        complaints=EXCLUDED.complaints, anamnesis=EXCLUDED.anamnesis,
                        objective_status=EXCLUDED.objective_status, diagnosis=EXCLUDED.diagnosis,
                        icd_code=EXCLUDED.icd_code, recommendations=EXCLUDED.recommendations,
                        prescriptions=EXCLUDED.prescriptions, next_visit=EXCLUDED.next_visit
                    RETURNING *
                """, (d['id'], d['patientId'], d['doctorId'], d['date'], d.get('time',''),
                      d.get('type',''), d.get('complaints',''), d.get('anamnesis',''),
                      d.get('objectiveStatus',''), d.get('diagnosis',''), d.get('icdCode',''),
                      d.get('recommendations',''), d.get('prescriptions',''), d.get('nextVisit','')))
                conn.commit()
                return ok(dict(cur.fetchone()))

        elif path.startswith('/examinations/') and method == 'DELETE':
            eid = path.split('/')[-1]
            cur.execute("DELETE FROM examinations WHERE id = %s", (eid,))
            conn.commit()
            return ok({'deleted': eid})

        # ── SICK LEAVES ───────────────────────────────────────────────
        elif path == '/sick-leaves':
            if method == 'GET':
                cur.execute("SELECT * FROM sick_leaves ORDER BY issue_date DESC")
                return ok([dict(r) for r in cur.fetchall()])
            elif method == 'POST':
                d = body
                cur.execute("""
                    INSERT INTO sick_leaves (id, patient_id, doctor_id, number, issue_date,
                        from_date, to_date, diagnosis, icd_code, employer, reason, status)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO UPDATE SET
                        patient_id=EXCLUDED.patient_id, doctor_id=EXCLUDED.doctor_id,
                        number=EXCLUDED.number, issue_date=EXCLUDED.issue_date,
                        from_date=EXCLUDED.from_date, to_date=EXCLUDED.to_date,
                        diagnosis=EXCLUDED.diagnosis, icd_code=EXCLUDED.icd_code,
                        employer=EXCLUDED.employer, reason=EXCLUDED.reason, status=EXCLUDED.status
                    RETURNING *
                """, (d['id'], d['patientId'], d['doctorId'], d.get('number',''),
                      d.get('issueDate',''), d.get('fromDate',''), d.get('toDate',''),
                      d.get('diagnosis',''), d.get('icdCode',''), d.get('employer',''),
                      d.get('reason',''), d.get('status','open')))
                conn.commit()
                return ok(dict(cur.fetchone()))

        elif path.startswith('/sick-leaves/') and method == 'DELETE':
            slid = path.split('/')[-1]
            cur.execute("DELETE FROM sick_leaves WHERE id = %s", (slid,))
            conn.commit()
            return ok({'deleted': slid})

        # ── CERTIFICATES ──────────────────────────────────────────────
        elif path == '/certificates':
            if method == 'GET':
                cur.execute("SELECT * FROM certificates ORDER BY issue_date DESC")
                return ok([dict(r) for r in cur.fetchall()])
            elif method == 'POST':
                d = body
                cur.execute("""
                    INSERT INTO certificates (id, patient_id, doctor_id, type, number,
                        issue_date, purpose, content)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO NOTHING RETURNING *
                """, (d['id'], d['patientId'], d['doctorId'], d.get('type',''),
                      d.get('number',''), d.get('issueDate',''), d.get('purpose',''),
                      d.get('content','')))
                conn.commit()
                row = cur.fetchone()
                return ok(dict(row) if row else {})

        elif path.startswith('/certificates/') and method == 'DELETE':
            cid = path.split('/')[-1]
            cur.execute("DELETE FROM certificates WHERE id = %s", (cid,))
            conn.commit()
            return ok({'deleted': cid})

        return err('Not found', 404)

    except Exception as e:
        conn.rollback()
        return err(str(e), 500)
    finally:
        cur.close()
        conn.close()
