# UI Design Tokens — TriageAI

> **Mục đích:** File này định nghĩa toàn bộ giá trị cụ thể (màu, spacing, font, ...) cho project này.
> AI phải đọc file này CÙNG LÚC với `ui-principles.md` khi thiết kế bất kỳ màn hình nào.
> Không được dùng bất kỳ giá trị màu hoặc spacing nào NGOÀI file này.

---

## THÔNG TIN PROJECT

```
Tên project    : TriageAI
Đối tượng dùng : Bệnh nhân, bác sĩ, chuyên gia y tế, quản lý/quản trị phòng khám
Nền tảng       : Web
Framework      : React + TypeScript + Vite + Tailwind CSS
Ngôn ngữ UI    : Tiếng Việt
```

---

## 1. COLOR TOKENS

### 1.1 Brand Colors

```css
:root {
  /* ============================================
     PRIMARY — màu nhận diện chính của ứng dụng
     Dùng cho: CTA chính, link, active state, focus ring
  ============================================ */
  --color-primary        : #2A93D5;
  --color-primary-hover  : #1F7FB9;
  --color-primary-light  : #E0F2FE;
  --color-on-primary     : #FFFFFF;

  /* ============================================
     SECONDARY — màu phụ
     Dùng cho: nút hủy, badge, highlight thứ cấp
  ============================================ */
  --color-secondary      : #64748B;
  --color-secondary-hover: #475569;
  --color-on-secondary   : #FFFFFF;

  /* ============================================
     SEMANTIC COLORS — GIỮ NGUYÊN Ý NGHĨA, chỉ đổi sắc thái nếu cần
     Lưu ý: --color-danger PHẢI là màu đỏ/cam đậm (văn hóa: đỏ = nguy hiểm)
             --color-success PHẢI là màu xanh lá
             --color-warning PHẢI là màu vàng/cam
  ============================================ */
  --color-danger         : #DC2626;
  --color-danger-light   : #FEE2E2;
  --color-on-danger      : #FFFFFF;

  --color-success        : #16A34A;
  --color-success-light  : #DCFCE7;
  --color-on-success     : #FFFFFF;

  --color-warning        : #D97706;
  --color-warning-light  : #FEF3C7;
  --color-on-warning     : #1C1917;

  /* ============================================
     NEUTRAL — nền, text, border
  ============================================ */
  --color-bg             : #F4F7FA;
  --color-bg-surface     : #FFFFFF;
  --color-bg-subtle      : #F8FAFC;

  --color-text-primary   : #252F3F;
  --color-text-secondary : #64748B;
  --color-text-disabled  : #CBD5E1;

  --color-border         : #E2E8F0;
  --color-border-focus   : #2A93D5;
}
```

### 1.2 Kiểm tra tương phản bắt buộc (WCAG AA)

Sau khi điền màu, kiểm tra tại https://webaim.org/resources/contrastchecker/

| Cặp màu | Tỉ lệ tối thiểu | Dùng cho |
|---------|----------------|---------|
| `--color-text-primary` trên `--color-bg` | ≥ 4.5:1 | Text thường |
| `--color-on-primary` trên `--color-primary` | ≥ 4.5:1 | Text trong button primary |
| `--color-on-danger` trên `--color-danger` | ≥ 4.5:1 | Text trong button danger |
| `--color-text-secondary` trên `--color-bg` | ≥ 3:1 | Text phụ, placeholder |

---

## 2. TYPOGRAPHY TOKENS

