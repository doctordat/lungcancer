const STORAGE_KEY = 'lungcare.phase1.v1';

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
  doctor: { accepted: false, voiceDone: false, toxicityReviewed: false, molecularReviewed: false, recistReviewed: false, decision: 'Tiếp tục osimertinib 80 mg', note: '' },
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
    education: { ...d.education, ...(raw.education || {}) },
    home: { ...d.home, ...(raw.home || {}) },
    alerts: Array.isArray(raw.alerts) ? raw.alerts : []
  };
}

let state = load();
function load(){ try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return defaultState(); } }
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
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

function topbar(roleMeta){ return `<header class="top"><div><small>${roleMeta[2].toUpperCase()}</small><h1>${roleMeta[1] === 'Bệnh nhân' ? 'Chào chú Minh' : roleMeta[1] === 'Điều dưỡng' ? 'Bàn giao điều trị hôm nay' : 'Case command center'}</h1></div><div class="top-actions">${pill('Clinical decision support · cần BS xác nhận','purple')}${pill('Không dùng dữ liệu thật','green')}</div></header>`; }

function alertsStrip(){
  const red = state.alerts.find(a => a.type === 'red');
  if (!red) return '';
  return `<section class="red-alert"><div><b>⚠ CẢNH BÁO ĐỎ · Khó thở khi nghỉ</b><p>${red.detail} · gửi đồng thời bác sĩ và điều dưỡng lúc ${red.at}. Không chờ phản hồi nếu tình trạng nặng.</p></div><div>${button('Ghi nhận đã gọi', 'handleAlert()', 'danger')}${button('Gọi 115', 'alert("Demo: mở cuộc gọi 115")', 'outline dangerText')}</div></section>`;
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

function homePlan(){ return `<section class="card"><small>KẾ HOẠCH VỀ NHÀ</small><div class="grid three"><div><b>Thuốc</b><p>Osimertinib 80mg 08:00 mỗi ngày</p></div><div><b>Xét nghiệm</b><p>CBC, AST/ALT, creatinine, điện giải trước tái khám</p></div><div><b>Báo ngay</b><p>Khó thở, đau ngực, sốt, tiêu chảy tăng, không uống được nước</p></div></div></section>`; }

function nurse(){ return shell(`${patientSummary()}<div class="grid two"><section class="card"><small>TIẾP NHẬN ĐIỀU DƯỠNG</small><h2>${can('previsit-submitted')?'Có bệnh nhân đã gửi khai nhanh':'Chờ bệnh nhân gửi khai nhanh'}</h2><p>Định danh, sinh hiệu, dị ứng, thuốc đang dùng và dấu hiệu báo động.</p>${checklist('intake', ['idChecked|Đối chiếu họ tên · ngày sinh · mã BN','vitals|Nhập sinh hiệu · SpO₂ · đau · cân nặng','allergy|Xác minh dị ứng','medrec|Medication reconciliation','redflags|Xác minh dấu hiệu báo động'])}<label>Ghi chú voice/nhập tay<textarea oninput="update(['intake','note'],this.value)">${state.intake.note}</textarea></label>${doneCount(state.intake)>=5 ? button('Hoàn tất tiếp nhận → gửi bác sĩ','advance("ready-for-doctor","NURSE_INTAKE_COMPLETED")','primary') : button('Cần đủ checklist để hoàn tất','void(0)','disabled')}</section><section class="card"><small>SAU KHI BÁC SĨ CHỐT KẾ HOẠCH</small><h2>${can('doctor-plan-confirmed')?'Kế hoạch đã chuyển từ bác sĩ':'Chưa có kế hoạch điều trị'}</h2><p>Điều dưỡng chỉ teach-back sau khi có plan version từ bác sĩ. Không tự sinh y lệnh.</p>${can('doctor-plan-confirmed') ? teachback() : '<div class="empty">Checklist bàn giao sẽ xuất hiện sau khi BS xác nhận.</div>'}</section></div>${activityLog()}`); }
function teachback(){ return `${checklist('education', ['identity|Đúng người bệnh','emr|Đối chiếu kế hoạch với HIS/EMR','allergy|Kiểm tra dị ứng','meds|Hướng dẫn từng thuốc','missedDose|Xử trí quên liều','toxicity|Độc tính thường gặp','redflags|Dấu hiệu phải báo ngay','teachback|Người bệnh nhắc lại đúng','followup|Lịch xét nghiệm/tái khám','contact|Số liên hệ khoa'])}${doneCount(state.education)>=10 ? button('Hoàn tất teach-back · kích hoạt My Care','advance("home-care-active","NURSE_EDUCATION_COMPLETED")','primary') : button('Hoàn tất sau khi đủ teach-back','void(0)','disabled')}`; }

function doctor(){ return shell(`${patientSummary()}<div class="layout"><section class="card"><small>DANH SÁCH BỆNH NHÂN</small>${['Nguyễn Văn Minh · tái khám · ready for doctor','Lê Hoàng Nam · ANC thấp · cần xử lý','Phạm Mỹ An · MDT 10:30'].map((x,i)=>`<div class="list ${i===0?'on':''}"><b>${x.split(' · ')[0]}</b><span>${x.split(' · ').slice(1).join(' · ')}</span></div>`).join('')}</section><section class="card"><small>KHÁM NGOẠI TRÚ TÁI KHÁM</small><h2>Mục tiêu: đáp ứng · độc tính · liều</h2><p>Voice consultation demo tách nội dung thành triệu chứng, tuân thủ, độc tính, khám, nhận định và kế hoạch đề xuất.</p><div class="actions">${can('ready-for-doctor') ? button('Nhận bệnh','advance("doctor-examining","DOCTOR_ACCEPTED_CASE")','primary') : button('Chờ điều dưỡng tiếp nhận','void(0)','disabled')}${button('Khám bằng giọng nói','voiceDoctor()','outline')}</div><label>Nhận định/kế hoạch<textarea oninput="update(['doctor','note'],this.value)">${state.doctor.note}</textarea></label><div class="decision-grid">${['Tiếp tục osimertinib 80 mg','Tạm ngưng thuốc','Giảm liều','Đổi phác đồ','Nhập viện','Chuyển cấp cứu'].map(d=>`<button class="choice ${state.doctor.decision===d?'on':''}" onclick="update(['doctor','decision'],'${d}')">${d}</button>`).join('')}</div>${can('doctor-examining') ? button('Xác nhận kế hoạch → chuyển điều dưỡng','advance("doctor-plan-confirmed","DOCTOR_PLAN_CONFIRMED")','primary') : ''}</section><aside class="sticky"><section class="card"><small>CDS STICKY PANEL</small>${mdcalcBlock('Molecular','EGFR exon 19 deletion','Osimertinib phù hợp · diễn giải cùng lâm sàng/hình ảnh')}${mdcalcBlock('Toxicity','Tiêu chảy G2 · ban da G1','Cân nhắc giữ liều + xử trí hỗ trợ, cần BS xác nhận')}${mdcalcBlock('RECIST','Chưa nhập CT hiện tại','Cần CT đánh giá đáp ứng sau 8 tuần')}</section></aside></div>${activityLog()}`); }
function mdcalcBlock(t,v,h){ return `<div class="calc"><b>${t}</b><span>${v}</span><small>${h}</small></div>`; }
function checklist(group, items){ return `<div class="checklist">${items.map(s=>{const [k,l]=s.split('|'); return `<label><input type="checkbox" ${state[group][k]?'checked':''} onchange="update(['${group}','${k}'],this.checked)"/> <span>${l}</span></label>`}).join('')}</div>`; }
function activityLog(){ return `<section class="card"><small>EVENT / AUDIT TIMELINE</small>${state.alerts.slice(0,8).map(a=>`<div class="event ${a.type==='red'?'red':''}"><b>${a.name || a.symptom}</b><span>${a.at}</span><p>${a.detail || ''}</p></div>`).join('') || '<div class="empty">Chưa có sự kiện.</div>'}</section>`; }

function takeMed(){ state.home.medicationTakenToday = true; state.patient.adherence.taken = Math.min(42, state.patient.adherence.taken + 1); event('MEDICATION_TAKEN', {detail:'Người bệnh xác nhận đã uống osimertinib hôm nay'}); save(); render(); }
function missDose(){ state.home.missedToday = true; state.patient.adherence.missed += 1; event('MEDICATION_MISSED', {detail:'Demo: hiện hướng dẫn xử trí quên liều và báo điều dưỡng nếu lặp lại'}); save(); render(); }
function redDyspnea(){ state.alerts.unshift({type:'red', name:'TOXICITY_REPORTED_RED', symptom:'Khó thở khi nghỉ', detail:'Người bệnh báo khó thở khi nghỉ/không nói trọn câu. Mục tiêu phản hồi < 5 phút.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function yellowSymptom(s){ state.alerts.unshift({type:'yellow', name:'TOXICITY_REPORTED_YELLOW', symptom:s, detail:'Điều dưỡng gọi lại trong ngày, bác sĩ xem nếu nặng lên.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function handleAlert(){ state.alertHandled = true; event('ALERT_CALL_DOCUMENTED', {detail:'Đã ghi nhận cuộc gọi xử trí cảnh báo đỏ trong demo'}); save(); render(); }
function voiceDoctor(){ state.doctor.voiceDone = true; state.doctor.note = 'Voice draft: BN tuần 6 osimertinib, tuân thủ tốt 41/42 liều. Tiêu chảy grade 2, ban da grade 1, không sốt. Chưa có khó thở lúc khám. Đề xuất tiếp tục osimertinib, xử trí hỗ trợ tiêu chảy/ban da, xét nghiệm CBC/điện giải/gan thận, hẹn CT đánh giá đáp ứng.'; event('VOICE_CONSULT_STRUCTURED', {detail:'AI tách transcript thành tuân thủ, độc tính, khám, nhận định, kế hoạch đề xuất'}); save(); render(); }
function render(){ document.getElementById('app').innerHTML = ({patient, nurse, doctor}[state.role] || patient)(); }
render();
