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
  previsit: { goal: '', changes: '', adherence: '', toxicity: '', submittedAt: null },
  intake: { idChecked: false, vitals: false, allergy: false, medrec: false, redflags: false, note: '' },
  doctor: { accepted: false, voiceDone: false, toxicityReviewed: false, molecularReviewed: false, recistReviewed: false, decision: 'Tiếp tục osimertinib 80 mg', decisionStatus: 'draft', decisionReason: '', note: '' },
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
    evidence: { title:'Protocol demo · Osimertinib follow-up', version:'v0.1 · 31/08/2026', note:'Nội dung mô phỏng, chờ bác sĩ phụ trách phê duyệt và gắn nguồn chính thức.' }
  },
  education: { identity: false, emr: false, allergy: false, meds: false, missedDose: false, toxicity: false, redflags: false, teachback: false, followup: false, contact: false },
  home: { medicationTakenToday: false, missedToday: false },
  alerts: []
});

function normalize(raw) {
  const d = defaultState();
  if (!raw || typeof raw !== 'object') return d;
  return {
    ...d, ...raw,
    patient: { ...d.patient, ...(raw.patient || {}) },
    previsit: { ...d.previsit, ...(raw.previsit || {}) },
    intake: { ...d.intake, ...(raw.intake || {}) },
    doctor: { ...d.doctor, ...(raw.doctor || {}) },
    decisionBrief: { ...d.decisionBrief, ...(raw.decisionBrief || {}), facts: Array.isArray(raw.decisionBrief?.facts) ? raw.decisionBrief.facts : d.decisionBrief.facts, patientReported: Array.isArray(raw.decisionBrief?.patientReported) ? raw.decisionBrief.patientReported : d.decisionBrief.patientReported, safetyGates: Array.isArray(raw.decisionBrief?.safetyGates) ? raw.decisionBrief.safetyGates : d.decisionBrief.safetyGates },
    education: { ...d.education, ...(raw.education || {}) },
    home: { ...d.home, ...(raw.home || {}) },
    alertResolution: { ...d.alertResolution, ...(raw.alertResolution || {}) },
    alerts: Array.isArray(raw.alerts) ? raw.alerts : []
  };
}

let state = load();
function load(){ try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return defaultState(); } }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
save();
function set(patch){ state = normalize({ ...state, ...patch }); save(); render(); }
function update(path, value){ let s = structuredClone(state); let o = s; path.slice(0,-1).forEach(k => o = o[k]); o[path.at(-1)] = value; set(s); }
function event(name, payload={}){ state.alerts.unshift({ type:'event', name, at: new Date().toLocaleTimeString('vi-VN'), ...payload }); save(); }
function advance(next, name){ state.encounterState = next; event(name); save(); render(); }
function switchRole(role){ state.role = role; save(); history.replaceState(null, '', `?role=${role}`); render(); }

const pct = () => Math.round(state.patient.adherence.taken / state.patient.adherence.total * 100);
const flowIndex = () => FLOW.findIndex(([k]) => k === state.encounterState);
const can = (key) => flowIndex() >= FLOW.findIndex(([k]) => k === key);
const doneCount = (obj) => Object.values(obj).filter(Boolean).length;
const pill = (text, tone='') => `<span class="pill ${tone}">${text}</span>`;
const button = (label, action, cls='') => `<button class="${cls}" onclick="${action}">${label}</button>`;

