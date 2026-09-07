/* LungCare V2 Clinical State Adapter + Consistency Engine
 * Deterministic demo module. It never edits state or approves treatment.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.LungCareConsistency = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function buildClinicalState(source) {
    const s = source || {};
    return {
      patient: s.patient || {},
      plan: s.careLoop?.plan || {},
      therapy: { medication: s.patient?.therapy || 'Not documented', week: s.patient?.week ?? null },
      safety: s.safetyLabs || {},
      medicationSafety: s.medicationSafety || {},
      imaging: s.recist || {},
      decisionBrief: s.decisionBrief || {},
      biomarkers: s.biomarkers || {},
      documentation: {
        diagnosis: s.patient?.diagnosis || null,
        stage: s.patient?.stage || null,
        tnm: s.patient?.tnm || null,
        previsit: s.previsit || {}
      },
      provenance: 'Adapter from LungCare legacy normalized state · SIMULATED'
    };
  }

  function issue(id, severity, title, affectedFields, explanation, reviewAction, provenance) {
    return { id, severity, title, affectedFields, explanation, reviewAction, provenance };
  }

  function detectConsistencyIssues(state) {
    const s = state || {};
    const issues = [];
    const labs = s.safety || {};
    const checks = s.medicationSafety?.checks || [];
    const safetyCheck = checks.find(c => c.id === 'labs');
    if (labs.qtc?.value != null && labs.potassium?.value != null && safetyCheck?.value?.toLowerCase().includes('chưa')) {
      issues.push(issue(
        'SAFETY_DATA_DUPLICATE_MISSING', 'high',
        'Safety labs đã có nhưng Medication Safety vẫn báo thiếu dữ liệu',
        ['safetyLabs.qtc', 'safetyLabs.potassium', 'medicationSafety.checks[labs]'],
        `QTcF ${labs.qtc.value}ms và K+ ${labs.potassium.value} ${labs.potassium.unit || ''} đang có trong safety state, trong khi vùng medication safety ghi “${safetyCheck.value}”.`,
        'Bác sĩ/Điều dưỡng đối chiếu nguồn, ngày lấy mẫu và cập nhật một trạng thái đã xác minh; engine không tự sửa.',
        'Safety Labs state vs Medication Safety Brief · SIMULATED'
      ));
    }

    const tnm = s.documentation?.tnm || '';
    const description = `${s.patient?.diagnosis || ''} ${s.patient?.stage || ''} ${s.imaging?.nonTargetStatus || ''}`.toLowerCase();
    if (tnm === 'cT2bN2M1a' && /xương|bone|màng phổi|pleur/.test(description)) {
      issues.push(issue(
        'TNM_SITE_RECONCILIATION', 'high',
        'TNM cần đối chiếu với vị trí/số lượng di căn đã ghi nhận',
        ['patient.tnm', 'patient.stage', 'recist.nonTargetStatus'],
        `TNM hiện là ${tnm}, nhưng mô tả lâm sàng có đề cập di căn màng phổi/xương. Không đủ dữ liệu để tự sửa staging.`,
        'Bác sĩ xác nhận site, count, modality và ngày đánh giá trước khi ký quyết định.',
        'Legacy TNM + metastatic-site narrative · SIMULATED'
      ));
    }

    if (s.imaging?.sumCurrent != null && s.imaging?.overallResponse && s.imaging?.sumChangePct != null) {
      const imagingCheck = (s.decisionBrief?.safetyGates || []).find(g => /CT|imaging|hình ảnh/i.test(g.label || ''));
      if (imagingCheck?.status === 'missing') {
        issues.push(issue(
          'RECIST_DATA_DUPLICATE_MISSING', 'medium',
          'RECIST đã có nhưng vùng quyết định vẫn báo thiếu imaging',
          ['recist.sumCurrent', 'recist.overallResponse', 'decisionBrief.safetyGates'],
          `RECIST có SLD ${s.imaging.sumCurrent}mm và đáp ứng ${s.imaging.overallResponse}, nhưng gate vẫn ở trạng thái missing.`,
          'Bác sĩ kiểm tra báo cáo CĐHA gốc, xác nhận measurement/review rồi cập nhật gate.',
          'RECIST Assessment vs Decision Brief · SIMULATED'
        ));
      }
    }
    return issues;
  }

  return { buildClinicalState, detectConsistencyIssues };
});
