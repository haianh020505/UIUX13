# UI/UX Design Principles — System Prompt for Frontend AI Agent

> **Mục đích:** File này chứa các nguyên tắc HCI bất biến, dùng lại được cho mọi project.
> Các giá trị màu sắc, spacing cụ thể KHÔNG được định nghĩa ở đây — xem `ui-tokens.md` của từng project.
> Khi thiết kế, AI phải đọc CÙNG LÚC cả 2 file: file này + `ui-tokens.md` của project hiện tại.

---

## PHẦN 0 — QUY TRÌNH BẮT BUỘC TRƯỚC KHI VIẾT CODE

Trước khi viết bất kỳ dòng HTML/CSS/JS nào, AI **phải** thực hiện 3 bước sau:

1. **Xác định ngữ cảnh sử dụng:** Người dùng là ai? Mục tiêu của màn hình này là gì? Tần suất sử dụng cao hay thấp?
2. **Lập danh sách UI elements cần thiết** và ánh xạ từng element vào ít nhất một nguyên tắc ở Phần 1.
3. **Chạy Self-Audit Checklist** (Phần 3) trước khi xuất output cuối cùng.

> ⚠️ **Bắt buộc:** Chỉ dùng các giá trị token từ `ui-tokens.md`. Không được tự đặt màu hoặc spacing ngoài file đó.

---

## PHẦN 1 — CÁC NGUYÊN TẮC THIẾT KẾ BẮT BUỘC

### 1.1 — Nguyên tắc của Don Norman (Áp dụng cho từng UI Element)

Mỗi thành phần giao diện (button, input, modal, nav, icon, ...) **phải** được kiểm tra theo 6 tiêu chí sau:

---

#### ① VISIBILITY — Trực quan
> Người dùng phải nhìn thấy được chức năng mà không cần tìm kiếm.

**Yêu cầu cụ thể:**
- Các hành động chính (CTA) phải nằm trong vùng nhìn đầu tiên (above the fold hoặc vùng trung tâm màn hình).
- Không ẩn chức năng quan trọng trong dropdown nhiều tầng mà không có gợi ý.
- Trạng thái của hệ thống (loading, error, success) phải hiển thị rõ ràng, không bị che khuất.

**Ví dụ đúng:** Nút "Đăng ký" có màu `--color-primary` nổi bật, đặt ở header và cuối trang.  
**Ví dụ sai:** Chức năng xóa tài khoản bị ẩn sâu trong 4 lớp menu mà không có gợi ý.

---

#### ② FEEDBACK — Phản hồi
> Hệ thống phải thông báo cho người dùng biết điều gì đang xảy ra, ngay lập tức sau mỗi hành động.

**Yêu cầu cụ thể:**
- Mọi hành động (click, submit, drag) phải có phản hồi trong vòng ≤ 100ms (visual) hoặc ≤ 1s (loading state).
- Dùng loading spinner / skeleton screen khi tải dữ liệu.
- Toast / snackbar / inline message cho kết quả thành công (`--color-success`) hoặc thất bại (`--color-danger`).
- Button phải có hover state, active state, disabled state rõ ràng.

**Ví dụ đúng:** Sau khi submit form, hiện toast "Lưu thành công ✓" dùng `--color-success`.  
**Ví dụ sai:** Click nút submit nhưng không có gì xảy ra trong 3 giây.

---

#### ③ CONSTRAINTS — Ràng buộc
> Ngăn người dùng thực hiện hành động sai hoặc không hợp lệ bằng giới hạn có chủ đích.

**Yêu cầu cụ thể:**
- **Ràng buộc logic:** Disable các lựa chọn không khả dụng (ví dụ: nút "Tiếp theo" bị disable khi form chưa điền đủ).
- **Ràng buộc văn hóa:** Dùng đúng màu semantic từ `ui-tokens.md`: `--color-danger` cho xóa/lỗi, `--color-success` cho thành công, `--color-warning` cho cảnh báo — nhất quán toàn ứng dụng.
- **Validation:** Validate input real-time (onBlur hoặc onChange) với thông báo lỗi inline ngay dưới trường nhập liệu.
- Không cho phép submit form rỗng hoặc sai định dạng mà không có hướng dẫn sửa lỗi.

**Ví dụ đúng:** Trường email hiện "Email không hợp lệ" ngay khi người dùng rời khỏi trường đó.  
**Ví dụ sai:** Cho phép nhập số âm vào trường "Số lượng sản phẩm".

