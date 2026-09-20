import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import BrandLogo from '../components/layout/BrandLogo'
import { CheckCircle2, Calendar, Clock, Award, Home, Sparkles } from 'lucide-react'

export default function CheckinSuccess() {
  const location = useLocation()
  const state = location.state || {}

  const studentName = state.studentName || 'الطالب المحترم'
  const studentCode = state.studentCode || 'STU-XXXX'
  const sessionTitle = state.sessionTitle || 'المحاضرة الحالية'
  const timestamp = state.timestamp || new Date().toLocaleTimeString('ar-SA')

  return (
    <div className="min-h-screen bg-[#0b1329] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Radiant Background Animation */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-sky-500/30 rounded-3xl p-8 shadow-2xl text-center relative z-10 space-y-6">
        <div className="mb-2">
          <BrandLogo size="md" />
        </div>

        {/* Animated Checkmark Badge with TAQAT colors */}
        <div className="w-20 h-20 bg-gradient-to-tr from-sky-500 via-blue-600 to-amber-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-sky-500/30 scale-105 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            تم تسجيل الحضور بنجاح!
          </span>
          <h1 className="text-2xl font-extrabold text-white">{studentName}</h1>
          <p className="text-sky-400 font-mono text-sm mt-1">{studentCode}</p>
        </div>

        {/* Attendance Card Details */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-5 text-right space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              المحاضرة:
            </span>
            <span className="font-semibold text-white truncate max-w-[180px]">{sessionTitle}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              وقت التسجيل الدقيق:
            </span>
            <span className="font-bold text-emerald-400 dir-ltr font-mono">{timestamp}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              حالة الحضور:
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
              حاضر (مبكر)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          شكراً لالتزامك وتواجدك المبكر في القاعة. نتمنى لك جلسة تدريبية مثرية ومكللة بالتوفيق مع طاقات!
        </p>

        <div className="pt-2">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
