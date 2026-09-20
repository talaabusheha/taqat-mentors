import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { dataService } from '../../services/dataService'
import { QrCode, LayoutDashboard, Users, PlusCircle, FileSpreadsheet, LogOut, ExternalLink, Sparkles } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    dataService.logoutAdmin()
    navigate('/admin/login')
  }

  const navItems = [
    { label: 'لوحة التحكم', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'إدارة الطلاب (40)', path: '/admin/students', icon: Users },
    { label: 'بدء جلسة & QR', path: '/admin/session/new', icon: PlusCircle },
    { label: 'تقارير Excel 📊', path: '/admin/reports', icon: FileSpreadsheet },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-b md:border-b-0 md:border-l border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-lg tracking-tight">طاقات | Taqat</h2>
              <p className="text-[10px] text-slate-400">لوحة الـ Mentor الإلكترونية</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-3">
          <Link
            to="/checkin"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              اختبار صفحة الطالب
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
