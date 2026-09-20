import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { dataService } from '../services/dataService'
import { QrCode, Play, StopCircle, RefreshCw, Users, CheckCircle, Clock, ExternalLink, Sparkles } from 'lucide-react'

export default function SessionQR() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // New Session Form State
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('16:00')

  const loadSession = async () => {
    if (!id || id === 'new') {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const currentSession = await dataService.getSessionById(id)
      const currentAttendance = await dataService.getAttendanceBySession(id)
      const allStudents = await dataService.getStudents()

      setSession(currentSession)
      setAttendance(currentAttendance)
      setStudents(allStudents)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSession()

    // Auto-refresh live attendance every 4 seconds if session is active
    const interval = setInterval(() => {
      if (id && id !== 'new') {
        dataService.getAttendanceBySession(id).then(setAttendance).catch(console.error)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [id])

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

  // Generate public checkin link for students
  const checkinUrl = session
    ? `${window.location.origin}/checkin/${session.id}`
    : ''

  if (id === 'new') {
    return (
      <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <Play className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">بدء محاضرة / جلسة جديدة</h1>
          <p className="text-slate-400 text-sm mt-1">إنشاء رمز QR للحضور وتسجيل الدخول المباشر</p>
        </div>

        <form onSubmit={handleCreateSession} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">عنوان المحاضرة</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: المحاضرة 4: تصميم النظم وتطوير الواجهات"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">التاريخ</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">وقت البدء</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2 text-base"
          >
            <QrCode className="w-5 h-5" />
            <span>إنتاج رمز QR وفتح الجلسة</span>
          </button>
        </form>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-16 text-slate-400">جاري تحميل بيانات الجلسة...</div>
  }

  if (!session) {
    return <div className="text-center py-16 text-slate-400">لم يتم العثور على الجلسة المطلوبة.</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Huge QR Code Display */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-6 text-right">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
              session.status === 'ACTIVE'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}>
              {session.status === 'ACTIVE' ? 'الجلسة مفتوحة للتسجيل الان 🟢' : 'الجلسة مغلقة 🔴'}
            </span>
            <h1 className="text-2xl font-extrabold text-white">{session.title}</h1>
            <p className="text-slate-400 text-xs mt-1">تاريخ الجلسة: {session.session_date} | البدء: {session.start_time}</p>
          </div>

          {session.status === 'ACTIVE' && (
            <button
              onClick={handleCloseSession}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1.5"
            >
              <StopCircle className="w-4 h-4" />
              <span>إغلاق الجلسة</span>
            </button>
          )}
        </div>

        {/* Big Projection QR Box */}
        <div className="bg-white p-6 md:p-8 rounded-3xl inline-block shadow-2xl my-4 border-4 border-slate-700">
          <QRCodeSVG
            value={checkinUrl}
            size={260}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="mt-4 max-w-md mx-auto">
          <p className="text-slate-300 text-sm font-semibold mb-2">امسح الـ QR Code بكاميرا الجوال لتسجيل الحضور</p>
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400 dir-ltr">
            <span className="truncate mr-2 font-mono text-blue-400">{checkinUrl}</span>
            <a
              href={checkinUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-sans font-bold flex items-center gap-1 transition"
            >
              فتح <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Live Attendance Tracker Feed */}
      <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            الناجحون في التسجيل Live ({attendance.length} / 40)
          </h2>
          <button
            onClick={loadSession}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
            title="تحديث الحضور"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {attendance.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            في انتظار دخول الطلاب وتسجيل الحضور... ⏳
          </div>
        ) : (
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {attendance.map((record) => {
              const student = students.find(s => s.id === record.student_id) || { full_name: 'طالب مسجل', student_code: 'STU' }
              return (
                <div key={record.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{student.full_name}</div>
                      <div className="text-xs text-slate-400 font-mono">{student.student_code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      حاضر
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(record.scanned_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
