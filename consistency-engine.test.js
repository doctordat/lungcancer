const assert = require('assert');
const { buildClinicalState, detectConsistencyIssues } = require('./consistency-engine');
const source = {
  patient: { diagnosis:'NSCLC adenocarcinoma', stage:'IVA', tnm:'cT2bN2M1a', therapy:'Osimertinib 80 mg/ngày', week:6 },
  careLoop: { plan:{ planId:'PLAN-LC-01', revision:1 } },
  safetyLabs: { qtc:{ value:432, unit:'ms' }, potassium:{ value:4.1, unit:'mmol/L' } },
  medicationSafety: { checks:[{ id:'labs', value:'QTc/điện giải chưa có' }] },
  recist: { sumCurrent:33, sumChangePct:-34, overallResponse:'PR (Đáp ứng một phần)', nonTargetStatus:'Di căn xương ghi nhận' },
  decisionBrief: { safetyGates:[{ label:'CT tuần 8 / imaging', status:'missing' }] }
};
const clinicalState = buildClinicalState(source);
const issues = detectConsistencyIssues(clinicalState);
assert.strictEqual(issues.length, 3);
assert.deepStrictEqual(issues.map(i => i.id), ['SAFETY_DATA_DUPLICATE_MISSING','TNM_SITE_RECONCILIATION','RECIST_DATA_DUPLICATE_MISSING']);
assert.ok(issues.every(i => i.provenance.includes('SIMULATED')));
assert.ok(issues.every(i => i.reviewAction && i.explanation && i.affectedFields.length));
assert.strictEqual(clinicalState.therapy.medication, 'Osimertinib 80 mg/ngày');
console.log('LungCare V2 consistency tests: PASS');
console.log('Assertions: adapter, 3 contradictions, provenance, review actions');