function shell(content){
  const roleMeta = { patient:['PT','Bệnh nhân','My Care'], nurse:['RN','Điều dưỡng','Nurse Station'], doctor:['DR','Bác sĩ','Clinical Command'] }[state.role];
  return `<div class="app">
    <aside class="side">
      <div class="brand"><b>LC</b><div><strong>LungCare</strong><span>CONNECTED ONCOLOGY</span></div></div>
      <div class="role-card"><span>${roleMeta[0]}</span><div><b>${roleMeta[1]}</b><small>${roleMeta[2]}</small></div></div>
      <nav>
        ${['patient','nurse','doctor'].map(r => `<button class="nav ${state.role===r?'on':''}" onclick="switchRole('${r}')">${{patient:'Bệnh nhân',nurse:'Điều dưỡng',doctor:'Bác sĩ'}[r]}</button>`).join('')}
      </nav>
      <div class="patient-mini"><small>DEMO PATIENT</small><b>${state.patient.name}</b><span>${state.patient.code} · ${state.patient.stage} · ${state.patient.biomarker}</span></div>
      <button class="ghost" onclick="localStorage.removeItem(STORAGE_KEY); location.href=location.pathname">Reset demo</button>
    </aside>
    <main>
      ${topbar(roleMeta)}
      ${alertsStrip()}
      ${flowRibbon()}
      ${content}
    </main>
  </div>`;
}

function topbar(roleMeta){ return `<header class="top"><div><small>${roleMeta[2].toUpperCase()}</small><h1>${roleMeta[1] === 'Bệnh nhân' ? 'Chào chú Minh' : roleMeta[1] === 'Điều dưỡng' ? 'Bàn giao điều trị hôm nay' : 'Case command center'}</h1></div><div class="top-actions">${pill('Demo CDS · không phải protocol · chờ clinical governance','purple')}${pill('Không dùng dữ liệu thật','green')}</div></header>`; }

function alertsStrip(){
  const red = state.alerts.find(a => a.type === 'red');
  if (!red) return '';
  const r=state.alertResolution;
  return `<section class="red-alert"><div><b>⚠ CẢNH BÁO ĐỎ · Khó thở khi nghỉ</b><p>${red.detail} · gửi đồng thời bác sĩ và điều dưỡng lúc ${red.at}. Nếu tình trạng nặng, thực hiện protocol cấp cứu của cơ sở và không chờ phản hồi trên app.</p>${r.acknowledged?`<div class="alert-workup"><label>Đánh giá/xử trí theo protocol cơ sở<textarea oninput="update(['alertResolution','assessment'],this.value)" placeholder="Người đánh giá, thời điểm, đánh giá, hành động...">${r.assessment}</textarea></label><label>Hành động đã thực hiện<textarea oninput="update(['alertResolution','action'],this.value)" placeholder="Liên hệ, đánh giá trực tiếp, giữ thuốc/điều phối theo protocol...">${r.action}</textarea></label><label>Lý do bác sĩ đóng/override cảnh báo<textarea oninput="update(['alertResolution','clinicianReason'],this.value)" placeholder="Bắt buộc để mở lại quyết định thường quy">${r.clinicianReason}</textarea></label></div>`:''}</div><div class="alert-actions">${!r.acknowledged?button('Tiếp nhận cảnh báo','acknowledgeAlert()','danger'):r.assessment.trim()&&r.action.trim()&&r.clinicianReason.trim()?button('BS xác nhận đã xử trí/override','resolveAlert()','danger'):button('Cần ghi đánh giá + lý do BS','void(0)','disabled')}${button('Xem protocol cơ sở','alert("Demo: protocol cấp cứu cần được cơ sở cấu hình và bác sĩ phụ trách phê duyệt")','outline dangerText')}</div></section>`;
}

function flowRibbon(){ return `<section class="flow">${FLOW.slice(1).map(([k,l],i)=>`<div class="step ${can(k)?'done':''} ${state.encounterState===k?'active':''}"><span>${i+1}</span><b>${l}</b></div>`).join('')}</section>`; }

function patientSummary(){ const p=state.patient; return `<section class="summary card"><div><small>CA XUYÊN SUỐT</small><h2>${p.name}</h2><p>${p.age} tuổi · ${p.sex} · ECOG ${p.ecog} · ${p.diagnosis}</p></div><div class="facts">${pill(p.stage,'purple')}${pill(p.tnm)}${pill(p.biomarker,'green')}${pill(p.therapy,'blue')}${pill(`Tuân thủ ${pct()}%`,'green')}</div></section>`; }

