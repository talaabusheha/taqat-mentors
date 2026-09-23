import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { INITIAL_STUDENTS, INITIAL_SESSIONS, INITIAL_ATTENDANCE } from './mockData'

const STORAGE_KEYS = {
  STUDENTS: 'taqat_students_v1',
  SESSIONS: 'taqat_sessions_v1',
  ATTENDANCE: 'taqat_attendance_v1',
  AUTH: 'taqat_admin_auth_v1'
}

// LocalStorage Helper Layer
const getLocalData = (key, initial) => {
  const data = localStorage.getItem(key)
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
  }
  return JSON.parse(data)
}

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// Data API Layer
export const dataService = {
  // Auth Check
  async loginAdmin(username, password) {
    // Attempt Supabase Auth login if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password
        })
        if (error) throw error
        if (data?.user) {
          localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data.user))
        }
        return data
      } catch (err) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
      }
    }

    throw new Error('لم يتم إعداد اتصال Supabase أو بيانات الدخول غير صحيحة')
  },

  getCurrentAdmin() {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH)
    return auth ? JSON.parse(auth) : null
  },

  logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.AUTH)
  },

  // 1. Students Management
  async getStudents() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('full_name', { ascending: true })
      if (error) throw error
      return data
    } else {
      return getLocalData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
    }
  },

  async addStudent(student) {
    if (student.phone) {
      const cleanPhone = student.phone.toString().trim().replace(/\D/g, '')
      if (cleanPhone) {
        const existingStudents = await this.getStudents()
        const foundPhone = existingStudents.find(s => s.phone && s.phone.toString().trim().replace(/\D/g, '') === cleanPhone)
        if (foundPhone) {
          throw new Error(`رقم الهاتف (${student.phone}) مسجل بالفعل باسم الطالب "${foundPhone.full_name}".`)
        }
      }
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('students').insert([student]).select()
      if (error) throw error
      return data[0]
    } else {
      const students = getLocalData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
      const newStudent = {
        ...student,
        id: student.id || `std-${Date.now()}`,
        passcode: student.passcode || student.student_code?.replace('STU-', '') || '1234',
        is_active: true
      }
      const updated = [newStudent, ...students]
      setLocalData(STORAGE_KEYS.STUDENTS, updated)
      return newStudent
    }
  },

  async registerStudentSelf({ full_name, email, phone }) {
    if (!phone || !phone.trim()) {
      throw new Error('يرجى أدخال رقم الجوال لإكمال التسجيل.')
    }

    const students = await this.getStudents()
    const cleanPhone = phone.toString().trim().replace(/\D/g, '')
    
    if (cleanPhone) {
      const existing = students.find(s => s.phone && s.phone.toString().trim().replace(/\D/g, '') === cleanPhone)
      if (existing) {
        throw new Error(`عذراً، رقم الجوال (${phone}) مسجل بالفعل باسم الطالب "${existing.full_name}". يرجى اختيار اسمك من قائمة المسجلين.`)
      }
    }

    // Generate a 4-digit unique passcode (e.g., 4829)
    let randomPin = ''
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 100) {
      randomPin = Math.floor(1000 + Math.random() * 9000).toString()
      isUnique = !students.some(s => (s.passcode === randomPin || s.student_code === `STU-${randomPin}`))
      attempts++
    }
    const studentCode = `STU-${randomPin}`

    const newStudent = {
      full_name,
      email: email || '',
      phone: phone || '',
      student_code: studentCode,
      passcode: randomPin,
      is_active: true
    }

    const created = await this.addStudent(newStudent)
    return { ...created, pin: randomPin }
  },

  async bulkAddStudents(studentsList) {
    const existingStudents = await this.getStudents()
    const existingPhones = new Set(
      existingStudents.map(s => s.phone ? s.phone.toString().trim().replace(/\D/g, '') : '').filter(Boolean)
    )

    const uniqueList = []
    const duplicateList = []

    for (let i = 0; i < studentsList.length; i++) {
      const st = studentsList[i]
      const cleanP = st.phone ? st.phone.toString().trim().replace(/\D/g, '') : ''
      if (cleanP && existingPhones.has(cleanP)) {
        duplicateList.push(st.full_name || st.phone)
      } else {
        if (cleanP) existingPhones.add(cleanP)
        uniqueList.push(st)
      }
    }

    if (uniqueList.length === 0) {
      throw new Error(`جميع الأسماء/الأرقام في القائمة مسجلة بالفعل (${duplicateList.join(', ')})`)
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('students').insert(uniqueList).select()
      if (error) throw error
      return data
    } else {
      const students = getLocalData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
      const formatted = uniqueList.map((st, i) => ({
        id: st.id || `std-${Date.now()}-${i}`,
        full_name: st.full_name,
        email: st.email || '',
        phone: st.phone || '',
        student_code: st.student_code || `STU-${1000 + students.length + i + 1}`,
        is_active: true
      }))
      const updated = [...formatted, ...students]
      setLocalData(STORAGE_KEYS.STUDENTS, updated)
      return formatted
    }
  },

  async deleteStudent(studentId) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('students').delete().eq('id', studentId)
      if (error) throw error
    } else {
      const students = getLocalData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
      const updated = students.filter(s => s.id !== studentId)
      setLocalData(STORAGE_KEYS.STUDENTS, updated)
    }
  },

  async clearAllStudents() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
    } else {
      setLocalData(STORAGE_KEYS.STUDENTS, [])
    }
  },

  // 2. Sessions Management
  async getSessions() {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    } else {
      return getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
    }
  },

  async getSessionById(sessionId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('sessions').select('*').eq('id', sessionId).maybeSingle()
      if (!error && data) return data
      const sessions = await this.getSessions()
      return sessions.find(s => s.id === sessionId) || null
    } else {
      const sessions = await this.getSessions()
      return sessions.find(s => s.id === sessionId) || null
    }
  },

  async createSession(sessionData) {
    const qrToken = sessionData.qr_code_token || `TAQAT-QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    const sessionPayload = {
      ...sessionData,
      status: sessionData.status || 'ACTIVE',
      qr_code_token: qrToken
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('sessions').insert([sessionPayload]).select()
      if (error) throw error
      return data[0]
    } else {
      const sessions = getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
      const newSession = {
        ...sessionPayload,
        id: `sess-${Date.now()}`
      }
      const updated = [newSession, ...sessions]
      setLocalData(STORAGE_KEYS.SESSIONS, updated)
      return newSession
    }
  },

  async closeSession(sessionId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status: 'CLOSED' })
        .eq('id', sessionId)
        .select()
      if (error) throw error
      return data[0]
    } else {
      const sessions = getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
      const updated = sessions.map(s => s.id === sessionId ? { ...s, status: 'CLOSED' } : s)
      setLocalData(STORAGE_KEYS.SESSIONS, updated)
      return updated.find(s => s.id === sessionId)
    }
  },

  async deleteSession(sessionId) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
      if (error) throw error
    } else {
      const sessions = getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
      const updatedSessions = sessions.filter(s => s.id !== sessionId)
      setLocalData(STORAGE_KEYS.SESSIONS, updatedSessions)

      const attendance = getLocalData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
      const updatedAttendance = attendance.filter(a => a.session_id !== sessionId)
      setLocalData(STORAGE_KEYS.ATTENDANCE, updatedAttendance)
    }
  },

  async clearAllSessions() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
    } else {
      setLocalData(STORAGE_KEYS.SESSIONS, [])
      setLocalData(STORAGE_KEYS.ATTENDANCE, [])
    }
  },

  // 3. Attendance Management
  async getAttendanceBySession(sessionId) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, students(*)')
        .eq('session_id', sessionId)
      if (error) throw error
      return data
    } else {
      const attendance = getLocalData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
      return attendance.filter(a => a.session_id === sessionId)
    }
  },

  async registerAttendance({ sessionId, studentId, status = 'PRESENT', notes = '' }) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ session_id: sessionId, student_id: studentId, status, notes, scanned_at: new Date().toISOString() }])
        .select()
      if (error) throw error
      return data[0]
    } else {
      const attendance = getLocalData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE)
      // Check if already registered
      const existing = attendance.find(a => a.session_id === sessionId && a.student_id === studentId)
      if (existing) {
        return existing
      }
      const newRecord = {
        id: `att-${Date.now()}`,
        session_id: sessionId,
        student_id: studentId,
        scanned_at: new Date().toISOString(),
        status,
        notes
      }
      const updated = [newRecord, ...attendance]
      setLocalData(STORAGE_KEYS.ATTENDANCE, updated)
      return newRecord
    }
  }
}
