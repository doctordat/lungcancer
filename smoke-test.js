#!/usr/bin/env node
'use strict';
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const store = new Map();
const appRoot = { innerHTML: '' };
const context = {
  console,
  URLSearchParams,
  Date,
  Math,
  JSON,
  localStorage: {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key)
  },
  location: { search: '?role=doctor' },
  history: { replaceState() {} },
  alert: message => { context.lastAlert = message; },
  document: { getElementById: () => appRoot }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + '/app.js', 'utf8'), context, { filename: 'app.js' });
const run = expression => vm.runInContext(expression, context);
const check = (condition, message) => assert.ok(condition, message);

run("state = defaultState()");
check(run("state.safetyRequests.length") === 0, 'default safetyRequests is empty');

const persisted = run("JSON.stringify({...state, careLoop:{...state.careLoop, plan:{...state.careLoop.plan, revision:2}}, safetyRequests:[{id:'keep',planId:state.careLoop.plan.planId,revision:2,checkId:'labs'},{id:'drop',planId:'other',revision:1,checkId:'labs'}]})");
run(`state = normalize(JSON.parse(${JSON.stringify(persisted)}))`);
check(run("state.safetyRequests.length") === 1 && run("state.safetyRequests[0].id") === 'keep', 'normalize filters requests by persisted plan revision');

run("state = defaultState(); state.role='doctor'; state.encounterState='doctor-examining'; state.alerts=[]; requestSafety('labs')");
check(run("state.safetyRequests[0].status") === 'requested', 'doctor can create request while examining');
run("state.role='doctor'; mockResult(0)");
check(run("state.safetyRequests[0].status") === 'requested', 'doctor cannot enter mock result');
run("state.role='nurse'; mockResult(0)");
check(run("state.safetyRequests[0].status") === 'available' && stateValue('nurseNote'), 'nurse can enter mock result with provenance');
run("state.role='nurse'; reviewSafetyRequest(0)");
check(run("state.safetyRequests[0].status") === 'available', 'nurse cannot review result');
run("state.role='doctor'; reviewSafetyRequest(0)");
check(run("state.safetyRequests[0].status") === 'reviewed', 'doctor can review available result');

run("state = defaultState(); state.role='doctor'; state.encounterState='doctor-examining'; state.alerts=[]; requestSafety('labs')");
run("state.alerts=[{type:'red'}]; state.alertResolution.status='open'");
const beforeRedRequest = run("state.safetyRequests.length");
run("requestSafety('interactions')");
check(run("state.safetyRequests.length") === beforeRedRequest, 'red alert blocks new request');
check(run("hasUnresolvedRed()") === true, 'red alert remains unresolved');

run("state = defaultState(); state.role='doctor'; state.encounterState='doctor-examining'; state.alerts=[]; state.decisionBrief.evidenceMap.forEach(x=>{if(['molecular','toxicity'].includes(x.id))x.reviewed=true}); state.decisionBrief.readiness.dataGapsAcknowledged=true");
check(run("decisionReady()") === false, 'readiness stays blocked before medication review');
run("['dose','adherence','toxicity'].forEach(id=>state.medicationSafety.reviewed[id]=true)");
check(run("decisionReady()") === true, 'readiness opens after medication review');

run("state = defaultState(); state.role='patient'; state.scenario='routine'; resetScenario('red')");
run("render()");
check(run("state.scenario") === 'routine', 'patient cannot reset demo scenario');
check(!appRoot.innerHTML.includes('DEMO / QA SCENARIO'), 'patient does not see demo controls');
run("state.role='doctor'; resetScenario('red')");
check(run("state.scenario") === 'red' && run("state.alerts.some(a=>a.type==='red')"), 'clinician can reset demo scenario');

// RECIST 1.1 Assessment Brief assertions
run("state = defaultState(); state.role='doctor'; state.encounterState='doctor-examining'");
check(run("state.recist.targetLesions.length") === 2, 'recist has 2 target lesions');
check(run("state.recist.sumChangePct") === -34.0, 'recist sum change is -34%');
check(run("state.recist.reviewed") === false, 'recist initially unreviewed');
run("reviewRecist()");
check(run("state.recist.reviewed") === true, 'recist marked as reviewed');
check(run("state.recist.reviewMeta.reviewedBy") === 'BS. Mỹ Linh', 'recist review metadata captured');
check(run("state.decisionBrief.evidenceMap.find(x=>x.id==='response').reviewed") === true, 'response in evidence map synced to reviewed');

const recistPersisted = run("JSON.stringify({...state, careLoop:{...state.careLoop, plan:{...state.careLoop.plan, revision:3}}, recist:{...state.recist, reviewed:true, reviewMeta:{planId:state.careLoop.plan.planId, revision:2, reviewedBy:'BS. Mỹ Linh'}}})");
run(`state = normalize(JSON.parse(${JSON.stringify(recistPersisted)}))`);
check(run("state.recist.reviewed") === false && run("state.recist.reviewMeta") === null, 'normalize invalidates old recist review on plan revision bump');