function patient(){
  const active = state.encounterState === 'home-care-active';
  return shell(`${patientSummary()}<div class="grid two">
    <section class="card hero"><small>TÁI KHÁM HÔM NAY · ${state.patient.followUp}</small><h2>${active ? 'Kế hoạch tại nhà đã kích hoạt' : 'Chuẩn bị trước khám'}</h2><p>${active ? 'Điều dưỡng đã teach-back. Theo dõi thuốc, độc tính và lịch tái khám bắt đầu từ hôm nay.' : 'Khai nhanh thay đổi từ lần trước để điều dưỡng tiếp nhận trước khi bác sĩ khám.'}</p>${!can('previsit-submitted') ? button('Xác nhận lịch & khai nhanh', 'advance("previsit-submitted","PREVISIT_SUBMITTED")', 'primary') : pill('Đã gửi cho điều dưỡng','green')}</section>
    <section class="card"><small>THUỐC HÔM NAY</small><h3>Osimertinib 80 mg</h3><p>Uống 1 viên mỗi ngày, không nghiền viên. Demo CDS: chú ý tiêu chảy, ban da, khó thở mới.</p><div class="actions">${button(state.home.medicationTakenToday?'Đã ghi nhận uống':'Đánh dấu đã uống','takeMed()','primary')}${button('Báo quên liều','missDose()','outline')}</div><meter min="0" max="42" value="${state.patient.adherence.taken}"></meter><small>${state.patient.adherence.taken}/${state.patient.adherence.total} liều · quên ${state.patient.adherence.missed}</small></section>
  </div>
  <div class="grid two">
    <section class="card"><small>KHAI NHANH TÁI KHÁM</small><label>Mục tiêu lần này<input value="${state.previsit.goal}" oninput="update(['previsit','goal'],this.value)" placeholder="Đánh giá đáp ứng, độc tính, cấp thuốc..." /></label><label>Thay đổi từ lần trước<textarea oninput="update(['previsit','changes'],this.value)" placeholder="VD: tiêu chảy 3-4 lần/ngày, ban da nhẹ...">${state.previsit.changes}</textarea></label>${button('Gửi thông tin cho khoa','advance("previsit-submitted","PREVISIT_SUBMITTED")','primary')}</section>
    <section class="card dangerZone"><small>BÁO TRIỆU CHỨNG</small><h3>Triage độc tính tại nhà</h3><p>Chọn nhanh triệu chứng. Nếu khó thở khi nghỉ/đau ngực/lơ mơ → popup đỏ gửi cả BS và ĐD.</p><div class="symptoms">${['Tiêu chảy','Ban da','Mệt','Sốt','Đau ngực','Khó thở khi nghỉ'].map(s=>button(s, s==='Khó thở khi nghỉ'?'redDyspnea()':'yellowSymptom("'+s+'")', s==='Khó thở khi nghỉ'?'danger':'outline')).join('')}</div></section>
  </div>
  ${active ? homePlan() : `<section class="empty card"><b>Chưa có kế hoạch tại nhà</b><p>Kế hoạch chỉ kích hoạt sau khi bác sĩ xác nhận và điều dưỡng hoàn tất teach-back.</p></section>`}`);
}

