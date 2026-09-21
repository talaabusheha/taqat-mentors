import * as XLSX from 'xlsx'

/**
 * Export full attendance sheet for all 40 students across all sessions to Excel (.xlsx)
 * @param {Array} students List of students
 * @param {Array} sessions List of sessions
 * @param {Array} attendance List of all attendance records
 * @param {String} courseTitle Title of course
 */
export const exportAttendanceToExcel = (students, sessions, attendance, courseTitle = 'دورة طاقات التدريبية') => {
  if (!students || students.length === 0) {
    alert('لا يوجد طلاب لتصدير بياناتهم!')
    return
  }

  // Build Excel rows dynamically
  const exportData = students.map((student, index) => {
    // Basic student info
    const row = {
      '#': index + 1,
      'اسم الطالب': student.full_name,
      'الرمز التدريبي': student.student_code,
      'البريد الإلكتروني': student.email || 'غير محدد',
      'رقم الجوال': student.phone || 'غير محدد',
    }

    let attendedCount = 0

    // Add a column for each session
    sessions.forEach((session) => {
      const record = attendance.find(
        (a) => a.student_id === student.id && a.session_id === session.id
      )
      const statusText = record
        ? record.status === 'PRESENT'
          ? 'حاضر'
          : 'متأخر'
        : 'غائب'

      if (record) attendedCount++

      const sessionColName = `${session.title} (${session.session_date})`
      row[sessionColName] = statusText
    })

    // Calculate metrics
    const totalSessions = sessions.length
    const absentCount = totalSessions - attendedCount
    const isExcluded = absentCount > 3
    const statusText = isExcluded ? '⚠️ مستثنى (تجاوز 3 أيام غياب)' : 'منتظم'

    const attendancePercentage = totalSessions > 0
      ? `${Math.round((attendedCount / totalSessions) * 100)}%`
      : '0%'

    row['إجمالي الجلسات'] = totalSessions
    row['عدد الحضور'] = attendedCount
    row['عدد الغياب'] = absentCount
    row['حالة الطالب / الاستثناء'] = statusText
    row['نسبة الحضور'] = attendancePercentage
    row['توصية القرار'] = isExcluded ? 'مستثنى لكثرة الغياب (> 3 أيام)' : 'مستمر في الدورة'

    return row
  })

  // Create sheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  
  // Set sheet direction to RTL for Arabic
  if (!worksheet['!views']) worksheet['!views'] = []
  worksheet['!views'].push({ RTL: true })

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الحضور والغياب')

  // Generate file name with current date
  const filename = `تقرير_حضور_طاقات_${new Date().toISOString().split('T')[0]}.xlsx`

  // Trigger browser download
  XLSX.writeFile(workbook, filename)
}
