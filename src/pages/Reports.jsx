import React, { useEffect, useState } from 'react'
import { dataService } from '../services/dataService'
import { exportAttendanceToExcel } from '../utils/exportToExcel'
import { FileSpreadsheet, Download, Calendar, Sparkles, AlertTriangle, UserX, CheckCircle2, Filter } from 'lucide-react'

export default function Reports() {
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState('ALL') // 'ALL' | 'EXCLUDED' | 'REGULAR'

  const loadAllData = async () => {
    setLoading(true)
    try {
      const allStudents = await dataService.getStudents()
      const allSessions = await dataService.getSessions()

      let allAttendance = []
      for (const sess of allSessions) {
        const sessAtt = await dataService.getAttendanceBySession(sess.id)
        allAttendance = [...allAttendance, ...sessAtt]
      }

      setStudents(allStudents)
      setSessions(allSessions)
      setAttendance(allAttendance)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // Calculate detailed stats for each student
  const studentsWithStats = students.map((student) => {
    let attended = 0
    sessions.forEach((session) => {
      const rec = attendance.find(
        (a) => a.student_id === student.id && a.session_id === session.id
      )
      if (rec) attended++
    })
    const totalSessions = sessions.length
    const absentCount = totalSessions - attended
    const isExcluded = absentCount > 3
    const attendancePercentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0

    return {
      ...student,
      attended,
      absentCount,
      totalSessions,
      isExcluded,
      attendancePercentage,
    }
  })

  const excludedStudentsCount = studentsWithStats.filter((s) => s.isExcluded).length
  const regularStudentsCount = studentsWithStats.filter((s) => !s.isExcluded).length

  const filteredStudents = studentsWithStats
    .filter((student) => {
      if (filterMode === 'EXCLUDED') return student.isExcluded
      if (filterMode === 'REGULAR') return !student.isExcluded
      return true
    })
    .sort((a, b) =>
      (a.student_code || '').localeCompare(b.student_code || '', undefined, { numeric: true, sensitivity: 'base' })
    )

  const handleExport = () => {
    exportAttendanceToExcel(students, sessions, attendance)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            تقارير وإحصائيات الحضور الكلية
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">تصدير السجلات ورصد المستثنين إلى Excel</h1>
          <p className="text-sky-100 text-sm mt-1">
            توليد ملفات إكسل شاملة مع التحديد التلقائي للطلاب الذين تجاوز غيابهم 3 أيام لاستبعادهم
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || students.length === 0}
          className="px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-extrabold text-sm shadow-lg flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-6 h-6" />
          <span>تنزيل ملف Excel (.xlsx) فوراً</span>
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Exclusion Warning Banner */}
      {excludedStudentsCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-5 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-rose-950">
                تنبيه استبعاد: يتواجد {excludedStudentsCount} طالب تجاوزوا الحد الأقصى للغياب (أكثر من 3 أيام)!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                تلقائياً تم وضع علامة استثناء عليهم بملف Excel لتسهيل استبعادهم وقبول الملتزمين.
              </p>
            </div>
          </div>

          <button
            onClick={() => setFilterMode('EXCLUDED')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0 cursor-pointer"
          >
            عرض المستثنين فقط ({excludedStudentsCount})
          </button>
        </div>
      )}

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">إجمالي الطلاب</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{students.length} طالب</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">عدد المحاضرات</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{sessions.length} جلسة</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">إجمالي التسجيلات</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{attendance.length} تسجيل</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">الطلاب المنتظمون</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
            <span>{regularStudentsCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </h3>
        </div>
        <div className="bg-white border-2 border-rose-200 bg-rose-50/50 rounded-2xl p-5 shadow-sm">
          <p className="text-rose-700 text-xs font-bold">المستثنون (غائب &gt; 3)</p>
          <h3 className="text-2xl font-extrabold text-rose-600 mt-2 flex items-center gap-2">
            <span>{excludedStudentsCount}</span>
            <UserX className="w-5 h-5 text-rose-500" />
          </h3>
        </div>
      </div>

      {/* Table Preview Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0072bc]" />
            معاينة جدول الحضور والغياب وحالات الاستثناء
          </h2>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عرض الكل ({students.length})
            </button>
            <button
              onClick={() => setFilterMode('EXCLUDED')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                filterMode === 'EXCLUDED'
                  ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <UserX className="w-3.5 h-3.5" />
              المستثنون فقط ({excludedStudentsCount})
            </button>
            <button
              onClick={() => setFilterMode('REGULAR')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                filterMode === 'REGULAR'
                  ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              المنتظمون ({regularStudentsCount})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">جاري إعداد ومعالجة تقرير الحضور...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">لا يوجد طلاب مطابقون لشرط التصفية المحدد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">اسم الطالب</th>
                  <th className="px-4 py-3">الرمز</th>
                  {sessions.map((sess) => (
                    <th key={sess.id} className="px-4 py-3 text-center whitespace-nowrap">
                      {sess.title}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">أيام الغياب</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">نسبة الحضور</th>
                  <th className="px-4 py-3 text-center font-bold text-slate-900">حالة الطالب / القرار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  return (
                    <tr
                      key={student.id}
                      className={`transition ${
                        student.isExcluded
                          ? 'bg-rose-50/60 hover:bg-rose-100/60 border-r-4 border-r-rose-500'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          {student.isExcluded && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                          <span>{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[#0072bc] font-bold">{student.student_code}</td>
                      {sessions.map((session) => {
                        const rec = attendance.find(
                          (a) => a.student_id === student.id && a.session_id === session.id
                        )
                        return (
                          <td key={session.id} className="px-4 py-3 text-center">
                            {rec ? (
                              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                حاضر
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                                غائب
                              </span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        <span className={`px-2 py-0.5 rounded ${student.absentCount > 3 ? 'bg-rose-200 text-rose-900 font-black' : 'bg-slate-100'}`}>
                          {student.absentCount} أيام
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                        {student.attendancePercentage}%
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {student.isExcluded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[11px] shadow-xs">
                            <UserX className="w-3 h-3" />
                            مستثنى (غياب &gt; 3 أيام)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            منتظم
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
