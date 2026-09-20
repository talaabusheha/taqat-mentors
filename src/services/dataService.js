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
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
      })
      if (error) throw error
      return data
    } else {
      // Simple mock authentication for MVP demonstration
      if ((username === 'admin' || username === 'mentor@taqat.sa') && password === 'admin123') {
        const user = { id: 'admin-1', email: 'mentor@taqat.sa', role: 'mentor' }
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user))
        return { user }
      }
      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة')
    }
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
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('students').insert([student]).select()
      if (error) throw error
      return data[0]
    } else {
      const students = getLocalData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
      const newStudent = {
        ...student,
        id: student.id || `std-${Date.now()}`,
        is_active: true
      }
      const updated = [newStudent, ...students]
      setLocalData(STORAGE_KEYS.STUDENTS, updated)
      return newStudent
    }
  },

  async bulkAddStudents(studentsList) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('students').insert(studentsList).select()
      if (error) throw error
      return data
    } else {
      const students = getLocalData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
      const formatted = studentsList.map((st, i) => ({
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
    const sessions = await this.getSessions()
    return sessions.find(s => s.id === sessionId) || null
  },

  async createSession(sessionData) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('sessions').insert([sessionData]).select()
      if (error) throw error
      return data[0]
    } else {
      const sessions = getLocalData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
      const newSession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
        status: 'ACTIVE',
        qr_code_token: `TAQAT-QR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
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
