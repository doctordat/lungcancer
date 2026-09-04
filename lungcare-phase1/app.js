const STORAGE_KEY = 'lungcare.phase2.v2';

const FLOW = [
  ['previsit-draft', 'Chưa khai'],
  ['previsit-submitted', 'Đã gửi khai nhanh'],
  ['nurse-intake', 'ĐD tiếp nhận'],
  ['ready-for-doctor', 'Sẵn sàng cho BS'],
  ['doctor-examining', 'BS đang khám'],
  ['doctor-plan-confirmed', 'BS chốt kế hoạch'],
  ['nurse-education', 'ĐD hướng dẫn'],
  ['home-care-active', 'Theo dõi tại nhà']
];

const defaultState = () => ({
  version: 1,
  role: new URLSearchParams(location.search).get('role') || 'patient',
  encounterState: 'previsit-draft',
  selectedTab: 'today',
  alertHandled: false,
  alertResolution: { acknowledged:false, assessment:'', action:'', clinicianReason:'', status:'open' },
  patient: {
    name: 'Nguyễn Văn Minh', code: 'LC-871748', age: 62, sex: 'Nam', ecog: 0,
    diagnosis: 'NSCLC adenocarcinoma', stage: 'IVA', tnm: 'cT2bN2M1a',
    biomarker: 'EGFR exon 19 deletion', therapy: 'Osimertinib 80 mg mỗi ngày',
    line: 'Điều trị đích tuyến 1', week: 6, adherence: { taken: 41, total: 42, missed: 1 },
    toxicity: [{ name: 'Tiêu chảy', grade: 2 }, { name: 'Ban da', grade: 1 }],
    followUp: '27/08/2026 · 08:30', doctor: 'BS. Mỹ Linh', nurse: 'ĐD. Thu Hà'
  },
  previsit: { goal: '', changes: '', adherence: '', toxicity: '', submittedAt: null, doctorRead: false },
  patientVoice: { transcript:'', status:'empty', capturedAt:null, readByDoctor:false },
  triage: { symptom:'', severity:'', redFlags:[], status:'empty', submittedAt:null, escalationId:null, actionStatus:'new', disposition:'', handledBy:'', handledAt:null, nurseNote:'', patientFeedback:'', review:{ status:'pending', outcome:'', rationale:'', redFlagAcknowledged:false, reviewedBy:'', reviewedAt:null, nurseTask:'', patientReceipt:'' } },
  scenario: 'routine',
  safetyRequests: [],
  recist: {
    scanDate: '28/08/2026 (Tuần 8 mô phỏng)',
    baselineDate: '03/07/2026',
    modality: 'CT lồng ngực có cản quang',
    evaluator: 'Khoa CĐHA · BS. Trần Quang',
    targetLesions: [
      { id: 'TL1', site: 'Thùy trên phổi phải (U nguyên phát)', baseline: 32, current: 22, unit: 'mm', change: -31.3 },
      { id: 'TL2', site: 'Hạch trung thất nhóm 4R', baseline: 18, current: 11, unit: 'mm', change: -38.9 }
    ],
    sumBaseline: 50,
    sumCurrent: 33,
    sumChangePct: -34.0,
    nonTargetStatus: 'Tổn thương xương di căn không tiến triển',
    newLesions: 'Không có tổn thương mới',
    overallResponse: 'PR (Đáp ứng một phần)',
    reviewed: false,
    reviewMeta: null
  },
  ctcae: {
    items: [
      {
        id: 'diarrhea',
        name: 'Tiêu chảy (Diarrhea)',
        grade: 2,
        patientReported: '3–4 lần/ngày, phân lỏng, không đau quặn nhiều',
        definition: 'Grade 2: Tăng 4–6 lần đi tiêu/ngày so với mức nền; ảnh hưởng sinh hoạt thường ngày mức độ vừa.',
        managementDemo: 'Bù nước điện giải Oresol + Loperamide 2mg sau mỗi lần đi tiêu lỏng (tối đa 16mg/ngày). Theo dõi sát nếu sốt hoặc kéo dài >48h.',
        dosingRecommendation: 'Tiếp tục Osimertinib 80mg + điều trị hỗ trợ. Nếu tăng lên Grade ≥ 3: tạm dừng thuốc cho đến khi về Grade ≤ 1.',
        reviewed: false
      },
      {
        id: 'rash',
        name: 'Ban da dạng trứng cá (Rash maculo-papular)',
        grade: 1,
        patientReported: 'Ban đỏ nhẹ vùng mặt và lưng, ngứa nhẹ',
        definition: 'Grade 1: Tổn thương dát sẩn diện tích < 10% BSA, có hoặc không ngứa/rát.',
        managementDemo: 'Dưỡng ẩm da không cồn + Kem bôi Hydrocortisone 1% hoặc Clindamycin 1% tại chỗ. Tránh ánh nắng trực tiếp.',
        dosingRecommendation: 'Tiếp tục Osimertinib 80mg, không cần chỉnh liều.',
        reviewed: false
      }
    ],
    reviewed: false,
    reviewMeta: null
  },
  mdt: {
    status: 'not_requested', // 'not_requested' | 'scheduled' | 'completed'
    reason: 'Đánh giá đáp ứng sau tuần 8 và xem xét chiến lược tiếp theo',
    requestedAt: null,
    completedAt: null,
    leadClinician: 'BS. Mỹ Linh (Nội Ung bướu)',
    panel: [
      { specialty: 'Nội Ung bướu', doctor: 'BS. Mỹ Linh', recommendation: 'Đáp ứng tốt (PR -34%), độc tính G1-2 kiểm soát được. Đề xuất tiếp tục Osimertinib 80mg.' },
      { specialty: 'Ngoại Lồng ngực', doctor: 'BS. CKII. Văn Hùng', recommendation: 'Tổn thương thùy trên phổi phải giảm từ 32mm -> 22mm. Hiện tại giai đoạn IVA chưa có chỉ định phẫu thuật triệt căn.' },
      { specialty: 'Xạ trị Ung bướu', doctor: 'TS. BS. Hoàng Nam', recommendation: 'Chưa có chỉ định xạ trị giảm nhẹ khẩn cấp hay xạ định vị (SBRT). Tiếp tục theo dõi đáp ứng toàn thân.' },
      { specialty: 'Giải phẫu bệnh & Sinh học PT', doctor: 'BS. Phương Thảo', recommendation: 'Đột biến EGFR exon 19 del nguyên phát. Chưa có dấu hiệu kháng thuốc trên lâm sàng, chưa cần sinh thiết lại/ctDNA lúc này.' }
    ],
    consensus: 'Đồng thuận tiếp tục Osimertinib 80mg/ngày, phối hợp chăm sóc hỗ trợ độc tính tiêu chảy/ban da và hẹn CT ngực + MRI não đánh giá lại ở tuần 16.',
    reviewed: false,
    reviewMeta: null
  },
  safetyLabs: {
    qtc: { value: 432, unit: 'ms', status: 'normal', date: '01/09/2026', baseline: 418, formula: 'Fridericia (QTcF)' },
    potassium: { value: 4.1, unit: 'mmol/L', status: 'normal', ref: '3.5 - 5.0', date: '01/09/2026' },
    magnesium: { value: 0.88, unit: 'mmol/L', status: 'normal', ref: '0.75 - 1.05', date: '01/09/2026' },
    astAlt: { ast: 28, alt: 32, unit: 'U/L', status: 'normal', ref: '< 40', date: '01/09/2026' },
    creatinine: { value: 82, unit: 'µmol/L', egfr: 86, status: 'normal', date: '01/09/2026' },
    ildScreening: { hoKhanTang: false, khoThoGangsuc: false, spo2: 98, status: 'clear', note: 'Chưa có dấu hiệu nghi ngờ viêm phổi kẽ (ILD)' },
    reviewed: false,
    reviewMeta: null
  },
  biomarkers: {
    primary: 'EGFR Exon 19 Deletion (p.E746_A750del)',
    baselineDate: '03/07/2026',
    resistanceMarkers: [
      { marker: 'EGFR T790M', status: 'Negative (0%)', method: 'ctDNA NGS', date: '28/08/2026' },
      { marker: 'EGFR C797S', status: 'Negative (0%)', method: 'ctDNA NGS', date: '28/08/2026' },
      { marker: 'MET Amplification', status: 'Negative (Copy No. 2.1)', method: 'ctDNA NGS', date: '28/08/2026' },
      { marker: 'HER2 Amplification / Mutation', status: 'Negative', method: 'ctDNA NGS', date: '28/08/2026' },
      { marker: 'SCLC Transformation Markers', status: 'Negative (NSE, ProGRP bình thường)', method: 'Serum + IHC', date: '28/08/2026' }
    ],
    ctDnaTrend: [
      { checkpoint: 'Baseline (Tuần 0)', egfrAbundance: '8.4%', interpretation: 'Tải lượng đột biến cao' },
      { checkpoint: 'Tuần 4', egfrAbundance: '1.2%', interpretation: 'Đáp ứng phân tử nhanh' },
      { checkpoint: 'Tuần 8 (Hiện tại)', egfrAbundance: '0.08% (Clearance)', interpretation: 'Thanh thải ctDNA sâu (Deep Molecular Response)' }
    ],
    reviewed: false,
    reviewMeta: null
  },
  medicationSafety: { reviewed:{dose:false,adherence:false,toxicity:false,labs:false,interactions:false}, reviewMeta:{}, checks:[{id:'dose',label:'Liều hiện tại',value:'Osimertinib 80 mg/ngày · tuần 6',source:'Treatment plan demo'},{id:'adherence',label:'Tuân thủ',value:'41/42 liều · 98%',source:'Patient medication log demo'},{id:'toxicity',label:'Độc tính',value:'Tiêu chảy G2 · ban da G1',source:'Patient-reported demo'},{id:'labs',label:'Safety labs',value:'QTc/điện giải chưa có',source:'Data gap demo'},{id:'interactions',label:'Tương tác cần kiểm tra',value:'Chưa kết nối drug database',source:'Chưa triển khai'}] },
  careLoop: { plan:{planId:'PLAN-LC-871748-001',revision:1,status:'draft',createdBy:'BS. Mỹ Linh',confirmedAt:null,activatedAt:null,provenance:'Draft demo · chưa clinician confirm'}, tasks:[{id:'med',label:'Uống thuốc hôm nay',status:'pending',planId:'PLAN-LC-871748-001',revision:1},{id:'symptom',label:'Kiểm tra triệu chứng',status:'pending',planId:'PLAN-LC-871748-001',revision:1},{id:'labs',label:'Nhắc xét nghiệm an toàn',status:'pending',planId:'PLAN-LC-871748-001',revision:1},{id:'followup',label:'Chuẩn bị tái khám',status:'pending',planId:'PLAN-LC-871748-001',revision:1}], symptomCheck:{completed:false,at:null,summary:''} },
  intake: { idChecked: false, vitals: false, allergy: false, medrec: false, redflags: false, note: '' },
  doctor: { accepted: false, voiceDone: false, toxicityReviewed: false, molecularReviewed: false, recistReviewed: false, decision: 'Tiếp tục osimertinib 80 mg', decisionStatus: 'draft', decisionReason: '', note: '', receipt: null },
  decisionBrief: {
    facts: [
      { label:'Chẩn đoán', value:'NSCLC adenocarcinoma · Stage IVA', source:'Dữ liệu mô phỏng · chưa xác minh' },
      { label:'Molecular', value:'EGFR exon 19 deletion', source:'Dữ liệu mô phỏng · molecular baseline' },
      { label:'Điều trị hiện tại', value:'Osimertinib 80 mg/ngày · tuần 6', source:'Dữ liệu mô phỏng · treatment plan v1' },
      { label:'Tuân thủ', value:'41/42 liều · 98%', source:'Dữ liệu mô phỏng · patient medication log' }
    ],
    patientReported: [
      { label:'Tiêu chảy', value:'Grade 2 (demo)', source:'Người bệnh báo cáo' },
      { label:'Ban da', value:'Grade 1 (demo)', source:'Người bệnh báo cáo' }
    ],
    safetyGates: [
      { label:'Khó thở mới / nghi ILD', status:'clear', detail:'Chưa ghi nhận tại thời điểm khám demo' },
      { label:'QTc · điện giải', status:'missing', detail:'Chưa có ECG/điện giải gần nhất' },
      { label:'Gan · thận', status:'ready', detail:'Dữ liệu demo trong giới hạn theo dõi' },
      { label:'Đáp ứng hình ảnh', status:'missing', detail:'CT tuần 8 chưa thực hiện' }
    ],
    evidence: { title:'Evidence map · Osimertinib follow-up', version:'Demo v0.2 · 01/09/2026', note:'Nội dung mô phỏng, chờ bác sĩ phụ trách phê duyệt và gắn nguồn chính thức.' },
    readiness: { dataGapsAcknowledged:false },
    lens: { uncertainties: [
      { id:'response', label:'Chưa có CT tuần 8 để đánh giá đáp ứng', checked:false },
      { id:'safety', label:'Chưa có QTc/điện giải gần nhất', checked:false },
      { id:'toxicity', label:'Cần xác minh mức độ độc tính qua trao đổi trực tiếp', checked:false }
    ] },
    evidenceMap: [
      { id:'molecular', label:'Molecular', value:'EGFR exon 19 deletion', status:'ready', provenance:'Mô phỏng · baseline report', reviewed:false },
      { id:'toxicity', label:'Độc tính', value:'Tiêu chảy G2 · ban da G1', status:'review', provenance:'Mô phỏng · người bệnh báo cáo', reviewed:false },
      { id:'adherence', label:'Tuân thủ', value:'41/42 liều · 98%', status:'ready', provenance:'Mô phỏng · medication log', reviewed:false },
      { id:'response', label:'Đáp ứng', value:'CT tuần 8 chưa có', status:'missing', provenance:'Data gap · cần bổ sung', reviewed:false },
      { id:'safety', label:'Safety labs', value:'QTc/điện giải chưa có', status:'missing', provenance:'Data gap · cần bổ sung', reviewed:false },
      { id:'context', label:'Bối cảnh', value:'Tái khám ngoại trú · tuần 6', status:'ready', provenance:'Mô phỏng · encounter context', reviewed:false }
    ]
  },
  education: { identity: false, emr: false, allergy: false, meds: false, missedDose: false, toxicity: false, redflags: false, teachback: false, followup: false, contact: false, completedAt: null, completedBy: null, nurseNote: '' },
  home: { medicationTakenToday: false, missedToday: false },
  proDiary: {
    entries: [
      { date: '27/08', medTaken: true, diarrheaCount: 2, rashGrade: 1, fever: false, dyspnea: false, note: 'Ăn uống bình thường' },
      { date: '28/08', medTaken: true, diarrheaCount: 3, rashGrade: 1, fever: false, dyspnea: false, note: 'Đi ngoài phân lỏng sau ăn' },
      { date: '29/08', medTaken: true, diarrheaCount: 4, rashGrade: 2, fever: false, dyspnea: false, note: 'Uống 1 gói Oresol + 1 viên Loperamide' },
      { date: '30/08', medTaken: false, diarrheaCount: 3, rashGrade: 1, fever: false, dyspnea: false, note: 'Quên uống thuốc buổi sáng, uống bù buổi chiều' },
      { date: '31/08', medTaken: true, diarrheaCount: 2, rashGrade: 1, fever: false, dyspnea: false, note: 'Đỡ tiêu chảy hơn' },
      { date: '01/09', medTaken: true, diarrheaCount: 1, rashGrade: 1, fever: false, dyspnea: false, note: 'Ban đỏ mặt nhẹ' },
      { date: '02/09', medTaken: true, diarrheaCount: 2, rashGrade: 1, fever: false, dyspnea: false, note: 'Ổn định, sẵn sàng tái khám' }
    ],
    todayCheckin: {
      medTaken: true,
      diarrheaCount: 2,
      rashGrade: 1,
      fever: false,
      dyspnea: false,
      note: ''
    }
  },
  ddiChecker: {
    concomitantMeds: [
      { name: 'Omeprazole 20mg', dose: '1 viên/sáng trước ăn', indication: 'Trào ngược dạ dày (GERD)', source: 'Đơn ngoại viện / Tự mua' },
      { name: 'Amlodipine 5mg', dose: '1 viên/sáng', indication: 'Tăng huyết áp', source: 'Khoa Tim mạch' },
      { name: 'Paracetamol 500mg', dose: 'Khi đau đầu/sốt (uống ngắt quãng)', indication: 'Giảm đau hạ sốt', source: 'Tủ thuốc gia đình' },
      { name: 'Cao thảo dược trị ho (Đông y)', dose: '2 thìa/ngày', indication: 'Giảm ho khan', source: 'Người nhà sắc uống' }
    ],
    interactions: [
      {
        drug: 'Omeprazole 20mg (Thuốc ức chế bơm Proton - PPI)',
        severity: 'Major (Nghiêm trọng)',
        level: 'major',
        mechanism: 'Tăng pH dịch vị dạ dày làm giảm độ hòa tan và giảm đáng kể nồng độ Osimertinib trong huyết tương (AUC giảm tới 30-40%), nguy cơ thất bại điều trị.',
        recommendation: 'Ngưng Omeprazole. Nếu cần điều trị dạ dày: Chuyển sang Antacid (như Nhôm/Magie hydroxyd) uống CÁCH Osimertinib ít nhất 2 giờ TRƯỚC hoặc SAU.'
      },
      {
        drug: 'Cao thảo dược trị ho (Đông y không rõ thành phần)',
        severity: 'Moderate (Cần thận trọng)',
        level: 'moderate',
        mechanism: 'Nguy cơ chứa các dược liệu cảm ứng hoặc ức chế enzym chuyển hóa gan CYP3A4, làm dao động nồng độ Osimertinib khó kiểm soát hoặc tăng độc tính gan.',
        recommendation: 'Tạm ngưng thảo dược đông y chưa rõ nguồn gốc. Theo dõi sát men gan AST/ALT.'
      },
      {
        drug: 'Amlodipine 5mg (Thuốc chẹn kênh Canxi)',
        severity: 'Minor (Theo dõi)',
        level: 'minor',
        mechanism: 'Cả 2 thuốc đều chuyển hóa qua CYP3A4 nhưng không gây ức chế/cảm ứng mạnh. Không tương tác nghiêm trọng.',
        recommendation: 'Tiếp tục duy trì Amlodipine 5mg. Theo dõi huyết áp định kỳ.'
      }
    ],
    reviewed: false,
    reviewMeta: null
  },
  rehabNutrition: {
    weightKg: 58.0,
    heightCm: 165,
    bmi: 21.3,
    weightChange6MoPct: -1.5,
    cachexiaRisk: 'Thấp (Ổn định thể trạng)',
    dietPlan: 'Chế độ ăn giàu đạm (thịt nạc, cá, trứng), chia 5-6 bữa nhỏ/ngày, uống đủ 2 lít nước ấm, hạn chế đồ dầu mỡ chua cay để giảm kích ứng tiêu hóa.',
    exercises: [
      { id: 'pursed_lip', name: '1. Thở chúm môi (Pursed-lip Breathing)', duration: '10 phút (Sáng / Chiều)', instruction: 'Hít sâu bằng mũi 2 giây -> Chúm môi thở ra từ từ 4 giây. Giúp xả khí cặn trong phổi, tăng oxy máu.', completed: false },
      { id: 'diaphragm', name: '2. Thở cơ hoành bụng (Diaphragmatic Breathing)', duration: '5 phút trước khi ngủ', instruction: 'Đặt 1 tay lên ngực, 1 tay lên bụng. Hít vào bụng phình lên, thở ra bụng xẹp xuống. Giúp giảm căng thẳng và giảm khó thở.', completed: false },
      { id: 'walking', name: '3. Đi bộ nhẹ nhàng bằng phẳng', duration: '15 phút/ngày', instruction: 'Đi bộ tốc độ vừa phải, ngưng nghỉ nếu thấy mệt hoặc hụt hơi. Duy trì thể lực ECOG 0-1.', completed: false }
    ],
    reviewed: false,
    reviewMeta: null
  },
  caregiverSync: {
    primaryCaregiver: { name: 'Nguyễn Văn Tuấn', relation: 'Con trai', phone: '0918 234 567', active: true },
    preferences: { alertRed: true, alertYellow: true, alertMissedDose: true, alertTeachbackDone: true },
    smsHistory: [
      { id: 'SMS-101', timestamp: '27/08/2026 08:35', type: 'info', recipient: '0918 234 567 (Anh Tuấn)', message: '[LungCare] Bố Minh đã tái khám tuần 6. Bác sĩ xác nhận đáp ứng tốt (PR -34%), tiếp tục phác đồ Osimertinib 80mg.' },
      { id: 'SMS-102', timestamp: '30/08/2026 10:15', type: 'warning', recipient: '0918 234 567 (Anh Tuấn)', message: '[LungCare Nhắc nhở] Bố Minh vừa báo quên uống liều thuốc sáng nay. Nhắc Bố uống bù trước 20:00 tối nay nếu có thể.' }
    ]
  },
  treatmentJourney: {
    milestones: [
      { week: 0, title: 'Chẩn đoán & Khởi trị', date: '03/07/2026', badge: 'Baseline', status: 'completed', desc: 'NSCLC IVA EGFR ex19del. Khởi trị Osimertinib 80mg/ngày. Kích thước u ban đầu 50mm.' },
      { week: 4, title: 'Đánh giá an toàn sớm', date: '31/07/2026', badge: 'Safety OK', status: 'completed', desc: 'Dung nạp tốt, xuất hiện Tiêu chảy G1 và Ban da G1. ECG QTcF 418ms bình thường.' },
      { week: 8, title: 'Tái khám & CT đánh giá', date: '28/08/2026', badge: 'PR (-34%)', status: 'active', desc: 'CT ngực: Đáp ứng một phần (-34.0%). ctDNA giảm sâu còn 0.08%. Không có đột biến kháng thuốc.' },
      { week: 16, title: 'Tái khám định kỳ & MRI não', date: '23/10/2026 (Dự kiến)', badge: 'Kế hoạch', status: 'upcoming', desc: 'CT lồng ngực + MRI sọ não kiểm tra di căn thần kinh trung ương + Sinh thiết lỏng ctDNA đợt 3.' },
      { week: 24, title: 'Theo dõi đáp ứng dài hạn', date: '18/12/2026 (Dự kiến)', badge: 'Kế hoạch', status: 'upcoming', desc: 'Đánh giá PFS dài hạn, kiểm tra toàn diện chất lượng sống và chức năng hô hấp.' }
    ]
  },
  clinicalCalculators: {
    inputs: {
      age: 62,
      sex: 'male',
      weightKg: 58.0,
      heightCm: 165,
      serumCreatinineMgDl: 0.93,
      qtIntervalMs: 390,
      heartRateBpm: 72,
      ecogScore: 0
    },
    results: {
      crClCockcroftGault: 67.5,
      qtcFFridericia: 414,
      qtcBBazett: 427,
      bsaDuBois: 1.63,
      karnofskyScore: 100
    },
    reviewed: false,
    reviewMeta: null
  },
  nccnPathways: {
    guidelineVersion: 'NCCN Guidelines v2.2026 Non-Small Cell Lung Cancer',
    selectedBiomarker: 'egfr_ex19del',
    pathwayTree: {
      histology: 'Adenocarcinoma (Ung thư biểu mô tuyến)',
      stage: 'Stage IVA (cT2bN2M1a - Di căn màng phổi & xương)',
      driverMutation: 'EGFR Exon 19 Deletion (p.E746_A750del)',
      firstLineStandard: {
        preferred: 'Osimertinib 80mg/ngày (Category 1, Preferred)',
        evidenceTrial: 'FLAURA Trial (Median PFS 18.9 tháng vs 10.2 tháng Erlotinib/Gefitinib; Median OS 38.6 tháng, HR 0.80)',
        combinationAlternative: 'Osimertinib + Platinum/Pemetrexed (FLAURA2 Trial, PFS 25.5 tháng, chỉ định ca gánh nặng u cao hoặc di căn não)'
      },
      progressionPathways: [
        { mechanism: 'Đột biến EGFR C797S', nextStep: 'Chuyển TKI thế hệ 4 (nghiên cứu) hoặc Phối hợp TKI thế hệ 1 + 3 (nếu trans/cis)' },
        { mechanism: 'Khuếch đại MET (MET Amplification)', nextStep: 'Phối hợp Osimertinib + Savolitinib / Amivantamab (SAVANNAH / MARIPOSA-2)' },
        { mechanism: 'Chuyển dạng SCLC (Tế bào nhỏ)', nextStep: 'Hóa trị bộ đôi Etoposide + Cisplatin/Carboplatin' },
        { mechanism: 'Tiến triển thiểu số (Oligoprogression)', nextStep: 'Tiếp tục Osimertinib 80mg + Xạ định vị SBRT vào tổn thương đích' }
      ]
    },
    reviewed: false,
    reviewMeta: null
  },
  voiceScribe: {
    status: 'idle',
    transcript: 'Bác sĩ Mỹ Linh: Chào chú Minh, tuần này chú uống thuốc Osimertinib 80mg đều không? Chú Minh: Dạ chào bác sĩ, tôi uống đủ mỗi sáng lúc 8h, chỉ quên 1 hôm sáng chủ nhật nhưng chiều uống bù ngay. Bác sĩ: Rất tốt, chú có bị tác dụng phụ gì không? Chú Minh: Bụng đi ngoài phân lỏng khoảng 3-4 lần mỗi ngày, tôi có uống 1 gói Oresol với 1 viên Loperamide thì thấy êm. Mặt và lưng nổi vài nốt mụn đỏ hơi ngứa nhẹ, tôi có bôi kem dưỡng. Bác sĩ: Chú có bị sốt hay khó thở khi leo cầu thang không? Chú Minh: Dạ không sốt, thở bình thường êm lắm bác sĩ. Bác sĩ: Kết quả CT tuần 8 khối u phổi đã giảm hơn 30%, đáp ứng rất tốt. Chú tiếp tục uống thuốc đúng giờ, nhớ uống nhiều nước nhé!',
    extractedEntities: {
      subjective: 'Bệnh nhân nam 62 tuổi, uống Osimertinib 80mg tuân thủ tốt (quên 1 liều đã uống bù). Tiêu chảy G2 (3-4 lần/ngày) đáp ứng với Oresol + Loperamide. Ban da dát sẩn G1 nhẹ vùng mặt/lưng. Không sốt, không khó thở (SpO2 98%).',
      objective: 'CT ngực tuần 8: U thùy trên phổi phải giảm từ 32mm -> 22mm, hạch 18mm -> 11mm (SLD giảm -34.0% -> PR). QTcF 414ms, K+ 4.1, ctDNA 0.08% thanh thải sâu. CrCl 67.6 mL/min.',
      assessment: 'NSCLC adenocarcinoma IVA EGFR ex19del tuần 6 đáp ứng một phần (PR - RECIST 1.1) theo NCCN Category 1. Độc tính G1-2 kiểm soát ổn định.',
      plan: 'Tiếp tục Osimertinib 80mg/ngày. Duy trì Oresol + Loperamide khi tiêu chảy. Dưỡng ẩm da. Hoàn tất Teach-back 10 điểm. Hẹn tái khám & CT tuần 16.'
    }
  },
  healthPassport: {
    passportId: 'PASS-LC-871748',
    issuedDate: '04/09/2026',
    fhirSummary: {
      patient: 'Nguyễn Văn Minh (62T · Nam)',
      diagnosis: 'NSCLC Tuyến IVA (cT2bN2M1a)',
      driverGenetics: 'EGFR Exon 19 Deletion (p.E746_A750del)',
      molecularStatus: 'ctDNA 0.08% (Deep Molecular Clearance) · T790M/C797S Âm tính',
      currentTherapy: 'Osimertinib 80mg uống 1 lần/ngày (08:00)',
      safetyCard: 'QTcF 414ms · K+ 4.1 · Không có tiền sử suy tim',
      criticalWarnings: 'CHỐNG CHỈ ĐỊNH: Thuốc ức chế acid PPI (Omeprazole), Thảo dược không rõ nguồn gốc, Thuốc kéo dài QTc.',
      managingCenter: 'Khoa Ung bướu Phổi · Bệnh viện Chuyên khoa Ung bướu',
      emergencyHotline: '028 3844 xxxx / 0903 xxx xxx'
    }
  },
  workloadAllocation: {
    encounterCostTotalVnd: 800000,
    breakdown: [
      { role: 'Bác sĩ Ung thư (Doctor)', sharePct: 60, amountVnd: 480000, tasks: 'Khám lâm sàng, Đánh giá RECIST 1.1 & ctDNA, Chỉ định NCCN Category 1, Hội chẩn MDT, Ký đơn thuốc' },
      { role: 'Điều dưỡng Lâm sàng (Nurse)', sharePct: 30, amountVnd: 240000, tasks: 'Tiếp nhận định danh/sinh hiệu, Medication Reconciliation DDI, Giáo dục Teach-back 10 điểm, Theo dõi Triage trực tuyến' },
      { role: 'Phục hồi & Điều phối (Allied)', sharePct: 10, amountVnd: 80000, tasks: 'Hướng dẫn tập thở chúm môi, Dinh dưỡng chống suy kiệt BMI 21.3, Đồng bộ SMS Caregiver' }
    ]
  },
  accessibility: {
    largeTextMode: false,
    highContrast: false,
    simplifiedMode: false
  },
  prognosisRadar: {
    modelName: 'MSKCC NSCLC Targeted Therapy Prognostic Model',
    medianPfsMonths: 21.4,
    os2YearPct: 78.0,
    dcrPct: 94.0,
    prognosisCategory: 'Favorable (Tiên lượng Rất Khả quan)',
    interpretation: 'Bệnh nhân có đột biến EGFR ex19del nhạy thuốc, không di căn não ban đầu, thể lực ECOG 0 và đạt thanh thải ctDNA phân tử sâu (0.08% ở tuần 8). Dự báo thời gian kiểm soát bệnh kéo dài vượt trội so với trung bình.',
    radarScores: [
      { axis: 'Thể lực ECOG', score: 95, detail: 'ECOG 0 / KPS 100%' },
      { axis: 'Đáp ứng U RECIST', score: 90, detail: 'PR -34.0% (Tuần 8)' },
      { axis: 'An toàn Tim mạch', score: 92, detail: 'QTcF 414ms · K+ 4.1' },
      { axis: 'Dung tích Hô hấp', score: 85, detail: 'SpO2 98% · Tập thở đều' },
      { axis: 'Tuân thủ Thuốc', score: 98, detail: '41/42 liều (98%)' }
    ],
    reviewed: false,
    reviewMeta: null
  },
  patientAiChat: {
    messages: [
      { sender: 'ai', text: 'Chào chú Minh! Cháu là Trợ lý Y tế AI của Khoa Ung bướu. Hôm nay chú có thắc mắc gì về cách uống thuốc Osimertinib 80mg, cách xử trí tiêu chảy hay bài tập thở không ạ?', timestamp: 'Hôm nay' }
    ],
    quickPrompts: [
      'Tôi lỡ quên uống thuốc sáng nay thì làm sao?',
      'Đi ngoài phân lỏng 3 lần/ngày uống thuốc gì?',
      'Mặt nổi vài nốt mụn đỏ có phải dị ứng không?',
      'Khi nào có dấu hiệu cần đi cấp cứu ngay?'
    ]
  },
  followupVaccine: {
    vaccines: [
      { id: 'flu', name: 'Vắc xin Cúm bất hoạt mùa (Inactivated Influenza)', lastGiven: '15/08/2026', nextDue: 'Tháng 08/2027 (Hàng năm)', status: 'up_to_date', note: 'Đã tiêm chủng đầy đủ, giúp giảm nguy cơ bội nhiễm viêm phổi.' },
      { id: 'pcv13', name: 'Vắc xin Phế cầu cộng hợp (PCV13 - Prevenar 13)', lastGiven: '10/07/2026', nextDue: 'Đã hoàn thành liều nền', status: 'up_to_date', note: 'Phòng ngừa 13 chủng phế cầu khuẩn gây viêm phổi xâm lấn.' },
      { id: 'ppsv23', name: 'Vắc xin Phế cầu đa giá (PPSV23 - Pneumovax 23)', lastGiven: 'Chưa tiêm', nextDue: 'Tháng 07/2027 (Sau PCV13 1 năm)', status: 'scheduled', note: 'Hẹn tiêm nhắc sau 1 năm để mở rộng độ bao phủ bảo vệ.' }
    ],
    insuranceCost: {
      monthlyMedCostTotal: 28000000,
      bhytCoveragePct: 80,
      bhytPaidAmount: 22400000,
      patientCoPayAmount: 5600000,
      supportProgramNote: 'Bệnh nhân được hỗ trợ thuốc từ Chương trình Đồng chi trả Hỗ trợ người bệnh (PAP) giúp giảm chi phí thực tế.'
    },
    reviewed: false,
    reviewMeta: null
  },
  geneticPedigree: {
    familyHistoryCategory: 'Mắc phải (Somatic) - Nguy cơ di truyền gia đình thấp',
    somaticVsGermline: {
      somaticDriver: 'EGFR Exon 19 Deletion (p.E746_A750del) · Mắc phải trong tế bào biểu mô phế quản (100% không di truyền cho con cái).',
      germlineRisk: 'Đột biến dòng mầm di truyền Âm tính (Không mang đột biến di truyền TP53 Li-Fraumeni, BRCA, EGFR T790M germline).'
    },
    pedigreeMembers: [
      { generation: 'Thế hệ I (Bố/Mẹ)', relation: 'Bố đẻ', ageAtDx: '68 tuổi', status: 'Ung thư phổi (Có hút thuốc lá 30 năm)', symbol: 'square-filled' },
      { generation: 'Thế hệ I (Bố/Mẹ)', relation: 'Mẹ đẻ', ageAtDx: '65 tuổi', status: 'Ung thư vú (Đã phẫu thuật & ổn định)', symbol: 'circle-filled' },
      { generation: 'Thế hệ II (Bệnh nhân & Anh em)', relation: 'Bệnh nhân (Nguyễn Văn Minh)', ageAtDx: '62 tuổi', status: 'NSCLC IVA EGFR ex19del (Không hút thuốc)', symbol: 'square-patient' },
      { generation: 'Thế hệ II (Bệnh nhân & Anh em)', relation: 'Em gái', ageAtDx: '58 tuổi', status: 'Khỏe mạnh bình thường', symbol: 'circle-normal' },
      { generation: 'Thế hệ III (Con cái)', relation: 'Con trai (Nguyễn Văn Tuấn)', ageAtDx: '35 tuổi', status: 'Khỏe mạnh, không hút thuốc · Tầm soát định kỳ', symbol: 'square-normal' }
    ],
    screeningRecommendation: 'Con trai (Anh Tuấn) không cần xét nghiệm gen dòng mầm khẩn cấp; khuyến cáo duy trì lối sống lành mạnh, không hút thuốc và bắt đầu tầm soát chụp CT lồng ngực liều thấp (LDCT) từ tuổi 45-50.',
    reviewed: false,
    reviewMeta: null
  },
  alerts: []
});

