import React, { useEffect, useState } from 'react'
import { dataService } from '../services/dataService'
import { Users, UserPlus, Search, Phone, Mail, Trash2, FileText, CheckCircle, RefreshCw, UserX, AlertTriangle } from 'lucide-react'

export default function StudentsManagement() {
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'EXCLUDED' | 'REGULAR'
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  
  // Single Add Form
  const [fullName, setFullName] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Bulk Add Form
  const [bulkText, setBulkText] = useState('')

  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      const data = await dataService.getStudents()
      const allSessions = await dataService.getSessions()
      
      let allAttendance = []
      for (const sess of allSessions) {
        const sessAtt = await dataService.getAttendanceBySession(sess.id)
        allAttendance = [...allAttendance, ...sessAtt]
      }

      setStudents(data)
      setSessions(allSessions)
      setAttendance(allAttendance)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddStudent = async (e) => {
    e.preventDefault()
    if (!fullName) return
    setLoading(true)
    try {
      const autoCode = studentCode || `STU-${1000 + students.length + 1}`
      await dataService.addStudent({
        full_name: fullName,
        email: email || '',
        student_code: autoCode,
        phone: phone || '',
        is_active: true
      })
      setFullName('')
      setStudentCode('')
      setEmail('')
      setPhone('')
      setShowAddModal(false)
      loadData()
    } catch (err) {
      alert('خطأ في إضافة الطالب: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAdd = async (e) => {
    e.preventDefault()
    if (!bulkText.trim()) return
    setLoading(true)

    try {
      const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
      const listToInsert = lines.map((line, idx) => {
        const parts = line.split(',').map(p => p.trim())
        return {
          full_name: parts[0] || `طالب ${idx + 1}`,
          email: parts[1] || '',
          phone: parts[2] || '',
          student_code: `STU-${1000 + students.length + idx + 1}`
        }
      })

      await dataService.bulkAddStudents(listToInsert)
      setBulkText('')
      setShowBulkModal(false)
      loadData()
    } catch (err) {
      alert('خطأ في إضافة القائمة: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId, name) => {
    if (window.confirm(`هل أنت تأكد من حذف الطالب (${name})؟`)) {
      try {
        await dataService.deleteStudent(studentId)
        loadData()
      } catch (err) {
        alert('خطأ في حذف الطالب: ' + err.message)
      }
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('هل أنت متأكد من مسح جميع الأسماء والحذف بالكامل للبدء بكشف جديد؟')) {
      try {
        await dataService.clearAllStudents()
        loadData()
      } catch (err) {
        alert('خطأ في مسح الأسماء: ' + err.message)
      }
    }
  }

  // Enhance students with stats
  const studentsWithStats = students.map((student) => {
    let attended = 0
    sessions.forEach((session) => {
      const rec = attendance.find(a => a.student_id === student.id && a.session_id === session.id)
      if (rec) attended++
    })
    const totalSessions = sessions.length
    const absentCount = totalSessions - attended
    const isExcluded = absentCount > 3
    return {
      ...student,
      attended,
      absentCount,
      totalSessions,
      isExcluded
    }
  })

  const excludedCount = studentsWithStats.filter(s => s.isExcluded).length

  const filteredStudents = studentsWithStats
    .filter(s => {
      const matchesSearch =
        s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.student_code?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase()) ||
        s.phone?.includes(search)

      if (!matchesSearch) return false

      if (filterType === 'EXCLUDED') return s.isExcluded
      if (filterType === 'REGULAR') return !s.isExcluded
      return true
    })
    .sort((a, b) =>
      (a.student_code || '').localeCompare(b.student_code || '', undefined, { numeric: true, sensitivity: 'base' })
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-[#0072bc]" />
            إدارة كشف الطلاب ({students.length} طالب)
          </h1>
          <p className="text-slate-500 text-sm mt-1">إضافة، متابعة الحضور والغياب ورصد الطلاب المستثنين (أكثر من 3 أيام غياب)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#0072bc] hover:bg-sky-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة طالب مفرد</span>
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition"
          >
            <FileText className="w-4 h-4" />
            <span>لصق قائمة طلاب (دفعة واحدة)</span>
          </button>

          {students.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition"
              title="تفريغ الكشف للبدء بطلابك الحقيقيين"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ القائمة</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، الإيميل، رقم الجوال، أو الرمز التدريبي..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-slate-900 text-sm outline-none focus:border-[#0072bc] shadow-sm transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl text-xs font-bold shadow-sm shrink-0">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-2 rounded-xl transition cursor-pointer ${
              filterType === 'ALL' ? 'bg-[#0072bc] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            جميع الطلاب
          </button>
          <button
            onClick={() => setFilterType('EXCLUDED')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
              filterType === 'EXCLUDED' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            المستثنون ({excludedCount})
          </button>
          <button
            onClick={() => setFilterType('REGULAR')}
            className={`px-3 py-2 rounded-xl transition cursor-pointer ${
              filterType === 'REGULAR' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            المنتظمون
          </button>
        </div>
      </div>

      {/* Students List - Mobile Cards (< md) & Desktop Table (>= md) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Mobile View: Cards Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">لا يوجد طلاب مطابقون للبحث والتصفية.</p>
            </div>
          ) : (
            filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className={`p-4 space-y-3 transition ${
                  student.isExcluded ? 'bg-rose-50/60 border-r-4 border-r-rose-500' : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Header: Avatar, Name & Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-sm shrink-0 border ${
                      student.isExcluded ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-sky-50 border-sky-200 text-[#0072bc]'
                    }`}>
                      {student.full_name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                        <span>{student.full_name}</span>
                        {student.isExcluded && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                            مستثنى
                          </span>
                        )}
                      </h4>
                      <span className="text-[11px] text-slate-400"># {index + 1}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStudent(student.id, student.full_name)}
                    className="p-2 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition shrink-0"
                    title="حذف الطالب"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Absence Metric & Status */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-600 font-bold">أيام الغياب:</span>
                  <span className={`px-2 py-0.5 rounded font-black ${
                    student.isExcluded ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {student.absentCount} من {student.totalSessions} جلسة
                    {student.isExcluded && ' ⚠️ (يتجاوز 3 أيام)'}
                  </span>
                </div>

                {/* Badges: PIN and Code */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-amber-50 border border-amber-200/80 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-amber-700 block font-semibold mb-0.5">الرمز الخاص (PIN)</span>
                    <span className="font-mono text-amber-800 font-bold text-sm tracking-wider">
                      {student.passcode || student.student_code?.replace('STU-', '') || '1234'}
                    </span>
                  </div>

                  <div className="flex-1 bg-sky-50 border border-sky-200/80 rounded-xl p-2 text-center">
                    <span className="text-[10px] text-[#0072bc] block font-semibold mb-0.5">الرمز التدريبي (Code)</span>
                    <span className="font-mono text-[#0072bc] font-bold text-xs">
                      {student.student_code}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                {(student.email || student.phone) && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {student.phone && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 text-[11px]">الجوال:</span>
                        <span className="font-medium dir-ltr flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {student.phone}
                        </span>
                      </div>
                    )}
                    {student.email && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 text-[11px]">الإيميل:</span>
                        <span className="font-medium dir-ltr flex items-center gap-1.5 truncate max-w-[200px]">
                          <Mail className="w-3.5 h-3.5 text-[#0072bc] shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">اسم الطالب الكامل</th>
                <th className="px-6 py-4">البريد الإلكتروني</th>
                <th className="px-6 py-4">الرمز التدريبي</th>
                <th className="px-6 py-4 text-center">أيام الغياب</th>
                <th className="px-6 py-4 text-center">حالة الاستثناء</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="space-y-2">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">لا يوجد طلاب في الكشف حالياً.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className={`transition ${
                      student.isExcluded
                        ? 'bg-rose-50/70 hover:bg-rose-100/70 border-r-4 border-r-rose-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-slate-400 text-xs">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl font-black flex items-center justify-center text-sm border ${
                        student.isExcluded ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-sky-50 border-sky-200 text-[#0072bc]'
                      }`}>
                        {student.full_name?.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span>{student.full_name}</span>
                        {student.phone && <span className="text-xs text-slate-400 font-normal dir-ltr text-right">{student.phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs dir-ltr text-right font-medium">
                      {student.email || <span className="text-slate-400 italic">غير محدد</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-[#0072bc] text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200">
                        {student.student_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                        student.absentCount > 3 ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {student.absentCount} من {student.totalSessions} أيام
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {student.isExcluded ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 text-white font-black text-xs shadow-xs">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          مستثنى (غياب &gt; 3 أيام)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          منتظم
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.full_name)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="حذف الطالب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">إضافة طالب جديد للدورة</h2>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">اسم الطالب الرباعي *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: عبد الله خالد العتيبي"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm outline-none focus:border-[#0072bc]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">البريد الإلكتروني (Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@company.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm outline-none focus:border-[#0072bc] dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">رقم الجوال</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0501234567"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm outline-none focus:border-[#0072bc] dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">الرمز التدريبي (تلقائي أو مخصص)</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder={`STU-${1000 + students.length + 1}`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-slate-900 text-sm outline-none focus:border-[#0072bc] font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#0072bc] hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ الطالب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-xl shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">لصق كشف طلاب الدورة (دفعة واحدة)</h2>
            <p className="text-xs text-slate-500 mb-4">
              يمكنك لصق الأسماء سطر بسطر. صيغة السطر: <code className="text-[#0072bc] bg-sky-50 px-1 py-0.5 rounded">الاسم, الإيميل, رقم الجوال</code> أو الأسماء فقط!
            </p>

            <form onSubmit={handleBulkAdd} className="space-y-4">
              <div>
                <textarea
                  rows={8}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`أحمد محمد علي, ahmed@email.com, 0501234561\nسارة خالد العتيبي, sara@email.com, 0501234562\nعمر عبد العزيز الشمري\nفاطمة إبراهيم الحسن`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-slate-900 text-xs outline-none focus:border-[#0072bc] font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition"
                >
                  {loading ? 'جاري الاستيراد...' : 'إضافة القائمة بالكامل'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
