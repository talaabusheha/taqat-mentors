import React, { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { dataService } from '../../services/dataService'
import BrandLogo from './BrandLogo'
import { LayoutDashboard, Users, PlusCircle, FileSpreadsheet, LogOut, ExternalLink, Sparkles, Menu, X } from 'lucide-react'

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <BrandLogo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-700 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          aria-label="القائمة"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-slate-200 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:w-64 md:shadow-sm md:z-auto shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div>
          {/* Official TAQAT Brand Header */}
          <div className="mb-6 md:mb-8 px-2 py-1 border-b border-slate-100 pb-4 flex items-center justify-between md:block">
            <div>
              <BrandLogo size="md" />
              <p className="text-[11px] text-slate-500 mt-2 font-semibold">لوحة الـ Mentor لـ إدارة الحضور</p>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
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
                  onClick={() => setMobileMenuOpen(false)}
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
            onClick={() => setMobileMenuOpen(false)}
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

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
