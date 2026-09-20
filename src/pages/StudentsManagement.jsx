import React, { useEffect, useState } from 'react'
import { dataService } from '../services/dataService'
import { Users, UserPlus, Search, Phone, Mail, Trash2, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

export default function StudentsManagement() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
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

  const loadStudents = async () => {
    try {
      const data = await dataService.getStudents()
      setStudents(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadStudents()
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
      loadStudents()
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
      // Parse bulk lines: e.g., Name, Email, Phone OR just Names line by line
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
      loadStudents()
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
        loadStudents()
      } catch (err) {
        alert('خطأ في حذف الطالب: ' + err.message)
      }
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('⚠️ هل أنت متأكد من مسح جميع الأسماء والحذف بالكامل للبدء بكشف جديد؟')) {
      try {
        await dataService.clearAllStudents()
        loadStudents()
      } catch (err) {
        alert('خطأ في مسح الأسماء: ' + err.message)
      }
    }
  }

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_code?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            إدارة كشف الطلاب ({students.length} طالب)
          </h1>
          <p className="text-slate-400 text-sm mt-1">إضافة، تعديل وتخصيص أسماء وإيميلات طلاب الدورة التدريبية</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة طالب مفرد</span>
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transition"
          >
            <FileText className="w-4 h-4" />
            <span>لصق قائمة طلاب (دفعة واحدة)</span>
          </button>

          {students.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
              title="تفريغ الكشف للبدء بطلابك الحقيقيين"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ القائمة</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، الإيميل، رقم الجوال، أو الرمز التدريبي..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3.5 pr-12 pl-4 text-white text-sm outline-none focus:border-blue-500 transition"
        />
      </div>

      {/* Students Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">اسم الطالب الكامل</th>
                <th className="px-6 py-4">البريد الإلكتروني (Email)</th>
                <th className="px-6 py-4">رقم الجوال</th>
                <th className="px-6 py-4">الرمز التدريبي (Code)</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="space-y-2">
                      <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-400">لا يوجد طلاب في الكشف حالياً.</p>
                      <p className="text-xs">اضغط على "إضافة طالب مفرد" أو "لصق قائمة طلاب" للبدء بإضافة طلاب دورك!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 text-slate-500 text-xs">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 text-blue-300 font-bold flex items-center justify-center text-sm">
                        {student.full_name?.charAt(0)}
                      </div>
                      <span>{student.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs dir-ltr text-right">
                      {student.email ? (
                        <span className="flex items-center justify-end gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          {student.email}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs dir-ltr text-right">
                      {student.phone ? (
                        <span className="flex items-center justify-end gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          {student.phone}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-blue-400 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        {student.student_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.full_name)}
                        className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">إضافة طالب جديد للدورة</h2>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">اسم الطالب الرباعي *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: عبد الله خالد العتيبي"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">البريد الإلكتروني (Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@company.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-blue-500 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">رقم الجوال</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0501234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-blue-500 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">الرمز التدريبي (تلقائي أو مخصص)</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder={`STU-${1000 + students.length + 1}`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ الطالب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">لصق كشف طلاب الدورة (دفعة واحدة)</h2>
            <p className="text-xs text-slate-400 mb-4">
              يمكنك لصق الأسماء سطر بسطر. صيغة السطر: <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">الاسم, الإيميل, رقم الجوال</code> أو الأسماء فقط!
            </p>

            <form onSubmit={handleBulkAdd} className="space-y-4">
              <div>
                <textarea
                  rows={8}
                  required
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`أحمد محمد علي, ahmed@email.com, 0501234561\nسارة خالد العتيبي, sara@email.com, 0501234562\nعمر عبد العزيز الشمري\nفاطمة إبراهيم الحسن`}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-xs outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition"
                >
                  {loading ? 'جاري الاستيراد...' : 'إضافة القائمة بالكامل'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition"
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
