// Mock dataset of 40 students for quick testing and fallback demo
export const INITIAL_STUDENTS = [
  { id: 'std-1', full_name: 'أحمد محمد علي', student_code: 'STU-1001', phone: '0501234561', is_active: true },
  { id: 'std-2', full_name: 'سارة خالد العتيبي', student_code: 'STU-1002', phone: '0501234562', is_active: true },
  { id: 'std-3', full_name: 'عمر عبد العزيز الشمري', student_code: 'STU-1003', phone: '0501234563', is_active: true },
  { id: 'std-4', full_name: 'فاطمة إبراهيم الحسن', student_code: 'STU-1004', phone: '0501234564', is_active: true },
  { id: 'std-5', full_name: 'محمد عبد الله القحطاني', student_code: 'STU-1005', phone: '0501234565', is_active: true },
  { id: 'std-6', full_name: 'ريم يوسف الدوسري', student_code: 'STU-1006', phone: '0501234566', is_active: true },
  { id: 'std-7', full_name: 'خالد عبد الرحمن السبيعي', student_code: 'STU-1007', phone: '0501234567', is_active: true },
  { id: 'std-8', full_name: 'نورة سعد المطيري', student_code: 'STU-1008', phone: '0501234568', is_active: true },
  { id: 'std-9', full_name: 'عبد العزيز فيصل الغامدي', student_code: 'STU-1009', phone: '0501234569', is_active: true },
  { id: 'std-10', full_name: 'منى طارق المالكي', student_code: 'STU-1010', phone: '0501234570', is_active: true },
  { id: 'std-11', full_name: 'ياسر هشام الزهراني', student_code: 'STU-1011', phone: '0501234571', is_active: true },
  { id: 'std-12', full_name: 'لماء حمد العنزي', student_code: 'STU-1012', phone: '0501234572', is_active: true },
  { id: 'std-13', full_name: 'سعود فهد الشهري', student_code: 'STU-1013', phone: '0501234573', is_active: true },
  { id: 'std-14', full_name: 'أسماء صالح الحربي', student_code: 'STU-1014', phone: '0501234574', is_active: true },
  { id: 'std-15', full_name: 'بدر ناصر الرشيدي', student_code: 'STU-1015', phone: '0501234575', is_active: true },
  { id: 'std-16', full_name: 'هند علي البقمي', student_code: 'STU-1016', phone: '0501234576', is_active: true },
  { id: 'std-17', full_name: 'فيصل سلطان الخالدي', student_code: 'STU-1017', phone: '0501234577', is_active: true },
  { id: 'std-18', full_name: 'دلال ماجد العصيمي', student_code: 'STU-1018', phone: '0501234578', is_active: true },
  { id: 'std-19', full_name: 'تركي منصور الغامدي', student_code: 'STU-1019', phone: '0501234579', is_active: true },
  { id: 'std-20', full_name: 'شهد عادل اليامي', student_code: 'STU-1020', phone: '0501234580', is_active: true },
  { id: 'std-21', full_name: 'ماجد وليد القحطاني', student_code: 'STU-1021', phone: '0501234581', is_active: true },
  { id: 'std-22', full_name: 'عبير راشد الأحمري', student_code: 'STU-1022', phone: '0501234582', is_active: true },
  { id: 'std-23', full_name: 'حسام زياد الغامدي', student_code: 'STU-1023', phone: '0501234583', is_active: true },
  { id: 'std-24', full_name: 'أمل سامي السليم', student_code: 'STU-1024', phone: '0501234584', is_active: true },
  { id: 'std-25', full_name: 'سلمان نواف الشمري', student_code: 'STU-1025', phone: '0501234585', is_active: true },
  { id: 'std-26', full_name: 'منى حسين باخشوين', student_code: 'STU-1026', phone: '0501234586', is_active: true },
  { id: 'std-27', full_name: 'وليد خالد الجهني', student_code: 'STU-1027', phone: '0501234587', is_active: true },
  { id: 'std-28', full_name: 'رنا زياد الصالح', student_code: 'STU-1028', phone: '0501234588', is_active: true },
  { id: 'std-29', full_name: 'مصطفى عادل المحسن', student_code: 'STU-1029', phone: '0501234589', is_active: true },
  { id: 'std-30', full_name: 'مريم محمود الشيخ', student_code: 'STU-1030', phone: '0501234590', is_active: true },
  { id: 'std-31', full_name: 'طرق حماد السفياني', student_code: 'STU-1031', phone: '0501234591', is_active: true },
  { id: 'std-32', full_name: 'وجدان سالم العيسى', student_code: 'STU-1032', phone: '0501234592', is_active: true },
  { id: 'std-33', full_name: 'زياد مروان التميمي', student_code: 'STU-1033', phone: '0501234593', is_active: true },
  { id: 'std-34', full_name: 'جواهر راكان القاسم', student_code: 'STU-1034', phone: '0501234594', is_active: true },
  { id: 'std-35', full_name: 'حمزة كمال النجار', student_code: 'STU-1035', phone: '0501234595', is_active: true },
  { id: 'std-36', full_name: 'ندى عثمان الهلالي', student_code: 'STU-1036', phone: '0501234596', is_active: true },
  { id: 'std-37', full_name: 'رامي غسان العوض', student_code: 'STU-1037', phone: '0501234597', is_active: true },
  { id: 'std-38', full_name: 'بيان طلال البسام', student_code: 'STU-1038', phone: '0501234598', is_active: true },
  { id: 'std-39', full_name: 'عصام بسام الفاضل', student_code: 'STU-1039', phone: '0501234599', is_active: true },
  { id: 'std-40', full_name: 'روان جمال الشريف', student_code: 'STU-1040', phone: '0501234600', is_active: true }
]

export const INITIAL_SESSIONS = [
  {
    id: 'sess-1',
    title: 'المحاضرة 1: مقدمة ودستور الدورة',
    session_date: '2026-09-15',
    start_time: '16:00',
    status: 'CLOSED',
    qr_code_token: 'TOKEN-SESS-1-SECRET'
  },
  {
    id: 'sess-2',
    title: 'المحاضرة 2: أساسيات تقنية الويب الحديثة',
    session_date: '2026-09-18',
    start_time: '16:00',
    status: 'CLOSED',
    qr_code_token: 'TOKEN-SESS-2-SECRET'
  },
  {
    id: 'sess-3',
    title: 'المحاضرة 3: تطبيق عملي ومباشر (الجلسة الحالية)',
    session_date: '2026-09-20',
    start_time: '16:00',
    status: 'ACTIVE',
    qr_code_token: 'TAQAT-LIVE-QR-2026'
  }
]

export const INITIAL_ATTENDANCE = [
  { id: 'att-1', session_id: 'sess-1', student_id: 'std-1', scanned_at: '2026-09-15T16:02:10Z', status: 'PRESENT' },
  { id: 'att-2', session_id: 'sess-1', student_id: 'std-2', scanned_at: '2026-09-15T16:05:40Z', status: 'PRESENT' },
  { id: 'att-3', session_id: 'sess-1', student_id: 'std-3', scanned_at: '2026-09-15T16:15:00Z', status: 'LATE' },
  { id: 'att-4', session_id: 'sess-2', student_id: 'std-1', scanned_at: '2026-09-18T16:01:05Z', status: 'PRESENT' },
  { id: 'att-5', session_id: 'sess-2', student_id: 'std-4', scanned_at: '2026-09-18T16:03:22Z', status: 'PRESENT' }
]