function normalize(raw) {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  const careLoop = { ...d.careLoop, ...(raw.careLoop || {}), plan:{...d.careLoop.plan,...(raw.careLoop?.plan||{}),status:(raw.careLoop?.plan?.confirmedAt && raw.encounterState==='home-care-active')?'active':(raw.careLoop?.plan?.confirmedAt?'doctor_confirmed':'draft')}, tasks:Array.isArray(raw.careLoop?.tasks)?raw.careLoop.tasks.map(t=>({...t,planId:t.planId||d.careLoop.plan.planId,revision:t.revision||d.careLoop.plan.revision,status:t.status==='done'&&raw.careLoop?.plan?.status==='active'?'done':'pending'})):d.careLoop.tasks, symptomCheck:{...d.careLoop.symptomCheck,...(raw.careLoop?.symptomCheck||{})} };
  return {
    ...d, ...raw,
    patient: { ...d.patient, ...(raw.patient || {}) },
    previsit: { ...d.previsit, ...(raw.previsit || {}) },
    patientVoice: { ...d.patientVoice, ...(raw.patientVoice || {}) },
    triage: { ...d.triage, ...(raw.triage || {}), redFlags: Array.isArray(raw.triage?.redFlags) ? raw.triage.redFlags : d.triage.redFlags, review:{ ...d.triage.review, ...(raw.triage?.review || {}) } },
    scenario: raw.scenario || d.scenario,
    safetyRequests: Array.isArray(raw.safetyRequests) ? raw.safetyRequests.filter(r=>r && r.planId===careLoop.plan.planId && r.revision===careLoop.plan.revision) : d.safetyRequests,
    recist: { ...d.recist, ...(raw.recist || {}), targetLesions: Array.isArray(raw.recist?.targetLesions) ? raw.recist.targetLesions : d.recist.targetLesions, reviewMeta: (raw.recist?.reviewMeta && raw.recist.reviewMeta.planId===careLoop.plan.planId && raw.recist.reviewMeta.revision===careLoop.plan.revision) ? raw.recist.reviewMeta : null, reviewed: Boolean(raw.recist?.reviewed && raw.recist?.reviewMeta?.planId===careLoop.plan.planId && raw.recist?.reviewMeta?.revision===careLoop.plan.revision) },
    ctcae: { ...d.ctcae, ...(raw.ctcae || {}), items: Array.isArray(raw.ctcae?.items) ? raw.ctcae.items : d.ctcae.items, reviewMeta: (raw.ctcae?.reviewMeta && raw.ctcae.reviewMeta.planId===careLoop.plan.planId && raw.ctcae.reviewMeta.revision===careLoop.plan.revision) ? raw.ctcae.reviewMeta : null, reviewed: Boolean(raw.ctcae?.reviewed && raw.ctcae?.reviewMeta?.planId===careLoop.plan.planId && raw.ctcae?.reviewMeta?.revision===careLoop.plan.revision) },
    mdt: { ...d.mdt, ...(raw.mdt || {}), panel: Array.isArray(raw.mdt?.panel) ? raw.mdt.panel : d.mdt.panel, reviewMeta: (raw.mdt?.reviewMeta && raw.mdt.reviewMeta.planId===careLoop.plan.planId && raw.mdt.reviewMeta.revision===careLoop.plan.revision) ? raw.mdt.reviewMeta : null, reviewed: Boolean(raw.mdt?.reviewed && raw.mdt?.reviewMeta?.planId===careLoop.plan.planId && raw.mdt.reviewMeta?.revision===careLoop.plan.revision) },
    safetyLabs: { ...d.safetyLabs, ...(raw.safetyLabs || {}), reviewMeta: (raw.safetyLabs?.reviewMeta && raw.safetyLabs.reviewMeta.planId===careLoop.plan.planId && raw.safetyLabs.reviewMeta.revision===careLoop.plan.revision) ? raw.safetyLabs.reviewMeta : null, reviewed: Boolean(raw.safetyLabs?.reviewed && raw.safetyLabs?.reviewMeta?.planId===careLoop.plan.planId && raw.safetyLabs?.reviewMeta?.revision===careLoop.plan.revision) },
    biomarkers: { ...d.biomarkers, ...(raw.biomarkers || {}), resistanceMarkers: Array.isArray(raw.biomarkers?.resistanceMarkers) ? raw.biomarkers.resistanceMarkers : d.biomarkers.resistanceMarkers, ctDnaTrend: Array.isArray(raw.biomarkers?.ctDnaTrend) ? raw.biomarkers.ctDnaTrend : d.biomarkers.ctDnaTrend, reviewMeta: (raw.biomarkers?.reviewMeta && raw.biomarkers.reviewMeta.planId===careLoop.plan.planId && raw.biomarkers.reviewMeta.revision===careLoop.plan.revision) ? raw.biomarkers.reviewMeta : null, reviewed: Boolean(raw.biomarkers?.reviewed && raw.biomarkers?.reviewMeta?.planId===careLoop.plan.planId && raw.biomarkers?.reviewMeta?.revision===careLoop.plan.revision) },
    ddiChecker: { ...d.ddiChecker, ...(raw.ddiChecker || {}), concomitantMeds: Array.isArray(raw.ddiChecker?.concomitantMeds) ? raw.ddiChecker.concomitantMeds : d.ddiChecker.concomitantMeds, interactions: Array.isArray(raw.ddiChecker?.interactions) ? raw.ddiChecker.interactions : d.ddiChecker.interactions, reviewMeta: (raw.ddiChecker?.reviewMeta && raw.ddiChecker.reviewMeta.planId===careLoop.plan.planId && raw.ddiChecker.reviewMeta.revision===careLoop.plan.revision) ? raw.ddiChecker.reviewMeta : null, reviewed: Boolean(raw.ddiChecker?.reviewed && raw.ddiChecker?.reviewMeta?.planId===careLoop.plan.planId && raw.ddiChecker?.reviewMeta?.revision===careLoop.plan.revision) },
    rehabNutrition: { ...d.rehabNutrition, ...(raw.rehabNutrition || {}), exercises: Array.isArray(raw.rehabNutrition?.exercises) ? raw.rehabNutrition.exercises : d.rehabNutrition.exercises, reviewMeta: (raw.rehabNutrition?.reviewMeta && raw.rehabNutrition.reviewMeta.planId===careLoop.plan.planId && raw.rehabNutrition.reviewMeta.revision===careLoop.plan.revision) ? raw.rehabNutrition.reviewMeta : null, reviewed: Boolean(raw.rehabNutrition?.reviewed && raw.rehabNutrition?.reviewMeta?.planId===careLoop.plan.planId && raw.rehabNutrition?.reviewMeta?.revision===careLoop.plan.revision) },
    caregiverSync: {
      primaryCaregiver: { ...d.caregiverSync.primaryCaregiver, ...(raw.caregiverSync?.primaryCaregiver || {}) },
      preferences: { ...d.caregiverSync.preferences, ...(raw.caregiverSync?.preferences || {}) },
      smsHistory: Array.isArray(raw.caregiverSync?.smsHistory) ? raw.caregiverSync.smsHistory : d.caregiverSync.smsHistory
    },
    treatmentJourney: {
      milestones: Array.isArray(raw.treatmentJourney?.milestones) ? raw.treatmentJourney.milestones : d.treatmentJourney.milestones
    },
    clinicalCalculators: {
      inputs: { ...d.clinicalCalculators.inputs, ...(raw.clinicalCalculators?.inputs || {}) },
      results: { ...d.clinicalCalculators.results, ...(raw.clinicalCalculators?.results || {}) },
      reviewMeta: (raw.clinicalCalculators?.reviewMeta && raw.clinicalCalculators.reviewMeta.planId===careLoop.plan.planId && raw.clinicalCalculators.reviewMeta.revision===careLoop.plan.revision) ? raw.clinicalCalculators.reviewMeta : null,
      reviewed: Boolean(raw.clinicalCalculators?.reviewed && raw.clinicalCalculators?.reviewMeta?.planId===careLoop.plan.planId && raw.clinicalCalculators?.reviewMeta?.revision===careLoop.plan.revision)
    },
    nccnPathways: {
      ...d.nccnPathways,
      ...(raw.nccnPathways || {}),
      reviewMeta: (raw.nccnPathways?.reviewMeta && raw.nccnPathways.reviewMeta.planId===careLoop.plan.planId && raw.nccnPathways.reviewMeta.revision===careLoop.plan.revision) ? raw.nccnPathways.reviewMeta : null,
      reviewed: Boolean(raw.nccnPathways?.reviewed && raw.nccnPathways?.reviewMeta?.planId===careLoop.plan.planId && raw.nccnPathways?.reviewMeta?.revision===careLoop.plan.revision)
    },
    voiceScribe: {
      ...d.voiceScribe,
      ...(raw.voiceScribe || {}),
      extractedEntities: { ...d.voiceScribe.extractedEntities, ...(raw.voiceScribe?.extractedEntities || {}) }
    },
    healthPassport: {
      ...d.healthPassport,
      ...(raw.healthPassport || {}),
      fhirSummary: { ...d.healthPassport.fhirSummary, ...(raw.healthPassport?.fhirSummary || {}) }
    },
    workloadAllocation: {
      ...d.workloadAllocation,
      ...(raw.workloadAllocation || {}),
      breakdown: Array.isArray(raw.workloadAllocation?.breakdown) ? raw.workloadAllocation.breakdown : d.workloadAllocation.breakdown
    },
    accessibility: {
      ...d.accessibility,
      ...(raw.accessibility || {})
    },
    prognosisRadar: {
      ...d.prognosisRadar,
      ...(raw.prognosisRadar || {}),
      radarScores: Array.isArray(raw.prognosisRadar?.radarScores) ? raw.prognosisRadar.radarScores : d.prognosisRadar.radarScores,
      reviewMeta: (raw.prognosisRadar?.reviewMeta && raw.prognosisRadar.reviewMeta.planId===careLoop.plan.planId && raw.prognosisRadar.reviewMeta.revision===careLoop.plan.revision) ? raw.prognosisRadar.reviewMeta : null,
      reviewed: Boolean(raw.prognosisRadar?.reviewed && raw.prognosisRadar?.reviewMeta?.planId===careLoop.plan.planId && raw.prognosisRadar?.reviewMeta?.revision===careLoop.plan.revision)
    },
    patientAiChat: {
      messages: Array.isArray(raw.patientAiChat?.messages) ? raw.patientAiChat.messages : d.patientAiChat.messages,
      quickPrompts: Array.isArray(raw.patientAiChat?.quickPrompts) ? raw.patientAiChat.quickPrompts : d.patientAiChat.quickPrompts
    },
    followupVaccine: {
      ...d.followupVaccine,
      ...(raw.followupVaccine || {}),
      vaccines: Array.isArray(raw.followupVaccine?.vaccines) ? raw.followupVaccine.vaccines : d.followupVaccine.vaccines,
      insuranceCost: { ...d.followupVaccine.insuranceCost, ...(raw.followupVaccine?.insuranceCost || {}) },
      reviewMeta: (raw.followupVaccine?.reviewMeta && raw.followupVaccine.reviewMeta.planId===careLoop.plan.planId && raw.followupVaccine.reviewMeta.revision===careLoop.plan.revision) ? raw.followupVaccine.reviewMeta : null,
      reviewed: Boolean(raw.followupVaccine?.reviewed && raw.followupVaccine?.reviewMeta?.planId===careLoop.plan.planId && raw.followupVaccine?.reviewMeta?.revision===careLoop.plan.revision)
    },
    geneticPedigree: {
      ...d.geneticPedigree,
      ...(raw.geneticPedigree || {}),
      pedigreeMembers: Array.isArray(raw.geneticPedigree?.pedigreeMembers) ? raw.geneticPedigree.pedigreeMembers : d.geneticPedigree.pedigreeMembers,
      somaticVsGermline: { ...d.geneticPedigree.somaticVsGermline, ...(raw.geneticPedigree?.somaticVsGermline || {}) },
      reviewMeta: (raw.geneticPedigree?.reviewMeta && raw.geneticPedigree.reviewMeta.planId===careLoop.plan.planId && raw.geneticPedigree.reviewMeta.revision===careLoop.plan.revision) ? raw.geneticPedigree.reviewMeta : null,
      reviewed: Boolean(raw.geneticPedigree?.reviewed && raw.geneticPedigree?.reviewMeta?.planId===careLoop.plan.planId && raw.geneticPedigree?.reviewMeta?.revision===careLoop.plan.revision)
    },
    medicationSafety: { ...d.medicationSafety, ...(raw.medicationSafety || {}), reviewed:{...d.medicationSafety.reviewed,...(raw.medicationSafety?.reviewed||{})}, reviewMeta:{...d.medicationSafety.reviewMeta,...(raw.medicationSafety?.reviewMeta||{})}, checks:Array.isArray(raw.medicationSafety?.checks)?raw.medicationSafety.checks:d.medicationSafety.checks },
    careLoop,
    intake: { ...d.intake, ...(raw.intake || {}) },
    doctor: { ...d.doctor, ...(raw.doctor || {}) },
    decisionBrief: { ...d.decisionBrief, ...(raw.decisionBrief || {}), facts: Array.isArray(raw.decisionBrief?.facts) ? raw.decisionBrief.facts : d.decisionBrief.facts, patientReported: Array.isArray(raw.decisionBrief?.patientReported) ? raw.decisionBrief.patientReported : d.decisionBrief.patientReported, safetyGates: Array.isArray(raw.decisionBrief?.safetyGates) ? raw.decisionBrief.safetyGates : d.decisionBrief.safetyGates, readiness: { ...d.decisionBrief.readiness, ...(raw.decisionBrief?.readiness || {}) }, lens: { ...d.decisionBrief.lens, ...(raw.decisionBrief?.lens || {}), uncertainties: Array.isArray(raw.decisionBrief?.lens?.uncertainties) ? raw.decisionBrief.lens.uncertainties : d.decisionBrief.lens.uncertainties }, evidenceMap: Array.isArray(raw.decisionBrief?.evidenceMap) ? raw.decisionBrief.evidenceMap : d.decisionBrief.evidenceMap, evidence: d.decisionBrief.evidence },
    education: { ...d.education, ...(raw.education || {}) },
    home: { ...d.home, ...(raw.home || {}) },
    proDiary: {
      entries: Array.isArray(raw.proDiary?.entries) ? raw.proDiary.entries : d.proDiary.entries,
      todayCheckin: { ...d.proDiary.todayCheckin, ...(raw.proDiary?.todayCheckin || {}) }
    },
    alertResolution: { ...d.alertResolution, ...(raw.alertResolution || {}) },
    alerts: Array.isArray(raw.alerts) ? raw.alerts : []
  };
}

