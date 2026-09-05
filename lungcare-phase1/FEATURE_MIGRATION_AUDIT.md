# BẢNG PHÂN BỔ KIỂM TOÁN TÍNH NĂNG (FEATURE MIGRATION AUDIT)
## Nguyên tắc: Hide complexity, not remove capability

| # | Tính năng hiện có | Vị trí cũ (Trang dài) | Role | Tầng IA | Vị trí mới (Mobile-First / Drill-down) |
|---|---|---|---|---|---|
| 1 | Uống thuốc & Báo quên liều | Patient Home (top) | Patient | Primary | **Patient > Hôm nay** (Hero Card) |
| 2 | Nhắc lịch tái khám | Patient Home (top) | Patient | Primary | **Patient > Hôm nay** (Appointment Card) |
| 3 | Khai nhanh trước khám | Patient Home (giữa) | Patient | Primary/Secondary | **Patient > Hôm nay** & **Patient > Sức khỏe** |
| 4 | Báo triệu chứng (Triage) | Patient Home (giữa) | Patient | Primary/Critical | **Patient > Hôm nay** & **Patient > Sức khỏe (+ Báo triệu chứng)** |
| 5 | Nhật ký sức khỏe (PRO Diary 30s) | Patient Home (cuộn sâu) | Patient | Secondary | **Patient > Sức khỏe > Nhật ký sức khỏe** |
| 6 | Biểu đồ xu hướng độc tính 7 ngày | Doctor / Patient (cuộn sâu) | Patient/Doctor | Secondary | **Patient > Sức khỏe > Xu hướng** & **Doctor > Bệnh nhân > Xu hướng PRO** |
| 7 | Bài tập thở phục hồi chức năng phổi | Patient Home (cuộn sâu) | Patient | Secondary | **Patient > Hôm nay** (Nhiệm vụ) & **Patient > Điều trị > Phục hồi phổi** |
| 8 | Hướng dẫn xuất viện A4 | Patient Home (cuộn sâu) | Patient | Secondary/Tertiary | **Patient > Điều trị > Hướng dẫn chăm sóc tại nhà** |
| 9 | Hộ chiếu Sức khỏe QR & FHIR JSON | Patient Home (cuộn sâu) | Patient/Doctor | Secondary | **Patient > Tôi > Thẻ Hộ chiếu Y tế** & **Doctor > Thêm > FHIR Passport** |
| 10 | Trợ lý Bác sĩ AI 24/7 | Patient Home (cuộn sâu) | Patient | Secondary | **Patient > Hỗ trợ > Bác sĩ AI 24/7** |
| 11 | Đồng bộ Người nhà (SMS Caregiver) | Patient Home (cuộn sâu) | Patient | Secondary | **Patient > Hỗ trợ > Người chăm sóc & SMS** |
| 12 | Decision Brief & Evidence Map | Doctor Home (cuộn sâu) | Doctor | Primary/Secondary | **Doctor > Tổng quan** (Tóm tắt ca) & **Doctor > Bệnh nhân > Evidence Map** |
| 13 | NCCN / ESMO Pathway Category 1 | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Bệnh nhân > Phác đồ NCCN** & **Command Search: `NCCN`** |
| 14 | RECIST 1.1 Assessment Brief | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Bệnh nhân > Đo lường RECIST 1.1** & **Command Search: `RECIST`** |
| 15 | CTCAE v5.0 Toxicity Guide | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Bệnh nhân > Xử trí độc tính CTCAE** & **Command Search: `CTCAE`** |
| 16 | Máy tính Y khoa chuẩn MDCalc | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Thêm > Máy tính Lâm sàng** & **Command Search: `MDCalc` / `CrCl` / `QT`** |
| 17 | Đột biến Gen & ctDNA Động học | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Bệnh nhân > Sinh học phân tử & ctDNA** & **Command Search: `GEN` / `ctDNA`** |
| 18 | Phả hệ Di truyền 3 Thế hệ | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Thêm > Phả hệ Di truyền** & **Command Search: `Phả hệ`** |
| 19 | DDI Pharmacopeia & Tương tác thuốc | Doctor/Nurse (cuộn sâu) | Doctor/Nurse | Secondary/Tertiary | **Doctor > Bệnh nhân > Tương tác DDI** & **Nurse > Dược thư DDI** |
| 20 | Hội chẩn Đa chuyên khoa MDT | Doctor Home (cuộn sâu) | Doctor | Secondary/Tertiary | **Doctor > Bệnh nhân > Hội đồng MDT** & **Command Search: `MDT`** |
| 21 | Phân bổ Công việc & Chi phí RVU | Doctor/Nurse (cuộn sâu) | Doctor/Nurse | Secondary/Tertiary | **Doctor > Thêm > Phân bổ RVU** & **Nurse > Thêm > Phân bổ RVU** |
| 22 | Tiếp nhận & Đo sinh hiệu (Intake) | Nurse Home (cuộn sâu) | Nurse | Primary | **Nurse > Hôm nay** & **Nurse > Tiếp nhận ca** |
| 23 | Bàn giao Teach-back 10 điểm | Nurse Home (cuộn sâu) | Nurse | Primary/Secondary | **Nurse > Công việc > Bàn giao Teach-back** |
| 24 | Lịch Tiêm chủng & Dự toán BHYT | Nurse/Patient (cuộn sâu) | Nurse/Patient | Secondary | **Nurse > Thêm > Tiêm chủng & BHYT** & **Patient > Tôi > BHYT** |
| 25 | Báo động Đỏ Khẩn cấp (Red Alert) | Toàn app | All | Critical | **CRITICAL SAFETY OVERLAY (Ghi đè hiển thị ở mọi Tab khi kích hoạt)** |