function homePlan(){ return `<section class="card"><small>KẾ HOẠCH VỀ NHÀ · TỪ QUYẾT ĐỊNH ĐÃ XÁC NHẬN</small><h2>${state.doctor.decision}</h2>${handoffCards('patient')}</section>`; }
function handoffCards(audience){
  const cards = audience==='nurse' ? [
    ['Thuốc & đối chiếu',state.doctor.decision,'Đối chiếu với HIS/EMR trước hướng dẫn; không tự thay đổi quyết định.'],
    ['Theo dõi an toàn','Điện giải · QTc · gan thận','Xác nhận lịch xét nghiệm và báo BS khi dữ liệu chưa đủ.'],
    ['Teach-back','Quên liều · độc tính · red flags','Người bệnh phải nhắc lại đúng trước khi kích hoạt My Care.']
  ] : [
    ['Thuốc hôm nay','Osimertinib 80 mg lúc 08:00','Dùng đúng kế hoạch đã được đội điều trị xác nhận.'],
    ['Việc sắp tới','Xét nghiệm an toàn + CT tuần 8','App sẽ nhắc theo lịch khoa đã xác nhận.'],
    ['Khi cần báo ngay','Khó thở mới, đau ngực, sốt, tiêu chảy tăng','Liên hệ khoa theo hướng dẫn; tình trạng nặng làm theo protocol cấp cứu của cơ sở.']
  ];
  return `<div class="handoff-grid">${cards.map(c=>`<div class="handoff"><small>${c[0]}</small><b>${c[1]}</b><p>${c[2]}</p></div>`).join('')}</div>`;
}

function nurse(){ return shell(`${patientSummary()}<div class="grid two"><section class="card"><small>TIẾP NHẬN ĐIỀU DƯỠNG</small><h2>${can('previsit-submitted')?'Có bệnh nhân đã gửi khai nhanh':'Chờ bệnh nhân gửi khai nhanh'}</h2><p>Định danh, sinh hiệu, dị ứng, thuốc đang dùng và dấu hiệu báo động.</p>${checklist('intake', ['idChecked|Đối chiếu họ tên · ngày sinh · mã BN','vitals|Nhập sinh hiệu · SpO₂ · đau · cân nặng','allergy|Xác minh dị ứng','medrec|Medication reconciliation','redflags|Xác minh dấu hiệu báo động'])}<label>Ghi chú voice/nhập tay<textarea oninput="update(['intake','note'],this.value)">${state.intake.note}</textarea></label>${doneCount(state.intake)>=5 ? button('Hoàn tất tiếp nhận → gửi bác sĩ','advance("ready-for-doctor","NURSE_INTAKE_COMPLETED")','primary') : button('Cần đủ checklist để hoàn tất','void(0)','disabled')}</section><section class="card"><small>SAU KHI BÁC SĨ CHỐT KẾ HOẠCH</small><h2>${can('doctor-plan-confirmed')?'Kế hoạch đã chuyển từ bác sĩ':'Chưa có kế hoạch điều trị'}</h2><p>Điều dưỡng chỉ nhận các việc cần phối hợp từ quyết định đã xác nhận — không nhận toàn bộ bệnh án và không tự sinh y lệnh.</p>${can('doctor-plan-confirmed') ? handoffCards('nurse') + teachback() : '<div class="empty">Handoff cards sẽ xuất hiện sau khi BS xác nhận quyết định.</div>'}</section></div>${activityLog()}`); }
function teachback(){ return `${checklist('education', ['identity|Đúng người bệnh','emr|Đối chiếu kế hoạch với HIS/EMR','allergy|Kiểm tra dị ứng','meds|Hướng dẫn từng thuốc','missedDose|Xử trí quên liều','toxicity|Độc tính thường gặp','redflags|Dấu hiệu phải báo ngay','teachback|Người bệnh nhắc lại đúng','followup|Lịch xét nghiệm/tái khám','contact|Số liên hệ khoa'])}${doneCount(state.education)>=10 ? button('Hoàn tất teach-back · kích hoạt My Care','advance("home-care-active","NURSE_EDUCATION_COMPLETED")','primary') : button('Hoàn tất sau khi đủ teach-back','void(0)','disabled')}`; }

