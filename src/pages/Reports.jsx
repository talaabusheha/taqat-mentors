import React, { useEffect, useState } from 'react'
import { dataService } from '../services/dataService'
import { exportAttendanceToExcel } from '../utils/exportToExcel'
import { FileSpreadsheet, Download, Calendar, Sparkles } from 'lucide-react'

export default function Reports() {
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

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
          <h1 className="text-2xl md:text-3xl font-extrabold">تصدير السجلات إلى ملف Excel</h1>
          <p className="text-sky-100 text-sm mt-1">توليد ملفات إكسل شاملة لجميع المحاضرات والطلاب على مدار 3 أشهر أو أي فترة</p>
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

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">إجمالي الطلاب في الكشف</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{students.length} طالب</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">عدد المحاضرات المنفذة</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{sessions.length} جلسة</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">إجمالي عمليات الحضور</p>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">{attendance.length} تسجيل</h3>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-slate-500 text-xs font-bold">معدل الحضور العام</p>
          <h3 className="text-2xl font-extrabold text-[#0072bc] mt-2">
            {students.length > 0 && sessions.length > 0
              ? `${Math.round((attendance.length / (students.length * sessions.length)) * 100)}%`
              : '0%'}
          </h3>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0072bc]" />
          معاينة جدول الحضور والغياب للطلاب
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400">جاري إعداد ومعالجة تقرير الحضور...</div>
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
                  <th className="px-4 py-3 text-center font-bold text-slate-900">نسبة الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  let attended = 0
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{student.full_name}</td>
                      <td className="px-4 py-3 font-mono text-[#0072bc] font-bold">{student.student_code}</td>
                      {sessions.map((session) => {
                        const rec = attendance.find(
                          (a) => a.student_id === student.id && a.session_id === session.id
                        )
                        if (rec) attended++
                        return (
                          <td key={session.id} className="px-4 py-3 text-center">
                            {rec ? (
                              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                حاضر
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold">
                                غائب
                              </span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                        {sessions.length > 0 ? `${Math.round((attended / sessions.length) * 100)}%` : '0%'}
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
