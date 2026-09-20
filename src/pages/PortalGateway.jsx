import React from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/layout/BrandLogo'
import { UserCheck, ShieldCheck, QrCode, ArrowLeft, Users, Layers, Sparkles } from 'lucide-react'

export default function PortalGateway() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Ambient Brand Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-6 border-b border-slate-200/80 relative z-10">
        <BrandLogo size="md" />
        <span className="text-xs px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0072bc] font-bold">
          منصة طاقات المعتمدة
        </span>
      </header>

      {/* Main Gateway Content */}
      <main className="w-full max-w-4xl mx-auto py-12 relative z-10 text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-extrabold mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            نظام الحضور والغياب الذكي عبر الـ QR Code
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            مرحباً بك في منصة <span className="text-[#0072bc]">طاقات</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
            يرجى اختيار بوابة الدخول المناسبة للبدء في استخدام النظام
          </p>
        </div>

        {/* Portal Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Card 1: Mentor / Admin Portal */}
          <Link
            to="/admin/login"
            className="group bg-white border-2 border-slate-200/90 hover:border-[#0072bc] rounded-3xl p-8 text-right shadow-sm hover:shadow-xl transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-[#0072bc] transition-all group-hover:w-3" />
            
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-[#0072bc] flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-sky-100/70 text-[#0072bc]">
                خاص بالمدرب والشركة
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3 group-hover:text-[#0072bc] transition">
                بوابـة الـ Mentor (الأدمن)
              </h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                دخول الأدمن والـ Mentor لبدء المحاضرات، عرض الـ QR Code، متابعة الحضور المباشر، وتصدير تقارير Excel.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[#0072bc] font-bold text-sm">
              <span>الدخول للوحة التحكم</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition" />
            </div>
          </Link>

          {/* Card 2: Student Portal */}
          <Link
            to="/checkin"
            className="group bg-white border-2 border-slate-200/90 hover:border-amber-500 rounded-3xl p-8 text-right shadow-sm hover:shadow-xl transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 transition-all group-hover:w-3" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <UserCheck className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100/70 text-amber-700">
                خاص بطالب الدورة
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3 group-hover:text-amber-600 transition">
                بوابـة الطالب (Student Portal)
              </h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                تأكيد حضورك عند مسح الـ QR في القاعة، أو تسجيل بياناتك لأول مرة للحصول على رمزك الخاص (PIN).
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-amber-600 font-bold text-sm">
              <span>الانتقال لتسجيل الحضور</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-slate-200/80 text-center text-xs text-slate-400 font-medium relative z-10">
        جميع الحقوق محفوظة لـ شركة طاقات لتطوير المهارات © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
