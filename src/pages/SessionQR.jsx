import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { dataService } from '../services/dataService'
import { getCurrentQRToken, getSecondsRemainingInCycle } from '../utils/qrSecurity'
import { QrCode, Play, StopCircle, RefreshCw, Users, CheckCircle, XCircle, UserCheck, Clock, ExternalLink, Sparkles, Trash2, ShieldAlert, Zap } from 'lucide-react'

export default function SessionQR() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('ALL') // 'ALL' | 'PRESENT' | 'ABSENT'

  // Dynamic QR Token State
  const [qrToken, setQrToken] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsRemainingInCycle())

  // New Session Form State
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5))

  const loadSession = async () => {
    setLoading(true)
    try {
      const allSessions = await dataService.getSessions()
      const allStudents = await dataService.getStudents()
      setStudents(allStudents)

      // Set default auto title if empty
      if (!title) {
        setTitle(`اللقاء رقم ${allSessions.length + 1}`)
      }

      if (id && id !== 'new') {
        let currentSession = await dataService.getSessionById(id)
        if (!currentSession) {
          currentSession = allSessions.find(s => s.status === 'ACTIVE') || null
        }

        if (currentSession) {
          const currentAttendance = await dataService.getAttendanceBySession(currentSession.id)
          setSession(currentSession)
          setAttendance(currentAttendance)
          setQrToken(getCurrentQRToken(currentSession.id))
        } else {
          setSession(null)
        }
      } else {
        setSession(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()

    // Auto refresh live attendance every 2.5 seconds
    const interval = setInterval(() => {
      if (id && id !== 'new' && session?.id) {
        dataService.getAttendanceBySession(session.id).then(setAttendance).catch(console.error)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [id, session?.id])

  // Timer Effect for 10-Second Dynamic QR Token Refresh
  useEffect(() => {
    if (!session?.id || session.status !== 'ACTIVE') return

    const timer = setInterval(() => {
      const rem = getSecondsRemainingInCycle()
      setSecondsLeft(rem)
      setQrToken(getCurrentQRToken(session.id))
    }, 1000)

    return () => clearInterval(timer)
  }, [session?.id, session?.status])

  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (!title) return
    try {
      const newSess = await dataService.createSession({
        title,
        session_date: date,
        start_time: time
      })
      navigate(`/admin/session/${newSess.id}`)
    } catch (err) {
      alert('خطأ في إنتاج الجلسة: ' + err.message)
    }
  }

  const handleCloseSession = async () => {
    if (!session) return
    try {
      const updated = await dataService.closeSession(session.id)
      setSession(updated)
    } catch (err) {
      alert('خطأ في إغلاق الجلسة: ' + err.message)
    }
  }

  const handleDeleteThisSession = async () => {
    if (!session) return
    if (window.confirm(`هل أنت تأكد من حذف الجلسة (${session.title})؟`)) {
      try {
        await dataService.deleteSession(session.id)
        navigate('/admin/dashboard')
      } catch (err) {
        alert('خطأ في حذف الجلسة: ' + err.message)
      }
    }
  }

  // Mentor Manual Attendance Override
  const handleManualMarkPresent = async (studentId) => {
    if (!session) return
    try {
      await dataService.registerAttendance({
        sessionId: session.id,
        studentId,
        status: 'PRESENT',
        notes: 'تسجيل يدوي بواسطة الـ Mentor'
      })
      const currentAttendance = await dataService.getAttendanceBySession(session.id)
      setAttendance(currentAttendance)
    } catch (err) {
      alert('خطأ أثناء التحضير اليدوي: ' + err.message)
    }
  }

  // Generate public checkin link for students
  const checkinUrl = session
    ? `${window.location.origin}/checkin/${session.id}${qrToken ? `?t=${qrToken}` : ''}`
    : ''

  if (loading) {
    return <div className="text-center py-16 text-slate-400">جاري تحميل بيانات الجلسة...</div>
  }

  // Form View for New Session or if no session selected
  if (id === 'new' || !session) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm my-4">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#0072bc] rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Play className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">بدء محاضرة / لقاء جديد</h1>
          <p className="text-slate-500 text-sm mt-1">إنشاء رمز QR للحضور وتسجيل الدخول المباشر</p>
        </div>

        <form onSubmit={handleCreateSession} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">عنوان اللقاء / المحاضرة</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: اللقاء رقم 1 (أو المحاضرة 1)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3.5 px-4 text-slate-900 text-sm outline-none focus:border-[#0072bc] font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">تاريخ اللقاء (تلقائي اليوم)</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-slate-900 text-sm outline-none focus:border-[#0072bc]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">وقت البدء</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-slate-900 text-sm outline-none focus:border-[#0072bc]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#0072bc] hover:bg-sky-700 text-white font-extrabold rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 text-base mt-4"
          >
            <QrCode className="w-5 h-5 text-amber-300" />
            <span>إنتاج رمز QR وفتح اللقاء الآن</span>
          </button>
        </form>
      </div>
    )
  }

  // Calculate attendance lists & metrics
  const attendedStudentIds = new Set(attendance.map(a => a.student_id))
  const presentCount = attendedStudentIds.size
  const absentCount = Math.max(0, students.length - presentCount)

  const studentListWithStatus = students.map((st) => {
    const rec = attendance.find(a => a.student_id === st.id)
    return {
      ...st,
      isPresent: !!rec,
      scannedAt: rec ? rec.scanned_at : null
    }
  })

  const filteredStudents = studentListWithStatus.filter((st) => {
    if (filterTab === 'PRESENT') return st.isPresent
    if (filterTab === 'ABSENT') return !st.isPresent
    return true
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Huge QR Code Display */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 text-center shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6 text-right">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
              session.status === 'ACTIVE'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 animate-pulse'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {session.status === 'ACTIVE' ? 'الجلسة مفتوحة للتسجيل الآن' : 'الجلسة مغلقة'}
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900">{session.title}</h1>
            <p className="text-slate-500 text-xs mt-1">تاريخ الجلسة: {session.session_date} | البدء: {session.start_time}</p>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'ACTIVE' && (
              <button
                onClick={handleCloseSession}
                className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" />
                <span>إغلاق الجلسة</span>
              </button>
            )}

            <button
              onClick={handleDeleteThisSession}
              className="p-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 transition"
              title="حذف هذه الجلسة بالكامل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Big Projection QR Box with Dynamic Refresh Indicator */}
        <div className="bg-white p-6 md:p-8 rounded-3xl inline-block shadow-lg my-4 border-2 border-slate-200 relative group max-w-sm w-full">
          <QRCodeSVG
            value={checkinUrl}
            size={260}
            level="H"
            includeMargin={true}
            className="mx-auto"
          />

          {session.status === 'ACTIVE' && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>رمز حماية حي يتجدد تلقائياً</span>
                <span className="font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-xs font-extrabold">
                  {secondsLeft}s
                </span>
              </div>

              {/* Progress bar for 10-second countdown */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden dir-ltr">
                <div
                  className="h-full bg-gradient-to-r from-[#0072bc] to-amber-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(secondsLeft / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 max-w-md mx-auto">
          <p className="text-slate-700 text-sm font-bold mb-2">امسح الـ QR Code بكاميرا الجوال لتسجيل الحضور</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-500 dir-ltr">
            <span className="truncate mr-2 font-mono text-[#0072bc] font-bold">{checkinUrl}</span>
            <a
              href={checkinUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-[#0072bc] hover:bg-sky-700 text-white rounded-lg font-sans font-bold flex items-center gap-1 transition"
            >
              فتح <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Live Attendance Roster */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0072bc]" />
              كشف حضور الطلاب Live
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">الحالة الأولية: غياب لحين مسح الـ QR Code</p>
          </div>
          <button
            onClick={loadSession}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            title="تحديث الحضور"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Filter Tabs */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`py-2 rounded-xl transition ${
              filterTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            الكل ({students.length})
          </button>
          <button
            onClick={() => setFilterTab('PRESENT')}
            className={`py-2 rounded-xl transition ${
              filterTab === 'PRESENT' ? 'bg-emerald-500 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-100/50'
            }`}
          >
            حاضر ({presentCount})
          </button>
          <button
            onClick={() => setFilterTab('ABSENT')}
            className={`py-2 rounded-xl transition ${
              filterTab === 'ABSENT' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-100/50'
            }`}
          >
            غائب ({absentCount})
          </button>
        </div>

        {/* Student Roster List */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            لا يوجد طلاب في هذه الفئة حالياً.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                  student.isPresent
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    student.isPresent
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {student.isPresent ? <CheckCircle className="w-4.5 h-4.5" /> : <XCircle className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{student.full_name}</div>
                    <div className="text-xs text-[#0072bc] font-mono font-bold">{student.student_code}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  {student.isPresent ? (
                    <div>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold inline-block">
                        حاضر 🟢
                      </span>
                      {student.scannedAt && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {new Date(student.scannedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-semibold">
                        غائب 🔴
                      </span>
                      <button
                        onClick={() => handleManualMarkPresent(student.id)}
                        className="px-2 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                        title="تحضير يدوي"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>تحضير</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