let state = load();
function load(){ let base; try { base = normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { base = defaultState(); } const requestedRole = new URLSearchParams(location.search).get('role'); if (['patient','nurse','doctor'].includes(requestedRole)) base.role = requestedRole; return base; }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
save();
function set(patch){ state = normalize({ ...state, ...patch }); save(); render(); }
function update(path, value){ let s = structuredClone(state); let o = s; path.slice(0,-1).forEach(k => o = o[k]); o[path.at(-1)] = value; set(s); }
function event(name, payload={}){ state.alerts.unshift({ type:'event', name, at: new Date().toLocaleTimeString('vi-VN'), ...payload }); save(); }
function advance(next, name){ if(name==='PREVISIT_SUBMITTED' && !state.previsit.submittedAt) state.previsit.submittedAt=new Date().toLocaleString('vi-VN'); state.encounterState = next; if(next==='home-care-active'){state.careLoop.plan.status='active';state.careLoop.plan.activatedAt=new Date().toLocaleString('vi-VN');state.careLoop.plan.provenance='Clinician confirmed + nurse teach-back demo';state.careLoop.tasks.forEach(t=>{if(t.status==='pending')t.status='open'});} event(name); save(); render(); }
function switchRole(role){ state.role = role; save(); history.replaceState(null, '', `?role=${role}`); render(); }

const pct = () => Math.round(state.patient.adherence.taken / state.patient.adherence.total * 100);
const flowIndex = () => FLOW.findIndex(([k]) => k === state.encounterState);
const can = (key) => flowIndex() >= FLOW.findIndex(([k]) => k === key);
const doneCount = (obj) => Object.values(obj).filter(Boolean).length;
const pill = (text, tone='') => `<span class="pill ${tone}">${text}</span>`;
const button = (label, action, cls='') => `<button class="${cls}" onclick="${action}">${label}</button>`;

function scenarioControls(){ if(!['doctor','nurse'].includes(state.role)) return ''; return `<div class="demo-controls"><small>DEMO / QA SCENARIO</small><button class="ghost" onclick="resetScenario('routine')">Routine</button><button class="ghost" onclick="resetScenario('yellow')">Yellow</button><button class="ghost" onclick="resetScenario('red')">Red</button></div>`; }

function printHandoutTemplate(){
  const p = state.patient;
  return `<div class="printable-handout">
    <div class="print-header">
      <div>
        <h2>HƯỚNG DẪN DÙNG THUỐC & CHĂM SÓC TẠI NHÀ</h2>
        <p>Khoa Ung bướu Phổi · Bệnh viện Chuyên khoa Ung bướu</p>
      </div>
      <div class="print-patient-box">
        <b>Người bệnh: ${p.name} (${p.age} tuổi)</b>
        <span>Mã BN: ${p.code} | Ngày cấp: ${new Date().toLocaleDateString('vi-VN')}</span>
      </div>
    </div>

    <div class="print-section primary-med">
      <h3>💊 THUỐC ĐIỀU TRỊ HÀNG NGÀY: OSIMERTINIB 80 MG</h3>
      <div class="print-med-instruction">
        <b>Cách uống:</b> Uống <strong>ĐÚNG 1 VIÊN</strong> mỗi ngày vào lúc <strong>08:00 SÁNG</strong>.<br>
        Uống nguyên viên với một cốc nước lọc đầy. <em>TUYỆT ĐỐI KHÔNG BẺ, KHÔNG NGHIỀN VIÊN THUỐC.</em><br>
        <b>Nếu lỡ quên uống:</b> Uống bù ngay nếu nhớ ra trước 20:00 tối. Nếu đã sang ngày hôm sau -> Bỏ qua liều quên và uống liều bình thường (KHÔNG UỐNG GẤP ĐÔI).
      </div>
    </div>

    <div class="print-grid">
      <div class="print-box">
        <h4>🚽 XỬ TRÍ TIÊU CHẢY TẠI NHÀ</h4>
        <ul>
          <li>Uống nhiều nước ấm, pha 1 gói <strong>Oresol</strong> vào 1 lít nước uống rải rác trong ngày.</li>
          <li>Uống <strong>Loperamide 2mg (1 viên)</strong> sau mỗi lần đi ngoài phân lỏng (tối đa không quá 8 viên/ngày).</li>
          <li>Ăn cháo loãng, thịt nạc, chuối chín. Tránh đồ cay nóng, sữa tươi, cà phê.</li>
        </ul>
      </div>
      <div class="print-box">
        <h4>🧴 CHĂM SÓC DA & MỤN ĐỎ</h4>
        <ul>
          <li>Thoa kem dưỡng ẩm dịu nhẹ (không cồn/hương liệu) 2 lần/ngày sau khi tắm.</li>
          <li>Bôi kem <strong>Hydrocortisone 1%</strong> mỏng lên vùng nốt ban đỏ ở mặt/lưng nếu ngứa.</li>
          <li>Đội mũ rộng vành, che chắn tránh ánh nắng gắt trực tiếp khi ra ngoài.</li>
        </ul>
      </div>
    </div>

    <div class="print-section danger-box">
      <h3>🚨 CÁC DẤU HIỆU CẦN ĐẾN VIỆN HOẶC GỌI CẤP CỨU NGAY</h3>
      <p>1. <strong>Khó thở mới xuất hiện</strong> hoặc thở hụt hơi tăng dần khi ngồi nghỉ.<br>
      2. <strong>Đau tức ngực dữ dội</strong> hoặc sốt cao liên tục trên 38.5°C không hạ.<br>
      3. Đi ngoài phân lỏng trên 6 lần/ngày kèm lơ mơ, mệt lả không uống được nước.</p>
    </div>

    <div class="print-footer">
      <div><b>Bác sĩ điều trị:</b> BS. Mỹ Linh</div>
      <div><b>Điều dưỡng hỗ trợ:</b> ĐD. Thu Hà</div>
      <div class="hotline-box"><b>HOTLINE KHOA UNG BƯỚU (24/7):</b> 028 3844 xxxx / 0903 xxx xxx</div>
    </div>
  </div>`;
}

function treatmentJourneyTimeline(){
  const ms = state.treatmentJourney.milestones;
  return `<section class="card journey-card">
    <div class="journey-header">
      <div>
        <small>ONCOLOGY TREATMENT ROADMAP · HÀNH TRÌNH ĐIỀU TRỊ UNG THƯ PHỔI</small>
        <h3>Tiến trình Cá thể hóa: Baseline -> Tuần 8 (Đáp ứng PR) -> Kế hoạch Tuần 16</h3>
      </div>
      <div>
        ${pill('Phác đồ Bước 1: Osimertinib 80mg/ngày', 'purple')}
      </div>
    </div>

    <div class="journey-timeline">
      ${ms.map((m, idx) => `
        <div class="journey-node ${m.status}">
          <div class="journey-node-circle">
            <span>${m.status === 'completed' ? '✓' : m.status === 'active' ? '●' : '○'}</span>
          </div>
          <div class="journey-node-content">
            <div class="journey-node-top">
              <b>Tuần ${m.week}: ${m.title}</b>
              <span class="pill ${m.status === 'completed' ? 'green' : m.status === 'active' ? 'purple' : 'yellow'}">${m.badge}</span>
            </div>
            <small class="journey-date">${m.date}</small>
            <p>${m.desc}</p>
          </div>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function toggleLargeTextMode(){
  state.accessibility.largeTextMode = !state.accessibility.largeTextMode;
  event('ACCESSIBILITY_MODE_TOGGLED', { detail: `Chế độ chữ to trợ năng: ${state.accessibility.largeTextMode ? 'BẬT' : 'TẮT'}` });
  save();
  render();
}

function topbar(roleMeta){
  return `<header class="top">
    <div class="top-title-area">
      <div class="live-dot-wrap">
        <span class="live-pulse"></span>
        <small>${roleMeta[2].toUpperCase()} · HỆ THỐNG TRỰC TUYẾN</small>
      </div>
      <h1>${roleMeta[1] === 'Bệnh nhân' ? 'Chào chú Nguyễn Văn Minh' : roleMeta[1] === 'Điều dưỡng' ? 'Nurse Station · Bàn giao & Tiếp nhận' : 'Oncology Clinical Command Center'}</h1>
    </div>

    <div class="top-actions-bar">
      <button class="pill-btn ${state.accessibility?.largeTextMode ? 'active' : ''}" onclick="toggleLargeTextMode()" title="Chế độ chữ to & trợ năng thị lực cho người cao tuổi">
        👓 Chữ to: ${state.accessibility?.largeTextMode ? 'BẬT' : 'TẮT'}
      </button>

      <div class="top-scenario-nav">
        <span class="scenario-label">MÔ PHỎNG:</span>
        <button class="pill-btn ${state.scenario==='routine'?'active':''}" onclick="resetScenario('routine')">Routine (PR)</button>
        <button class="pill-btn ${state.scenario==='yellow'?'active':''}" onclick="resetScenario('yellow')">Triage Yellow</button>
        <button class="pill-btn ${state.scenario==='red'?'active':''}" onclick="resetScenario('red')">Red Alert</button>
      </div>

      <div class="top-util-btns">
        ${state.role === 'doctor' ? button('📋 Copy SOAP EMR', 'copySoapSummary()', 'primary') : ''}
        ${button('🖨 In bản A4', 'openPrintHandout()', 'outline')}
      </div>
    </div>
  </header>`;
}

function shell(content){
  const roleMeta = { patient:['PT','Bệnh nhân','My Care'], nurse:['RN','Điều dưỡng','Nurse Station'], doctor:['DR','Bác sĩ','Clinical Command'] }[state.role];
  const isLarge = Boolean(state.accessibility?.largeTextMode);
  return `<div class="app ${isLarge ? 'elderly-mode' : ''}">
    <aside class="side">
      <div class="brand"><b>LC</b><div><strong>LungCare</strong><span>CONNECTED ONCOLOGY</span></div></div>
      <div class="role-card"><span>${roleMeta[0]}</span><div><b>${roleMeta[1]}</b><small>${roleMeta[2]}</small></div></div>
      <nav>
        ${['patient','nurse','doctor'].map(r => `<button class="nav ${state.role===r?'on':''}" onclick="switchRole('${r}')">${{patient:'Bệnh nhân',nurse:'Điều dưỡng',doctor:'Bác sĩ'}[r]}</button>`).join('')}
      </nav>
      <div class="patient-mini"><small>DEMO PATIENT</small><b>${state.patient.name}</b><span>${state.patient.code} · ${state.patient.stage} · ${state.patient.biomarker}</span></div>
      ${scenarioControls()}
    </aside>
    <main>
      ${topbar(roleMeta)}
      ${alertsStrip()}
      ${flowRibbon()}
      ${treatmentJourneyTimeline()}
      ${content}
    </main>
    ${printHandoutTemplate()}
  </div>`;
}

function generateSoapSummary(){
  const p = state.patient;
  const c = state.ctcae;
  const r = state.recist;
  const l = state.safetyLabs;
  const d = state.doctor;
  const m = state.mdt;
  return `=== TÓM TẮT LÂM SÀNG CHUẨN SOAP (LUNGCARE CDS) ===
BỆNH NHÂN: ${p.name} | Tuổi: ${p.age} | Giới: ${p.sex} | Mã BN: ${p.code}
NGÀY KHÁM: ${new Date().toLocaleDateString('vi-VN')} | BÁC SĨ: BS. Mỹ Linh | ĐIỀU DƯỠNG: ĐD. Thu Hà

[S] CHỦ QUAN (SUBJECTIVE / PATIENT-REPORTED):
- Tuân thủ thuốc: ${p.adherence.taken}/${p.adherence.total} liều (${pct()}%), quên ${p.adherence.missed} liều.
- Độc tính ghi nhận: Tiêu chảy G2 (3-4 lần/ngày, đã dùng Oresol + Loperamide); Ban da dát sẩn G1 vùng mặt/lưng.
- Sàng lọc ILD: Không ho khan tăng dần, không khó thở khi nghỉ, SpO2 98%.

[O] KHÁCH QUAN (OBJECTIVE / LABS & IMAGING):
- Chẩn đoán ban đầu: NSCLC adenocarcinoma giai đoạn IVA (cT2bN2M1a), EGFR exon 19 deletion.
- CT lồng ngực tuần 8 (${r.scanDate}): Tổng kích thước u SLD giảm từ 50mm -> 33mm (-34.0%), không có u mới -> ĐÁP ỨNG MỘT PHẦN (PR - RECIST 1.1).
- Điện tâm đồ & Điện giải (${l.qtc.date}): QTcF = ${l.qtc.value} ms (Bình thường, baseline ${l.qtc.baseline} ms); K+ = ${l.potassium.value} mmol/L; Mg2+ = ${l.magnesium.value} mmol/L; AST/ALT = ${l.astAlt.ast}/${l.astAlt.alt} U/L; Creatinine = ${l.creatinine.value} µmol/L (eGFR ${l.creatinine.egfr}).
- Sinh học phân tử (${state.biomarkers.baselineDate} -> Hiện tại): ctDNA EGFR giảm từ 8.4% -> 0.08% (Deep Molecular Response). Kháng thuốc (T790M, C797S, MET amp) ÂM TÍNH.

[A] ĐÁNH GIÁ (ASSESSMENT):
- Ung thư phổi không tế bào nhỏ (NSCLC) giai đoạn IVA, EGFR exon 19 del, điều trị đích bước 1 với Osimertinib 80mg/ngày tuần thứ 6.
- Đang đáp ứng rất tốt về mặt hình ảnh (PR -34%) và sinh học phân tử (ctDNA thanh thải sâu).
- Độc tính Tiêu chảy G2 và Ban da G1 kiểm soát ổn định với điều trị hỗ trợ; chưa có dấu hiệu kháng thuốc hay độc tính tim mạch/phổi kẽ.
${m.status === 'completed' ? `- Hội đồng MDT: ${m.consensus}` : ''}

[P] KẾ HOẠCH XỬ TRÍ (PLAN):
1. Thuốc: Tiếp tục Osimertinib 80 mg uống 1 viên/ngày vào 08:00 sáng.
2. Xử trí hỗ trợ: Oresol bù nước + Loperamide 2mg sau mỗi lần đi tiêu lỏng; Kem dưỡng ẩm da không cồn.
3. Giáo dục sức khỏe: Đã hoàn tất bảng kiểm Teach-back 10 điểm trước khi xuất viện.
4. Tái khám & Theo dõi: Hẹn tái khám sau 4 tuần; Chụp CT lồng ngực + MRI não đánh giá lại ở tuần 16.
5. Cảnh báo khẩn cấp: Đến viện ngay nếu khó thở tăng dần, đau ngực hoặc sốt > 38.5°C.
=====================================================`;
}

function copySoapSummary(){
  const text = generateSoapSummary();
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(() => alert('Đã sao chép tóm tắt SOAP vào Clipboard! Bác sĩ có thể dán (Ctrl+V) thẳng vào phần mềm EMR/HIS bệnh viện.'));
  } else {
    alert('Đã tạo tóm tắt SOAP. Bác sĩ có thể xem và copy từ cửa sổ xem trước.');
  }
}

function openPrintHandout(){
  window.print();
}

function topbar(roleMeta){
  return `<header class="top">
    <div class="top-title-area">
      <div class="live-dot-wrap">
        <span class="live-pulse"></span>
        <small>${roleMeta[2].toUpperCase()} · HỆ THỐNG TRỰC TUYẾN</small>
      </div>
      <h1>${roleMeta[1] === 'Bệnh nhân' ? 'Chào chú Nguyễn Văn Minh' : roleMeta[1] === 'Điều dưỡng' ? 'Nurse Station · Bàn giao & Tiếp nhận' : 'Oncology Clinical Command Center'}</h1>
    </div>

    <div class="top-actions-bar">
      <div class="top-scenario-nav">
        <span class="scenario-label">MÔ PHỎNG:</span>
        <button class="pill-btn ${state.scenario==='routine'?'active':''}" onclick="resetScenario('routine')">Routine (PR)</button>
        <button class="pill-btn ${state.scenario==='yellow'?'active':''}" onclick="resetScenario('yellow')">Triage Yellow</button>
        <button class="pill-btn ${state.scenario==='red'?'active':''}" onclick="resetScenario('red')">Red Alert</button>
      </div>

      <div class="top-util-btns">
        ${state.role === 'doctor' ? button('📋 Copy SOAP EMR', 'copySoapSummary()', 'primary') : ''}
        ${button('🖨 In bản A4', 'openPrintHandout()', 'outline')}
      </div>
    </div>
  </header>`;
}

function alertsStrip(){
  const red = state.alerts.find(a => a.type === 'red');
  if (!red) return '';
  const r=state.alertResolution;
  return `<section class="red-alert"><div><b>⚠ CẢNH BÁO ĐỎ · Khó thở khi nghỉ</b><p>${red.detail} · gửi đồng thời bác sĩ và điều dưỡng lúc ${red.at}. Nếu tình trạng nặng, thực hiện protocol cấp cứu của cơ sở và không chờ phản hồi trên app.</p>${r.acknowledged?`<div class="alert-workup"><label>Đánh giá/xử trí theo protocol cơ sở<textarea oninput="update(['alertResolution','assessment'],this.value)" placeholder="Người đánh giá, thời điểm, đánh giá, hành động...">${r.assessment}</textarea></label><label>Hành động đã thực hiện<textarea oninput="update(['alertResolution','action'],this.value)" placeholder="Liên hệ, đánh giá trực tiếp, giữ thuốc/điều phối theo protocol...">${r.action}</textarea></label><label>Lý do bác sĩ đóng/override cảnh báo<textarea oninput="update(['alertResolution','clinicianReason'],this.value)" placeholder="Bắt buộc để mở lại quyết định thường quy">${r.clinicianReason}</textarea></label></div>`:''}</div><div class="alert-actions">${!r.acknowledged?button('Tiếp nhận cảnh báo','acknowledgeAlert()','danger'):r.assessment.trim()&&r.action.trim()&&r.clinicianReason.trim()?button('BS xác nhận đã xử trí/override','resolveAlert()','danger'):button('Cần ghi đánh giá + lý do BS','void(0)','disabled')}${button('Xem protocol cơ sở','alert("Demo: protocol cấp cứu cần được cơ sở cấu hình và bác sĩ phụ trách phê duyệt")','outline dangerText')}</div></section>`;
}

function flowRibbon(){ return `<section class="flow">${FLOW.slice(1).map(([k,l],i)=>`<div class="step ${can(k)?'done':''} ${state.encounterState===k?'active':''}"><span>${i+1}</span><b>${l}</b></div>`).join('')}</section>`; }

function patientSummary(){ const p=state.patient; return `<section class="summary card"><div><small>CA XUYÊN SUỐT</small><h2>${p.name}</h2><p>${p.age} tuổi · ${p.sex} · ECOG ${p.ecog} · ${p.diagnosis}</p></div><div class="facts">${pill(p.stage,'purple')}${pill(p.tnm)}${pill(p.biomarker,'green')}${pill(p.therapy,'blue')}${pill(`Tuân thủ ${pct()}%`,'green')}</div></section>`; }

function patientDailyCheckin(){
  const today = state.proDiary.todayCheckin;
  return `<section class="card pro-diary-card">
    <small>NHẬT KÝ SỨC KHỎE HẰNG NGÀY (PRO-CTCAE 30 GIÂY)</small>
    <h3>Hôm nay chú Minh cảm thấy thế nào?</h3>
    <p>Ghi nhận nhanh mỗi tối để Bác sĩ & Điều dưỡng theo dõi sát giữa 2 đợt khám.</p>
    
    <div class="pro-form-grid">
      <div class="pro-field">
        <label><b>1. Uống thuốc hôm nay:</b></label>
        <div class="pro-buttons">
          <button class="${today.medTaken ? 'primary' : 'outline'}" onclick="updateTodayCheckin('medTaken', true)">Đã uống 1 viên (80mg)</button>
          <button class="${!today.medTaken ? 'danger' : 'outline'}" onclick="updateTodayCheckin('medTaken', false)">Chưa uống / Quên</button>
        </div>
      </div>

      <div class="pro-field">
        <label><b>2. Số lần đi ngoài phân lỏng hôm nay:</b></label>
        <div class="pro-buttons">
          <button class="${today.diarrheaCount <= 1 ? 'primary' : 'outline'}" onclick="updateTodayCheckin('diarrheaCount', 1)">Bình thường / 0-1 lần</button>
          <button class="${today.diarrheaCount >= 2 && today.diarrheaCount <= 3 ? 'primary' : 'outline'}" onclick="updateTodayCheckin('diarrheaCount', 2)">2 - 3 lần</button>
          <button class="${today.diarrheaCount >= 4 ? 'danger' : 'outline'}" onclick="updateTodayCheckin('diarrheaCount', 4)">≥ 4 lần (Nhiều)</button>
        </div>
      </div>

      <div class="pro-field">
        <label><b>3. Ban đỏ / Mụn trên da:</b></label>
        <div class="pro-buttons">
          <button class="${today.rashGrade === 0 ? 'primary' : 'outline'}" onclick="updateTodayCheckin('rashGrade', 0)">Không có</button>
          <button class="${today.rashGrade === 1 ? 'primary' : 'outline'}" onclick="updateTodayCheckin('rashGrade', 1)">Nhẹ (vài nốt mặt/lưng)</button>
          <button class="${today.rashGrade >= 2 ? 'danger' : 'outline'}" onclick="updateTodayCheckin('rashGrade', 2)">Nhiều / Ngứa rát</button>
        </div>
      </div>

      <div class="pro-field">
        <label><b>4. Dấu hiệu bất thường:</b></label>
        <div class="pro-checkboxes">
          <label><input type="checkbox" ${today.fever ? 'checked' : ''} onchange="updateTodayCheckin('fever', this.checked)"/> Có sốt (>38°C)</label>
          <label><input type="checkbox" ${today.dyspnea ? 'checked' : ''} onchange="updateTodayCheckin('dyspnea', this.checked)"/> Có khó thở mới xuất hiện</label>
        </div>
      </div>
    </div>

    <div class="actions" style="margin-top:14px">
      ${button('Lưu nhật ký hôm nay & Gửi đội điều trị', 'submitProCheckin()', 'primary')}
    </div>
  </section>`;
}

function updateTodayCheckin(field, val){
  state.proDiary.todayCheckin[field] = val;
  if(field === 'medTaken' && val === true){
    state.home.medicationTakenToday = true;
    const medTask = state.careLoop.tasks.find(t=>t.id==='med');
    if(medTask) medTask.status = 'done';
  }
  save();
  render();
}

function submitProCheckin(){
  const t = state.proDiary.todayCheckin;
  const now = new Date().toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'});
  const existingIdx = state.proDiary.entries.findIndex(e => e.date === now);
  const entry = {
    date: now,
    medTaken: t.medTaken,
    diarrheaCount: t.diarrheaCount,
    rashGrade: t.rashGrade,
    fever: t.fever,
    dyspnea: t.dyspnea,
    note: t.note || (t.diarrheaCount >= 4 ? 'Tiêu chảy nhiều cần chú ý' : 'Ghi nhận hàng ngày')
  };
  if(existingIdx >= 0){
    state.proDiary.entries[existingIdx] = entry;
  } else {
    state.proDiary.entries.push(entry);
  }

  // Tự động kích hoạt Triage nếu có dấu hiệu nặng
  if(t.dyspnea){
    redDyspnea();
  } else if(t.diarrheaCount >= 4 || t.fever){
    state.triage.symptom = t.diarrheaCount >= 4 ? 'Tiêu chảy' : 'Sốt';
    state.triage.severity = 3;
    state.triage.status = 'yellow';
    state.triage.escalationId = `ESC-${Date.now()}`;
    state.triage.actionStatus = 'new';
    state.triage.submittedAt = new Date().toLocaleString('vi-VN');
    event('TOXICITY_REPORTED_YELLOW', { detail: `Cảnh báo từ nhật ký PRO: ${state.triage.symptom} mức độ 3/4` });
  }

  event('PATIENT_PRO_CHECKIN_SUBMITTED', { detail: `Nhật ký PRO: Tiêu chảy ${t.diarrheaCount} lần, Ban da G${t.rashGrade}` });
  save();
  render();
}

function dispatchCaregiverSms(type, text){
  const cg = state.caregiverSync;
  if(!cg.primaryCaregiver.active) return;
  const msgObj = {
    id: `SMS-${Date.now()}`,
    timestamp: new Date().toLocaleString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'}),
    type,
    recipient: `${cg.primaryCaregiver.phone} (${cg.primaryCaregiver.name})`,
    message: text
  };
  cg.smsHistory.unshift(msgObj);
  event('CAREGIVER_SMS_DISPATCHED', { detail: `Đã gửi SMS tới ${cg.primaryCaregiver.name}: ${text.slice(0, 50)}...` });
}

function sendCustomCaregiverSms(customMsg){
  const cg = state.caregiverSync;
  if(!customMsg.trim()) return;
  dispatchCaregiverSms('info', `[LungCare] ${customMsg.trim()}`);
  save();
  render();
}

function toggleRehabExercise(idx){
  state.rehabNutrition.exercises[idx].completed = !state.rehabNutrition.exercises[idx].completed;
  event('PULMONARY_REHAB_UPDATED', { detail: `Tập thở: ${state.rehabNutrition.exercises[idx].name} -> ${state.rehabNutrition.exercises[idx].completed ? 'Đã tập' : 'Chưa tập'}` });
  save();
  render();
}

function patientRehabSection(){
  const r = state.rehabNutrition;
  return `<section class="card rehab-patient-card">
    <small>PHỤC HỒI CHỨC NĂNG PHỔI & DINH DƯỠNG TẠI NHÀ</small>
    <h3>Tập thở chúm môi & Dinh dưỡng chống suy kiệt</h3>
    <p>Duy trì dung tích phổi và cân nặng 58kg để đảm bảo thể lực tiếp tục điều trị.</p>

    <div class="rehab-exercises-list">
      <b>3 Bài tập phục hồi phổi mỗi ngày:</b>
      ${r.exercises.map((ex, idx) => `
        <div class="rehab-exercise-item ${ex.completed ? 'completed' : ''}">
          <div class="rehab-exercise-top">
            <b>${ex.name}</b>
            <span class="pill ${ex.completed ? 'green' : 'yellow'}">${ex.duration}</span>
          </div>
          <p>${ex.instruction}</p>
          <button class="${ex.completed ? 'primary' : 'outline'}" onclick="toggleRehabExercise(${idx})">
            ${ex.completed ? '✓ Đã hoàn thành hôm nay' : '○ Đánh dấu đã tập'}
          </button>
        </div>
      `).join('')}
    </div>

    <div class="rehab-nutrition-tip">
      <b>💡 Lời khuyên dinh dưỡng từ Bác sĩ:</b>
      <p>${r.dietPlan}</p>
    </div>
  </section>`;
}

function caregiverSyncPanel(){
  const cg = state.caregiverSync;
  return `<section class="card caregiver-card"><small>FAMILY CAREGIVER SYNC · ĐỒNG HÀNH NGƯỜI NHÀ & SMS BÁO ĐỘNG</small>
    <div class="caregiver-header">
      <div>
        <h3>Người chăm sóc chính: ${cg.primaryCaregiver.name} (${cg.primaryCaregiver.relation})</h3>
        <p>Số điện thoại nhận tin: <strong>${cg.primaryCaregiver.phone}</strong> · Trạng thái: ${cg.primaryCaregiver.active ? '🟢 Đang kết nối' : '⚪ Tạm dừng'}</p>
        <small>Tự động gửi tin nhắn SMS/Zalo khi người bệnh quên liều hoặc xuất hiện triệu chứng báo động đỏ tại nhà</small>
      </div>
      <div>
        <button class="outline" onclick="testCaregiverAlert()">🔔 Gửi SMS thử nghiệm</button>
      </div>
    </div>

    <div class="caregiver-grid">
      <div class="caregiver-box">
        <b>1. Cấu hình nhận thông báo tự động (Alert Rules):</b>
        <div class="caregiver-prefs">
          <label><input type="checkbox" ${cg.preferences.alertRed ? 'checked' : ''} onchange="update(['caregiverSync','preferences','alertRed'],this.checked)"/> Khẩn cấp: Khó thở / Cảnh báo đỏ (Gửi ngay)</label>
          <label><input type="checkbox" ${cg.preferences.alertMissedDose ? 'checked' : ''} onchange="update(['caregiverSync','preferences','alertMissedDose'],this.checked)"/> Nhắc nhở: Báo quên liều thuốc hôm nay</label>
          <label><input type="checkbox" ${cg.preferences.alertYellow ? 'checked' : ''} onchange="update(['caregiverSync','preferences','alertYellow'],this.checked)"/> Theo dõi: Tiêu chảy ≥ 4 lần hoặc có sốt</label>
          <label><input type="checkbox" ${cg.preferences.alertTeachbackDone ? 'checked' : ''} onchange="update(['caregiverSync','preferences','alertTeachbackDone'],this.checked)"/> Bàn giao: Tóm tắt xuất viện sau khi ĐD teach-back</label>
        </div>
      </div>

      <div class="caregiver-box">
        <b>2. Hộp thư tin nhắn SMS/Zalo đã gửi (${cg.smsHistory.length} tin nhắn):</b>
        <div class="sms-history-list">
          ${cg.smsHistory.slice(0, 4).map(sms => `
            <div class="sms-bubble ${sms.type}">
              <div class="sms-top">
                <b>${sms.recipient}</b>
                <small>${sms.timestamp}</small>
              </div>
              <p>${sms.message}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function testCaregiverAlert(){
  dispatchCaregiverSms('info', `[LungCare Thử nghiệm] Hệ thống thông báo kết nối thành công với Anh Tuấn (con trai). Bố Minh đang được theo dõi sát tại nhà.`);
  save();
  render();
}

function healthPassportCard(){
  const hp = state.healthPassport;
  const s = hp.fhirSummary;
  return `<section class="card passport-card"><small>HL7 FHIR HEALTH PASSPORT · HỘ CHIẾU SỨC KHỎE UNG BƯỚU LIÊN VIỆN</small>
    <div class="passport-header">
      <div>
        <h3>Thẻ Tóm tắt Y tế Chuyển tuyến (Mã: ${hp.passportId})</h3>
        <p>Quét mã QR để truy xuất ngay Đột biến Gen, Liều thuốc và Cảnh báo Khẩn cấp khi đi khám tuyến khác</p>
        <small>Cấp ngày: ${hp.issuedDate} · ${s.managingCenter}</small>
      </div>
      <div>
        <button class="primary" onclick="window.print()">🖨 In Thẻ Hộ Chiếu QR</button>
      </div>
    </div>

    <div class="passport-grid">
      <div class="passport-qr-box">
        <div class="qr-mockup">
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" fill="white" rx="8"/>
            <rect x="10" y="10" width="25" height="25" fill="#0f172a"/>
            <rect x="15" y="15" width="15" height="15" fill="white"/>
            <rect x="18" y="18" width="9" height="9" fill="#0f172a"/>
            <rect x="65" y="10" width="25" height="25" fill="#0f172a"/>
            <rect x="70" y="15" width="15" height="15" fill="white"/>
            <rect x="73" y="18" width="9" height="9" fill="#0f172a"/>
            <rect x="10" y="65" width="25" height="25" fill="#0f172a"/>
            <rect x="15" y="70" width="15" height="15" fill="white"/>
            <rect x="18" y="73" width="9" height="9" fill="#0f172a"/>
            <circle cx="50" cy="50" r="8" fill="#4f46e5"/>
            <rect x="42" y="15" width="6" height="20" fill="#0f172a"/>
            <rect x="70" y="42" width="20" height="6" fill="#0f172a"/>
            <rect x="42" y="65" width="16" height="16" fill="#0f172a"/>
            <rect x="65" y="70" width="12" height="12" fill="#10b981"/>
          </svg>
          <small>QUÉT MÃ QR BẰNG SMARTPHONE</small>
        </div>
      </div>

      <div class="passport-info-box">
        <div class="passport-field"><b>Bệnh nhân:</b> <span>${s.patient} · ${s.diagnosis}</span></div>
        <div class="passport-field"><b>Đột biến Gen (Driver):</b> <strong class="badge-gen">${s.driverGenetics}</strong></div>
        <div class="passport-field"><b>Trạng thái phân tử:</b> <span>${s.molecularStatus}</span></div>
        <div class="passport-field"><b>Thuốc đang dùng:</b> <strong>${s.currentTherapy}</strong></div>
        <div class="passport-field"><b>An toàn tim mạch:</b> <span>${s.safetyCard}</span></div>
        <div class="passport-field warning-row"><b>🚨 Cảnh báo đặc biệt:</b> <em>${s.criticalWarnings}</em></div>
        <div class="passport-field hotline-row"><b>Hotline hỗ trợ liên viện (24/7):</b> <strong>${s.emergencyHotline}</strong></div>
      </div>
    </div>
  </section>`;
}

function handlePatientAiQuery(userText){
  if(!userText.trim()) return;
  const chat = state.patientAiChat;
  const now = new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
  chat.messages.push({ sender: 'user', text: userText.trim(), timestamp: now });

  const query = userText.toLowerCase();
  let aiReply = '';
  let isRed = false;

  // Quy tắc suy luận lâm sàng y khoa thông minh
  if(query.includes('khó thở') || query.includes('đau ngực') || query.includes('sốt cao') || query.includes('cấp cứu') || query.includes('ngất')){
    isRed = true;
    aiReply = '🚨 CẢNH BÁO KHẨN CẤP: Chú Minh ơi, dấu hiệu khó thở/đau ngực hoặc sốt cao là triệu chứng cần được xử trí y tế ngay lập tức! Cháu đã tự động kích hoạt Cảnh báo Đỏ gửi bác sĩ và gửi tin nhắn cho anh Tuấn (con trai). Chú hãy ngồi nghỉ ngơi tại chỗ, đo SpO2 và gọi ngay Hotline Cấp cứu 028 3844 xxxx nếu thấy mệt nhiều!';
    redDyspnea();
  } else if(query.includes('quên') && query.includes('thuốc')){
    aiReply = '💊 Hướng dẫn xử trí quên liều Osimertinib 80mg:\n- Nếu chú nhớ ra trước 20:00 tối nay: Chú hãy uống bù ngay 1 viên 80mg.\n- Nếu đã sang sáng hôm sau: Chú bỏ qua liều đã quên và uống liều bình thường lúc 08:00 sáng.\n- TUYỆT ĐỐI KHÔNG UỐNG GẤP ĐÔI (2 viên cùng lúc). Cháu đã ghi nhận vào nhật ký theo dõi rồi ạ!';
  } else if(query.includes('tiêu chảy') || query.includes('đi ngoài') || query.includes('phân lỏng')){
    aiReply = '🚽 Hướng dẫn xử trí Tiêu chảy do Osimertinib (Grade 1-2):\n1. Pha 1 gói Oresol với 1 lít nước đun sôi để nguội, uống rải rác nhiều lần trong ngày để bù nước.\n2. Uống 1 viên Loperamide 2mg sau mỗi lần đi ngoài phân lỏng (không uống quá 8 viên/ngày).\n3. Ăn cháo loãng, thịt nạc, chuối chín. Tránh đồ cay nóng, sữa bò tươi và cà phê.\nNếu đi ngoài ≥ 4 lần/ngày kéo dài, chú báo ngay cho Điều dưỡng Thu Hà nhé!';
  } else if(query.includes('mụn') || query.includes('ban da') || query.includes('ngứa') || query.includes('dị ứng')){
    aiReply = '🧴 Hướng dẫn chăm sóc da & mụn phát ban:\n- Đây là phản ứng thường gặp của thuốc đích (Grade 1 nhẹ), không phải dị ứng nguy hiểm.\n- Chú thoa kem dưỡng ẩm dịu nhẹ (loại không cồn, không hương liệu) 2 lần/ngày sau khi tắm.\n- Có thể bôi một lớp mỏng kem Hydrocortisone 1% lên nốt ngứa ở mặt hoặc lưng.\n- Tránh ánh nắng gắt trực tiếp, đội mũ rộng vành khi ra ngoài.';
  } else if(query.includes('ăn') || query.includes('dinh dưỡng') || query.includes('uống gì')){
    aiReply = '🥗 Lời khuyên dinh dưỡng:\nChú nên ăn nhiều thực phẩm giàu đạm (thịt gà, cá hồi, trứng, đậu phụ) để duy trì cân nặng 58kg, chia nhỏ 5-6 bữa trong ngày. Uống đủ 2 lít nước ấm. Tránh ăn bưởi chùm (Grapefruit) vì có thể làm tăng độc tính của thuốc!';
  } else {
    aiReply = 'Dạ cháu đã ghi nhận câu hỏi của chú Minh. Về phác đồ Osimertinib 80mg hiện tại chú đang đáp ứng rất tốt (khối u giảm 34%). Nếu có bất kỳ triệu chứng lạ nào chú cứ nhắn cho cháu hoặc bấm nút Báo triệu chứng để Điều dưỡng Thu Hà hỗ trợ chú nhé!';
  }

  chat.messages.push({ sender: 'ai', text: aiReply, timestamp: now, alert: isRed ? 'red' : 'normal' });
  event('PATIENT_AI_CHAT_INTERACTION', { detail: `Bệnh nhân hỏi: "${userText.slice(0, 40)}..." -> AI trả lời an toàn` });
  save();
  render();
}

function patientAiAssistantWidget(){
  const chat = state.patientAiChat;
  return `<section class="card ai-chat-card"><small>24/7 AI ONCOLOGY ASSISTANT · TRỢ LÝ Y TẾ THÔNG MINH ĐỒNG HÀNH</small>
    <div class="ai-chat-header">
      <div class="ai-bot-avatar">
        <span>🤖</span>
        <div>
          <b>Bác sĩ AI Khoa Ung Bướu</b>
          <small>🟢 Trực tuyến 24/7 · Sẵn sàng giải đáp</small>
        </div>
      </div>
      <div>
        ${pill('CDS Assistant · An toàn Y tế', 'purple')}
      </div>
    </div>

    <div class="ai-chat-body">
      ${chat.messages.map(m => `
        <div class="chat-msg ${m.sender === 'user' ? 'user-msg' : 'ai-msg'} ${m.alert === 'red' ? 'red-alert-msg' : ''}">
          <div class="msg-bubble">
            <p>${m.text.replace(/\n/g, '<br>')}</p>
            <small>${m.timestamp}</small>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="ai-quick-prompts">
      <small>Gợi ý câu hỏi nhanh (Bấm 1 chạm):</small>
      <div class="prompt-chips">
        ${chat.quickPrompts.map(qp => `
          <button class="prompt-chip-btn" onclick="handlePatientAiQuery('${qp}')">${qp}</button>
        `).join('')}
      </div>
    </div>

    <div class="ai-chat-input-box">
      <input type="text" id="aiChatInput" placeholder="Nhập câu hỏi của chú Minh tại đây..." onkeydown="if(event.key==='Enter'){handlePatientAiQuery(this.value); this.value='';}"/>
      <button class="primary" onclick="const el=document.getElementById('aiChatInput'); handlePatientAiQuery(el.value); el.value='';">Gửi 💬</button>
    </div>
  </section>`;
}

function followupVaccinePanel(){
  const fv = state.followupVaccine;
  const ins = fv.insuranceCost;
  return `<section class="card vaccine-cost-card"><small>PREVENTIVE CARE & COST TRANSPARENCY · LỊCH TIÊM CHỦNG & DỰ TOÁN BHYT</small>
    <div class="vaccine-cost-header">
      <div>
        <h3>Phòng ngừa Nhiễm trùng Hô hấp & Dự toán Chi phí Thuốc BHYT</h3>
        <p>Khuyến cáo NCCN & CDC cho bệnh nhân Ung thư phổi · Tối ưu hóa chi phí đồng chi trả</p>
      </div>
      <div>
        ${fv.reviewed ? pill(`ĐD/BS đã review tiêm chủng · ${fv.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận Lịch Tiêm & Chi Phí', 'reviewFollowupVaccine()', 'primary')}
      </div>
    </div>

    <div class="vaccine-cost-grid">
      <div class="vaccine-box">
        <b>1. Lịch tiêm chủng Vắc xin Bất hoạt (Preventive Vaccines):</b>
        <div class="vaccine-list">
          ${fv.vaccines.map(v => `
            <div class="vaccine-item ${v.status}">
              <div class="vaccine-item-top">
                <b>${v.name}</b>
                <span class="pill ${v.status === 'up_to_date' ? 'green' : 'yellow'}">${v.status === 'up_to_date' ? 'Đã tiêm' : 'Lên lịch'}</span>
              </div>
              <small>Lần tiêm gần nhất: ${v.lastGiven} | Hẹn tiếp theo: <strong>${v.nextDue}</strong></small>
              <p>${v.note}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="cost-box">
        <b>2. Dự toán Chi phí Điều trị & Quyền lợi BHYT (Tháng):</b>
        <div class="cost-breakdown">
          <div class="cost-row">
            <span>Tổng chi phí thuốc Osimertinib 80mg (30 ngày):</span>
            <b>${ins.monthlyMedCostTotal.toLocaleString('vi-VN')} đ</b>
          </div>
          <div class="cost-row highlight-green">
            <span>BHYT chi trả (${ins.bhytCoveragePct}%):</span>
            <b>- ${ins.bhytPaidAmount.toLocaleString('vi-VN')} đ</b>
          </div>
          <div class="cost-row highlight-blue">
            <span>Người bệnh đồng chi trả (20%):</span>
            <b>${ins.patientCoPayAmount.toLocaleString('vi-VN')} đ</b>
          </div>
          <div class="cost-note">
            <small>💡 <b>Chương trình hỗ trợ:</b> ${ins.supportProgramNote}</small>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function reviewFollowupVaccine(){
  if(!['doctor','nurse'].includes(state.role)) return;
  state.followupVaccine.reviewed = true;
  state.followupVaccine.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: state.role === 'doctor' ? 'BS. Mỹ Linh' : 'ĐD. Thu Hà'
  };
  event('FOLLOWUP_VACCINE_REVIEWED', { detail: 'Đã review lịch tiêm vắc xin Cúm/Phế cầu và dự toán BHYT' });
  save();
  render();
}

function patient(){
  const active = state.encounterState === 'home-care-active';
  return shell(`${patientSummary()}<div class="grid two">
    <section class="card hero"><small>TÁI KHÁM HÔM NAY · ${state.patient.followUp}</small><h2>${active ? 'Kế hoạch tại nhà đã kích hoạt' : 'Chuẩn bị trước khám'}</h2><p>${active ? 'Điều dưỡng đã teach-back. Theo dõi thuốc, độc tính và lịch tái khám bắt đầu từ hôm nay.' : 'Khai nhanh thay đổi từ lần trước để điều dưỡng tiếp nhận trước khi bác sĩ khám.'}</p>${!can('previsit-submitted') ? button('Xác nhận lịch & khai nhanh', 'advance("previsit-submitted","PREVISIT_SUBMITTED")', 'primary') : pill('Đã gửi cho điều dưỡng','green')}</section>
    <section class="card"><small>THUỐC HÔM NAY</small><h3>Osimertinib 80 mg</h3><p>Uống 1 viên mỗi ngày, không nghiền viên. Demo CDS: chú ý tiêu chảy, ban da, khó thở mới.</p><div class="actions">${button(state.home.medicationTakenToday?'Đã ghi nhận uống':'Đánh dấu đã uống','takeMed()','primary')}${button('Báo quên liều','missDose()','outline')}</div><meter min="0" max="42" value="${state.patient.adherence.taken}"></meter><small>${state.patient.adherence.taken}/${state.patient.adherence.total} liều · quên ${state.patient.adherence.missed}</small></section>
  </div>
  ${healthPassportCard()}
  ${patientAiAssistantWidget()}
  ${patientDailyCheckin()}
  ${patientRehabSection()}
  ${followupVaccinePanel()}
  ${caregiverSyncPanel()}` + `<div class="grid two">
    <section class="card"><small>KHAI NHANH TÁI KHÁM</small><label>Mục tiêu lần này<input value="${state.previsit.goal}" oninput="update(['previsit','goal'],this.value)" placeholder="Đánh giá đáp ứng, độc tính, cấp thuốc..." /></label><label>Thay đổi từ lần trước<textarea oninput="update(['previsit','changes'],this.value)" placeholder="VD: tiêu chảy 3-4 lần/ngày, ban da nhẹ...">${state.previsit.changes}</textarea></label>${button('Gửi thông tin cho khoa','advance("previsit-submitted","PREVISIT_SUBMITTED")','primary')}</section>
    <section class="card dangerZone"><small>BÁO TRIỆU CHỨNG</small><h3>Triage độc tính tại nhà</h3><p>Chọn nhanh triệu chứng. Nếu khó thở khi nghỉ/đau ngực/lơ mơ → popup đỏ gửi cả BS và ĐD.</p><div class="symptoms">${['Tiêu chảy','Ban da','Mệt','Sốt','Đau ngực','Khó thở khi nghỉ'].map(s=>button(s, s==='Khó thở khi nghỉ'?'redDyspnea()':'yellowSymptom("'+s+'")', s==='Khó thở khi nghỉ'?'danger':'outline')).join('')}</div></section>
  </div>
  ${carePlanCard()}${teachbackPatientReceipt()}${safetyPatientReceipt()}${triagePanel()}${patientVoicePanel()}${decisionReceipt()}${active ? homePlan() : `<section class="empty card"><b>Chưa có kế hoạch tại nhà</b><p>Kế hoạch chỉ kích hoạt sau khi bác sĩ xác nhận và điều dưỡng hoàn tất teach-back.</p></section>`}`);
}

function teachbackPatientReceipt(){
  const ed = state.education;
  if(state.encounterState !== 'home-care-active' || !ed.completedAt) return '';
  return `<section class="card patient-feedback teachback-receipt">
    <small>BẢN HƯỚNG DẪN XUẤT VIỆN & DÙNG THUỐC TẠI NHÀ</small>
    <h3>Điều dưỡng đã bàn giao lúc ${ed.completedAt} (${ed.completedBy || 'ĐD. Thu Hà'})</h3>
    <div class="receipt-instructions">
      <div><b>1. Uống thuốc:</b> Osimertinib 80mg uống nguyên viên, 1 lần/ngày vào cùng một khung giờ.</div>
      <div><b>2. Xử trí quên liều:</b> Uống ngay nếu còn >12h tới liều tiếp theo. Không uống gấp đôi.</div>
      <div><b>3. Độc tính tiêu chảy:</b> Uống Oresol bù nước + Loperamide 2mg sau mỗi lần tiêu chảy lỏng.</div>
      <div><b>4. Độc tính ban da:</b> Dưỡng ẩm nhẹ nhàng không cồn, tránh nắng.</div>
      <div><b>5. Báo động khẩn cấp:</b> Khó thở khi nghỉ, đau ngực dữ dội, sốt >38.5°C -> Bấm Triage đỏ hoặc gọi Hotline cấp cứu.</div>
      ${ed.nurseNote ? `<div><b>Ghi chú điều dưỡng:</b> ${ed.nurseNote}</div>` : ''}
    </div>
  </section>`;
}

function safetyPatientReceipt(){ const rs=state.safetyRequests; if(!rs.length)return ''; return `<section class=\"card patient-feedback\"><b>Việc đội điều trị đang phối hợp</b><p>${rs.map(r=>`${r.label}: ${r.status==='reviewed'?'đã được đội điều trị xem':'đang chờ/được điều phối'}`).join(' · ')}</p></section>`; }
function carePlanCard(){ const p=state.careLoop.plan; const invariant=p.status==='active' && (!p.confirmedAt || state.encounterState!=='home-care-active'); return `<section class="card care-plan">${invariant?`<div class="warning">State warning: plan active khi chưa đủ confirmation/teach-back.</div>`:''}<small>MY CARE · KẾ HOẠCH KẾT NỐI</small><h3>Plan ${p.planId} · revision ${p.revision}</h3><div class="plan-status">${pill(p.status==='active'?'Đang theo dõi tại nhà':p.status==='doctor_confirmed'?'BS đã xác nhận · chờ teach-back':'Bản nháp · chưa active',p.status==='active'?'green':'')}${pill('Nguồn: quyết định BS · không phải y lệnh')}</div><p>Care loop: thuốc hôm nay · symptom check · xét nghiệm · tái khám.</p>${state.careLoop.symptomCheck.completed?pill(`Đã check · ${state.careLoop.symptomCheck.at}`,'green'):button('Hoàn tất symptom check hôm nay','completeSymptomCheck()','outline')}</section>`; }
function triagePanel(){ const t=state.triage; const symptoms=['Tiêu chảy','Ban da','Mệt','Sốt','Đau ngực','Khó thở']; const flags=['Khó thở khi nghỉ','Đau ngực tăng','Lơ mơ / tím tái','Không nói trọn câu']; return `<section class="card triage-panel"><small>SYMPTOM TRIAGE · NGƯỜI BỆNH BÁO CÁO</small><h3>Hôm nay chú thấy triệu chứng gì?</h3><div class="symptoms">${symptoms.map(s=>button(s,`update(['triage','symptom'],'${s}')`,t.symptom===s?'primary':'outline')).join('')}</div>${t.symptom?`<label>Mức độ<input type="range" min="1" max="4" value="${t.severity||2}" oninput="update(['triage','severity'],this.value)"/><small>1 nhẹ · 4 nặng</small></label><h4>Dấu hiệu cần báo ngay</h4><div class="flags">${flags.map(f=>`<label><input type="checkbox" ${t.redFlags.includes(f)?'checked':''} onchange="toggleFlag('${f}',this.checked)"/> ${f}</label>`).join('')}</div>${button('Gửi triage cho đội điều trị','submitTriage()','primary')}`:'<div class="empty">Chọn triệu chứng để bắt đầu. Đây là bản ghi người bệnh cung cấp, chưa phải kết luận y khoa.</div>'}${t.status!=='empty'?pill(`${t.status.toUpperCase()} · ${t.submittedAt}`,t.status==='red'?'danger':'green'):''}${t.patientFeedback?`<div class="patient-feedback"><b>Phản hồi đội điều trị</b><p>${t.patientFeedback}</p></div>`:''}${t.review.patientReceipt?`<div class="patient-feedback"><b>Decision receipt</b><p>${t.review.patientReceipt}</p></div>`:''}</section>`; }
function resetScenario(kind){ if(!['doctor','nurse'].includes(state.role)) return; const fresh=defaultState(); if(kind==='yellow'){fresh.triage={...fresh.triage,symptom:'Tiêu chảy',severity:3,status:'yellow',escalationId:`ESC-${Date.now()}`,actionStatus:'new',submittedAt:new Date().toLocaleString('vi-VN')};} if(kind==='red'){const id=`ESC-${Date.now()}`; fresh.triage={...fresh.triage,symptom:'Khó thở',severity:4,redFlags:['Khó thở khi nghỉ'],status:'red',escalationId:id,actionStatus:'new',submittedAt:new Date().toLocaleString('vi-VN')}; fresh.alerts=[{type:'red',name:'TOXICITY_REPORTED_RED',escalationId:id,detail:'Demo scenario red: khó thở khi nghỉ',at:new Date().toLocaleTimeString('vi-VN')}];} state={...fresh,role:state.role,scenario:kind}; save(); render(); }
function toggleFlag(flag,checked){ const a=state.triage.redFlags.filter(x=>x!==flag); if(checked)a.push(flag); state.triage.redFlags=a; save(); render(); }
function submitTriage(){ if(!state.triage.symptom)return; const red=state.triage.redFlags.length>0; state.triage.status=red?'red':Number(state.triage.severity)>=3?'yellow':'green'; state.triage.escalationId=`ESC-${Date.now()}`; state.triage.submittedAt=new Date().toLocaleString('vi-VN'); event('STRUCTURED_TRIAGE_SUBMITTED',{detail:`${state.triage.symptom} · mức ${state.triage.severity} · ${state.triage.status} · người bệnh cung cấp`}); save(); render(); }
function patientVoicePanel(){ const v=state.patientVoice; return `<section class="card voice-panel"><small>PATIENT VOICE · BẢN NHÁP DO NGƯỜI BỆNH GỬI</small><h3>${v.status==='submitted'?'Đã gửi cho đội điều trị':'Nói điều chú muốn bác sĩ biết'}</h3><p>Voice thật chưa triển khai trong prototype. Có thể nhập bản nháp để mô phỏng nội dung người bệnh gửi.</p><textarea oninput="update(['patientVoice','transcript'],this.value)" placeholder="VD: Tôi đi ngoài 3 lần/ngày, vẫn uống thuốc đủ, chưa khó thở...">${v.transcript}</textarea><div class="actions">${button('Mô phỏng voice draft','fillPatientVoice()','outline')}${button(v.status==='submitted'?'Đã gửi':'Gửi cho điều dưỡng','submitPatientVoice()','primary')}</div>${v.status==='submitted'?pill(`Đã gửi · ${v.capturedAt}`,'green'):pill('Chưa gửi')}</section>`; }
function fillPatientVoice(){ state.patientVoice.transcript='Bản nháp voice: Tôi vẫn uống osimertinib hằng ngày, quên 1 liều. Gần đây tiêu chảy khoảng 3 lần/ngày và có ban da nhẹ. Hiện tôi chưa khó thở khi nghỉ.'; save(); render(); }
function submitPatientVoice(){ if(!state.patientVoice.transcript.trim()) return; state.patientVoice.status='submitted'; state.patientVoice.capturedAt=new Date().toLocaleString('vi-VN'); state.previsit.submittedAt=state.patientVoice.capturedAt; event('PATIENT_VOICE_SUBMITTED',{detail:'Người bệnh gửi bản nháp voice cho điều dưỡng; chưa được xác minh'}); save(); render(); }
function homePlan(){ return `<section class="card"><small>KẾ HOẠCH VỀ NHÀ · TỪ QUYẾT ĐỊNH ĐÃ XÁC NHẬN</small><h2>${state.doctor.decision}</h2>${handoffCards('patient')}</section>`; }
function safetyQueue(){ const rs=state.safetyRequests; if(!rs.length)return ''; return `<section class="card care-queue"><small>SAFETY COORDINATION QUEUE</small><h3>${rs.length} request · plan ${state.careLoop.plan.revision}</h3>${rs.map((r,i)=>`<div class="queue-row"><span>${r.status==='reviewed'?'✓':'○'}</span><b>${r.label}<small>${r.status} · requested ${r.requestedAt}${r.handledAt?` · ${r.handledBy} ${r.handledAt}`:''}</small></b>${r.status==='requested'&&state.role==='nurse'?button('Nhập mock result',`mockResult(${i})`,'outline'):r.status==='available'&&state.role==='doctor'?button('BS review',`reviewSafetyRequest(${i})`,'primary'):pill(r.result||'Đang chờ kết quả','green')}</div>`).join('')}</section>`; }
function mockResult(i){ if(state.role!=='nurse')return; const r=state.safetyRequests[i]; if(!r||r.status!=='requested')return; r.status='available';r.result=`Mock result · ${r.label} trong giới hạn demo`;r.nurseNote='Đã điều phối · dữ liệu mô phỏng/chưa xác minh';r.handledBy='ĐD. Thu Hà';r.handledAt=new Date().toLocaleString('vi-VN');event('SAFETY_MOCK_RESULT_RECEIVED',{detail:`${r.label} · mock only`});save();render(); }
function reviewSafetyRequest(i){ if(state.role!=='doctor'||!can('doctor-examining')||hasUnresolvedRed())return; const r=state.safetyRequests[i]; if(!r||r.status!=='available')return;r.status='reviewed';r.reviewed=true;r.reviewedAt=new Date().toLocaleString('vi-VN');event('SAFETY_RESULT_REVIEWED',{detail:`${r.label} · plan revision ${r.revision}`});save();render(); }
function careTaskQueue(){ return `<section class="card care-queue"><small>MY CARE TASK QUEUE</small><h3>Việc cần phối hợp</h3>${state.careLoop.tasks.map((t,i)=>`<div class="queue-row"><span class="${t.status==='done'?'done':''}">${t.status==='done'?'✓':'○'}</span><b>${t.label}</b><small>${t.status==='done'?'Đã hoàn tất':'Đang chờ'}</small></div>`).join('')}</section>`; }
function triageInbox(){ const t=state.triage; if(t.status==='empty') return ''; return `<section class="card triage-inbox"><small>TRIAGE INBOX · ${t.actionStatus.toUpperCase()}</small><h3>${t.symptom} · mức ${t.severity}/4</h3><p>Patient-reported · ${t.submittedAt} · ${t.redFlags.length?'Có red flag':'Chưa có red flag'} · demo routing, pending clinical governance.</p><label>Disposition<select onchange="setTriageDisposition(this.value)"><option value="">Chọn hành động...</option><option>Đã xem · tiếp tục theo dõi</option><option>Liên hệ người bệnh</option><option>Chuyển bác sĩ đánh giá</option><option>Xử trí theo protocol cơ sở</option></select></label><label>Ghi chú xử lý<textarea oninput="update(['triage','nurseNote'],this.value)" placeholder="Ghi nhận ngắn, không phải bệnh án...">${t.nurseNote}</textarea>${t.disposition?pill(t.disposition,'green'):''}${t.review.status==='resolved'?`<div class="patient-feedback"><b>Task sau resolution</b><p>${t.review.nurseTask}</p></div>`:''}<div class="actions">${button('Ghi nhận xử lý','ackTriage()','primary')}</div></section>`; }
function setTriageDisposition(v){ state.triage.disposition=v; save(); render(); }
function ackTriage(){ if(!state.triage.disposition)return; state.triage.actionStatus=state.triage.disposition.includes('bác sĩ')?'escalated':'acknowledged'; state.triage.handledBy='ĐD. Thu Hà'; state.triage.handledAt=new Date().toLocaleString('vi-VN'); state.triage.patientFeedback=state.triage.actionStatus==='escalated'?'Đội điều trị đã tiếp nhận và đang chuyển bác sĩ đánh giá.':'Đội điều trị đã tiếp nhận báo cáo và sẽ theo dõi theo quy trình của cơ sở.'; event('NURSE_TRIAGE_ACTION',{detail:`${state.triage.disposition} · ${state.triage.handledBy}`}); save(); render(); }
function requestSafety(id){ const c=state.medicationSafety.checks.find(x=>x.id===id); if(state.role!=='doctor'||!can('doctor-examining')||hasUnresolvedRed()||!c||state.safetyRequests.some(r=>r.checkId===id))return; state.safetyRequests.push({id:`REQ-${Date.now()}`,planId:state.careLoop.plan.planId,revision:state.careLoop.plan.revision,checkId:id,label:c.label,status:'requested',requestedBy:'BS. Mỹ Linh',requestedAt:new Date().toLocaleString('vi-VN'),result:'',nurseNote:'',reviewed:false}); event('SAFETY_COORDINATION_REQUESTED',{detail:`Request ${c.label} · coordination, không phải y lệnh`});save();render(); }
function medicationSafetyBrief(){ const m=state.medicationSafety; return `<section class="card med-safety"><small>MEDICATION SAFETY BRIEF · DEMO CDS</small><h3>Osimertinib · review trước quyết định</h3><p>Không tự tính liều/không thay y lệnh. Bấm từng yếu tố để ghi nhận đã review.</p><div class="med-grid">${m.checks.map(c=>`<button class="med-check ${m.reviewed[c.id]?'reviewed':''}" onclick="reviewMed('${c.id}')"><span>${m.reviewed[c.id]?'✓':'○'}</span><div><b>${c.label}</b><strong>${c.value}</strong><small>${c.source}</small></div></button>`).join('')}</div><div class="safety-requests"><b>Coordination requests</b>${state.medicationSafety.checks.filter(c=>['labs','interactions'].includes(c.id)).map(c=>`<button class="outline" onclick="requestSafety('${c.id}')">${state.safetyRequests.some(r=>r.checkId===c.id)?'Đã request':'Request'} · ${c.label}</button>`).join('')}</div><div class="warning">Tương tác thuốc chưa kết nối drug database · cần kiểm tra theo nguồn/protocol được cơ sở phê duyệt.</div></section>`; }
function reviewMed(id){ const c=state.medicationSafety.checks.find(x=>x.id===id); if(!c || ['labs','interactions'].includes(id)) { event('MEDICATION_SAFETY_GAP_ACKNOWLEDGED',{detail:`Data gap cần xử lý: ${id}`}); save(); render(); return; } state.medicationSafety.reviewed[id]=true; state.medicationSafety.reviewMeta[id]={planId:state.careLoop.plan.planId,revision:state.careLoop.plan.revision,reviewedAt:new Date().toLocaleString('vi-VN')}; event('MEDICATION_SAFETY_REVIEWED',{detail:`Đã review medication safety: ${id}`}); save(); render(); }
function doctorCareSnapshot(){ const p=state.patient; return `<section class="card care-snapshot"><small>CARE LOOP SNAPSHOT · MÔ PHỎNG</small><div class="snapshot-grid"><div><b>Tuân thủ thuốc</b><strong>${p.adherence.taken}/${p.adherence.total} · ${pct()}%</strong><small>Patient medication log</small></div><div><b>Độc tính đang theo dõi</b><strong>Tiêu chảy G2 · ban da G1</strong><small>Patient-reported · cần xác minh</small></div><div><b>Việc tại nhà</b><strong>${state.careLoop.tasks.filter(t=>t.status==='done').length}/${state.careLoop.tasks.length} hoàn tất</strong><small>Connected care tasks</small></div><div><b>Checkpoint</b><strong>CT tuần 8 + safety labs</strong><small>Data gap · chưa có kết quả</small></div></div></section>`; }
function escalationReview(){ const t=state.triage,r=t.review; if(state.role!=='doctor'||t.actionStatus!=='escalated'||r.status==='resolved') return ''; return `<section class="card escalation-review"><small>ESCALATION REVIEW · TRIAGE ${t.status.toUpperCase()}</small><h3>${t.symptom} · mức ${t.severity}/4</h3><p>Red flags: ${t.redFlags.join(' · ')||'không có'} · điều dưỡng: ${t.nurseNote||'chưa ghi chú'} · ${t.handledAt||t.submittedAt}</p><div class="decision-grid">${['Tiếp tục theo dõi','Liên hệ/đánh giá người bệnh ngay','Giữ quyết định thường quy chờ đánh giá','Route theo protocol cấp cứu cơ sở'].map(o=>`<button class="choice ${r.outcome===o?'on':''}" onclick="setEscalationOutcome('${o}')">${o}</button>`).join('')}</div><label><input type="checkbox" ${r.redFlagAcknowledged?'checked':''} onchange="update(['triage','review','redFlagAcknowledged'],this.checked)"/> Tôi đã xem và ghi nhận red flag chưa được giải quyết</label><textarea oninput="update(['triage','review','rationale'],this.value)" placeholder="Lý do xử trí/resolution...">${r.rationale}</textarea>${r.outcome&&r.rationale.trim()&&r.redFlagAcknowledged?button('Xác nhận resolution','resolveEscalation()','danger'):button('Chọn outcome + ghi lý do + acknowledge red flag','void(0)','disabled')}</section>`; }
function setEscalationOutcome(o){ state.triage.review.outcome=o; save(); render(); }
function resolveEscalation(){ const r=state.triage.review; if(!r.outcome||!r.rationale.trim()||!r.redFlagAcknowledged||!state.triage.escalationId)return; r.status='resolved'; r.reviewedBy='BS. Mỹ Linh'; r.reviewedAt=new Date().toLocaleString('vi-VN'); state.alertResolution.escalationId=state.triage.escalationId; const terminal=r.outcome==='Tiếp tục theo dõi' && state.triage.redFlags.length===0; state.alertResolution.status=terminal?'resolved':'action_required';r.reviewedBy='BS. Mỹ Linh';r.reviewedAt=new Date().toLocaleString('vi-VN');r.nurseTask=r.outcome.includes('Liên hệ')?'Điều dưỡng liên hệ người bệnh và ghi kết quả.':'Điều dưỡng theo dõi theo hướng dẫn của cơ sở.';r.patientReceipt=terminal?'Đội điều trị đã xem báo cáo và cập nhật bước tiếp theo.':'Đội điều trị đã xem báo cáo và đang xử lý theo quy trình của cơ sở.';state.triage.actionStatus=terminal?'resolved':'doctor_reviewed_action_required';event('DOCTOR_ESCALATION_RESOLVED',{detail:`${r.outcome} · ${r.rationale}`});save();render(); }
function triageHandoff(){ const t=state.triage; if(t.status==='empty' || (state.role==='doctor' && t.actionStatus!=='escalated')) return ''; return `<div class="triage-handoff ${t.status}"><small>TRIAGE HANDOFF · ${t.status.toUpperCase()}</small><b>${t.symptom} · mức ${t.severity}/4</b><p>${t.redFlags.length?`Red flags: ${t.redFlags.join(' · ')}`:'Chưa chọn red flag'} · ${t.submittedAt}</p><em>Patient-reported · demo phân tầng, không phải protocol.</em></div>`; }
function decisionReceipt(){ const r=state.doctor.receipt; if(!r || state.doctor.decisionStatus!=='confirmed') return ''; return `<section class="receipt card"><div><small>DECISION RECEIPT · ${r.at}</small><h3>${r.decision}</h3><p>${r.rationale}</p></div><div class="receipt-grid"><div><small>EVIDENCE ĐÃ DÙNG</small><b>${r.evidence}</b></div><div><small>DATA GAP MỞ</small><b>${r.gaps}</b></div><div><small>CHECKPOINT</small><b>${r.checkpoint}</b></div>${r.mdtSummary ? `<div class="receipt-mdt"><small>HỘI CHẨN MDT</small><b>${r.mdtSummary}</b></div>` : ''}</div><em>Demo CDS · receipt phối hợp, không phải y lệnh hay bệnh án.</em></section>`; }
function handoffCards(audience){
  const cards = audience==='nurse' ? [
    ['Thuốc & đối chiếu',state.doctor.decision,'Đối chiếu với HIS/EMR trước hướng dẫn; không tự thay đổi quyết định.'],
    ['Theo dõi an toàn','Điện giải · QTc · gan thận','Xác nhận lịch xét nghiệm và báo BS khi dữ liệu chưa đủ.'],
    ['Medication safety','Đối chiếu thuốc & tương tác','Drug database chưa kết nối; ghi nhận kiểm tra theo nguồn cơ sở.'],
    ['Data gaps','CT tuần 8 · ECG/điện giải','Đây là việc cần bổ sung, không phải trường bệnh án bắt buộc.'],
    ['Teach-back','Quên liều · độc tính · red flags','Người bệnh phải nhắc lại đúng trước khi kích hoạt My Care.']
  ] : [
    ['Thuốc hôm nay','Osimertinib 80 mg lúc 08:00','Dùng đúng kế hoạch đã được đội điều trị xác nhận.'],
    ['Việc sắp tới','Xét nghiệm an toàn + CT tuần 8','App sẽ nhắc theo lịch khoa đã xác nhận.'],
    ['Nguồn thông tin','Kế hoạch từ Decision Brief','Nội dung mô phỏng; đội điều trị xác nhận trước khi áp dụng.'],
    ['Medication safety','Dùng đúng liều đã xác nhận','Không tự đổi liều; liên hệ đội điều trị nếu có vấn đề.'],
    ['Khi cần báo ngay','Khó thở mới, đau ngực, sốt, tiêu chảy tăng','Liên hệ khoa theo hướng dẫn; tình trạng nặng làm theo protocol cấp cứu của cơ sở.']
  ];
  return `<div class="handoff-grid">${cards.map(c=>`<div class="handoff"><small>${c[0]}</small><b>${c[1]}</b><p>${c[2]}</p></div>`).join('')}</div>`;
}

function ddiCheckerPanel(){
  const d = state.ddiChecker;
  return `<section class="card ddi-card"><small>DRUG-DRUG INTERACTION (DDI) & MEDICATION RECONCILIATION · ĐỐI CHIẾU TƯƠNG TÁC THUỐC</small>
    <div class="ddi-header">
      <div>
        <h3>Đối chiếu thuốc dùng kèm & Tương tác với Osimertinib 80mg</h3>
        <p>Phát hiện tự động nguy cơ tương tác dược động học qua CYP3A4, ức chế acid dạ dày (PPI) và khoảng QTc</p>
        <small>CDS demo · Bác sĩ và Điều dưỡng đối chiếu trước khi phát thuốc xuất viện</small>
      </div>
      <div>
        ${d.reviewed ? pill(`Đã đối chiếu & xử trí tương tác · ${d.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận xử trí tương tác thuốc', 'reviewDdi()', 'primary')}
      </div>
    </div>

    <div class="ddi-grid">
      <div class="ddi-box">
        <b>1. Danh sách thuốc dùng kèm hiện tại (Medication Reconciliation):</b>
        <table class="ddi-table">
          <thead>
            <tr>
              <th>Tên thuốc & Liều lượng</th>
              <th>Chỉ định</th>
              <th>Nguồn ghi nhận</th>
            </tr>
          </thead>
          <tbody>
            ${d.concomitantMeds.map(m => `
              <tr>
                <td><b>${m.name}</b><br><small>${m.dose}</small></td>
                <td>${m.indication}</td>
                <td><small>${m.source}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="ddi-box">
        <b>2. Cảnh báo tương tác thuốc & Khuyến cáo xử trí lâm sàng:</b>
        <div class="ddi-alerts">
          ${d.interactions.map(it => `
            <div class="ddi-alert-card ${it.level}">
              <div class="ddi-alert-top">
                <b>${it.drug}</b>
                ${pill(it.severity, it.level === 'major' ? 'red' : it.level === 'moderate' ? 'yellow' : 'green')}
              </div>
              <p><strong>Cơ chế:</strong> ${it.mechanism}</p>
              <div class="ddi-rec"><strong>Khuyến cáo xử trí:</strong> ${it.recommendation}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function reviewDdi(){
  if(!['doctor','nurse'].includes(state.role)) return;
  state.ddiChecker.reviewed = true;
  state.ddiChecker.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: state.role === 'doctor' ? 'BS. Mỹ Linh' : 'ĐD. Thu Hà'
  };
  state.medicationSafety.reviewed['interactions'] = true;
  state.medicationSafety.reviewMeta['interactions'] = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: state.ddiChecker.reviewMeta.reviewedAt
  };
  const ddiItem = state.medicationSafety.checks.find(x => x.id === 'interactions');
  if(ddiItem){
    ddiItem.value = 'Đã xử trí: Ngưng Omeprazole -> Đổi Antacid cách 2h; Ngưng thảo dược';
    ddiItem.source = 'DDI Checker · Đã đối chiếu';
  }
  event('DDI_INTERACTIONS_REVIEWED', { detail: 'Đã đối chiếu tương tác thuốc: Ngưng Omeprazole (PPI) & thảo dược' });
  save();
  render();
}

function nurse(){ return shell(`${patientSummary()}${ddiCheckerPanel()}${safetyQueue()}${careTaskQueue()}${triageInbox()}${triageHandoff()}${decisionReceipt()}<div class="grid two"><section class="card"><small>TIẾP NHẬN ĐIỀU DƯỠNG</small><h2>${can('previsit-submitted')?'Có bệnh nhân đã gửi khai nhanh':'Chờ bệnh nhân gửi khai nhanh'}</h2><p>Định danh, sinh hiệu, dị ứng, thuốc đang dùng và dấu hiệu báo động.</p>${checklist('intake', ['idChecked|Đối chiếu họ tên · ngày sinh · mã BN','vitals|Nhập sinh hiệu · SpO₂ · đau · cân nặng','allergy|Xác minh dị ứng','medrec|Medication reconciliation','redflags|Xác minh dấu hiệu báo động'])}<label>Ghi chú voice/nhập tay<textarea oninput="update(['intake','note'],this.value)">${state.intake.note}</textarea></label>${doneCount(state.intake)>=5 ? button('Hoàn tất tiếp nhận → gửi bác sĩ','advance("ready-for-doctor","NURSE_INTAKE_COMPLETED")','primary') : button('Cần đủ checklist để hoàn tất','void(0)','disabled')}</section><section class="card"><small>SAU KHI BÁC SĨ CHỐT KẾ HOẠCH</small><h2>${can('doctor-plan-confirmed')?'Kế hoạch đã chuyển từ bác sĩ':'Chưa có kế hoạch điều trị'}</h2><p>Điều dưỡng chỉ nhận các việc cần phối hợp từ quyết định đã xác nhận — không nhận toàn bộ bệnh án và không tự sinh y lệnh.</p>${can('doctor-plan-confirmed') ? handoffCards('nurse') + teachback() : '<div class="empty">Handoff cards sẽ xuất hiện sau khi BS xác nhận quyết định.</div>'}</section></div>${activityLog()}`); }
function completeTeachback(){
  if(doneCount(state.education) < 10) return;
  state.education.completedAt = new Date().toLocaleString('vi-VN');
  state.education.completedBy = 'ĐD. Thu Hà';
  advance('home-care-active', 'NURSE_EDUCATION_COMPLETED');
}

function teachback(){
  const items = [
    'identity|1. Đối chiếu định danh đúng người bệnh (họ tên, ngày sinh, mã BN LC-871748)',
    'emr|2. Đối chiếu kế hoạch điều trị của BS với HIS/EMR',
    'allergy|3. Kiểm tra tiền sử dị ứng thuốc và thực phẩm',
    'meds|4. Hướng dẫn dùng Osimertinib 80mg/ngày (uống nguyên viên cùng giờ, không nghiền)',
    'missedDose|5. Xử trí quên liều (uống bù nếu còn >12h tới liều kế tiếp; không uống gấp đôi)',
    'toxicity|6. Hướng dẫn chăm sóc độc tính tại nhà (bù nước/Loperamide cho tiêu chảy G2, dưỡng ẩm da)',
    'redflags|7. Nhận biết dấu hiệu báo động (khó thở khi nghỉ, đau ngực, sốt cao >38.5°C)',
    'teachback|8. Người bệnh nhắc lại đúng liều lượng, giờ uống và cách báo động (Teach-back OK)',
    'followup|9. Hẹn lịch xét nghiệm an toàn (ECG/điện giải) và CT đánh giá tuần 8',
    'contact|10. Cung cấp số điện thoại hotline Khoa Ung bướu để hỗ trợ 24/7'
  ];
  const count = doneCount(state.education);
  return `<div class="teachback-section">
    <div class="teachback-header">
      <div>
        <h4>Bảng kiểm bàn giao & Giáo dục sức khỏe (Teach-back 10 điểm)</h4>
        <p>Điều dưỡng thực hiện trước khi người bệnh xuất viện · Hoàn thành: ${count}/10</p>
      </div>
      <div>
        ${count >= 10 ? pill('Đã hoàn thành 10/10 mục', 'green') : pill(`Còn ${10 - count} mục`, 'yellow')}
      </div>
    </div>
    ${checklist('education', items)}
    <label>Ghi chú phản hồi của người bệnh khi bàn giao:
      <textarea oninput="update(['education','nurseNote'],this.value)" placeholder="Người bệnh hiểu rõ cách uống thuốc và cách theo dõi tiêu chảy...">${state.education.nurseNote || ''}</textarea>
    </label>
    <div class="actions">
      ${count >= 10 ? button('Hoàn tất teach-back · Kích hoạt My Care tại nhà', 'completeTeachback()', 'primary') : button('Cần đánh dấu đủ 10 mục để kích hoạt', 'void(0)', 'disabled')}
    </div>
  </div>`;
}

function recistAssessmentBrief(){
  const r = state.recist;
  return `<section class="card recist-brief"><small>RECIST 1.1 ASSESSMENT BRIEF · ĐÁNH GIÁ ĐÁP ỨNG MÔ PHỎNG</small>
    <div class="recist-header">
      <div>
        <h3>Đáp ứng khối u: ${r.overallResponse}</h3>
        <p>Thời điểm chụp: ${r.scanDate} · Baseline: ${r.baselineDate} · ${r.modality}</p>
        <small>${r.evaluator} · CDS demo (không thay thế kết quả CĐHA chính thức)</small>
      </div>
      <div>
        ${r.reviewed ? pill(`BS đã review · ${r.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận đã review RECIST', 'reviewRecist()', 'primary')}
      </div>
    </div>
    <div class="recist-table-wrap">
      <table class="recist-table">
        <thead>
          <tr>
            <th>Tổn thương đích (Target Lesions)</th>
            <th>Baseline (${r.baselineDate})</th>
            <th>Lần này (${r.scanDate})</th>
            <th>% Thay đổi</th>
          </tr>
        </thead>
        <tbody>
          ${r.targetLesions.map(tl => `<tr>
            <td><b>${tl.id}:</b> ${tl.site}</td>
            <td>${tl.baseline} ${tl.unit}</td>
            <td>${tl.current} ${tl.unit}</td>
            <td><span class="change-badge negative">${tl.change > 0 ? '+' : ''}${tl.change}%</span></td>
          </tr>`).join('')}
          <tr class="sum-row">
            <td><b>Tổng đường kính lớn nhất (SLD)</b></td>
            <td><b>${r.sumBaseline} mm</b></td>
            <td><b>${r.sumCurrent} mm</b></td>
            <td><b class="change-badge negative">${r.sumChangePct}% (Giảm ≥ 30% -> PR)</b></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="recist-grid">
      <div><b>Tổn thương không đích (Non-target)</b><p>${r.nonTargetStatus}</p></div>
      <div><b>Tổn thương mới (New lesions)</b><p>${r.newLesions}</p></div>
      <div><b>Kết luận sơ bộ RECIST 1.1</b><p><strong>${r.overallResponse}</strong> · Phù hợp tiếp tục liệu pháp đích nếu dung nạp tốt</p></div>
    </div>
  </section>`;
}

function reviewRecist(){
  if(state.role !== 'doctor') return;
  state.recist.reviewed = true;
  state.recist.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  const respItem = state.decisionBrief.evidenceMap.find(x => x.id === 'response');
  if(respItem){
    respItem.reviewed = true;
    respItem.value = `PR (-34%) · ${state.recist.scanDate}`;
    respItem.status = 'ready';
    respItem.provenance = 'RECIST 1.1 mô phỏng · BS đã review';
  }
  event('RECIST_ASSESSMENT_REVIEWED', { detail: `Đã review đáp ứng RECIST 1.1: ${state.recist.overallResponse}` });
  save();
  render();
}

function ctcaeToxicityGuide(){
  const c = state.ctcae;
  return `<section class="card ctcae-guide"><small>CTCAE v5.0 TOXICITY MANAGEMENT GUIDE · XỬ TRÍ ĐỘC TÍNH MÔ PHỎNG</small>
    <div class="ctcae-header">
      <div>
        <h3>Đánh giá độc tính: Tiêu chảy G2 · Ban da G1</h3>
        <p>Phân độ theo CTCAE v5.0 · Hướng dẫn xử trí nâng đỡ theo khuyến cáo lâm sàng osimertinib</p>
        <small>CDS demo · Không tự động thay đổi liều hoặc phát sinh y lệnh</small>
      </div>
      <div>
        ${c.reviewed ? pill(`BS đã review độc tính · ${c.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận đã review CTCAE', 'reviewCtcae()', 'primary')}
      </div>
    </div>
    <div class="ctcae-cards">
      ${c.items.map((item, idx) => `
        <div class="ctcae-card ${item.grade >= 2 ? 'warning-card' : ''}">
          <div class="ctcae-card-top">
            <b>${item.name}</b>
            ${pill(`Grade ${item.grade}`, item.grade >= 3 ? 'red' : item.grade === 2 ? 'yellow' : 'green')}
          </div>
          <div class="ctcae-field"><small>Người bệnh báo cáo:</small><p>${item.patientReported}</p></div>
          <div class="ctcae-field"><small>Tiêu chuẩn CTCAE v5.0:</small><p>${item.definition}</p></div>
          <div class="ctcae-field"><small>Khuyến cáo chăm sóc hỗ trợ (Supportive Care):</small><p><strong>${item.managementDemo}</strong></p></div>
          <div class="ctcae-field"><small>Khuyến cáo điều chỉnh liều osimertinib:</small><p><em>${item.dosingRecommendation}</em></p></div>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function reviewCtcae(){
  if(state.role !== 'doctor') return;
  state.ctcae.reviewed = true;
  state.ctcae.items.forEach(it => it.reviewed = true);
  state.ctcae.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  state.medicationSafety.reviewed['toxicity'] = true;
  state.medicationSafety.reviewMeta['toxicity'] = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: state.ctcae.reviewMeta.reviewedAt
  };
  const toxItem = state.decisionBrief.evidenceMap.find(x => x.id === 'toxicity');
  if(toxItem){
    toxItem.reviewed = true;
    toxItem.provenance = 'CTCAE v5.0 mô phỏng · BS đã review';
  }
  event('CTCAE_TOXICITY_REVIEWED', { detail: 'Đã review phân độ và hướng xử trí độc tính CTCAE v5.0' });
  save();
  render();
}

function mdtConsultationPanel(){
  const m = state.mdt;
  const isRequested = m.status === 'scheduled' || m.status === 'completed' || state.doctor.decision === 'Trình MDT / đổi chiến lược';
  if(!isRequested) return '';
  return `<section class="card mdt-panel"><small>MULTIDISCIPLINARY TEAM (MDT) · HỘI CHẨN ĐA CHUYÊN KHOA MÔ PHỎNG</small>
    <div class="mdt-header">
      <div>
        <h3>Biên bản Hội chẩn Đa chuyên khoa Ung bướu Phổi</h3>
        <p>Chủ trì: ${m.leadClinician} · Trạng thái: ${m.status === 'completed' ? 'Đã hoàn tất hội chẩn' : 'Đang tiến hành hội chẩn'}</p>
        <small>Lý do: ${m.reason} · CDS demo (không thay thế hồ sơ hội chẩn chính thức)</small>
      </div>
      <div>
        ${m.status === 'completed' ? pill(`MDT hoàn tất · ${m.completedAt}`, 'green') : button('Chốt biên bản & đồng thuận MDT', 'completeMdt()', 'primary')}
      </div>
    </div>
    <div class="mdt-grid">
      ${m.panel.map(p => `
        <div class="mdt-member-card">
          <div class="mdt-member-top">
            <b>${p.specialty}</b>
            <small>${p.doctor}</small>
          </div>
          <p class="mdt-opinion">"${p.recommendation}"</p>
        </div>
      `).join('')}
    </div>
    <div class="mdt-consensus-box">
      <b>Kết luận đồng thuận của Hội đồng (MDT Consensus):</b>
      <p>${m.consensus}</p>
    </div>
  </section>`;
}

function requestMdt(){
  state.mdt.status = 'scheduled';
  state.mdt.requestedAt = new Date().toLocaleString('vi-VN');
  state.doctor.decision = 'Trình MDT / đổi chiến lược';
  event('MDT_CONSULTATION_REQUESTED', { detail: 'Bác sĩ yêu cầu triệu tập hội chẩn đa chuyên khoa MDT' });
  save();
  render();
}

function completeMdt(){
  if(state.role !== 'doctor') return;
  state.mdt.status = 'completed';
  state.mdt.completedAt = new Date().toLocaleString('vi-VN');
  state.mdt.reviewed = true;
  state.mdt.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: state.mdt.completedAt,
    reviewedBy: 'BS. Mỹ Linh'
  };
  event('MDT_CONSULTATION_COMPLETED', { detail: 'Đã hoàn tất hội chẩn MDT và thống nhất kết luận đồng thuận' });
  save();
  render();
}

function proTrendDashboard(){
  const entries = state.proDiary.entries;
  if(!entries.length) return '';
  return `<section class="card pro-trend-card"><small>PATIENT-REPORTED OUTCOMES (PRO) · XU HƯỚNG SỨC KHỎE 7 NGÀY GẦN NHẤT</small>
    <div class="pro-trend-header">
      <div>
        <h3>Biểu đồ theo dõi Độc tính & Tuân thủ tại nhà</h3>
        <p>Dữ liệu do người bệnh ghi nhận hằng ngày giữa 2 đợt tái khám · Nguồn: Patient-reported</p>
      </div>
      <div>
        ${pill(`Ghi nhận: ${entries.length} ngày`, 'purple')}
      </div>
    </div>

    <div class="pro-chart-container">
      <div class="pro-chart-title"><b>Số lần tiêu chảy / ngày & Độ nặng Ban da:</b></div>
      <div class="pro-bars">
        ${entries.map(e => `
          <div class="pro-bar-col">
            <div class="pro-bar-value">${e.diarrheaCount} lần</div>
            <div class="pro-bar-wrap">
              <div class="pro-bar ${e.diarrheaCount >= 4 ? 'danger' : e.diarrheaCount >= 2 ? 'warning' : 'normal'}" style="height:${Math.min(100, e.diarrheaCount * 22)}px"></div>
            </div>
            <div class="pro-bar-date">${e.date}</div>
            <div class="pro-bar-badge">${e.rashGrade > 0 ? `<span class="rash-tag ${e.rashGrade >= 2 ? 'danger' : 'warning'}">Ban G${e.rashGrade}</span>` : '<span class="rash-tag normal">Da êm</span>'}</div>
            <div class="pro-bar-med">${e.medTaken ? '💊 80mg' : '❌ Quên'}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="pro-trend-summary">
      <div><b>Đánh giá xu hướng lâm sàng:</b> Tiêu chảy dao động 1–3 lần/ngày (Grade 1-2), có 1 đợt đỉnh 4 lần (ngày 29/08) đã kiểm soát bằng bù nước và Loperamide. Tuân thủ thuốc đạt ${entries.filter(e=>e.medTaken).length}/${entries.length} ngày (${Math.round(entries.filter(e=>e.medTaken).length/entries.length*100)}%).</div>
    </div>
  </section>`;
}

function safetyLabsPanel(){
  const l = state.safetyLabs;
  return `<section class="card safety-labs-card"><small>SAFETY LABS & TIM MẠCH · SÀNG LỌC AN TOÀN TRƯỚC ĐIỀU TRỊ</small>
    <div class="safety-labs-header">
      <div>
        <h3>Điện tâm đồ (QTcF) & Điện giải đồ · Sàng lọc ILD</h3>
        <p>Xét nghiệm ngày ${l.qtc.date} · Đánh giá an toàn cho liệu pháp Osimertinib 80mg</p>
        <small>Cảnh báo an toàn: QTcF > 500ms hoặc tăng > 60ms so với baseline (${l.qtc.baseline}ms) -> Cần tạm dừng thuốc và chỉnh điện giải</small>
      </div>
      <div>
        ${l.reviewed ? pill(`BS đã review an toàn · ${l.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận đã review Labs & QTc', 'reviewSafetyLabs()', 'primary')}
      </div>
    </div>

    <div class="safety-labs-grid">
      <div class="lab-tile ${l.qtc.value > 500 ? 'danger' : 'normal'}">
        <small>Khoảng QTc (Fridericia)</small>
        <b>${l.qtc.value} ${l.qtc.unit}</b>
        <span>Baseline: ${l.qtc.baseline} ms (+14ms) · An toàn</span>
      </div>

      <div class="lab-tile ${l.potassium.value < 3.5 ? 'danger' : 'normal'}">
        <small>Kali máu (K+)</small>
        <b>${l.potassium.value} ${l.potassium.unit}</b>
        <span>Tham chiếu: ${l.potassium.ref} · Bình thường</span>
      </div>

      <div class="lab-tile ${l.magnesium.value < 0.75 ? 'danger' : 'normal'}">
        <small>Magie máu (Mg2+)</small>
        <b>${l.magnesium.value} ${l.magnesium.unit}</b>
        <span>Tham chiếu: ${l.magnesium.ref} · Bình thường</span>
      </div>

      <div class="lab-tile normal">
        <small>Men gan AST / ALT</small>
        <b>${l.astAlt.ast} / ${l.astAlt.alt} ${l.astAlt.unit}</b>
        <span>Tham chiếu: ${l.astAlt.ref} · Không độc tính gan</span>
      </div>

      <div class="lab-tile normal">
        <small>Chức năng thận (eGFR)</small>
        <b>${l.creatinine.egfr} mL/min</b>
        <span>Creatinine: ${l.creatinine.value} µmol/L · Tốt</span>
      </div>

      <div class="lab-tile ${l.ildScreening.status === 'clear' ? 'normal' : 'danger'}">
        <small>Sàng lọc Viêm phổi kẽ (ILD)</small>
        <b>SpO2 ${l.ildScreening.spo2}%</b>
        <span>${l.ildScreening.note}</span>
      </div>
    </div>
  </section>`;
}

function reviewSafetyLabs(){
  if(state.role !== 'doctor') return;
  state.safetyLabs.reviewed = true;
  state.safetyLabs.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  state.medicationSafety.reviewed['labs'] = true;
  state.medicationSafety.reviewMeta['labs'] = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: state.safetyLabs.reviewMeta.reviewedAt
  };
  const safeItem = state.decisionBrief.evidenceMap.find(x => x.id === 'safety');
  if(safeItem){
    safeItem.reviewed = true;
    safeItem.value = `QTcF ${state.safetyLabs.qtc.value}ms · K+ ${state.safetyLabs.potassium.value}`;
    safeItem.status = 'ready';
    safeItem.provenance = 'Safety Labs demo · BS đã review';
  }
  event('SAFETY_LABS_REVIEWED', { detail: `Đã review QTcF ${state.safetyLabs.qtc.value}ms và điện giải an toàn` });
  save();
  render();
}

function biomarkerEvolutionPanel(){
  const b = state.biomarkers;
  return `<section class="card biomarker-card"><small>BIOMARKER EVOLUTION & RESISTANCE TRACKER · THEO DÕI KHÁNG THUỐC</small>
    <div class="biomarker-header">
      <div>
        <h3>Đột biến EGFR & Động học ctDNA (Sinh thiết lỏng)</h3>
        <p>Đột biến nền: <strong>${b.primary}</strong> (${b.baselineDate})</p>
        <small>Theo dõi đột biến kháng thuốc thứ phát (C797S, MET, T790M) chuẩn bị cho bước điều trị kế tiếp</small>
      </div>
      <div>
        ${b.reviewed ? pill(`BS đã review Biomarkers · ${b.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận đã review Biomarkers', 'reviewBiomarkers()', 'primary')}
      </div>
    </div>

    <div class="biomarker-grid">
      <div class="biomarker-box">
        <b>Động học ctDNA EGFR (Mức độ thanh thải phân tử):</b>
        <div class="ctdna-timeline">
          ${b.ctDnaTrend.map((t, idx) => `
            <div class="ctdna-point ${idx === b.ctDnaTrend.length - 1 ? 'current' : ''}">
              <small>${t.checkpoint}</small>
              <b>${t.egfrAbundance}</b>
              <span>${t.interpretation}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="biomarker-box">
        <b>Bảng sàng lọc đột biến kháng thuốc (Resistance Panel):</b>
        <table class="biomarker-table">
          <thead>
            <tr>
              <th>Gen / Đột biến</th>
              <th>Kết quả</th>
              <th>Phương pháp</th>
            </tr>
          </thead>
          <tbody>
            ${b.resistanceMarkers.map(rm => `
              <tr>
                <td><b>${rm.marker}</b></td>
                <td><span class="pill green">${rm.status}</span></td>
                <td><small>${rm.method} (${rm.date})</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </section>`;
}

function nccnPathwayViewer(){
  const n = state.nccnPathways;
  const t = n.pathwayTree;
  return `<section class="card nccn-card"><small>NCCN & ESMO CLINICAL PATHWAYS · CÂY PHÁC ĐỒ ĐIỀU TRỊ CHUẨN QUỐC TẾ</small>
    <div class="nccn-header">
      <div>
        <h3>${n.guidelineVersion}</h3>
        <p>Phân nhánh điều trị cá thể hóa: ${t.histology} · ${t.stage}</p>
        <small>Mức độ chứng cứ: <strong>Category 1 (FLAURA Trial)</strong> · Hướng dẫn số 1 thế giới cho NSCLC</small>
      </div>
      <div>
        ${n.reviewed ? pill(`BS đã đối chiếu NCCN · ${n.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận đối chiếu NCCN Pathway', 'reviewNccnPathway()', 'primary')}
      </div>
    </div>

    <div class="nccn-tree-container">
      <div class="nccn-branch standard-first-line">
        <div class="nccn-badge-title">
          <span class="nccn-pill preferred">PREFERRED BƯỚC 1 (CATEGORY 1)</span>
          <b>${t.firstLineStandard.preferred}</b>
        </div>
        <div class="nccn-evidence-box">
          <b>Bằng chứng thử nghiệm lâm sàng bản lề:</b>
          <p>${t.firstLineStandard.evidenceTrial}</p>
          <div class="nccn-alt"><small>Lựa chọn phối hợp khi gánh nặng u cao / di căn não:</small> <em>${t.firstLineStandard.combinationAlternative}</em></div>
        </div>
      </div>

      <div class="nccn-branch progression-branch">
        <div class="nccn-badge-title">
          <span class="nccn-pill warning">DỰ PHÒNG XỬ TRÍ KHI TIẾN TRIỂN (NEXT-LINE PATHWAYS)</span>
          <b>Chiến lược theo cơ chế kháng thuốc sinh học phân tử</b>
        </div>
        <div class="nccn-progression-grid">
          ${t.progressionPathways.map(p => `
            <div class="nccn-path-card">
              <b>${p.mechanism}</b>
              <p>${p.nextStep}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function reviewNccnPathway(){
  if(state.role !== 'doctor') return;
  state.nccnPathways.reviewed = true;
  state.nccnPathways.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  event('NCCN_PATHWAY_REVIEWED', { detail: 'Đã đối chiếu phác đồ Osimertinib 80mg Category 1 NCCN' });
  save();
  render();
}

function reviewBiomarkers(){
  if(state.role !== 'doctor') return;
  state.biomarkers.reviewed = true;
  state.biomarkers.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  const molItem = state.decisionBrief.evidenceMap.find(x => x.id === 'molecular');
  if(molItem){
    molItem.reviewed = true;
    molItem.value = `${state.biomarkers.primary} · ctDNA 0.08%`;
    molItem.provenance = 'ctDNA NGS tuần 8 · BS đã review';
  }
  event('BIOMARKER_EVOLUTION_REVIEWED', { detail: 'Đã review động học ctDNA và bảng đột biến kháng thuốc' });
  save();
  render();
}

function voiceScribePanel(){
  const v = state.voiceScribe;
  const ext = v.extractedEntities;
  return `<section class="card voice-scribe-card"><small>AI VOICE CLINICAL SCRIBE · TRỢ LÝ GHI ÂM & TRÍCH XUẤT SOAP TỰ ĐỘNG</small>
    <div class="voice-scribe-header">
      <div>
        <h3>Trích xuất Bệnh án SOAP từ Đoạn hội thoại Bác sĩ - Người bệnh</h3>
        <p>Tự động nhận diện thực thể y khoa (triệu chứng, tuân thủ, đáp ứng u, tác dụng phụ) từ giọng nói</p>
      </div>
      <div>
        ${button('✨ Trích xuất & Dán vào SOAP EMR', 'applyVoiceScribeToSoap()', 'primary')}
      </div>
    </div>

    <div class="voice-scribe-grid">
      <div class="scribe-transcript-box">
        <b>Đoạn hội thoại lâm sàng 3 phút (Audio Transcript):</b>
        <p class="transcript-text">"${v.transcript}"</p>
      </div>

      <div class="scribe-entities-box">
        <b>Thực thể lâm sàng đã phân loại tự động (Auto-classified SOAP):</b>
        <div class="scribe-quadrants">
          <div><small>[S] Chủ quan:</small><span>${ext.subjective}</span></div>
          <div><small>[O] Khách quan:</small><span>${ext.objective}</span></div>
          <div><small>[A] Đánh giá:</small><span>${ext.assessment}</span></div>
          <div><small>[P] Kế hoạch:</small><span>${ext.plan}</span></div>
        </div>
      </div>
    </div>
  </section>`;
}

function applyVoiceScribeToSoap(){
  copySoapSummary();
  event('VOICE_SCRIBE_SOAP_APPLIED', { detail: 'Đã trích xuất và sao chép bệnh án SOAP từ AI Voice Scribe' });
}

function rehabAssessmentPanel(){
  const r = state.rehabNutrition;
  const completedCount = r.exercises.filter(ex => ex.completed).length;
  return `<section class="card rehab-admin-card"><small>PULMONARY REHABILITATION & NUTRITION STATUS · THỂ LỰC & DINH DƯỠNG</small>
    <div class="rehab-admin-header">
      <div>
        <h3>Thể trạng: ECOG 0 · BMI ${r.bmi} kg/m² (${r.weightKg}kg / ${r.heightCm}cm)</h3>
        <p>Sụt cân 6 tháng: ${r.weightChange6MoPct}% (${r.cachexiaRisk}) · Tuân thủ tập thở: ${completedCount}/${r.exercises.length} bài tập</p>
        <small>Mục tiêu: Duy trì khối cơ nạc, phòng ngừa suy kiệt (Cachexia) và cải thiện dung tích sống của phổi</small>
      </div>
      <div>
        ${r.reviewed ? pill(`BS/ĐD đã review thể lực · ${r.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận review Thể lực & Phổi', 'reviewRehabNutrition()', 'primary')}
      </div>
    </div>

    <div class="rehab-admin-grid">
      <div class="rehab-tile">
        <small>Chỉ số Khối cơ thể (BMI)</small>
        <b>${r.bmi} kg/m²</b>
        <span>Cân nặng 58.0 kg · Ổn định</span>
      </div>
      <div class="rehab-tile">
        <small>Nguy cơ suy kiệt (Cachexia)</small>
        <b>${r.cachexiaRisk}</b>
        <span>Sụt < 5% trong 6 tháng</span>
      </div>
      <div class="rehab-tile">
        <small>Tập thở chúm môi & Cơ hoành</small>
        <b>${completedCount === 3 ? '✓ Hoàn thành tốt' : `${completedCount}/3 bài đã tập`}</b>
        <span>Tăng cường trao đổi khí SpO2</span>
      </div>
    </div>
  </section>`;
}

function reviewRehabNutrition(){
  if(!['doctor','nurse'].includes(state.role)) return;
  state.rehabNutrition.reviewed = true;
  state.rehabNutrition.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: state.role === 'doctor' ? 'BS. Mỹ Linh' : 'ĐD. Thu Hà'
  };
  event('REHAB_NUTRITION_REVIEWED', { detail: `Đã review thể lực ECOG 0, BMI ${state.rehabNutrition.bmi} và phục hồi chức năng phổi` });
  save();
  render();
}

function recalculateClinicalScores(){
  const inp = state.clinicalCalculators.inputs;
  const age = Number(inp.age) || 62;
  const wt = Number(inp.weightKg) || 58;
  const ht = Number(inp.heightCm) || 165;
  const scr = Number(inp.serumCreatinineMgDl) || 0.93;
  const qt = Number(inp.qtIntervalMs) || 390;
  const hr = Number(inp.heartRateBpm) || 72;
  const ecog = Number(inp.ecogScore) || 0;

  // 1. Cockcroft-Gault CrCl (mL/min)
  // CrCl = [(140 - Age) * Wt] / (72 * Scr) * (0.85 if female)
  let crcl = ((140 - age) * wt) / (72 * Math.max(0.1, scr));
  if(inp.sex === 'female') crcl *= 0.85;

  // 2. QTc Fridericia & Bazett
  const rr = 60 / Math.max(30, hr); // seconds
  const qtcF = qt / Math.cbrt(rr);
  const qtcB = qt / Math.sqrt(rr);

  // 3. BSA DuBois (m2) = 0.007184 * (height^0.725) * (weight^0.425)
  const bsa = 0.007184 * Math.pow(ht, 0.725) * Math.pow(wt, 0.425);

  // 4. ECOG to Karnofsky
  const kpsMap = { 0: 100, 1: 80, 2: 60, 3: 40, 4: 20 };
  const kps = kpsMap[ecog] || 100;

  state.clinicalCalculators.results = {
    crClCockcroftGault: Math.round(crcl * 10) / 10,
    qtcFFridericia: Math.round(qtcF),
    qtcBBazett: Math.round(qtcB),
    bsaDuBois: Math.round(bsa * 100) / 100,
    karnofskyScore: kps
  };
}

function updateCalculatorInput(field, val){
  state.clinicalCalculators.inputs[field] = val;
  recalculateClinicalScores();
  save();
  render();
}

function clinicalCalculatorsPanel(){
  recalculateClinicalScores();
  const c = state.clinicalCalculators;
  const inp = c.inputs;
  const res = c.results;

  return `<section class="card calc-widget-card"><small>EMBEDDED MEDICAL CALCULATORS · CÔNG CỤ TÍNH TOÁN LÂM SÀNG (CHUẨN MDCALC)</small>
    <div class="calc-widget-header">
      <div>
        <h3>Bộ tính toán Động học An toàn Thận, Tim mạch & Thể trạng</h3>
        <p>Tự động nạp thông số bệnh nhân · Hỗ trợ tính toán thời gian thực theo công thức chuẩn quốc tế</p>
      </div>
      <div>
        ${c.reviewed ? pill(`BS đã review tính toán · ${c.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận kết quả tính toán', 'reviewCalculators()', 'primary')}
      </div>
    </div>

    <div class="calc-widget-grid">
      <!-- Calculator 1: Cockcroft-Gault -->
      <div class="calc-box">
        <div class="calc-box-title">
          <b>1. Độ thanh thải Creatinine (Cockcroft-Gault)</b>
          <span class="pill ${res.crClCockcroftGault >= 50 ? 'green' : 'yellow'}">eGFR: ${res.crClCockcroftGault} mL/min</span>
        </div>
        <div class="calc-inputs-row">
          <label>Scr (mg/dL): <input type="number" step="0.05" value="${inp.serumCreatinineMgDl}" oninput="updateCalculatorInput('serumCreatinineMgDl', this.value)"/></label>
          <label>Cân nặng (kg): <input type="number" value="${inp.weightKg}" oninput="updateCalculatorInput('weightKg', this.value)"/></label>
        </div>
        <div class="calc-interpret">
          <b>Đánh giá liều Osimertinib:</b> ${res.crClCockcroftGault >= 50 ? 'Chức năng thận tốt, dùng liều chuẩn 80mg/ngày không cần chỉnh.' : 'Suy thận nhẹ-vừa, vẫn an toàn với 80mg/ngày, theo dõi creatinin định kỳ.'}
        </div>
      </div>

      <!-- Calculator 2: QTc Fridericia & Bazett -->
      <div class="calc-box">
        <div class="calc-box-title">
          <b>2. Khoảng QTc tim mạch (Fridericia & Bazett)</b>
          <span class="pill ${res.qtcFFridericia <= 450 ? 'green' : 'red'}">QTcF: ${res.qtcFFridericia} ms</span>
        </div>
        <div class="calc-inputs-row">
          <label>Khoảng QT (ms): <input type="number" step="5" value="${inp.qtIntervalMs}" oninput="updateCalculatorInput('qtIntervalMs', this.value)"/></label>
          <label>Nhịp tim HR (bpm): <input type="number" step="1" value="${inp.heartRateBpm}" oninput="updateCalculatorInput('heartRateBpm', this.value)"/></label>
        </div>
        <div class="calc-interpret">
          <b>Đánh giá an toàn tim mạch:</b> QTc Bazett = ${res.qtcBBazett} ms | ${res.qtcFFridericia <= 450 ? 'Ngưỡng an toàn bình thường (< 450ms ở nam), nguy cơ loạn nhịp thấp.' : '⚠ QTcF kéo dài (> 450ms) -> Cần kiểm tra điện giải K+/Mg2+ và ECG lại.'}
        </div>
      </div>

      <!-- Calculator 3: BSA DuBois -->
      <div class="calc-box">
        <div class="calc-box-title">
          <b>3. Diện tích bề mặt cơ thể (BSA DuBois)</b>
          <span class="pill blue">${res.bsaDuBois} m²</span>
        </div>
        <div class="calc-inputs-row">
          <label>Chiều cao (cm): <input type="number" value="${inp.heightCm}" oninput="updateCalculatorInput('heightCm', this.value)"/></label>
          <label>Cân nặng (kg): <input type="number" value="${inp.weightKg}" oninput="updateCalculatorInput('weightKg', this.value)"/></label>
        </div>
        <div class="calc-interpret">
          <b>Ứng dụng:</b> Dùng tính liều hóa trị phối hợp hoặc thuốc diện tích thân thể nếu cần chuyển đổi phác đồ.
        </div>
      </div>

      <!-- Calculator 4: ECOG to Karnofsky (KPS) -->
      <div class="calc-box">
        <div class="calc-box-title">
          <b>4. Quy đổi Thể trạng ECOG sang KPS (%)</b>
          <span class="pill green">KPS ${res.karnofskyScore}%</span>
        </div>
        <div class="calc-inputs-row">
          <label>Thang điểm ECOG: 
            <select onchange="updateCalculatorInput('ecogScore', this.value)">
              <option value="0" ${inp.ecogScore==0?'selected':''}>ECOG 0 (Hoạt động bình thường)</option>
              <option value="1" ${inp.ecogScore==1?'selected':''}>ECOG 1 (Hạn chế gắng sức nặng)</option>
              <option value="2" ${inp.ecogScore==2?'selected':''}>ECOG 2 (Tự chăm sóc, nằm < 50% ngày)</option>
              <option value="3" ${inp.ecogScore==3?'selected':''}>ECOG 3 (Nằm giường > 50% ngày)</option>
              <option value="4" ${inp.ecogScore==4?'selected':''}>ECOG 4 (Liệt giường hoàn toàn)</option>
            </select>
          </label>
        </div>
        <div class="calc-interpret">
          <b>Ý nghĩa:</b> Thể trạng KPS ${res.karnofskyScore}% phản ánh bệnh nhân hoàn toàn đủ tiêu chuẩn tiếp tục liệu pháp đích ngoại trú.
        </div>
      </div>
    </div>
  </section>`;
}

function reviewCalculators(){
  if(state.role !== 'doctor') return;
  state.clinicalCalculators.reviewed = true;
  state.clinicalCalculators.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  event('CLINICAL_CALCULATORS_REVIEWED', { detail: `Đã review tính toán CrCl ${state.clinicalCalculators.results.crClCockcroftGault} mL/min và QTcF ${state.clinicalCalculators.results.qtcFFridericia} ms` });
  save();
  render();
}

function workloadAllocationPanel(){
  const w = state.workloadAllocation;
  return `<section class="card workload-card"><small>CARE WORKLOAD & VALUE-BASED FEE ALLOCATION · PHÂN ĐỊNH TRÁCH NHIỆM & QUYỀN LỢI CA KHÁM</small>
    <div class="workload-header">
      <div>
        <h3>Phân bổ Chi phí & Khối lượng Công việc Chuyên môn (RVU Model)</h3>
        <p>Tổng định phí ca khám & chăm sóc kết nối: <strong>${w.encounterCostTotalVnd.toLocaleString('vi-VN')} VNĐ</strong></p>
        <small>Minh bạch hóa đóng góp lâm sàng giữa Bác sĩ điều trị, Điều dưỡng lâm sàng và Chuyên viên phục hồi</small>
      </div>
      <div>
        ${pill('Minh bạch 100% RVU', 'green')}
      </div>
    </div>

    <div class="workload-grid">
      ${w.breakdown.map(b => `
        <div class="workload-col">
          <div class="workload-top">
            <b>${b.role}</b>
            <span class="pill ${b.sharePct >= 50 ? 'purple' : b.sharePct >= 30 ? 'blue' : 'yellow'}">${b.sharePct}% (${b.amountVnd.toLocaleString('vi-VN')} đ)</span>
          </div>
          <p class="workload-tasks">${b.tasks}</p>
        </div>
      `).join('')}
    </div>
  </section>`;
}

function prognosisRadarPanel(){
  const pr = state.prognosisRadar;
  const sc = pr.radarScores;
  return `<section class="card prognosis-card"><small>PROGNOSTIC NOMOGRAM & 5-AXIS WELLNESS RADAR · TIÊN LƯỢNG CÁ THỂ HÓA (CHUẨN MSKCC)</small>
    <div class="prognosis-header">
      <div>
        <h3>${pr.modelName}</h3>
        <p>Phân loại tiên lượng: <strong class="badge-favorable">${pr.prognosisCategory}</strong> · Dự báo DCR: ${pr.dcrPct}%</p>
        <small>${pr.interpretation}</small>
      </div>
      <div>
        ${pr.reviewed ? pill(`BS đã review tiên lượng · ${pr.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận Review Tiên lượng MSKCC', 'reviewPrognosis()', 'primary')}
      </div>
    </div>

    <div class="prognosis-grid">
      <div class="prognosis-metrics-box">
        <b>Ước tính Tiên lượng Sống còn Cá thể hóa:</b>
        <div class="prognosis-tiles">
          <div class="prog-tile">
            <small>Thời gian kiểm soát bệnh (Median PFS)</small>
            <b>~ ${pr.medianPfsMonths} tháng</b>
            <span>FLAURA chuẩn: 18.9 tháng (+2.5 tháng)</span>
          </div>
          <div class="prog-tile">
            <small>Xác suất sống còn 2 năm (2-Year OS)</small>
            <b>${pr.os2YearPct}%</b>
            <span>Nhóm đột biến Exon 19 del thuận lợi</span>
          </div>
          <div class="prog-tile">
            <small>Tỉ lệ đáp ứng & khống chế (DCR)</small>
            <b>${pr.dcrPct}%</b>
            <span>Thanh thải ctDNA sâu (0.08%)</span>
          </div>
        </div>
      </div>

      <div class="prognosis-radar-box">
        <b>Biểu đồ Radar 5 Trục Sức khỏe Toàn diện (Patient Wellness Radar):</b>
        <div class="radar-chart-wrap">
          <svg viewBox="0 0 200 200" class="radar-svg">
            <!-- Mạng lưới đa giác nền -->
            <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#e2e8f0" stroke-width="1"/>
            <polygon points="100,45 153,83 133,145 67,145 47,83" fill="none" stroke="#e2e8f0" stroke-width="1"/>
            <polygon points="100,70 130,92 118,126 82,126 70,92" fill="none" stroke="#e2e8f0" stroke-width="1"/>
            <!-- Trục tọa độ -->
            <line x1="100" y1="100" x2="100" y2="20" stroke="#cbd5e1" stroke-width="1"/>
            <line x1="100" y1="100" x2="176" y2="75" stroke="#cbd5e1" stroke-width="1"/>
            <line x1="100" y1="100" x2="147" y2="165" stroke="#cbd5e1" stroke-width="1"/>
            <line x1="100" y1="100" x2="53" y2="165" stroke="#cbd5e1" stroke-width="1"/>
            <line x1="100" y1="100" x2="24" y2="75" stroke="#cbd5e1" stroke-width="1"/>
            <!-- Đa giác dữ liệu thực tế -->
            <polygon points="100,24 172,77 143,160 57,157 26,76" fill="rgba(79, 70, 229, 0.2)" stroke="#4f46e5" stroke-width="2.5"/>
            <!-- Các điểm nút -->
            <circle cx="100" cy="24" r="4" fill="#4f46e5"/>
            <circle cx="172" cy="77" r="4" fill="#4f46e5"/>
            <circle cx="143" cy="160" r="4" fill="#4f46e5"/>
            <circle cx="57" cy="157" r="4" fill="#4f46e5"/>
            <circle cx="26" cy="76" r="4" fill="#4f46e5"/>
          </svg>
          <div class="radar-legend">
            ${sc.map(s => `
              <div><small>${s.axis}:</small> <b>${s.score}/100</b> (${s.detail})</div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function reviewPrognosis(){
  if(state.role !== 'doctor') return;
  state.prognosisRadar.reviewed = true;
  state.prognosisRadar.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  event('PROGNOSIS_RADAR_REVIEWED', { detail: `Đã review tiên lượng MSKCC: Median PFS ~${state.prognosisRadar.medianPfsMonths} tháng` });
  save();
  render();
}

function geneticPedigreePanel(){
  const gp = state.geneticPedigree;
  const svg = gp.somaticVsGermline;
  return `<section class="card pedigree-card"><small>HEREDITARY ONCOLOGY & PEDIGREE TREE · PHẢ HỆ DI TRUYỀN & NGUY CƠ GIA ĐÌNH</small>
    <div class="pedigree-header">
      <div>
        <h3>Phân tích Nguy cơ Ung thư Di truyền & Cây Phả hệ 3 Đời</h3>
        <p>Phân loại: <strong class="badge-somatic">${gp.familyHistoryCategory}</strong></p>
        <small>Đối chiếu bản chất đột biến: <strong>Somatic (Tế bào u mắc phải)</strong> vs <strong>Germline (Dòng mầm di truyền)</strong></small>
      </div>
      <div>
        ${gp.reviewed ? pill(`BS đã review di truyền · ${gp.reviewMeta?.reviewedAt || ''}`, 'green') : button('Xác nhận Review Phả hệ Di truyền', 'reviewGeneticPedigree()', 'primary')}
      </div>
    </div>

    <div class="pedigree-grid">
      <!-- Cột 1: Sơ đồ Cây Phả hệ SVG 3 Đời -->
      <div class="pedigree-tree-box">
        <b>Sơ đồ Cây Phả hệ 3 Thế hệ (Pedigree Tree):</b>
        <div class="pedigree-svg-wrap">
          <svg viewBox="0 0 320 180" class="pedigree-svg">
            <!-- Thế hệ I -->
            <!-- Bố đẻ (Vuông tô đen - K phổi) -->
            <rect x="60" y="20" width="30" height="30" fill="#0f172a" stroke="#0f172a" stroke-width="2"/>
            <text x="75" y="62" font-size="9" text-anchor="middle" font-weight="bold" fill="#334155">Bố (68T)</text>
            <text x="75" y="72" font-size="8" text-anchor="middle" fill="#dc2626">K Phổi</text>

            <!-- Hôn nhân line I -->
            <line x1="90" y1="35" x2="170" y2="35" stroke="#64748b" stroke-width="2"/>
            <line x1="130" y1="35" x2="130" y2="90" stroke="#64748b" stroke-width="2"/>

            <!-- Mẹ đẻ (Tròn tô đen - K vú) -->
            <circle cx="185" cy="35" r="15" fill="#e11d48" stroke="#e11d48" stroke-width="2"/>
            <text x="185" y="62" font-size="9" text-anchor="middle" font-weight="bold" fill="#334155">Mẹ (65T)</text>
            <text x="185" y="72" font-size="8" text-anchor="middle" fill="#e11d48">K Vú</text>

            <!-- Thế hệ II Line ngang -->
            <line x1="90" y1="90" x2="190" y2="90" stroke="#64748b" stroke-width="2"/>

            <!-- Bệnh nhân Minh (Vuông màu tím viền đậm có mũi tên Proband) -->
            <line x1="90" y1="90" x2="90" y2="105" stroke="#64748b" stroke-width="2"/>
            <rect x="75" y="105" width="30" height="30" fill="#4f46e5" stroke="#312e81" stroke-width="2.5"/>
            <text x="90" y="147" font-size="9.5" text-anchor="middle" font-weight="bold" fill="#4f46e5">BN Minh (62T)</text>
            <text x="90" y="157" font-size="8" text-anchor="middle" fill="#4f46e5">NSCLC IVA (Proband)</text>

            <!-- Hôn nhân line II -->
            <line x1="105" y1="120" x2="145" y2="120" stroke="#64748b" stroke-width="2"/>
            <line x1="125" y1="120" x2="125" y2="145" stroke="#64748b" stroke-width="2"/>
            <circle cx="155" cy="120" r="10" fill="white" stroke="#64748b" stroke-width="1.5"/>

            <!-- Em gái (Tròn trắng - Khỏe mạnh) -->
            <line x1="190" y1="90" x2="190" y2="105" stroke="#64748b" stroke-width="2"/>
            <circle cx="190" cy="120" r="15" fill="white" stroke="#64748b" stroke-width="2"/>
            <text x="190" y="147" font-size="9" text-anchor="middle" fill="#334155">Em gái (58T)</text>
            <text x="190" y="157" font-size="8" text-anchor="middle" fill="#16a34a">Khỏe mạnh</text>

            <!-- Thế hệ III - Con trai Tuấn (Vuông trắng) -->
            <rect x="110" y="145" width="30" height="30" fill="white" stroke="#16a34a" stroke-width="2"/>
            <text x="125" y="185" font-size="9" text-anchor="middle" font-weight="bold" fill="#047857">Con trai Tuấn (35T)</text>
          </svg>
        </div>
      </div>

      <!-- Cột 2: Bảng phân tích Y khoa Somatic vs Germline -->
      <div class="pedigree-analysis-box">
        <b>Bản chất Di truyền & Khuyến cáo Tầm soát:</b>
        <div class="pedigree-somatic-box">
          <small>🔬 Đột biến Tế bào u Mắc phải (Somatic Mutation):</small>
          <p>${svg.somaticDriver}</p>
        </div>
        <div class="pedigree-germline-box">
          <small>🧬 Đột biến Dòng mầm Di truyền (Germline Risk):</small>
          <p>${svg.germlineRisk}</p>
        </div>
        <div class="pedigree-counseling-box">
          <small>💡 Tư vấn Bác sĩ cho Người nhà (Con trai - Anh Tuấn):</small>
          <p>${gp.screeningRecommendation}</p>
        </div>
      </div>
    </div>
  </section>`;
}

function reviewGeneticPedigree(){
  if(state.role !== 'doctor') return;
  state.geneticPedigree.reviewed = true;
  state.geneticPedigree.reviewMeta = {
    planId: state.careLoop.plan.planId,
    revision: state.careLoop.plan.revision,
    reviewedAt: new Date().toLocaleString('vi-VN'),
    reviewedBy: 'BS. Mỹ Linh'
  };
  event('GENETIC_PEDIGREE_REVIEWED', { detail: 'Đã review phả hệ di truyền 3 đời: Đột biến Somatic, nguy cơ con cái thấp' });
  save();
  render();
}

function doctor(){ return shell(`${patientSummary()}${medicationSafetyBrief()}${geneticPedigreePanel()}${healthPassportCard()}${prognosisRadarPanel()}${workloadAllocationPanel()}${voiceScribePanel()}${nccnPathwayViewer()}${clinicalCalculatorsPanel()}${ddiCheckerPanel()}${safetyLabsPanel()}${biomarkerEvolutionPanel()}${proTrendDashboard()}${recistAssessmentBrief()}${ctcaeToxicityGuide()}${rehabAssessmentPanel()}${mdtConsultationPanel()}${safetyQueue()}${doctorCareSnapshot()}${escalationReview()}${triageHandoff()}${doctorPatientVoice()}<div class="decision-layout"><section class="card"><small>DECISION BRIEF · TUẦN 6</small><h2>Tiếp tục điều trị hay cần đánh giá thêm?</h2><p class="lead">Bản tóm tắt cho một quyết định — không phải bệnh án. Mọi gợi ý cần bác sĩ xác nhận.</p>${patientVoice()}<div class="decision-lens"><small>DECISION LENS · FRAMING MÔ PHỎNG</small><h3>Câu hỏi lần khám</h3><b>Có thể tiếp tục liều hiện tại trong khi hoàn thiện dữ liệu an toàn và đáp ứng không?</b><div class="lens-grid"><div><small>Tín hiệu ủng hộ</small><p>Tuân thủ tốt · molecular phù hợp · độc tính demo G1–2</p></div><div><small>Next-best-information</small><p>CT tuần 8 · ECG/QTc · điện giải · xác minh toxicity trực tiếp</p></div></div><h3>Điểm bất định cần ghi nhận</h3>${uncertainties()}</div><div class="brief-columns"><div><h3>Dữ kiện mô phỏng</h3>${briefFacts(state.decisionBrief.facts,'fact')}</div><div><h3>Người bệnh báo cáo</h3>${briefFacts(state.decisionBrief.patientReported,'reported')}</div></div><h3>Evidence map · bấm từng mục để xác nhận đã review</h3>${evidenceMap()}${readinessPanel()}<h3>Safety gates</h3><div class="gates">${state.decisionBrief.safetyGates.map(g=>`<div class="gate ${g.status}"><span>${g.status==='ready'||g.status==='clear'?'✓':'!'}</span><div><b>${g.label}</b><small>${g.detail}</small></div></div>`).join('')}</div></section><section class="card"><small>CDS OPTIONS · KHÔNG PHẢI Y LỆNH</small><h2>Các hướng xử trí để bác sĩ cân nhắc</h2>${decisionOptions()}<label>Lý do quyết định / lý do từ chối gợi ý<textarea oninput="update(['doctor','decisionReason'],this.value)" placeholder="Bắt buộc ghi lý do trước khi xác nhận">${state.doctor.decisionReason}</textarea></label><div class="actions">${can('ready-for-doctor') ? button('Nhận ca','advance("doctor-examining","DOCTOR_ACCEPTED_CASE")','outline') : button('Chờ ĐD hoàn tất tiếp nhận','void(0)','disabled')}${hasUnresolvedRed() ? button('Đang có cảnh báo đỏ · phải xử trí trước','void(0)','disabled') : !decisionReady() ? button('Review evidence + xác nhận data gap trước','void(0)','disabled') : can('doctor-examining') && state.doctor.decisionReason.trim() ? button('Xác nhận quyết định · tạo handoff','confirmDecision()','primary') : button('Cần nhận ca + ghi lý do','void(0)','disabled')}</div></section><aside class="sticky"><section class="card evidence"><small>NGUỒN & PHIÊN BẢN</small><h3>${state.decisionBrief.evidence.title}</h3><p>${state.decisionBrief.evidence.version}</p><div class="warning">${state.decisionBrief.evidence.note}</div><hr><b>Dữ liệu còn thiếu</b><ul>${state.decisionBrief.safetyGates.filter(g=>g.status==='missing').map(g=>`<li>${g.label}</li>`).join('')}</ul></section></aside></div>${activityLog()}`); }
function patientVoice(){ const p=state.previsit; const submitted=state.encounterState!=='previsit-draft'||p.submittedAt; return `<div class="patient-voice ${submitted?'submitted':''}"><div><small>PATIENT VOICE · NGUỒN NGƯỜI BỆNH TỰ BÁO CÁO</small><h3>${submitted?'Thông tin trước khám đã gửi':'Chưa có khai nhanh từ người bệnh'}</h3>${submitted?`<p><b>Mục tiêu:</b> ${p.goal||'Chưa nhập'}</p><p><b>Thay đổi:</b> ${p.changes||'Chưa nhập'}</p><small>Gửi lúc ${p.submittedAt||'không rõ'} · Không tự động xem là dữ kiện đã xác minh</small>`:'<p>Điều dưỡng/bác sĩ chưa nhận được patient voice. Đây là empty state, không phải lỗi hồ sơ.</p>'}</div><div>${submitted&&!p.doctorRead?button('Đánh dấu đã đọc','markPatientVoiceRead()','outline'):submitted?pill('BS đã đọc · patient-reported','green'):pill('Chờ người bệnh gửi')}</div></div>`; }
function markPatientVoiceRead(){ state.previsit.doctorRead=true; event('PATIENT_VOICE_READ',{detail:'Bác sĩ đã đọc thông tin patient-reported trước khám'}); save(); render(); }
function doctorPatientVoice(){ const v=state.patientVoice; if(v.status!=='submitted') return `<section class="card voice-empty"><small>PATIENT VOICE</small><b>Chưa có khai voice từ người bệnh</b><p>Đây là khoảng trống thông tin, không phải dữ liệu âm tính.</p></section>`; return `<section class="card patient-voice"><div><small>PATIENT VOICE · CHƯA XÁC MINH</small><h3>Người bệnh đã gửi bản nháp</h3><p>${v.transcript}</p><small>${v.capturedAt} · nguồn: người bệnh</small></div><button onclick="markVoiceRead()" class="${v.readByDoctor?'outline':'primary'}">${v.readByDoctor?'Đã đọc':'Đánh dấu đã đọc'}</button></section>`; }
function markVoiceRead(){ state.patientVoice.readByDoctor=true; event('DOCTOR_READ_PATIENT_VOICE',{detail:'Bác sĩ đã đọc bản nháp Patient Voice; cần xác minh khi khám'}); save(); render(); }
function briefFacts(items, kind){ return items.map(x=>`<div class="brief-fact ${kind}"><b>${x.label}</b><strong>${x.value}</strong><small>${x.source}</small></div>`).join(''); }
function readinessPanel(){ const m=state.decisionBrief.evidenceMap; const reviewed=m.filter(x=>x.reviewed).length; const critical=m.filter(x=>['molecular','toxicity'].includes(x.id)).every(x=>x.reviewed); const medIds=['dose','adherence','toxicity']; const medReviewed=medIds.filter(id=>state.medicationSafety.reviewed[id]).length; const ready=critical&&medReviewed===medIds.length&&state.decisionBrief.readiness.dataGapsAcknowledged; const medText=medReviewed===medIds.length?'Medication safety đã review':`Medication safety ${medReviewed}/${medIds.length} · cần review liều, tuân thủ, độc tính`; return `<div class="readiness ${ready?'ready':''}"><div><b>Decision readiness</b><span>${reviewed}/${m.length} evidence · ${critical?'Molecular + độc tính đã xem':'Cần review Molecular + độc tính'} · ${medText}</span></div><label><input type="checkbox" ${state.decisionBrief.readiness.dataGapsAcknowledged?'checked':''} onchange="ackGaps(this.checked)"/> Đã thấy và cân nhắc data gap</label>${ready?pill('Sẵn sàng cho BS xác nhận','green'):pill('Chưa sẵn sàng · cần review đầy đủ','')}</div>`; }
function ackGaps(checked){ state.decisionBrief.readiness.dataGapsAcknowledged=checked; event('DATA_GAPS_ACKNOWLEDGED',{detail:checked?'Bác sĩ đã xác nhận đã thấy data gap':'Bỏ xác nhận data gap'}); save(); render(); }
function uncertainties(){ return `<div class="uncertainties">${state.decisionBrief.lens.uncertainties.map((u,i)=>`<label><input type="checkbox" ${u.checked?'checked':''} onchange="toggleUncertainty(${i},this.checked)"/> ${u.label}</label>`).join('')}</div>`; }
function toggleUncertainty(i,checked){ state.decisionBrief.lens.uncertainties[i].checked=checked; event('UNCERTAINTY_RECORDED',{detail:`${checked?'Đã ghi nhận':'Bỏ ghi nhận'}: ${state.decisionBrief.lens.uncertainties[i].label}`}); save(); render(); }
function evidenceMap(){ return `<div class="evidence-map">${state.decisionBrief.evidenceMap.map((x,i)=>`<button class="evidence-item ${x.status} ${x.reviewed?'reviewed':''}" onclick="reviewEvidence(${i})"><span>${x.status==='missing'?'!':x.status==='review'?'~':'✓'}</span><div><b>${x.label}</b><strong>${x.value}</strong><small>${x.provenance} · ${x.reviewed?'Đã review':'Chưa review'}</small></div></button>`).join('')}</div>`; }
function reviewEvidence(i){
  state.decisionBrief.evidenceMap[i].reviewed=true;
  if(state.decisionBrief.evidenceMap[i].id === 'response' && !state.recist.reviewed){
    state.recist.reviewed = true;
    state.recist.reviewMeta = {
      planId: state.careLoop.plan.planId,
      revision: state.careLoop.plan.revision,
      reviewedAt: new Date().toLocaleString('vi-VN'),
      reviewedBy: 'BS. Mỹ Linh'
    };
    state.decisionBrief.evidenceMap[i].value = `PR (-34%) · ${state.recist.scanDate}`;
    state.decisionBrief.evidenceMap[i].status = 'ready';
    state.decisionBrief.evidenceMap[i].provenance = 'RECIST 1.1 mô phỏng · BS đã review';
  }
  event('EVIDENCE_REVIEWED',{detail:`Đã review: ${state.decisionBrief.evidenceMap[i].label}`});
  save();
  render();
}
function decisionOptions(){ const options=[
  {name:'Tiếp tục osimertinib 80 mg',badge:'Có điều kiện',why:'Tuân thủ tốt; độc tính người bệnh báo cáo hiện ở mức demo G1–2.',need:'Bổ sung điện giải/QTc và theo dõi triệu chứng; CT tuần 8.'},
  {name:'Giữ thuốc · đánh giá thêm',badge:'Safety first',why:'Chọn khi xuất hiện red flag hoặc dữ liệu an toàn chưa đủ để tiếp tục.',need:'Đánh giá trực tiếp, xét nghiệm/ECG và loại trừ biến cố nghiêm trọng.'},
  {name:'Trình MDT / đổi chiến lược',badge:'Escalate',why:'Chọn khi tiến triển, kháng thuốc hoặc chẩn đoán/đáp ứng không phù hợp.',need:'Hình ảnh, molecular evolution và bối cảnh lâm sàng đầy đủ.'}
]; return `<div class="decision-options">${options.map(o=>`<button class="decision-option ${state.doctor.decision===o.name?'on':''}" onclick="update(['doctor','decision'],'${o.name}')"><span>${o.badge}</span><b>${o.name}</b><p><strong>Vì sao:</strong> ${o.why}</p><p><strong>Cần thêm:</strong> ${o.need}</p></button>`).join('')}</div>`; }
function decisionReady(){ const m=state.decisionBrief.evidenceMap; const med=['dose','adherence','toxicity'].every(id=>state.medicationSafety.reviewed[id]); return ['molecular','toxicity'].every(id=>m.some(x=>x.id===id&&x.reviewed)) && med && state.decisionBrief.readiness.dataGapsAcknowledged; }
function hasUnresolvedRed(){ return state.alerts.some(a=>a.type==='red') && state.alertResolution.status!=='resolved'; }
function confirmDecision(){
  if(hasUnresolvedRed()){
    alert('Cảnh báo đỏ chưa được xử trí. Hãy ghi nhận đánh giá/điều phối theo protocol cơ sở trước khi xác nhận quyết định thường quy.');
    return;
  }
  state.doctor.decisionStatus='confirmed';
  state.careLoop.plan.status='doctor_confirmed';
  state.careLoop.plan.confirmedAt=new Date().toLocaleString('vi-VN');
  state.careLoop.plan.provenance='Clinician decision demo · cần nurse teach-back';
  state.doctor.receipt={
    decision: state.doctor.decision,
    rationale: state.doctor.decisionReason,
    evidence: 'Molecular · độc tính CTCAE · tuân thủ · RECIST 1.1 · context',
    gaps: 'QTc/điện giải gần nhất',
    checkpoint: 'Đánh giá lại sau CT tuần 16/labs',
    mdtSummary: state.mdt.status === 'completed' ? `Đã đồng thuận hội chẩn MDT lúc ${state.mdt.completedAt}` : null,
    at: new Date().toLocaleString('vi-VN')
  };
  event('CLINICIAN_DECISION_CONFIRMED',{detail:`${state.doctor.decision} · Lý do: ${state.doctor.decisionReason}`});
  advance('doctor-plan-confirmed','DECISION_RECEIPT_CREATED');
}
function mdcalcBlock(t,v,h){ return `<div class="calc"><b>${t}</b><span>${v}</span><small>${h}</small></div>`; }
function checklist(group, items){ return `<div class="checklist">${items.map(s=>{const [k,l]=s.split('|'); return `<label><input type="checkbox" ${state[group][k]?'checked':''} onchange="update(['${group}','${k}'],this.checked)"/> <span>${l}</span></label>`}).join('')}</div>`; }
function activityLog(){ return `<section class="card"><small>EVENT / AUDIT TIMELINE</small>${state.alerts.slice(0,8).map(a=>`<div class="event ${a.type==='red'?'red':''}"><b>${a.name || a.symptom}</b><span>${a.at}</span><p>${a.detail || ''}</p></div>`).join('') || '<div class="empty">Chưa có sự kiện.</div>'}</section>`; }

function completeSymptomCheck(){ if(['red','yellow'].includes(state.triage.status) && state.triage.actionStatus!=='resolved') { alert('Còn triage cần follow-up; chưa thể đóng symptom check.'); return; } state.careLoop.symptomCheck={completed:true,at:new Date().toLocaleString('vi-VN'),summary:'Người bệnh xác nhận đã hoàn tất kiểm tra triệu chứng hôm nay.'}; state.careLoop.tasks.find(t=>t.id==='symptom').status='done'; event('DAILY_SYMPTOM_CHECK_COMPLETED',{detail:'Patient-reported daily symptom check'}); save(); render(); }
function takeMed(){ state.home.medicationTakenToday = true; state.careLoop.tasks.find(t=>t.id==='med').status='done'; state.patient.adherence.taken = Math.min(42, state.patient.adherence.taken + 1); event('MEDICATION_TAKEN', {detail:'Người bệnh xác nhận đã uống osimertinib hôm nay'}); save(); render(); }
function missDose(){
  state.home.missedToday = true;
  state.patient.adherence.missed += 1;
  event('MEDICATION_MISSED', {detail:'Demo: hiện hướng dẫn xử trí quên liều và báo điều dưỡng nếu lặp lại'});
  dispatchCaregiverSms('warning', `[LungCare Khẩn] Bố Minh vừa thông báo quên liều Osimertinib 80mg sáng nay. Nhắc Bố uống bù trước 20:00 tối nay nếu có thể (không uống gấp đôi).`);
  save();
  render();
}

function redDyspnea(){
  state.alertResolution={acknowledged:false,assessment:'',action:'',clinicianReason:'',status:'open'};
  state.alertHandled=false;
  state.alerts.unshift({type:'red', name:'TOXICITY_REPORTED_RED', symptom:'Khó thở khi nghỉ', detail:'Người bệnh báo khó thở khi nghỉ/không nói trọn câu. Mục tiêu phản hồi < 5 phút.', at:new Date().toLocaleTimeString('vi-VN')});
  dispatchCaregiverSms('danger', `[LUNGCARE CẢNH BÁO ĐỎ] Bố Minh đang có dấu hiệu KHÓ THỞ KHI NGHỈ. Đội điều trị bệnh viện đang tiếp nhận. Gia đình cần kiểm tra Bố ngay và gọi Hotline Cấp cứu 028 3844 xxxx nếu Bố mệt lả.`);
  save();
  render();
}
function yellowSymptom(s){ state.alerts.unshift({type:'yellow', name:'TOXICITY_REPORTED_YELLOW', symptom:s, detail:'Điều dưỡng gọi lại trong ngày, bác sĩ xem nếu nặng lên.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function acknowledgeAlert(){ state.alertResolution.acknowledged=true; state.alertResolution.status='acknowledged'; event('RED_ALERT_ACKNOWLEDGED',{detail:'Đã tiếp nhận cảnh báo; quyết định thường quy vẫn bị khóa cho tới khi có đánh giá và xác nhận của bác sĩ.'}); save(); render(); }
function resolveAlert(){ if(!state.alertResolution.assessment.trim()||!state.alertResolution.action.trim()||!state.alertResolution.clinicianReason.trim()) return; state.alertResolution.status='resolved'; state.alertHandled=true; event('RED_ALERT_CLINICIAN_RESOLVED',{detail:`Đánh giá: ${state.alertResolution.assessment} · Lý do BS: ${state.alertResolution.clinicianReason}`}); save(); render(); }
function voiceDoctor(){ state.doctor.voiceDone = true; state.doctor.note = 'Voice draft: BN tuần 6 osimertinib, tuân thủ tốt 41/42 liều. Tiêu chảy grade 2, ban da grade 1, không sốt. Chưa có khó thở lúc khám. Đề xuất tiếp tục osimertinib, xử trí hỗ trợ tiêu chảy/ban da, xét nghiệm CBC/điện giải/gan thận, hẹn CT đánh giá đáp ứng.'; event('VOICE_CONSULT_STRUCTURED', {detail:'AI tách transcript thành tuân thủ, độc tính, khám, nhận định, kế hoạch đề xuất'}); save(); render(); }
function render(){ document.getElementById('app').innerHTML = ({patient, nurse, doctor}[state.role] || patient)(); }
render();