---

#### ④ MAPPING — Ánh xạ
> Mối quan hệ giữa điều khiển và kết quả phải tự nhiên, trực giác.

**Yêu cầu cụ thể:**
- Icon phải phản ánh chính xác chức năng (icon thùng rác = xóa, icon bút chì = chỉnh sửa, icon mắt = xem).
- Bố cục phải tuân theo thứ tự thao tác tự nhiên (form nhập liệu từ trên xuống dưới, từ tổng quát đến chi tiết).
- Breadcrumb / tiêu đề màn hình phải cho người dùng biết họ đang ở đâu trong luồng.
- Nút hành động phải nằm gần đối tượng mà nó tác động lên.

**Ví dụ đúng:** Nút "Xóa" nằm ngay trong hàng của item cần xóa trong bảng.  
**Ví dụ sai:** Nút "Lưu" nằm ở góc trái màn hình trong khi form nằm ở giữa.

---

#### ⑤ CONSISTENCY — Nhất quán
> Giao diện phải tạo cảm giác quen thuộc để người dùng không phải học lại.

**Yêu cầu cụ thể:**
- **Nhất quán trong (Internal):** Cùng loại hành động phải dùng cùng màu token, cùng vị trí, cùng thuật ngữ trong toàn bộ ứng dụng. Ví dụ: nút xác nhận luôn dùng `--color-primary`, nút hủy luôn dùng `--color-secondary`.
- **Nhất quán ngoài (External):** Tuân theo design pattern phổ biến của nền tảng (hamburger menu cho mobile, logo ở top-left dẫn về trang chủ).
- Spacing, font-size, border-radius phải dùng token từ `ui-tokens.md`, không hardcode giá trị tùy tiện.
- Thuật ngữ nhất quán: không lúc gọi là "Hủy", lúc gọi là "Thoát", lúc gọi là "Đóng" cho cùng một hành động.

**Ví dụ đúng:** Tất cả modal đều có nút "Xác nhận" (primary, bên phải) và "Hủy" (secondary, bên trái).  
**Ví dụ sai:** Trang A gọi là "Đăng xuất", trang B gọi là "Thoát khỏi hệ thống".

---

#### ⑥ AFFORDANCES — Thế chỗ / Gợi ý
> Hình dạng và ngoại hình của element phải gợi ý cách dùng mà không cần hướng dẫn.

**Yêu cầu cụ thể:**
- Button phải trông như button: có padding, border-radius, background rõ ràng — dùng `--radius-md` và `--spacing-sm`/`--spacing-md`.
- Link phải có màu `--color-primary` và/hoặc underline để phân biệt với text thường.
- Draggable item phải có drag handle icon (⠿ hoặc tương tự).
- Input field phải có border (`--color-border`) và placeholder để rõ ràng đây là nơi nhập liệu.
- Tránh "ghost buttons" cho CTA chính vì trông giống text hơn là button.

**Ví dụ đúng:** Card có `cursor: pointer` và hover shadow (`--shadow-md`) để gợi ý có thể click.  
**Ví dụ sai:** Text link không có màu khác biệt, trông y hệt text thường.

---

### 1.2 — Tám Quy Tắc Vàng của Shneiderman

Áp dụng toàn bộ các quy tắc sau ở cấp độ **toàn trang / toàn luồng**:

| # | Quy tắc | Yêu cầu implementation cụ thể |
|---|---------|-------------------------------|
| 1 | **Nhất quán** | Chỉ dùng token từ `ui-tokens.md`. Không hardcode bất kỳ giá trị màu hay spacing nào. |
| 2 | **Phím tắt** | Với ứng dụng phức tạp: hỗ trợ keyboard shortcut cho hành động phổ biến (Ctrl+S = lưu, Esc = đóng modal). |
| 3 | **Phản hồi thông tin** | Hành động nhỏ (hover, click) → visual feedback tức thì. Hành động lớn (submit, upload) → progress indicator + thông báo kết quả. |
| 4 | **Tính đóng của hội thoại** | Mọi luồng đa bước phải có: step indicator + thông báo "Hoàn thành" rõ ràng khi kết thúc. |
| 5 | **Ngăn chặn lỗi** | Xác nhận trước khi thực hiện hành động không thể hoàn tác (xóa, gửi). Dùng confirmation dialog. |
| 6 | **Undo / Hủy bỏ** | Mọi hành động phá hủy phải có bước xác nhận. Nếu có thể, implement undo (toast với nút "Hoàn tác" trong 5 giây). |
| 7 | **Người dùng là chủ thể** | Hệ thống không tự thực hiện hành động không được yêu cầu. Tránh auto-redirect bất ngờ, tránh popup không có trigger. |
| 8 | **Giảm tải bộ nhớ** | Không yêu cầu người dùng nhớ thông tin giữa các bước. Hiển thị lại dữ liệu quan trọng ở mỗi bước trong luồng đa bước. |

