import React, { useEffect, useState } from 'react'
import { dataService } from '../services/dataService'
import { exportAttendanceToExcel } from '../utils/exportToExcel'
import { FileSpreadsheet, Download, Calendar, Users, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react'

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

      // Fetch attendance for all sessions
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
      <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            تقارير وإحصائيات الحضور الكلية
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">تصدير السجلات إلى ملف Excel 📊</h1>
          <p className="text-slate-400 text-sm mt-1">توليد ملفات إكسل شاملة لجميع المحاضرات والطلاب على مدار 3 أشهر أو أي فترة</p>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || students.length === 0}
          className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
        >
          <FileSpreadsheet className="w-6 h-6" />
          <span>تنزيل ملف Excel (.xlsx) فوراً</span>
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs font-semibold">إجمالي الطلاب في الكشف</p>
          <h3 className="text-2xl font-extrabold text-white mt-2">{students.length} طالب</h3>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs font-semibold">عدد المحاضرات المنفذة</p>
          <h3 className="text-2xl font-extrabold text-white mt-2">{sessions.length} جلسة</h3>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs font-semibold">إجمالي عمليات الحضور</p>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{attendance.length} تسجيل</h3>
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
          <p className="text-slate-400 text-xs font-semibold">معدل الحضور العام</p>
          <h3 className="text-2xl font-extrabold text-blue-400 mt-2">
            {students.length > 0 && sessions.length > 0
              ? `${Math.round((attendance.length / (students.length * sessions.length)) * 100)}%`
              : '0%'}
          </h3>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          معاينة جدول الحضور والغياب للطلاب
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-500">جاري إعداد ومعالجة تقرير الحضور...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">اسم الطالب</th>
                  <th className="px-4 py-3">الرمز</th>
                  {sessions.map((sess) => (
                    <th key={sess.id} className="px-4 py-3 text-center whitespace-nowrap">
                      {sess.title}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-bold text-white">نسبة الحضور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student, idx) => {
                  let attended = 0
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-white">{student.full_name}</td>
                      <td className="px-4 py-3 font-mono text-blue-400">{student.student_code}</td>
                      {sessions.map((session) => {
                        const rec = attendance.find(
                          (a) => a.student_id === student.id && a.session_id === session.id
                        )
                        if (rec) attended++
                        return (
                          <td key={session.id} className="px-4 py-3 text-center">
                            {rec ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                                حاضر ✓
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold">
                                غائب ✗
                              </span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center font-bold text-emerald-400">
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
