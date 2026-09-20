import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dataService } from '../services/dataService'
import { QrCode, CheckCircle, User, ShieldCheck, KeyRound, UserPlus, AlertTriangle, Sparkles, Copy, Check } from 'lucide-react'

import BrandLogo from '../components/layout/BrandLogo'

export default function StudentCheckin() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [activeTab, setActiveTab] = useState('checkin') // 'checkin' | 'register'

  // Checkin state
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [enteredPasscode, setEnteredPasscode] = useState('')

  // Registration state
  const [regFullName, setRegFullName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [registeredPin, setRegisteredPin] = useState(null)
  const [copiedPin, setCopiedPin] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const allStudents = await dataService.getStudents()
      setStudents(allStudents)

      if (sessionId) {
        const sess = await dataService.getSessionById(sessionId)
        setSession(sess)
      } else {
        const sessions = await dataService.getSessions()
        const active = sessions.find(s => s.status === 'ACTIVE')
        setSession(active || null)
      }
    } catch (err) {
      console.error(err)
      setError('تعذر تحميل بيانات الجلسة')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [sessionId])

  // Handle New Student Self Registration
  const handleRegisterNewStudent = async (e) => {
    e.preventDefault()
    if (!regFullName) return
    setSubmitting(true)
    setError('')

    try {
      const newStudent = await dataService.registerStudentSelf({
        full_name: regFullName,
        phone: regPhone,
        email: regEmail
      })

      // Show generated PIN to student
      const pinCode = newStudent.pin || newStudent.passcode || '1234'
      setRegisteredPin(pinCode)

      // Reload students list and auto select the new student
      await loadData()
      setSelectedStudentId(newStudent.id)
      setEnteredPasscode(pinCode)

      // Reset form
      setRegFullName('')
      setRegPhone('')
      setRegEmail('')
    } catch (err) {
      setError('خطأ في تسجيل البيانات: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Attendance Check-in with Passcode Verification
  const handleCheckin = async (e) => {
    e.preventDefault()
    if (!selectedStudentId) {
      setError('يرجى اختيار اسمك من القائمة')
      return
    }

    if (!enteredPasscode) {
      setError('يرجى كتابة رمزك الخاص / كلمة المرور لتأكيد الحضور')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const student = students.find(s => s.id === selectedStudentId)

      // Verify passcode against student's passcode or code (e.g. 4-digit code)
      const validPasscode = student?.passcode || student?.student_code?.replace('STU-', '') || '1234'
      
      if (enteredPasscode.trim() !== validPasscode && enteredPasscode.trim() !== student?.student_code) {
        setError('كلمة المرور / الرمز الذي أدخلته غير صحيح. يرجى إدخال الرمز المخصص لك عند التسجيل.')
        setSubmitting(false)
        return
      }

      const currentSessionId = session?.id || 'sess-3'

      await dataService.registerAttendance({
        sessionId: currentSessionId,
        studentId: selectedStudentId,
        status: 'PRESENT'
      })

      navigate('/checkin/success', {
        state: {
          studentName: student?.full_name,
          studentCode: student?.student_code,
          sessionTitle: session?.title || 'المحاضرة الحالية',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      })
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الحضور')
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedPin(true)
    setTimeout(() => setCopiedPin(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1329] text-white flex items-center justify-center p-4">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">جاري فتح صفحة الحضور...</p>
        </div>
      </div>
    )
  }

  if (session && session.status === 'CLOSED') {
    return (
      <div className="min-h-screen bg-[#0b1329] text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">الجلسة مغلقة</h1>
          <p className="text-slate-400 text-sm">
            تم إغلاق تسجيل الحضور لهذه المحاضرة بواسطة الـ Mentor.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1329] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-sky-900/40 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="mb-3 inline-block">
            <BrandLogo size="md" />
          </div>
          <br />
          <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold inline-block mb-2">
            تسجيل الحضور الإلكتروني
          </span>
          <h1 className="text-xl font-bold text-white">
            {session?.title || 'المحاضرة التدريبية المباشرة'}
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-6 border border-slate-700/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('checkin'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-sky-600 text-white shadow shadow-sky-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-amber-400" />
            <span>تأكيد الحضور (مع الـ QR)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-600 text-white shadow shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>طالب جديد؟ سجل بياناتك</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs text-center leading-relaxed flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: Attendance Checkin */}
        {activeTab === 'checkin' && (
          <form onSubmit={handleCheckin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                اختر اسمك من القائمة
              </label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => {
                  const id = e.target.value
                  setSelectedStudentId(id)
                  setError('')
                  const st = students.find(s => s.id === id)
                  if (st) {
                    setEnteredPasscode(st.passcode || st.student_code?.replace('STU-', '') || '1234')
                  } else {
                    setEnteredPasscode('')
                  }
                }}
                className="w-full bg-slate-800 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-2xl py-3.5 px-4 text-white text-sm outline-none transition cursor-pointer"
              >
                <option value="">-- اضغط لاختيار اسمك --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-900 text-white py-2">
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                كلمة المرور / الرمز الخاص بك (Code / PIN)
              </label>
              <div className="relative">
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value)}
                  placeholder="أدخل الرمز المخصص لك (مثال: 4829)"
                  className="w-full bg-slate-800 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-2xl py-3.5 pr-12 pl-4 text-white text-sm outline-none transition font-mono tracking-widest"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                * أدخل الرمز المكون من 4 أرقام الذي أعطاك إياه الموقع عند تسجيل بياناتك أول مرة.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStudentId || !enteredPasscode}
              className="w-full py-4 px-4 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
            >
              {submitting ? (
                <span>جاري التحقق والتسجيل...</span>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>تأكيد الحضور في القاعة</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: Self Registration */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterNewStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">اسمك الرباعي *</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="مثال: أحمد عبد الله الشمري"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الجوال</label>
              <input
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0501234567"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-sky-500 dir-ltr text-right"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-sky-500 dir-ltr text-right"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !regFullName}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              {submitting ? 'جاري إنشاء حسابك...' : 'حفظ البيانات والحصول على الرمز الخاص (PIN)'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>نظام طاقات المعتمد لحضور طلاب الدورة التدريبية</span>
        </div>
      </div>

      {/* Modal dialog showing generated PIN Code after registration */}
      {registeredPin && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <Sparkles className="w-8 h-8 text-slate-950" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">تم تسجيل بياناتك بنجاح</h2>
              <p className="text-slate-400 text-xs mt-1">
                هذا هو رمزك الخاص (كلمة المرور) لتأكيد حضورك في كل محاضرة:
              </p>
            </div>

            {/* Big PIN Display */}
            <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between">
              <span className="text-3xl font-black font-mono text-amber-400 tracking-widest dir-ltr">
                {registeredPin}
              </span>

              <button
                onClick={() => copyToClipboard(registeredPin)}
                className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPin ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl text-right leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span><strong>هام جداً:</strong> يرجى حفظ هذا الرمز ({registeredPin}) أو التقاط صورة للشاشة لاستخدامه عند مسح الـ QR في المحاضرات.</span>
            </div>

            <button
              onClick={() => {
                setRegisteredPin(null)
                setActiveTab('checkin')
              }}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              الانتقال لتأكيد الحضور في القاعة الآن
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
