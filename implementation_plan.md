# Patient Dashboard — Trang chủ Bệnh nhân

Xây dựng giao diện "Trang chủ" cho Role Bệnh nhân, kế thừa layout **Sidebar trái + Navbar trên** đã dùng cho role Bác sĩ và Quản lý.

## Proposed Changes

### Patient Module — Cấu trúc file mới

Tạo module `src/pages/patient/` tương tự cấu trúc Doctor/Manager, gồm:

---

#### [NEW] [types.ts](file:///d:/HaiAnh-HUST/20252/Giao%20diện%20và%20trải%20nghiệm%20người%20dùng/UIUX13/src/pages/patient/types.ts)

- Định nghĩa `PatientPage`: `'dashboard' | 'ai-chat' | 'booking' | 'health-records' | 'account'`
- Định nghĩa `PatientMenuItem`: `{ id, label, icon }`

---

#### [NEW] [data.ts](file:///d:/HaiAnh-HUST/20252/Giao%20diện%20và%20trải%20nghiệm%20người%20dùng/UIUX13/src/pages/patient/data.ts)

- `patientMenu`: Menu sidebar gồm 5 items: Tổng quan, Hỏi đáp AI, Đặt lịch khám, Hồ sơ sức khỏe, Tài khoản
- `upcomingAppointment`: Mock data lịch hẹn sắp tới (bác sĩ, chuyên khoa, ngày giờ)
- `popularSpecialties`: 4 chuyên khoa phổ biến (Tim mạch, Nhi khoa, Tai Mũi Họng, Tiêu hóa) + icon mapping
- `healthArticles`: 4-5 bài viết cẩm nang y tế (tiêu đề, chuyên mục, ảnh placeholder)
- `patientNotifications`: Thông báo cho bệnh nhân (xác nhận lịch, nhắc khám, kết quả XN, nhắc thuốc)

---

#### [MODIFY] [PatientDashboard.tsx](file:///d:/HaiAnh-HUST/20252/Giao%20diện%20và%20trải%20nghiệm%20người%20dùng/UIUX13/src/pages/patient/PatientDashboard.tsx)

**Thay thế hoàn toàn** file hiện tại (đang dùng `RoleDashboardShell` — placeholder). File mới là **Patient App Shell** với layout pattern giống `ManagerApp.tsx`:
- Sidebar trái (w-60, logo, nav items)
- Top Navbar (nền trắng, shadow mờ, bell icon + user profile snippet)
- Content area render theo `page` state
- State: `page`, `mobileOpen`, `toast`, `confirmLogout`
- Khi `page === 'dashboard'` → render `PatientDashboardHome`
- Các page khác hiện ActionPanel placeholder (giống Manager)

---

#### [NEW] [PatientDashboardHome.tsx](file:///d:/HaiAnh-HUST/20252/Giao%20diện%20và%20trải%20nghiệm%20người%20dùng/UIUX13/src/pages/patient/PatientDashboardHome.tsx)

Dashboard body chia 4 khối:

1. **Khối 1 — Lịch hẹn sắp tới**: Card gradient xanh, bo góc lớn, hiển thị ngày giờ đậm + bác sĩ + chuyên khoa. 2 nút: "Lấy mã QR Check-in" (primary) + "Chỉ đường" (outline).

2. **Khối 2 — Quick Actions**: Grid 3 cột, 3 card lớn bo góc + shadow + hover effect:
   - Hỏi đáp AI Chatbot (icon `Bot`)
   - Khám Chuyên khoa (icon `Stethoscope`)
   - Hồ sơ bệnh án (icon `FolderHeart`)

3. **Khối 3 — Chuyên khoa phổ biến**: Header row (tiêu đề + "Xem tất cả"), Grid 4 cột, mỗi thẻ có icon minh họa lớn + tên khoa, hover translateY(-4px).

4. **Khối 4 — Cẩm nang y tế**: Horizontal scroll container (overflow-x-auto, ẩn scrollbar), mỗi card có ảnh cover 16:9, tiêu đề 2 dòng clamp, tag chuyên mục màu xanh.

---

#### [MODIFY] [styles.css](file:///d:/HaiAnh-HUST/20252/Giao%20diện%20và%20trải%20nghiệm%20người%20dùng/UIUX13/src/styles.css)

Thêm CSS cho Patient Dashboard (dùng CSS tokens, không hardcode):
- `.patient-shell`: min-height, bg, font
- `.patient-appointment-card`: gradient nền xanh, bo góc lớn
- `.patient-quick-action`: card lớn bo góc + hover shadow/scale
- `.patient-specialty-card`: hover translateY + shadow transition
- `.patient-articles-scroll`: horizontal scroll, ẩn scrollbar
- `.patient-article-card`: ảnh 16:9 + clamp text

---

### Routing & Auth

#### [MODIFY] [NotificationBell.tsx](file:///d:/HaiAnh-HUST/20252/Giao%20diện%20và%20trải%20nghiệm%20người%20dùng/UIUX13/src/components/common/NotificationBell.tsx)

Bổ sung notification target types cho Patient vào `NotificationTarget` union type.

---

## Verification Plan

### Automated Tests
- Run `npm run build` — phải pass không lỗi TypeScript/compile
- Truy cập `/patient-dashboard` — render layout Sidebar + Navbar + 4 khối dashboard

### Manual Verification
- So sánh layout sidebar/navbar với Doctor/Manager — phải nhất quán
- Hover effects trên Quick Actions, Specialty cards, Article cards
- Mobile responsive: sidebar ẩn/hiện qua hamburger menu
- Click thông báo, click menu items, đăng xuất