```css
:root {
  /* Font family */
  --font-family-base    : Inter, ui-sans-serif, system-ui, sans-serif;
  --font-family-heading : Inter, ui-sans-serif, system-ui, sans-serif;
  --font-family-mono    : 'JetBrains Mono', monospace;

  /* Font size scale — GIỮ NGUYÊN tỉ lệ, không đổi */
  --font-size-xs  : 0.75rem;   /* 12px */
  --font-size-sm  : 0.875rem;  /* 14px */
  --font-size-md  : 1rem;      /* 16px — base */
  --font-size-lg  : 1.125rem;  /* 18px */
  --font-size-xl  : 1.25rem;   /* 20px */
  --font-size-2xl : 1.5rem;    /* 24px */
  --font-size-3xl : 1.875rem;  /* 30px */
  --font-size-4xl : 2.25rem;   /* 36px */

  /* Font weight */
  --font-weight-regular  : 400;
  --font-weight-medium   : 500;
  --font-weight-semibold : 600;
  --font-weight-bold     : 700;

  /* Line height */
  --line-height-tight  : 1.25;
  --line-height-normal : 1.5;
  --line-height-loose  : 1.75;
}
```

---

## 3. SPACING TOKENS

```css
:root {
  /* Spacing scale — GIỮ NGUYÊN, không đổi */
  --spacing-xs  : 0.25rem;  /* 4px  */
  --spacing-sm  : 0.5rem;   /* 8px  */
  --spacing-md  : 1rem;     /* 16px */
  --spacing-lg  : 1.5rem;   /* 24px */
  --spacing-xl  : 2rem;     /* 32px */
  --spacing-2xl : 3rem;     /* 48px */
  --spacing-3xl : 4rem;     /* 64px */
}
```

---

## 4. SHAPE & ELEVATION TOKENS

```css
:root {
  /* Border radius — có thể chỉnh theo phong cách project */
  --radius-sm   : 4px;
  --radius-md   : 6px;
  --radius-lg   : 8px;
  --radius-xl   : 16px;
  --radius-full : 9999px;  /* pill / badge — GIỮ NGUYÊN */

  /* Box shadow — GIỮ NGUYÊN tỉ lệ, có thể đổi màu nếu project dùng dark theme */
  --shadow-sm : 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md : 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg : 0 10px 15px rgba(0, 0, 0, 0.10);
  --shadow-xl : 0 20px 25px rgba(0, 0, 0, 0.10);
}
```

---

## 5. MOTION TOKENS

```css
:root {
  /* Duration */
  --duration-fast   : 150ms;
  --duration-normal : 250ms;
  --duration-slow   : 400ms;

  /* Easing */
  --ease-default : ease;
  --ease-in      : cubic-bezier(0.4, 0, 1, 1);
  --ease-out     : cubic-bezier(0, 0, 0.2, 1);
  --ease-spring  : cubic-bezier(0.34, 1.56, 0.64, 1); /* cho micro-interaction có "nảy" */

  /* Shorthand */
  --transition-fast   : var(--duration-fast)   var(--ease-default);
  --transition-normal : var(--duration-normal) var(--ease-default);
  --transition-slow   : var(--duration-slow)   var(--ease-out);
}
```

---

## 6. BREAKPOINTS (nếu responsive)

```css
:root {
  /* Dùng trong media query, không dùng trực tiếp trong CSS var() */
  /* --breakpoint-sm  : 640px  */
  /* --breakpoint-md  : 768px  */
  /* --breakpoint-lg  : 1024px */
  /* --breakpoint-xl  : 1280px */
}
```

---

## 7. GHI CHÚ RIÊNG CỦA PROJECT

> Điền vào đây các quy ước đặc biệt của project mà AI cần biết.

```
- Dùng icon outline từ `lucide-react`.
- Sidebar quản lý rộng 240px (`w-60`).
- Dashboard dùng panel/card nền trắng, border slate, shadow nhẹ.
- CTA chính dùng `bg-brand`; hover dùng `#1F7FB9`.
- Trạng thái y tế dùng semantic color nhất quán: danger cho nguy cơ/lỗi, success cho thành công/đang hoạt động, warning cho cảnh báo.
- UI ưu tiên layout nghiệp vụ dạng dashboard/bảng/form, không dùng phong cách landing page trang trí cho màn tác vụ.
- `Fakeeh Care Group` là brand/clinic context hiển thị trong UI; `TriageAI` là tên sản phẩm/app.
```

---

*File này là project-specific. Sao chép và điền lại cho mỗi project mới.*  
*Nguyên tắc thiết kế bất biến nằm trong `ui-principles.md`.*
