import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dataService } from '../services/dataService'
import { Users, Calendar, QrCode, CheckCircle, Clock, ArrowUpRight, Plus, RefreshCw, Layers } from 'lucide-react'

export default function Dashboard() {
  const [studentsCount, setStudentsCount] = useState(0)
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const students = await dataService.getStudents()
      const allSessions = await dataService.getSessions()
      setStudentsCount(students.length)
      setSessions(allSessions)
      setActiveSession(allSessions.find(s => s.status === 'ACTIVE') || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              دورة التدريب الحالية (40 طالب)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">مرحباً بك يا Mentor 👋</h1>
            <p className="text-slate-400 text-sm mt-1">نظام إدارة الحضور الذكي وسجل الجلسات التفاعلي</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/session/new"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>بدء جلسة جديدة و QR</span>
            </Link>
            <button
              onClick={loadData}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">إجمالي الطلاب المسجلين</p>
            <h3 className="text-3xl font-black text-white mt-2">{studentsCount} <span className="text-sm font-normal text-slate-400">طالب</span></h3>
            <Link to="/admin/students" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-3">
              إدارة كشف الأسماء <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">إجمالي المحاضرات الجارية</p>
            <h3 className="text-3xl font-black text-white mt-2">{sessions.length} <span className="text-sm font-normal text-slate-400">جلسات</span></h3>
            <p className="text-xs text-slate-400 mt-3">مكتملة ومؤرشفة</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">حالة الجلسة المباشرة</p>
            {activeSession ? (
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mt-2">
                  نشطة الآن 🟢
                </span>
                <Link to={`/admin/session/${activeSession.id}`} className="block text-xs text-blue-400 hover:underline mt-2">
                  عرض شاشة الـ QR
                </Link>
              </div>
            ) : (
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs mt-2">
                  لا توجد جلسة مفعّلة
                </span>
              </div>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <QrCode className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          سجل المحاضرات والجلسات
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            لا توجد جلسات مسجلة بعد. قم بإنشاء أول جلسة حضور الآن!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {sessions.map((session) => (
              <div key={session.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <h4 className="font-semibold text-white text-base">{session.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span>📅 {session.session_date}</span>
                    <span>⏰ {session.start_time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.status === 'ACTIVE' 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {session.status === 'ACTIVE' ? 'نشطة الان' : 'مغلقة'}
                  </span>

                  <Link
                    to={`/admin/session/${session.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                  >
                    عرض التفاصيل & QR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