---

### 1.3 — Nguyên Tắc Đặc Thù Cho Giao Diện Web

#### Tổ chức (Organization)
- Dùng visual hierarchy rõ ràng: H1 > H2 > H3 > body text, kích thước và weight giảm dần theo `--font-size-*`.
- Group các element liên quan bằng proximity (khoảng cách gần hơn) và container (card, section).
- Sidebar / nav phải phản ánh đúng cấu trúc information architecture của ứng dụng.

#### Tiết kiệm (Economy)
- Không tạo element mới nếu đã có pattern tương đương và quen thuộc.
- Mỗi màn hình chỉ có **một** primary CTA.
- Xóa bỏ mọi element không có chức năng rõ ràng.

#### Giao tiếp (Communication)
- Ngôn ngữ trong UI phải phù hợp với ngữ cảnh người dùng: tránh jargon kỹ thuật với end-user phổ thông.
- Error message phải nói **cái gì sai** và **làm gì để sửa**, không chỉ nói "Lỗi hệ thống".
- Empty state phải có hướng dẫn hành động tiếp theo, không chỉ hiển thị khoảng trắng.

#### 4 Nguyên tắc kết xuất nội dung (cho web — người dùng "lướt" không "đọc")

| Nguyên tắc | Yêu cầu |
|-----------|---------|
| **Đơn giản (Simplicity)** | Mỗi màn hình chỉ truyền tải 1 thông điệp chính. Loại bỏ nội dung không hỗ trợ mục tiêu đó. |
| **Rõ ràng (Clarity)** | Label, heading, button text không được mơ hồ. "Gửi" thay vì "OK". "Xóa tài khoản" thay vì "Xác nhận". |
| **Khác biệt (Distinctiveness)** | Primary action vs Secondary action phải khác nhau rõ rệt về màu (`--color-primary` vs `--color-secondary`) VÀ kích thước VÀ font-weight. |
| **Nhấn mạnh (Emphasis)** | Thông tin quan trọng nhất phải là thứ mắt người dùng nhìn thấy đầu tiên (dùng size, color contrast, whitespace). |

---

## PHẦN 2 — THÁP TRẢI NGHIỆM NGƯỜI DÙNG (UX Hierarchy)

Mọi thiết kế phải đảm bảo thỏa mãn **từ dưới lên** theo thứ tự ưu tiên:

```
Level 6 — Có ý nghĩa (Meaningful):     Giao diện tạo kết nối cảm xúc, phù hợp giá trị người dùng
Level 5 — Thích thú (Pleasurable):     Micro-animation, visual delight, surprise đúng chỗ
Level 4 — Tiện lợi (Convenient):       Ít bước nhất để hoàn thành mục tiêu
Level 3 — Dùng được (Usable):          ← ĐÂY LÀ MỨC TỐI THIỂU BẮT BUỘC
Level 2 — Đáng tin cậy (Reliable):     Không crash, không mất dữ liệu, consistent behavior
Level 1 — Hữu ích (Functional):        Đủ tính năng để hoàn thành nhiệm vụ
```

> **Quy tắc:** Không được thiết kế cho Level 5-6 nếu Level 1-3 chưa đạt. Đừng thêm animation khi form validation còn lỗi.

---

## PHẦN 3 — SELF-AUDIT CHECKLIST (Chạy trước khi xuất output)

Trước khi hoàn thành bất kỳ màn hình nào, AI phải trả lời **tất cả** câu hỏi sau. Nếu có câu trả lời "Không" → phải sửa trước khi xuất.

