import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dataService } from '../services/dataService'
import { QrCode, CheckCircle, User, ShieldCheck, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react'

export default function StudentCheckin() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const allStudents = await dataService.getStudents()
        setStudents(allStudents)

        if (sessionId) {
          const sess = await dataService.getSessionById(sessionId)
          setSession(sess)
        } else {
          // If no sessionId in URL, pick the current active session
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
    init()
  }, [sessionId])

  const handleCheckin = async (e) => {
    e.preventDefault()
    if (!selectedStudentId) {
      setError('يرجى اختيار اسمك من قائمة الطلاب')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      const student = students.find(s => s.id === selectedStudentId)
      const currentSessionId = session?.id || 'sess-3'

      await dataService.registerAttendance({
        sessionId: currentSessionId,
        studentId: selectedStudentId,
        status: 'PRESENT'
      })

      // Navigate to Success Page with details
      navigate('/checkin/success', {
        state: {
          studentName: student?.full_name,
          studentCode: student?.student_code,
          sessionTitle: session?.title || 'المحاضرة الحالية',
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      })
    } catch (err) {
      setError(err.message || 'حدث خطأ في عملية التسجيل')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 text-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    )
  }

  if (session && session.status === 'CLOSED') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">الجلسة مغلقة 🔴</h1>
          <p className="text-slate-400 text-sm">
            تم إغلاق تسجيل الحضور لهذه المحاضرة بواسطة الـ Mentor. يرجى التواصل مباشرة مع المدرب.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20 mb-3">
            <QrCode className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold inline-block mb-2">
            تسجيل حضور الطالب 🟢
          </span>
          <h1 className="text-xl font-bold text-white">
            {session?.title || 'المحاضرة التدريبية المباشرة'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">اختر اسمك من القائمة لتأكيد حضورك فوراً</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleCheckin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              اختر اسم الطالب (من بين الـ 40 طالب)
            </label>
            <div className="relative">
              <select
                required
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value)
                  const st = students.find(s => s.id === e.target.value)
                  if (st) setStudentCode(st.student_code)
                }}
                className="w-full bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl py-3.5 px-4 text-white text-sm outline-none transition appearance-none cursor-pointer"
              >
                <option value="">-- اضغط لاختيار اسمك --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-900 text-white py-2">
                    {student.full_name} ({student.student_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {studentCode && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">الرمز التدريبي للمطابقة:</span>
              <span className="font-mono text-blue-400 font-bold px-2 py-1 bg-blue-500/10 rounded-lg">
                {studentCode}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !selectedStudentId}
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-base"
          >
            {submitting ? (
              <span>جاري تسجيل الحضور...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>تأكيد الحضور الآن</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>يتم إرسال الطابع الزمني والموقع تلقائياً للـ Mentor</span>
        </div>
      </div>
    </div>
  )
}