// CTCAE v5.0 Toxicity Management Guide assertions
run("state = defaultState(); state.role='doctor'; state.encounterState='doctor-examining'");
check(run("state.ctcae.items.length") === 2, 'ctcae has 2 toxicity items (diarrhea, rash)');
check(run("state.ctcae.reviewed") === false, 'ctcae initially unreviewed');
run("reviewCtcae()");
check(run("state.ctcae.reviewed") === true, 'ctcae marked as reviewed');
check(run("state.medicationSafety.reviewed['toxicity']") === true, 'medication toxicity review synced');
check(run("state.decisionBrief.evidenceMap.find(x=>x.id==='toxicity').reviewed") === true, 'evidence map toxicity synced');

const ctcaePersisted = run("JSON.stringify({...state, careLoop:{...state.careLoop, plan:{...state.careLoop.plan, revision:3}}, ctcae:{...state.ctcae, reviewed:true, reviewMeta:{planId:state.careLoop.plan.planId, revision:2, reviewedBy:'BS. Mỹ Linh'}}})");
run(`state = normalize(JSON.parse(${JSON.stringify(ctcaePersisted)}))`);
check(run("state.ctcae.reviewed") === false && run("state.ctcae.reviewMeta") === null, 'normalize invalidates old ctcae review on plan revision bump');

// Nurse Teach-back & Discharge assertions
run("state = defaultState(); state.role='nurse'; state.encounterState='doctor-plan-confirmed'");
check(run("doneCount(state.education)") === 0, 'education checklist initially 0/10');
run("completeTeachback()");
check(run("state.encounterState") === 'doctor-plan-confirmed', 'cannot complete teachback when items < 10');
run("['identity','emr','allergy','meds','missedDose','toxicity','redflags','teachback','followup','contact'].forEach(k => state.education[k] = true)");
check(run("doneCount(state.education)") === 10, 'education checklist is now 10/10');
run("completeTeachback()");
check(run("state.encounterState") === 'home-care-active', 'encounter state advances to home-care-active');
check(run("state.careLoop.plan.status") === 'active', 'care plan activated');
check(run("state.education.completedBy") === 'ĐD. Thu Hà', 'education completedBy captured');

// MDT Escalation & Consultation assertions
run("state = defaultState(); state.role='doctor'; state.encounterState='doctor-examining'");
check(run("state.mdt.status") === 'not_requested', 'mdt initially not_requested');
run("requestMdt()");
check(run("state.mdt.status") === 'scheduled', 'mdt status scheduled after request');
check(run("state.doctor.decision") === 'Trình MDT / đổi chiến lược', 'doctor decision synced to MDT escalation');
check(run("state.mdt.panel.length") === 4, 'mdt panel has 4 specialties');
run("completeMdt()");
check(run("state.mdt.status") === 'completed' && run("state.mdt.reviewed") === true, 'mdt completed and reviewed');
check(run("state.mdt.reviewMeta.reviewedBy") === 'BS. Mỹ Linh', 'mdt reviewMeta recorded');

const mdtPersisted = run("JSON.stringify({...state, careLoop:{...state.careLoop, plan:{...state.careLoop.plan, revision:3}}, mdt:{...state.mdt, reviewed:true, reviewMeta:{planId:state.careLoop.plan.planId, revision:2, reviewedBy:'BS. Mỹ Linh'}}})");
run(`state = normalize(JSON.parse(${JSON.stringify(mdtPersisted)}))`);
check(run("state.mdt.reviewed") === false && run("state.mdt.reviewMeta") === null, 'normalize invalidates old mdt review on plan revision bump');

// Daily PRO Diary & Trend Chart assertions
run("state = defaultState(); state.role='patient'");
check(run("state.proDiary.entries.length") === 7, 'proDiary has 7 seed entries');
check(run("state.proDiary.todayCheckin.medTaken") === true, 'default today checkin med is true');
run("updateTodayCheckin('diarrheaCount', 4)");
check(run("state.proDiary.todayCheckin.diarrheaCount") === 4, 'updated today checkin diarrhea to 4');
run("submitProCheckin()");
check(run("state.triage.status") === 'yellow', 'severe diarrhea auto-triggers yellow triage');

run("updateTodayCheckin('dyspnea', true)");
run("submitProCheckin()");
check(run("hasUnresolvedRed()") === true, 'dyspnea auto-triggers red alert');