function doctor(){ return shell(`${patientSummary()}<div class="decision-layout"><section class="card"><small>DECISION BRIEF · TUẦN 6</small><h2>Tiếp tục điều trị hay cần đánh giá thêm?</h2><p class="lead">Bản tóm tắt cho một quyết định — không phải bệnh án. Mọi gợi ý cần bác sĩ xác nhận.</p><div class="brief-columns"><div><h3>Dữ kiện đã xác nhận</h3>${briefFacts(state.decisionBrief.facts,'fact')}</div><div><h3>Người bệnh báo cáo</h3>${briefFacts(state.decisionBrief.patientReported,'reported')}</div></div><h3>Safety gates</h3><div class="gates">${state.decisionBrief.safetyGates.map(g=>`<div class="gate ${g.status}"><span>${g.status==='ready'||g.status==='clear'?'✓':'!'}</span><div><b>${g.label}</b><small>${g.detail}</small></div></div>`).join('')}</div></section><section class="card"><small>CDS OPTIONS · KHÔNG PHẢI Y LỆNH</small><h2>Các hướng xử trí để bác sĩ cân nhắc</h2>${decisionOptions()}<label>Lý do quyết định / lý do từ chối gợi ý<textarea oninput="update(['doctor','decisionReason'],this.value)" placeholder="Bắt buộc ghi lý do trước khi xác nhận">${state.doctor.decisionReason}</textarea></label><div class="actions">${can('ready-for-doctor') ? button('Nhận ca','advance("doctor-examining","DOCTOR_ACCEPTED_CASE")','outline') : button('Chờ ĐD hoàn tất tiếp nhận','void(0)','disabled')}${hasUnresolvedRed() ? button('Đang có cảnh báo đỏ · phải xử trí trước','void(0)','disabled') : can('doctor-examining') && state.doctor.decisionReason.trim() ? button('Xác nhận quyết định · tạo handoff','confirmDecision()','primary') : button('Cần nhận ca + ghi lý do','void(0)','disabled')}</div></section><aside class="sticky"><section class="card evidence"><small>NGUỒN & PHIÊN BẢN</small><h3>${state.decisionBrief.evidence.title}</h3><p>${state.decisionBrief.evidence.version}</p><div class="warning">${state.decisionBrief.evidence.note}</div><hr><b>Dữ liệu còn thiếu</b><ul>${state.decisionBrief.safetyGates.filter(g=>g.status==='missing').map(g=>`<li>${g.label}</li>`).join('')}</ul></section></aside></div>${activityLog()}`); }
function briefFacts(items, kind){ return items.map(x=>`<div class="brief-fact ${kind}"><b>${x.label}</b><strong>${x.value}</strong><small>${x.source}</small></div>`).join(''); }
function decisionOptions(){ const options=[
  {name:'Tiếp tục osimertinib 80 mg',badge:'Có điều kiện',why:'Tuân thủ tốt; độc tính người bệnh báo cáo hiện ở mức demo G1–2.',need:'Bổ sung điện giải/QTc và theo dõi triệu chứng; CT tuần 8.'},
  {name:'Giữ thuốc · đánh giá thêm',badge:'Safety first',why:'Chọn khi xuất hiện red flag hoặc dữ liệu an toàn chưa đủ để tiếp tục.',need:'Đánh giá trực tiếp, xét nghiệm/ECG và loại trừ biến cố nghiêm trọng.'},
  {name:'Trình MDT / đổi chiến lược',badge:'Escalate',why:'Chọn khi tiến triển, kháng thuốc hoặc chẩn đoán/đáp ứng không phù hợp.',need:'Hình ảnh, molecular evolution và bối cảnh lâm sàng đầy đủ.'}
]; return `<div class="decision-options">${options.map(o=>`<button class="decision-option ${state.doctor.decision===o.name?'on':''}" onclick="update(['doctor','decision'],'${o.name}')"><span>${o.badge}</span><b>${o.name}</b><p><strong>Vì sao:</strong> ${o.why}</p><p><strong>Cần thêm:</strong> ${o.need}</p></button>`).join('')}</div>`; }
function hasUnresolvedRed(){ return state.alerts.some(a=>a.type==='red') && state.alertResolution.status!=='resolved'; }
function confirmDecision(){ if(hasUnresolvedRed()){ alert('Cảnh báo đỏ chưa được xử trí. Hãy ghi nhận đánh giá/điều phối theo protocol cơ sở trước khi xác nhận quyết định thường quy.'); return; } state.doctor.decisionStatus='confirmed'; event('CLINICIAN_DECISION_CONFIRMED',{detail:`${state.doctor.decision} · Lý do: ${state.doctor.decisionReason}`}); advance('doctor-plan-confirmed','HANDOFF_CARDS_CREATED'); }
function mdcalcBlock(t,v,h){ return `<div class="calc"><b>${t}</b><span>${v}</span><small>${h}</small></div>`; }
function checklist(group, items){ return `<div class="checklist">${items.map(s=>{const [k,l]=s.split('|'); return `<label><input type="checkbox" ${state[group][k]?'checked':''} onchange="update(['${group}','${k}'],this.checked)"/> <span>${l}</span></label>`}).join('')}</div>`; }
function activityLog(){ return `<section class="card"><small>EVENT / AUDIT TIMELINE</small>${state.alerts.slice(0,8).map(a=>`<div class="event ${a.type==='red'?'red':''}"><b>${a.name || a.symptom}</b><span>${a.at}</span><p>${a.detail || ''}</p></div>`).join('') || '<div class="empty">Chưa có sự kiện.</div>'}</section>`; }