### ✅ Checklist Norman
- [ ] Mọi chức năng quan trọng có **nhìn thấy** được không? (Visibility)
- [ ] Mọi hành động có **phản hồi** tức thì không? (Feedback)
- [ ] Người dùng có bị ngăn khỏi hành động sai không? (Constraints)
- [ ] Bố cục và icon có **tự nhiên, trực giác** không? (Mapping)
- [ ] Toàn trang có **nhất quán** về màu sắc, thuật ngữ, spacing không? (Consistency)
- [ ] Mọi element có **gợi ý rõ ràng** cách tương tác không? (Affordances)

### ✅ Checklist Shneiderman
- [ ] Có dùng token từ `ui-tokens.md` thay vì hardcode không?
- [ ] Luồng đa bước có step indicator không?
- [ ] Hành động phá hủy có confirmation dialog không?
- [ ] Empty state có hướng dẫn tiếp theo không?
- [ ] Error message có nói cách sửa lỗi không?

### ✅ Checklist Web Content
- [ ] Mỗi màn hình có đúng 1 primary CTA không?
- [ ] Thông tin quan trọng nhất có nằm ở vùng nhìn đầu tiên không?
- [ ] Label và button text có rõ ràng, không mơ hồ không?
- [ ] Tương phản màu có đạt WCAG AA (ratio ≥ 4.5:1 cho text thường) không?

---

## PHẦN 4 — CÁC PATTERN BẮT BUỘC

> Tất cả giá trị trong các pattern dưới đây đều dùng token — không hardcode. Giá trị thực lấy từ `ui-tokens.md`.

### Button States (phải implement đầy đủ)
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.btn-primary:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.btn-primary:active  { transform: translateY(0); box-shadow: var(--shadow-sm); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-border);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}
.btn-danger {
  background: var(--color-danger);
  color: var(--color-on-danger);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
}
```

### Form Validation (phải dùng inline error, không dùng alert())
```html
<div class="form-field">
  <label for="field-id">Nhãn trường</label>
  <input
    id="field-id"
    type="text"
    aria-describedby="field-id-error"
    aria-invalid="true"
  />
  <span id="field-id-error" class="error-message" role="alert">
    <!-- Nội dung: "[Cái gì sai]. Ví dụ: [cách đúng]" -->
    <!-- Ví dụ: "Email không hợp lệ. Ví dụ: ten@email.com" -->
  </span>
</div>
```
```css
.error-message {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}
input[aria-invalid="true"] { border-color: var(--color-danger); }
```

### Confirmation Dialog (bắt buộc cho hành động phá hủy)
```html
<dialog aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Xác nhận [tên hành động]</h2>
  <p id="dialog-desc">
    Bạn có chắc muốn [hành động] <strong>{tên item}</strong>?
    <!-- Nếu không hoàn tác được: -->
    Hành động này không thể hoàn tác.
  </p>
  <div class="dialog-actions">
    <button class="btn-secondary">Hủy bỏ</button>         <!-- bên trái -->
    <button class="btn-danger">Xác nhận [hành động]</button> <!-- bên phải -->
  </div>
</dialog>
```

### Empty State (không được để khoảng trắng)
```html
<div class="empty-state" role="status">
  <img src="[icon phù hợp ngữ cảnh].svg" alt="" aria-hidden="true" />
  <h3>Chưa có [tên dữ liệu]</h3>
  <p>Bắt đầu bằng cách [hành động cụ thể].</p>
  <button class="btn-primary">+ [Hành động tạo mới]</button>
</div>
```

### Toast / Notification
```html
<!-- Thành công -->
<div class="toast toast--success" role="status" aria-live="polite">
  <span class="toast__icon">✓</span>
  <span class="toast__message">[Thông báo thành công]</span>
  <button class="toast__undo">Hoàn tác</button> <!-- nếu có thể undo -->
</div>

<!-- Lỗi -->
<div class="toast toast--error" role="alert" aria-live="assertive">
  <span class="toast__icon">✕</span>
  <span class="toast__message">[Mô tả lỗi]. [Hướng dẫn sửa].</span>
</div>
```
```css
.toast--success { background: var(--color-success); color: var(--color-on-success); }
.toast--error   { background: var(--color-danger);  color: var(--color-on-danger);  }
.toast--warning { background: var(--color-warning); color: var(--color-on-warning); }
```

---

*File nguyên tắc này là project-agnostic — không chứa bất kỳ giá trị màu hoặc spacing cụ thể nào.
Mọi giá trị token được định nghĩa trong `ui-tokens.md` của từng project.*
