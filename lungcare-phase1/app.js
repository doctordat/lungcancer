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
    patientVoice: { ...d.patientVoice, ...(raw.patientVoice || {}) },
    triage: { ...d.triage, ...(raw.triage || {}), redFlags: Array.isArray(raw.triage?.redFlags) ? raw.triage.redFlags : d.triage.redFlags, review:{ ...d.triage.review, ...(raw.triage?.review || {}) } },
    scenario: raw.scenario || d.scenario,
    careLoop: { ...d.careLoop, ...(raw.careLoop || {}), plan:{...d.careLoop.plan,...(raw.careLoop?.plan||{}),status:(raw.careLoop?.plan?.confirmedAt && raw.encounterState==='home-care-active')?'active':(raw.careLoop?.plan?.confirmedAt?'doctor_confirmed':'draft')},  tasks:Array.isArray(raw.careLoop?.tasks)?raw.careLoop.tasks.map(t=>({...t,planId:t.planId||d.careLoop.plan.planId,revision:t.revision||d.careLoop.plan.revision,status:t.status==='done'&&raw.careLoop?.plan?.status==='active'?'done':'pending'})):d.careLoop.tasks, symptomCheck:{...d.careLoop.symptomCheck,...(raw.careLoop?.symptomCheck||{})} },
    intake: { ...d.intake, ...(raw.intake || {}) },
    doctor: { ...d.doctor, ...(raw.doctor || {}) },
    decisionBrief: { ...d.decisionBrief, ...(raw.decisionBrief || {}), facts: Array.isArray(raw.decisionBrief?.facts) ? raw.decisionBrief.facts : d.decisionBrief.facts, patientReported: Array.isArray(raw.decisionBrief?.patientReported) ? raw.decisionBrief.patientReported : d.decisionBrief.patientReported, safetyGates: Array.isArray(raw.decisionBrief?.safetyGates) ? raw.decisionBrief.safetyGates : d.decisionBrief.safetyGates, readiness: { ...d.decisionBrief.readiness, ...(raw.decisionBrief?.readiness || {}) }, lens: { ...d.decisionBrief.lens, ...(raw.decisionBrief?.lens || {}), uncertainties: Array.isArray(raw.decisionBrief?.lens?.uncertainties) ? raw.decisionBrief.lens.uncertainties : d.decisionBrief.lens.uncertainties }, evidenceMap: Array.isArray(raw.decisionBrief?.evidenceMap) ? raw.decisionBrief.evidenceMap : d.decisionBrief.evidenceMap, evidence: d.decisionBrief.evidence },
    education: { ...d.education, ...(raw.education || {}) },
    home: { ...d.home, ...(raw.home || {}) },
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
      <button class="ghost" onclick="resetScenario('routine')">Scenario: Routine</button><button class="ghost" onclick="resetScenario('yellow')">Scenario: Yellow</button><button class="ghost" onclick="resetScenario('red')">Scenario: Red</button>
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
  ${carePlanCard()}${triagePanel()}${patientVoicePanel()}${decisionReceipt()}${active ? homePlan() : `<section class="empty card"><b>Chưa có kế hoạch tại nhà</b><p>Kế hoạch chỉ kích hoạt sau khi bác sĩ xác nhận và điều dưỡng hoàn tất teach-back.</p></section>`}`);
}

function carePlanCard(){ const p=state.careLoop.plan; const invariant=p.status==='active' && (!p.confirmedAt || state.encounterState!=='home-care-active'); return `<section class="card care-plan">${invariant?`<div class="warning">State warning: plan active khi chưa đủ confirmation/teach-back.</div>`:''}<small>MY CARE · KẾ HOẠCH KẾT NỐI</small><h3>Plan ${p.planId} · revision ${p.revision}</h3><div class="plan-status">${pill(p.status==='active'?'Đang theo dõi tại nhà':p.status==='doctor_confirmed'?'BS đã xác nhận · chờ teach-back':'Bản nháp · chưa active',p.status==='active'?'green':'')}${pill('Nguồn: quyết định BS · không phải y lệnh')}</div><p>Care loop: thuốc hôm nay · symptom check · xét nghiệm · tái khám.</p>${state.careLoop.symptomCheck.completed?pill(`Đã check · ${state.careLoop.symptomCheck.at}`,'green'):button('Hoàn tất symptom check hôm nay','completeSymptomCheck()','outline')}</section>`; }
function triagePanel(){ const t=state.triage; const symptoms=['Tiêu chảy','Ban da','Mệt','Sốt','Đau ngực','Khó thở']; const flags=['Khó thở khi nghỉ','Đau ngực tăng','Lơ mơ / tím tái','Không nói trọn câu']; return `<section class="card triage-panel"><small>SYMPTOM TRIAGE · NGƯỜI BỆNH BÁO CÁO</small><h3>Hôm nay chú thấy triệu chứng gì?</h3><div class="symptoms">${symptoms.map(s=>button(s,`update(['triage','symptom'],'${s}')`,t.symptom===s?'primary':'outline')).join('')}</div>${t.symptom?`<label>Mức độ<input type="range" min="1" max="4" value="${t.severity||2}" oninput="update(['triage','severity'],this.value)"/><small>1 nhẹ · 4 nặng</small></label><h4>Dấu hiệu cần báo ngay</h4><div class="flags">${flags.map(f=>`<label><input type="checkbox" ${t.redFlags.includes(f)?'checked':''} onchange="toggleFlag('${f}',this.checked)"/> ${f}</label>`).join('')}</div>${button('Gửi triage cho đội điều trị','submitTriage()','primary')}`:'<div class="empty">Chọn triệu chứng để bắt đầu. Đây là bản ghi người bệnh cung cấp, chưa phải kết luận y khoa.</div>'}${t.status!=='empty'?pill(`${t.status.toUpperCase()} · ${t.submittedAt}`,t.status==='red'?'danger':'green'):''}${t.patientFeedback?`<div class="patient-feedback"><b>Phản hồi đội điều trị</b><p>${t.patientFeedback}</p></div>`:''}${t.review.patientReceipt?`<div class="patient-feedback"><b>Decision receipt</b><p>${t.review.patientReceipt}</p></div>`:''}</section>`; }
function resetScenario(kind){ const fresh=defaultState(); if(kind==='yellow'){fresh.triage={...fresh.triage,symptom:'Tiêu chảy',severity:3,status:'yellow',escalationId:`ESC-${Date.now()}`,actionStatus:'new',submittedAt:new Date().toLocaleString('vi-VN')};} if(kind==='red'){const id=`ESC-${Date.now()}`; fresh.triage={...fresh.triage,symptom:'Khó thở',severity:4,redFlags:['Khó thở khi nghỉ'],status:'red',escalationId:id,actionStatus:'new',submittedAt:new Date().toLocaleString('vi-VN')}; fresh.alerts=[{type:'red',name:'TOXICITY_REPORTED_RED',escalationId:id,detail:'Demo scenario red: khó thở khi nghỉ',at:new Date().toLocaleTimeString('vi-VN')}];} state={...fresh,role:state.role,scenario:kind}; save(); render(); }
function toggleFlag(flag,checked){ const a=state.triage.redFlags.filter(x=>x!==flag); if(checked)a.push(flag); state.triage.redFlags=a; save(); render(); }
function submitTriage(){ if(!state.triage.symptom)return; const red=state.triage.redFlags.length>0; state.triage.status=red?'red':Number(state.triage.severity)>=3?'yellow':'green'; state.triage.escalationId=`ESC-${Date.now()}`; state.triage.submittedAt=new Date().toLocaleString('vi-VN'); event('STRUCTURED_TRIAGE_SUBMITTED',{detail:`${state.triage.symptom} · mức ${state.triage.severity} · ${state.triage.status} · người bệnh cung cấp`}); save(); render(); }
function patientVoicePanel(){ const v=state.patientVoice; return `<section class="card voice-panel"><small>PATIENT VOICE · BẢN NHÁP DO NGƯỜI BỆNH GỬI</small><h3>${v.status==='submitted'?'Đã gửi cho đội điều trị':'Nói điều chú muốn bác sĩ biết'}</h3><p>Voice thật chưa triển khai trong prototype. Có thể nhập bản nháp để mô phỏng nội dung người bệnh gửi.</p><textarea oninput="update(['patientVoice','transcript'],this.value)" placeholder="VD: Tôi đi ngoài 3 lần/ngày, vẫn uống thuốc đủ, chưa khó thở...">${v.transcript}</textarea><div class="actions">${button('Mô phỏng voice draft','fillPatientVoice()','outline')}${button(v.status==='submitted'?'Đã gửi':'Gửi cho điều dưỡng','submitPatientVoice()','primary')}</div>${v.status==='submitted'?pill(`Đã gửi · ${v.capturedAt}`,'green'):pill('Chưa gửi')}</section>`; }
function fillPatientVoice(){ state.patientVoice.transcript='Bản nháp voice: Tôi vẫn uống osimertinib hằng ngày, quên 1 liều. Gần đây tiêu chảy khoảng 3 lần/ngày và có ban da nhẹ. Hiện tôi chưa khó thở khi nghỉ.'; save(); render(); }
function submitPatientVoice(){ if(!state.patientVoice.transcript.trim()) return; state.patientVoice.status='submitted'; state.patientVoice.capturedAt=new Date().toLocaleString('vi-VN'); state.previsit.submittedAt=state.patientVoice.capturedAt; event('PATIENT_VOICE_SUBMITTED',{detail:'Người bệnh gửi bản nháp voice cho điều dưỡng; chưa được xác minh'}); save(); render(); }
function homePlan(){ return `<section class="card"><small>KẾ HOẠCH VỀ NHÀ · TỪ QUYẾT ĐỊNH ĐÃ XÁC NHẬN</small><h2>${state.doctor.decision}</h2>${handoffCards('patient')}</section>`; }
function careTaskQueue(){ return `<section class="card care-queue"><small>MY CARE TASK QUEUE</small><h3>Việc cần phối hợp</h3>${state.careLoop.tasks.map((t,i)=>`<div class="queue-row"><span class="${t.status==='done'?'done':''}">${t.status==='done'?'✓':'○'}</span><b>${t.label}</b><small>${t.status==='done'?'Đã hoàn tất':'Đang chờ'}</small></div>`).join('')}</section>`; }
function triageInbox(){ const t=state.triage; if(t.status==='empty') return ''; return `<section class="card triage-inbox"><small>TRIAGE INBOX · ${t.actionStatus.toUpperCase()}</small><h3>${t.symptom} · mức ${t.severity}/4</h3><p>Patient-reported · ${t.submittedAt} · ${t.redFlags.length?'Có red flag':'Chưa có red flag'} · demo routing, pending clinical governance.</p><label>Disposition<select onchange="setTriageDisposition(this.value)"><option value="">Chọn hành động...</option><option>Đã xem · tiếp tục theo dõi</option><option>Liên hệ người bệnh</option><option>Chuyển bác sĩ đánh giá</option><option>Xử trí theo protocol cơ sở</option></select></label><label>Ghi chú xử lý<textarea oninput="update(['triage','nurseNote'],this.value)" placeholder="Ghi nhận ngắn, không phải bệnh án...">${t.nurseNote}</textarea>${t.disposition?pill(t.disposition,'green'):''}${t.review.status==='resolved'?`<div class="patient-feedback"><b>Task sau resolution</b><p>${t.review.nurseTask}</p></div>`:''}<div class="actions">${button('Ghi nhận xử lý','ackTriage()','primary')}</div></section>`; }
function setTriageDisposition(v){ state.triage.disposition=v; save(); render(); }
function ackTriage(){ if(!state.triage.disposition)return; state.triage.actionStatus=state.triage.disposition.includes('bác sĩ')?'escalated':'acknowledged'; state.triage.handledBy='ĐD. Thu Hà'; state.triage.handledAt=new Date().toLocaleString('vi-VN'); state.triage.patientFeedback=state.triage.actionStatus==='escalated'?'Đội điều trị đã tiếp nhận và đang chuyển bác sĩ đánh giá.':'Đội điều trị đã tiếp nhận báo cáo và sẽ theo dõi theo quy trình của cơ sở.'; event('NURSE_TRIAGE_ACTION',{detail:`${state.triage.disposition} · ${state.triage.handledBy}`}); save(); render(); }
function doctorCareSnapshot(){ const p=state.patient; return `<section class="card care-snapshot"><small>CARE LOOP SNAPSHOT · MÔ PHỎNG</small><div class="snapshot-grid"><div><b>Tuân thủ thuốc</b><strong>${p.adherence.taken}/${p.adherence.total} · ${pct()}%</strong><small>Patient medication log</small></div><div><b>Độc tính đang theo dõi</b><strong>Tiêu chảy G2 · ban da G1</strong><small>Patient-reported · cần xác minh</small></div><div><b>Việc tại nhà</b><strong>${state.careLoop.tasks.filter(t=>t.status==='done').length}/${state.careLoop.tasks.length} hoàn tất</strong><small>Connected care tasks</small></div><div><b>Checkpoint</b><strong>CT tuần 8 + safety labs</strong><small>Data gap · chưa có kết quả</small></div></div></section>`; }
function escalationReview(){ const t=state.triage,r=t.review; if(state.role!=='doctor'||t.actionStatus!=='escalated'||r.status==='resolved') return ''; return `<section class="card escalation-review"><small>ESCALATION REVIEW · TRIAGE ${t.status.toUpperCase()}</small><h3>${t.symptom} · mức ${t.severity}/4</h3><p>Red flags: ${t.redFlags.join(' · ')||'không có'} · điều dưỡng: ${t.nurseNote||'chưa ghi chú'} · ${t.handledAt||t.submittedAt}</p><div class="decision-grid">${['Tiếp tục theo dõi','Liên hệ/đánh giá người bệnh ngay','Giữ quyết định thường quy chờ đánh giá','Route theo protocol cấp cứu cơ sở'].map(o=>`<button class="choice ${r.outcome===o?'on':''}" onclick="setEscalationOutcome('${o}')">${o}</button>`).join('')}</div><label><input type="checkbox" ${r.redFlagAcknowledged?'checked':''} onchange="update(['triage','review','redFlagAcknowledged'],this.checked)"/> Tôi đã xem và ghi nhận red flag chưa được giải quyết</label><textarea oninput="update(['triage','review','rationale'],this.value)" placeholder="Lý do xử trí/resolution...">${r.rationale}</textarea>${r.outcome&&r.rationale.trim()&&r.redFlagAcknowledged?button('Xác nhận resolution','resolveEscalation()','danger'):button('Chọn outcome + ghi lý do + acknowledge red flag','void(0)','disabled')}</section>`; }
function setEscalationOutcome(o){ state.triage.review.outcome=o; save(); render(); }
function resolveEscalation(){ const r=state.triage.review; if(!r.outcome||!r.rationale.trim()||!r.redFlagAcknowledged||!state.triage.escalationId)return; r.status='resolved'; r.reviewedBy='BS. Mỹ Linh'; r.reviewedAt=new Date().toLocaleString('vi-VN'); state.alertResolution.escalationId=state.triage.escalationId; const terminal=r.outcome==='Tiếp tục theo dõi' && state.triage.redFlags.length===0; state.alertResolution.status=terminal?'resolved':'action_required';r.reviewedBy='BS. Mỹ Linh';r.reviewedAt=new Date().toLocaleString('vi-VN');r.nurseTask=r.outcome.includes('Liên hệ')?'Điều dưỡng liên hệ người bệnh và ghi kết quả.':'Điều dưỡng theo dõi theo hướng dẫn của cơ sở.';r.patientReceipt=terminal?'Đội điều trị đã xem báo cáo và cập nhật bước tiếp theo.':'Đội điều trị đã xem báo cáo và đang xử lý theo quy trình của cơ sở.';state.triage.actionStatus=terminal?'resolved':'doctor_reviewed_action_required';event('DOCTOR_ESCALATION_RESOLVED',{detail:`${r.outcome} · ${r.rationale}`});save();render(); }
function triageHandoff(){ const t=state.triage; if(t.status==='empty' || (state.role==='doctor' && t.actionStatus!=='escalated')) return ''; return `<div class="triage-handoff ${t.status}"><small>TRIAGE HANDOFF · ${t.status.toUpperCase()}</small><b>${t.symptom} · mức ${t.severity}/4</b><p>${t.redFlags.length?`Red flags: ${t.redFlags.join(' · ')}`:'Chưa chọn red flag'} · ${t.submittedAt}</p><em>Patient-reported · demo phân tầng, không phải protocol.</em></div>`; }
function decisionReceipt(){ const r=state.doctor.receipt; if(!r || state.doctor.decisionStatus!=='confirmed') return ''; return `<section class="receipt card"><div><small>DECISION RECEIPT · ${r.at}</small><h3>${r.decision}</h3><p>${r.rationale}</p></div><div class="receipt-grid"><div><small>EVIDENCE ĐÃ DÙNG</small><b>${r.evidence}</b></div><div><small>DATA GAP MỞ</small><b>${r.gaps}</b></div><div><small>CHECKPOINT</small><b>${r.checkpoint}</b></div></div><em>Demo CDS · receipt phối hợp, không phải y lệnh hay bệnh án.</em></section>`; }
function handoffCards(audience){
  const cards = audience==='nurse' ? [
    ['Thuốc & đối chiếu',state.doctor.decision,'Đối chiếu với HIS/EMR trước hướng dẫn; không tự thay đổi quyết định.'],
    ['Theo dõi an toàn','Điện giải · QTc · gan thận','Xác nhận lịch xét nghiệm và báo BS khi dữ liệu chưa đủ.'],
    ['Data gaps','CT tuần 8 · ECG/điện giải','Đây là việc cần bổ sung, không phải trường bệnh án bắt buộc.'],
    ['Teach-back','Quên liều · độc tính · red flags','Người bệnh phải nhắc lại đúng trước khi kích hoạt My Care.']
  ] : [
    ['Thuốc hôm nay','Osimertinib 80 mg lúc 08:00','Dùng đúng kế hoạch đã được đội điều trị xác nhận.'],
    ['Việc sắp tới','Xét nghiệm an toàn + CT tuần 8','App sẽ nhắc theo lịch khoa đã xác nhận.'],
    ['Nguồn thông tin','Kế hoạch từ Decision Brief','Nội dung mô phỏng; đội điều trị xác nhận trước khi áp dụng.'],
    ['Khi cần báo ngay','Khó thở mới, đau ngực, sốt, tiêu chảy tăng','Liên hệ khoa theo hướng dẫn; tình trạng nặng làm theo protocol cấp cứu của cơ sở.']
  ];
  return `<div class="handoff-grid">${cards.map(c=>`<div class="handoff"><small>${c[0]}</small><b>${c[1]}</b><p>${c[2]}</p></div>`).join('')}</div>`;
}

function nurse(){ return shell(`${patientSummary()}${careTaskQueue()}${triageInbox()}${triageHandoff()}${decisionReceipt()}<div class="grid two"><section class="card"><small>TIẾP NHẬN ĐIỀU DƯỠNG</small><h2>${can('previsit-submitted')?'Có bệnh nhân đã gửi khai nhanh':'Chờ bệnh nhân gửi khai nhanh'}</h2><p>Định danh, sinh hiệu, dị ứng, thuốc đang dùng và dấu hiệu báo động.</p>${checklist('intake', ['idChecked|Đối chiếu họ tên · ngày sinh · mã BN','vitals|Nhập sinh hiệu · SpO₂ · đau · cân nặng','allergy|Xác minh dị ứng','medrec|Medication reconciliation','redflags|Xác minh dấu hiệu báo động'])}<label>Ghi chú voice/nhập tay<textarea oninput="update(['intake','note'],this.value)">${state.intake.note}</textarea></label>${doneCount(state.intake)>=5 ? button('Hoàn tất tiếp nhận → gửi bác sĩ','advance("ready-for-doctor","NURSE_INTAKE_COMPLETED")','primary') : button('Cần đủ checklist để hoàn tất','void(0)','disabled')}</section><section class="card"><small>SAU KHI BÁC SĨ CHỐT KẾ HOẠCH</small><h2>${can('doctor-plan-confirmed')?'Kế hoạch đã chuyển từ bác sĩ':'Chưa có kế hoạch điều trị'}</h2><p>Điều dưỡng chỉ nhận các việc cần phối hợp từ quyết định đã xác nhận — không nhận toàn bộ bệnh án và không tự sinh y lệnh.</p>${can('doctor-plan-confirmed') ? handoffCards('nurse') + teachback() : '<div class="empty">Handoff cards sẽ xuất hiện sau khi BS xác nhận quyết định.</div>'}</section></div>${activityLog()}`); }
function teachback(){ return `${checklist('education', ['identity|Đúng người bệnh','emr|Đối chiếu kế hoạch với HIS/EMR','allergy|Kiểm tra dị ứng','meds|Hướng dẫn từng thuốc','missedDose|Xử trí quên liều','toxicity|Độc tính thường gặp','redflags|Dấu hiệu phải báo ngay','teachback|Người bệnh nhắc lại đúng','followup|Lịch xét nghiệm/tái khám','contact|Số liên hệ khoa'])}${doneCount(state.education)>=10 ? button('Hoàn tất teach-back · kích hoạt My Care','advance("home-care-active","NURSE_EDUCATION_COMPLETED")','primary') : button('Hoàn tất sau khi đủ teach-back','void(0)','disabled')}`; }

function doctor(){ return shell(`${patientSummary()}${doctorCareSnapshot()}${escalationReview()}${triageHandoff()}${doctorPatientVoice()}<div class="decision-layout"><section class="card"><small>DECISION BRIEF · TUẦN 6</small><h2>Tiếp tục điều trị hay cần đánh giá thêm?</h2><p class="lead">Bản tóm tắt cho một quyết định — không phải bệnh án. Mọi gợi ý cần bác sĩ xác nhận.</p>${patientVoice()}<div class="decision-lens"><small>DECISION LENS · FRAMING MÔ PHỎNG</small><h3>Câu hỏi lần khám</h3><b>Có thể tiếp tục liều hiện tại trong khi hoàn thiện dữ liệu an toàn và đáp ứng không?</b><div class="lens-grid"><div><small>Tín hiệu ủng hộ</small><p>Tuân thủ tốt · molecular phù hợp · độc tính demo G1–2</p></div><div><small>Next-best-information</small><p>CT tuần 8 · ECG/QTc · điện giải · xác minh toxicity trực tiếp</p></div></div><h3>Điểm bất định cần ghi nhận</h3>${uncertainties()}</div><div class="brief-columns"><div><h3>Dữ kiện mô phỏng</h3>${briefFacts(state.decisionBrief.facts,'fact')}</div><div><h3>Người bệnh báo cáo</h3>${briefFacts(state.decisionBrief.patientReported,'reported')}</div></div><h3>Evidence map · bấm từng mục để xác nhận đã review</h3>${evidenceMap()}${readinessPanel()}<h3>Safety gates</h3><div class="gates">${state.decisionBrief.safetyGates.map(g=>`<div class="gate ${g.status}"><span>${g.status==='ready'||g.status==='clear'?'✓':'!'}</span><div><b>${g.label}</b><small>${g.detail}</small></div></div>`).join('')}</div></section><section class="card"><small>CDS OPTIONS · KHÔNG PHẢI Y LỆNH</small><h2>Các hướng xử trí để bác sĩ cân nhắc</h2>${decisionOptions()}<label>Lý do quyết định / lý do từ chối gợi ý<textarea oninput="update(['doctor','decisionReason'],this.value)" placeholder="Bắt buộc ghi lý do trước khi xác nhận">${state.doctor.decisionReason}</textarea></label><div class="actions">${can('ready-for-doctor') ? button('Nhận ca','advance("doctor-examining","DOCTOR_ACCEPTED_CASE")','outline') : button('Chờ ĐD hoàn tất tiếp nhận','void(0)','disabled')}${hasUnresolvedRed() ? button('Đang có cảnh báo đỏ · phải xử trí trước','void(0)','disabled') : !decisionReady() ? button('Review evidence + xác nhận data gap trước','void(0)','disabled') : can('doctor-examining') && state.doctor.decisionReason.trim() ? button('Xác nhận quyết định · tạo handoff','confirmDecision()','primary') : button('Cần nhận ca + ghi lý do','void(0)','disabled')}</div></section><aside class="sticky"><section class="card evidence"><small>NGUỒN & PHIÊN BẢN</small><h3>${state.decisionBrief.evidence.title}</h3><p>${state.decisionBrief.evidence.version}</p><div class="warning">${state.decisionBrief.evidence.note}</div><hr><b>Dữ liệu còn thiếu</b><ul>${state.decisionBrief.safetyGates.filter(g=>g.status==='missing').map(g=>`<li>${g.label}</li>`).join('')}</ul></section></aside></div>${activityLog()}`); }
function patientVoice(){ const p=state.previsit; const submitted=state.encounterState!=='previsit-draft'||p.submittedAt; return `<div class="patient-voice ${submitted?'submitted':''}"><div><small>PATIENT VOICE · NGUỒN NGƯỜI BỆNH TỰ BÁO CÁO</small><h3>${submitted?'Thông tin trước khám đã gửi':'Chưa có khai nhanh từ người bệnh'}</h3>${submitted?`<p><b>Mục tiêu:</b> ${p.goal||'Chưa nhập'}</p><p><b>Thay đổi:</b> ${p.changes||'Chưa nhập'}</p><small>Gửi lúc ${p.submittedAt||'không rõ'} · Không tự động xem là dữ kiện đã xác minh</small>`:'<p>Điều dưỡng/bác sĩ chưa nhận được patient voice. Đây là empty state, không phải lỗi hồ sơ.</p>'}</div><div>${submitted&&!p.doctorRead?button('Đánh dấu đã đọc','markPatientVoiceRead()','outline'):submitted?pill('BS đã đọc · patient-reported','green'):pill('Chờ người bệnh gửi')}</div></div>`; }
function markPatientVoiceRead(){ state.previsit.doctorRead=true; event('PATIENT_VOICE_READ',{detail:'Bác sĩ đã đọc thông tin patient-reported trước khám'}); save(); render(); }
function doctorPatientVoice(){ const v=state.patientVoice; if(v.status!=='submitted') return `<section class="card voice-empty"><small>PATIENT VOICE</small><b>Chưa có khai voice từ người bệnh</b><p>Đây là khoảng trống thông tin, không phải dữ liệu âm tính.</p></section>`; return `<section class="card patient-voice"><div><small>PATIENT VOICE · CHƯA XÁC MINH</small><h3>Người bệnh đã gửi bản nháp</h3><p>${v.transcript}</p><small>${v.capturedAt} · nguồn: người bệnh</small></div><button onclick="markVoiceRead()" class="${v.readByDoctor?'outline':'primary'}">${v.readByDoctor?'Đã đọc':'Đánh dấu đã đọc'}</button></section>`; }
function markVoiceRead(){ state.patientVoice.readByDoctor=true; event('DOCTOR_READ_PATIENT_VOICE',{detail:'Bác sĩ đã đọc bản nháp Patient Voice; cần xác minh khi khám'}); save(); render(); }
function briefFacts(items, kind){ return items.map(x=>`<div class="brief-fact ${kind}"><b>${x.label}</b><strong>${x.value}</strong><small>${x.source}</small></div>`).join(''); }
function readinessPanel(){ const m=state.decisionBrief.evidenceMap; const reviewed=m.filter(x=>x.reviewed).length; const critical=m.filter(x=>['molecular','toxicity'].includes(x.id)).every(x=>x.reviewed); const ready=critical&&state.decisionBrief.readiness.dataGapsAcknowledged; return `<div class="readiness ${ready?'ready':''}"><div><b>Decision readiness</b><span>${reviewed}/${m.length} evidence đã review · ${critical?'Molecular + độc tính đã xem':'Cần review Molecular + độc tính'}</span></div><label><input type="checkbox" ${state.decisionBrief.readiness.dataGapsAcknowledged?'checked':''} onchange="ackGaps(this.checked)"/> Đã thấy và cân nhắc data gap</label>${ready?pill('Sẵn sàng cho BS xác nhận','green'):pill('Chưa sẵn sàng','')}</div>`; }
function ackGaps(checked){ state.decisionBrief.readiness.dataGapsAcknowledged=checked; event('DATA_GAPS_ACKNOWLEDGED',{detail:checked?'Bác sĩ đã xác nhận đã thấy data gap':'Bỏ xác nhận data gap'}); save(); render(); }
function uncertainties(){ return `<div class="uncertainties">${state.decisionBrief.lens.uncertainties.map((u,i)=>`<label><input type="checkbox" ${u.checked?'checked':''} onchange="toggleUncertainty(${i},this.checked)"/> ${u.label}</label>`).join('')}</div>`; }
function toggleUncertainty(i,checked){ state.decisionBrief.lens.uncertainties[i].checked=checked; event('UNCERTAINTY_RECORDED',{detail:`${checked?'Đã ghi nhận':'Bỏ ghi nhận'}: ${state.decisionBrief.lens.uncertainties[i].label}`}); save(); render(); }
function evidenceMap(){ return `<div class="evidence-map">${state.decisionBrief.evidenceMap.map((x,i)=>`<button class="evidence-item ${x.status} ${x.reviewed?'reviewed':''}" onclick="reviewEvidence(${i})"><span>${x.status==='missing'?'!':x.status==='review'?'~':'✓'}</span><div><b>${x.label}</b><strong>${x.value}</strong><small>${x.provenance} · ${x.reviewed?'Đã review':'Chưa review'}</small></div></button>`).join('')}</div>`; }
function reviewEvidence(i){ state.decisionBrief.evidenceMap[i].reviewed=true; event('EVIDENCE_REVIEWED',{detail:`Đã review: ${state.decisionBrief.evidenceMap[i].label}`}); save(); render(); }
function decisionOptions(){ const options=[
  {name:'Tiếp tục osimertinib 80 mg',badge:'Có điều kiện',why:'Tuân thủ tốt; độc tính người bệnh báo cáo hiện ở mức demo G1–2.',need:'Bổ sung điện giải/QTc và theo dõi triệu chứng; CT tuần 8.'},
  {name:'Giữ thuốc · đánh giá thêm',badge:'Safety first',why:'Chọn khi xuất hiện red flag hoặc dữ liệu an toàn chưa đủ để tiếp tục.',need:'Đánh giá trực tiếp, xét nghiệm/ECG và loại trừ biến cố nghiêm trọng.'},
  {name:'Trình MDT / đổi chiến lược',badge:'Escalate',why:'Chọn khi tiến triển, kháng thuốc hoặc chẩn đoán/đáp ứng không phù hợp.',need:'Hình ảnh, molecular evolution và bối cảnh lâm sàng đầy đủ.'}
]; return `<div class="decision-options">${options.map(o=>`<button class="decision-option ${state.doctor.decision===o.name?'on':''}" onclick="update(['doctor','decision'],'${o.name}')"><span>${o.badge}</span><b>${o.name}</b><p><strong>Vì sao:</strong> ${o.why}</p><p><strong>Cần thêm:</strong> ${o.need}</p></button>`).join('')}</div>`; }
function decisionReady(){ const m=state.decisionBrief.evidenceMap; return ['molecular','toxicity'].every(id=>m.some(x=>x.id===id&&x.reviewed)) && state.decisionBrief.readiness.dataGapsAcknowledged; }
function hasUnresolvedRed(){ return state.alerts.some(a=>a.type==='red') && state.alertResolution.status!=='resolved'; }
function confirmDecision(){ if(hasUnresolvedRed()){ alert('Cảnh báo đỏ chưa được xử trí. Hãy ghi nhận đánh giá/điều phối theo protocol cơ sở trước khi xác nhận quyết định thường quy.'); return; } state.doctor.decisionStatus='confirmed'; state.careLoop.plan.status='doctor_confirmed'; state.careLoop.plan.confirmedAt=new Date().toLocaleString('vi-VN'); state.careLoop.plan.provenance='Clinician decision demo · cần nurse teach-back'; state.doctor.receipt={decision:state.doctor.decision,rationale:state.doctor.decisionReason,evidence:'Molecular · độc tính · tuân thủ · context',gaps:'CT tuần 8 · QTc/điện giải',checkpoint:'Đánh giá lại sau CT/labs',at:new Date().toLocaleString('vi-VN')}; event('CLINICIAN_DECISION_CONFIRMED',{detail:`${state.doctor.decision} · Lý do: ${state.doctor.decisionReason}`}); advance('doctor-plan-confirmed','DECISION_RECEIPT_CREATED'); }
function mdcalcBlock(t,v,h){ return `<div class="calc"><b>${t}</b><span>${v}</span><small>${h}</small></div>`; }
function checklist(group, items){ return `<div class="checklist">${items.map(s=>{const [k,l]=s.split('|'); return `<label><input type="checkbox" ${state[group][k]?'checked':''} onchange="update(['${group}','${k}'],this.checked)"/> <span>${l}</span></label>`}).join('')}</div>`; }
function activityLog(){ return `<section class="card"><small>EVENT / AUDIT TIMELINE</small>${state.alerts.slice(0,8).map(a=>`<div class="event ${a.type==='red'?'red':''}"><b>${a.name || a.symptom}</b><span>${a.at}</span><p>${a.detail || ''}</p></div>`).join('') || '<div class="empty">Chưa có sự kiện.</div>'}</section>`; }

function completeSymptomCheck(){ if(['red','yellow'].includes(state.triage.status) && state.triage.actionStatus!=='resolved') { alert('Còn triage cần follow-up; chưa thể đóng symptom check.'); return; } state.careLoop.symptomCheck={completed:true,at:new Date().toLocaleString('vi-VN'),summary:'Người bệnh xác nhận đã hoàn tất kiểm tra triệu chứng hôm nay.'}; state.careLoop.tasks.find(t=>t.id==='symptom').status='done'; event('DAILY_SYMPTOM_CHECK_COMPLETED',{detail:'Patient-reported daily symptom check'}); save(); render(); }
function takeMed(){ state.home.medicationTakenToday = true; state.careLoop.tasks.find(t=>t.id==='med').status='done'; state.patient.adherence.taken = Math.min(42, state.patient.adherence.taken + 1); event('MEDICATION_TAKEN', {detail:'Người bệnh xác nhận đã uống osimertinib hôm nay'}); save(); render(); }
function missDose(){ state.home.missedToday = true; state.patient.adherence.missed += 1; event('MEDICATION_MISSED', {detail:'Demo: hiện hướng dẫn xử trí quên liều và báo điều dưỡng nếu lặp lại'}); save(); render(); }
function redDyspnea(){ state.alertResolution={acknowledged:false,assessment:'',action:'',clinicianReason:'',status:'open'}; state.alertHandled=false; state.alerts.unshift({type:'red', name:'TOXICITY_REPORTED_RED', symptom:'Khó thở khi nghỉ', detail:'Người bệnh báo khó thở khi nghỉ/không nói trọn câu. Mục tiêu phản hồi < 5 phút.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function yellowSymptom(s){ state.alerts.unshift({type:'yellow', name:'TOXICITY_REPORTED_YELLOW', symptom:s, detail:'Điều dưỡng gọi lại trong ngày, bác sĩ xem nếu nặng lên.', at:new Date().toLocaleTimeString('vi-VN')}); save(); render(); }
function acknowledgeAlert(){ state.alertResolution.acknowledged=true; state.alertResolution.status='acknowledged'; event('RED_ALERT_ACKNOWLEDGED',{detail:'Đã tiếp nhận cảnh báo; quyết định thường quy vẫn bị khóa cho tới khi có đánh giá và xác nhận của bác sĩ.'}); save(); render(); }
function resolveAlert(){ if(!state.alertResolution.assessment.trim()||!state.alertResolution.action.trim()||!state.alertResolution.clinicianReason.trim()) return; state.alertResolution.status='resolved'; state.alertHandled=true; event('RED_ALERT_CLINICIAN_RESOLVED',{detail:`Đánh giá: ${state.alertResolution.assessment} · Lý do BS: ${state.alertResolution.clinicianReason}`}); save(); render(); }
function voiceDoctor(){ state.doctor.voiceDone = true; state.doctor.note = 'Voice draft: BN tuần 6 osimertinib, tuân thủ tốt 41/42 liều. Tiêu chảy grade 2, ban da grade 1, không sốt. Chưa có khó thở lúc khám. Đề xuất tiếp tục osimertinib, xử trí hỗ trợ tiêu chảy/ban da, xét nghiệm CBC/điện giải/gan thận, hẹn CT đánh giá đáp ứng.'; event('VOICE_CONSULT_STRUCTURED', {detail:'AI tách transcript thành tuân thủ, độc tính, khám, nhận định, kế hoạch đề xuất'}); save(); render(); }
function render(){ document.getElementById('app').innerHTML = ({patient, nurse, doctor}[state.role] || patient)(); }
render();