function takeMed(){ state.home.medicationTakenToday = true; state.patient.adherence.taken = Math.min(42, state.patient.adherence.taken + 1); event('MEDICATION_TAKEN', {detail:'Người bệnh xác nhận đã uống osimertinib hôm nay'}); save(); render(); }
function missDose(){ state.home.missedToday = true; state.patient.adherence.missed += 1; event('MEDICATION_MISSED', {detail:'Demo: hiện hướng dẫn xử trí quên liều và báo điều dưỡng nếu lặp lại'}); save(); render(); }
function redDyspnea(){ state.alertResolution={acknowledged:false,assessment:'',action:'',clinicianReason:'',status:'open'}; state.alertHandled=false; state.alerts.unshift({type:'red', name:'TOXICITY_REPORTED_RED', symptom:'Khó thở khi nghỉ', detail:'Người bệnh báo khó thở khi nghỉ/không nói trọn câu. Mục tiêu phản hồi < 5 phút.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function yellowSymptom(s){ state.alerts.unshift({type:'yellow', name:'TOXICITY_REPORTED_YELLOW', symptom:s, detail:'Điều dưỡng gọi lại trong ngày, bác sĩ xem nếu nặng lên.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function acknowledgeAlert(){ state.alertResolution.acknowledged=true; state.alertResolution.status='acknowledged'; event('RED_ALERT_ACKNOWLEDGED',{detail:'Đã tiếp nhận cảnh báo; quyết định thường quy vẫn bị khóa cho tới khi có đánh giá và xác nhận của bác sĩ.'}); save(); render(); }
function resolveAlert(){ if(!state.alertResolution.assessment.trim()||!state.alertResolution.action.trim()||!state.alertResolution.clinicianReason.trim()) return; state.alertResolution.status='resolved'; state.alertHandled=true; event('RED_ALERT_CLINICIAN_RESOLVED',{detail:`Đánh giá: ${state.alertResolution.assessment} · Lý do BS: ${state.alertResolution.clinicianReason}`}); save(); render(); }
function voiceDoctor(){ state.doctor.voiceDone = true; state.doctor.note = 'Voice draft: BN tuần 6 osimertinib, tuân thủ tốt 41/42 liều. Tiêu chảy grade 2, ban da grade 1, không sốt. Chưa có khó thở lúc khám. Đề xuất tiếp tục osimertinib, xử trí hỗ trợ tiêu chảy/ban da, xét nghiệm CBC/điện giải/gan thận, hẹn CT đánh giá đáp ứng.'; event('VOICE_CONSULT_STRUCTURED', {detail:'AI tách transcript thành tuân thủ, độc tính, khám, nhận định, kế hoạch đề xuất'}); save(); render(); }
function render(){ document.getElementById('app').innerHTML = ({patient, nurse, doctor}[state.role] || patient)(); }
render();
