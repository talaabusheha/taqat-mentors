import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dataService } from '../services/dataService'
import { Users, Calendar, QrCode, ArrowUpRight, Plus, RefreshCw, Layers, Clock, Trash2 } from 'lucide-react'

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

  const handleDeleteSession = async (sessionId, title) => {
    if (window.confirm(`هل أنت تأكد من حذف الجلسة (${title})؟`)) {
      try {
        await dataService.deleteSession(sessionId)
        loadData()
      } catch (err) {
        alert('خطأ في حذف الجلسة: ' + err.message)
      }
    }
  }

  const handleClearAllSessions = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الجلسات المسجلة للبدء من جديد؟')) {
      try {
        await dataService.clearAllSessions()
        loadData()
      } catch (err) {
        alert('خطأ في مسح الجلسات: ' + err.message)
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-sky-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-amber-300 text-xs font-bold mb-3">
              <Layers className="w-3.5 h-3.5" />
              دورة التدريب الحالية ({studentsCount} طالب)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold">مرحباً بك يا Mentor</h1>
            <p className="text-sky-100 text-sm mt-1">نظام طاقات الذكي لإدارة الحضور وتوليد الـ QR Code</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/session/new"
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>بدء جلسة جديدة و QR</span>
            </Link>
            <button
              onClick={loadData}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">إجمالي الطلاب المسجلين</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{studentsCount} <span className="text-sm font-normal text-slate-500">طالب</span></h3>
            <Link to="/admin/students" className="inline-flex items-center gap-1 text-xs text-[#0072bc] font-bold hover:underline mt-3">
              إدارة كشف الأسماء <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0072bc] border border-sky-100 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">إجمالي المحاضرات الجارية</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{sessions.length} <span className="text-sm font-normal text-slate-500">جلسات</span></h3>
            <p className="text-xs text-slate-400 mt-3 font-medium">مكتملة ومؤرشفة</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Calendar className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">حالة الجلسة المباشرة</p>
            {activeSession ? (
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  نشطة الآن
                </span>
                <Link to={`/admin/session/${activeSession.id}`} className="block text-xs text-[#0072bc] font-bold hover:underline mt-2">
                  عرض شاشة الـ QR
                </Link>
              </div>
            ) : (
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mt-2">
                  لا توجد جلسة مفعّلة
                </span>
              </div>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
            <QrCode className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0072bc]" />
            سجل المحاضرات والجلسات
          </h2>

          {sessions.length > 0 && (
            <button
              onClick={handleClearAllSessions}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="تفريغ سجل الجلسات للبدء من جديد"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح كافة الجلسات</span>
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">لا توجد جلسات مسجلة حالياً.</p>
            <p className="text-xs text-slate-400">اضغط على زر "بدء جلسة جديدة و QR" للبدء بإنشاء أول محاصرة لك!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div key={session.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{session.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#0072bc]" />
                      {session.session_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {session.start_time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    session.status === 'ACTIVE' 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 animate-pulse'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {session.status === 'ACTIVE' ? 'نشطة الان' : 'مغلقة'}
                  </span>

                  <Link
                    to={`/admin/session/${session.id}`}
                    className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-xs font-bold text-[#0072bc] border border-sky-200 transition"
                  >
                    عرض التفاصيل & QR
                  </Link>

                  <button
                    onClick={() => handleDeleteSession(session.id, session.title)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                    title="حذف هذه الجلسة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
