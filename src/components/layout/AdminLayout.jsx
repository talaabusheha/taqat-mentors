import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { dataService } from '../../services/dataService'
import BrandLogo from './BrandLogo'
import { LayoutDashboard, Users, PlusCircle, FileSpreadsheet, LogOut, ExternalLink, Sparkles } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    dataService.logoutAdmin()
    navigate('/admin/login')
  }

  const navItems = [
    { label: 'لوحة التحكم', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'إدارة الطلاب', path: '/admin/students', icon: Users },
    { label: 'بدء جلسة & QR', path: '/admin/session/new', icon: PlusCircle },
    { label: 'تقارير Excel', path: '/admin/reports', icon: FileSpreadsheet },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-l border-slate-200 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Official TAQAT Brand Header */}
          <div className="mb-8 px-2 py-1 border-b border-slate-100 pb-4">
            <BrandLogo size="md" />
            <p className="text-[11px] text-slate-500 mt-2 font-semibold">لوحة الـ Mentor لـ إدارة الحضور</p>
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
                      ? 'bg-sky-50 text-[#0072bc] border-r-4 border-[#0072bc] shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#f8a11d]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-100 space-y-3">
          <Link
            to="/checkin"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              اختبار صفحة الطالب
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
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
