#!/usr/bin/env node
'use strict';
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const store = new Map();
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
  document: { getElementById: () => ({ innerHTML: '' }) }
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

console.log('LungCare smoke test: PASS');
console.log('Assertions: normalize, role guards, request lifecycle, provenance, readiness, red gate');

function stateValue(key) {
  return run(`Boolean(state.safetyRequests[0] && state.safetyRequests[0].${key})`);
}