// SOAP Summary & Clinical Modules assertions
run("state = defaultState(); state.role='doctor'");
const soap = run("generateSoapSummary()");
check(soap.includes('[S] CHỦ QUAN') && soap.includes('[O] KHÁCH QUAN') && soap.includes('[A] ĐÁNH GIÁ') && soap.includes('[P] KẾ HOẠCH XỬ TRÍ'), 'SOAP summary generated with all 4 quadrants');
check(soap.includes('Osimertinib 80'), 'SOAP summary includes correct medication');

// Safety Labs (QTc & Electrolytes)
check(run("state.safetyLabs.qtc.value") === 432, 'safetyLabs qtc value is 432ms');
run("reviewSafetyLabs()");
check(run("state.safetyLabs.reviewed") === true, 'safety labs marked as reviewed');
check(run("state.medicationSafety.reviewed['labs']") === true, 'medication safety labs synced');

// Biomarker Evolution (ctDNA & Resistance)
check(run("state.biomarkers.resistanceMarkers.length") === 5, 'biomarkers resistance panel has 5 genes');
run("reviewBiomarkers()");
check(run("state.biomarkers.reviewed") === true, 'biomarkers marked as reviewed');
check(run("state.decisionBrief.evidenceMap.find(x=>x.id==='molecular').reviewed") === true, 'evidence map molecular synced');

// DDI & Medication Reconciliation assertions
check(run("state.ddiChecker.concomitantMeds.length") === 4, 'ddiChecker has 4 concomitant meds');
check(run("state.ddiChecker.interactions.length") === 3, 'ddiChecker detected 3 interactions');
check(run("state.ddiChecker.reviewed") === false, 'ddiChecker initially unreviewed');
run("reviewDdi()");
check(run("state.ddiChecker.reviewed") === true, 'ddiChecker marked as reviewed');
check(run("state.medicationSafety.reviewed['interactions']") === true, 'medication interactions review synced');
check(run("state.medicationSafety.checks.find(x=>x.id==='interactions').value").includes('Ngưng Omeprazole'), 'medication check value updated after DDI review');

// Nutrition & Pulmonary Rehab assertions
check(run("state.rehabNutrition.exercises.length") === 3, 'rehabNutrition has 3 exercises');
check(run("state.rehabNutrition.bmi") === 21.3, 'rehabNutrition bmi is 21.3');
check(run("state.rehabNutrition.exercises[0].completed") === false, 'first exercise initially uncompleted');
run("toggleRehabExercise(0)");
check(run("state.rehabNutrition.exercises[0].completed") === true, 'first exercise marked completed');
run("reviewRehabNutrition()");
check(run("state.rehabNutrition.reviewed") === true, 'rehabNutrition marked as reviewed');

// Caregiver Sync & SMS assertions
check(run("state.caregiverSync.primaryCaregiver.phone") === '0918 234 567', 'caregiver phone registered');
const initialSmsLen = run("state.caregiverSync.smsHistory.length");
run("missDose()");
check(run("state.caregiverSync.smsHistory.length") === initialSmsLen + 1, 'missDose auto-dispatches caregiver SMS');
check(run("state.caregiverSync.smsHistory[0].message").includes('quên liều'), 'dispatched SMS contains missed dose notice');
run("testCaregiverAlert()");
check(run("state.caregiverSync.smsHistory.length") === initialSmsLen + 2, 'test alert dispatches caregiver SMS');

// Treatment Journey Timeline assertions
check(run("state.treatmentJourney.milestones.length") === 5, 'treatmentJourney has 5 milestones');
check(run("state.treatmentJourney.milestones[2].badge") === 'PR (-34%)', 'milestone 2 has PR badge');

// Clinical Calculators (MDCalc standard) assertions
run("recalculateClinicalScores()");
check(run("state.clinicalCalculators.results.crClCockcroftGault") === 67.6, 'crCl Cockcroft-Gault correctly calculated');
check(run("state.clinicalCalculators.results.qtcFFridericia") === 414, 'qtcF Fridericia correctly calculated');
check(run("state.clinicalCalculators.results.bsaDuBois") === 1.63, 'bsa DuBois correctly calculated');
check(run("state.clinicalCalculators.results.karnofskyScore") === 100, 'kps 100% for ECOG 0');

run("updateCalculatorInput('serumCreatinineMgDl', 1.86)");
check(run("state.clinicalCalculators.results.crClCockcroftGault") < 35, 'crCl reactive update works');
run("reviewCalculators()");
check(run("state.clinicalCalculators.reviewed") === true, 'calculators marked reviewed');

console.log('LungCare smoke test: PASS');
console.log('Assertions: normalize, role guards, request lifecycle, provenance, readiness, red gate, recist 1.1, ctcae v5.0, teach-back 10-point, mdt workflow, pro diary, soap summary, safety labs, biomarkers, ddi checker, rehab nutrition, caregiver sync, treatment journey, clinical calculators');

function stateValue(key) {
  return run(`Boolean(state.safetyRequests[0] && state.safetyRequests[0].${key})`);
}
