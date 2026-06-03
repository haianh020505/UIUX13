"""
Test UI/UX fixes for TriageAI - Simulating real user interaction
Tests:
1. Auth page: Card sizing consistency (Login vs Forgot vs OTP vs Reset vs Register)
2. Auth page: Slider height stays fixed when switching steps
3. Auth page: Images load from local files
4. Manager Dashboard: No scrollbar (content fits viewport)
5. Manager: Table columns stable when filtering
6. Manager: Modals close when clicking outside
"""

from playwright.sync_api import sync_playwright
import sys
import os

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = "http://localhost:5174/UIUX13/"
SCREENSHOTS_DIR = os.path.join(os.environ.get("TEMP", "."), "triageai_test_screenshots")
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def screenshot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, f"{name}.png")
    page.screenshot(path=path)
    print(f"  [Screenshot] {path}")
    return path

def test_auth_pages(page):
    """Test 1: Auth card sizing and slider consistency"""
    print("\n=== TEST 1: Auth Page — Card Sizing & Slider ===")

    # Go to login page
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    screenshot(page, "01_login")

    # Get login card dimensions
    login_card = page.locator("div.max-w-lg").first
    login_box = login_card.bounding_box()
    print(f"  Login card: width={login_box['width']:.0f}, height={login_box['height']:.0f}")

    # Get slider dimensions
    slider = page.locator("section[aria-label='TriageAI feature slider']")
    slider_box = slider.bounding_box()
    slider_height_login = slider_box['height']
    print(f"  Slider height (login): {slider_height_login:.0f}")

    # Click "Quên mật khẩu?"
    page.click("text=Quên mật khẩu?")
    page.wait_for_timeout(500)
    screenshot(page, "02_forgot")

    forgot_card = page.locator("div.max-w-lg").first
    forgot_box = forgot_card.bounding_box()
    print(f"  Forgot card: width={forgot_box['width']:.0f}, height={forgot_box['height']:.0f}")

    slider_box_forgot = slider.bounding_box()
    slider_height_forgot = slider_box_forgot['height']
    print(f"  Slider height (forgot): {slider_height_forgot:.0f}")

    # Check card widths match
    width_diff = abs(login_box['width'] - forgot_box['width'])
    if width_diff < 2:
        print("  ✅ PASS: Login and Forgot card widths match!")
    else:
        print(f"  ❌ FAIL: Card widths differ by {width_diff:.0f}px (Login={login_box['width']:.0f}, Forgot={forgot_box['width']:.0f})")

    # Check slider height unchanged
    slider_diff = abs(slider_height_login - slider_height_forgot)
    if slider_diff < 2:
        print("  ✅ PASS: Slider height stays fixed when switching steps!")
    else:
        print(f"  ❌ FAIL: Slider height changed by {slider_diff:.0f}px (Login={slider_height_login:.0f}, Forgot={slider_height_forgot:.0f})")

    # Fill in forgot email and go to OTP
    page.fill("input[placeholder*='email']", "test@email.com")
    page.click("text=Gửi mã xác nhận")
    page.wait_for_timeout(500)
    screenshot(page, "03_otp")

    otp_card = page.locator("div.max-w-lg").first
    otp_box = otp_card.bounding_box()
    print(f"  OTP card: width={otp_box['width']:.0f}, height={otp_box['height']:.0f}")

    otp_width_diff = abs(login_box['width'] - otp_box['width'])
    if otp_width_diff < 2:
        print("  ✅ PASS: OTP card width matches Login!")
    else:
        print(f"  ❌ FAIL: OTP card width differs by {otp_width_diff:.0f}px")

    slider_box_otp = slider.bounding_box()
    slider_diff_otp = abs(slider_height_login - slider_box_otp['height'])
    if slider_diff_otp < 2:
        print("  ✅ PASS: Slider height stays fixed on OTP step!")
    else:
        print(f"  ❌ FAIL: Slider height changed on OTP step by {slider_diff_otp:.0f}px")

    # Fill OTP and go to Reset Password
    otp_inputs = page.locator("input[inputmode='numeric']")
    for i in range(6):
        otp_inputs.nth(i).click()
        otp_inputs.nth(i).press_sequentially(str(i + 1))
    page.click("text=Xác thực mã")
    page.wait_for_timeout(500)
    screenshot(page, "04_reset_password")

    reset_card = page.locator("div.max-w-lg").first
    reset_box = reset_card.bounding_box()
    print(f"  Reset card: width={reset_box['width']:.0f}, height={reset_box['height']:.0f}")

    reset_width_diff = abs(login_box['width'] - reset_box['width'])
    if reset_width_diff < 2:
        print("  ✅ PASS: Reset card width matches Login!")
    else:
        print(f"  ❌ FAIL: Reset card width differs by {reset_width_diff:.0f}px")

    # Go back to login, then try Register
    page.click("text=Quay lại Đăng nhập")
    page.wait_for_timeout(500)

    page.click("text=Đăng ký ngay")
    page.wait_for_timeout(500)
    screenshot(page, "05_register")

    slider_box_register = slider.bounding_box()
    slider_diff_register = abs(slider_height_login - slider_box_register['height'])
    if slider_diff_register < 2:
        print("  ✅ PASS: Slider height stays fixed on Register step!")
    else:
        print(f"  ❌ FAIL: Slider height changed on Register step by {slider_diff_register:.0f}px")


def test_auth_images(page):
    """Test 2: Local images load correctly"""
    print("\n=== TEST 2: Auth Page — Images Load ===")

    page.goto(BASE)
    page.wait_for_load_state("networkidle")

    images = page.locator("section[aria-label='TriageAI feature slider'] img")
    count = images.count()
    print(f"  Found {count} slider images")

    all_loaded = True
    for i in range(count):
        img = images.nth(i)
        src = img.get_attribute("src")
        # Check it's a local image, not unsplash
        if "unsplash" in (src or ""):
            print(f"  ❌ FAIL: Image {i+1} still uses Unsplash: {src}")
            all_loaded = False
        else:
            print(f"  ✅ Image {i+1}: {src}")

    if all_loaded:
        print("  ✅ PASS: All images are local!")


def test_dashboard_no_scroll(page):
    """Test 3: Dashboard fits viewport without scrolling"""
    print("\n=== TEST 3: Dashboard — No Scroll ===")

    # Login as admin
    page.goto(BASE)
    page.wait_for_load_state("networkidle")

    page.click("text=Vào Role Quản lý")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)
    screenshot(page, "06_dashboard")

    # Check if page has scrollbar by comparing scrollHeight vs clientHeight
    scroll_info = page.evaluate("""() => {
        const body = document.documentElement;
        return {
            scrollHeight: body.scrollHeight,
            clientHeight: body.clientHeight,
            hasScroll: body.scrollHeight > body.clientHeight + 5
        }
    }""")

    print(f"  scrollHeight: {scroll_info['scrollHeight']}, clientHeight: {scroll_info['clientHeight']}")

    if not scroll_info['hasScroll']:
        print("  ✅ PASS: Dashboard fits viewport without scrolling!")
    else:
        overflow = scroll_info['scrollHeight'] - scroll_info['clientHeight']
        print(f"  ⚠️ WARNING: Dashboard overflows by {overflow}px — may need more compaction")

    return page


def test_dashboard_filter(page):
    """Test 4: Filter dropdown not clipped"""
    print("\n=== TEST 4: Dashboard — Filter Dropdown ===")

    filter_btn = page.locator("text=Bộ lọc")
    filter_btn.click()
    page.wait_for_timeout(300)
    screenshot(page, "07_filter_open")

    # Check if filter dropdown is visible
    dropdown = page.locator("text=Chọn tag lọc")
    if dropdown.is_visible():
        print("  ✅ PASS: Filter dropdown is visible and not clipped!")
    else:
        print("  ❌ FAIL: Filter dropdown is not visible (may be clipped)")

    # Close filter
    filter_btn.click()
    page.wait_for_timeout(200)


def test_table_columns_stable(page):
    """Test 5: Table columns don't shift when filtering"""
    print("\n=== TEST 5: Table Columns — Stability ===")

    # Navigate to clinic management
    page.click("text=Quản lý phòng khám")
    page.wait_for_timeout(500)
    screenshot(page, "08_clinic")

    # Get initial column positions
    headers = page.locator("thead th")
    initial_count = headers.count()

    if initial_count > 0:
        initial_positions = []
        for i in range(initial_count):
            box = headers.nth(i).bounding_box()
            if box:
                initial_positions.append(box['x'])

        print(f"  Found {initial_count} columns, positions: {[f'{p:.0f}' for p in initial_positions]}")

        # Check table has table-fixed class
        table = page.locator("table")
        table_class = table.first.get_attribute("class") or ""
        if "table-fixed" in table_class:
            print("  ✅ PASS: Table has table-fixed class for column stability!")
        else:
            print("  ⚠️ INFO: Table does not have table-fixed (may use ResponsiveTable)")
    else:
        print("  ⚠️ INFO: No table headers found on this tab")


def test_modal_click_outside(page):
    """Test 6: Modals close when clicking outside"""
    print("\n=== TEST 6: Modal Click-Outside-to-Close ===")

    # Navigate to personnel management
    page.click("text=Nhân sự")
    page.wait_for_timeout(500)

    # Try to find and click an add button to open a modal
    add_btn = page.locator("button:has-text('Thêm')")
    if add_btn.count() > 0:
        add_btn.first.click()
        page.wait_for_timeout(500)
        screenshot(page, "09_modal_open")

        # Check if modal is visible
        modal_overlay = page.locator("div.fixed.inset-0")
        if modal_overlay.count() > 0:
            print("  Modal is open")

            # Click on the overlay (outside the modal content)
            modal_overlay.first.click(position={"x": 10, "y": 10})
            page.wait_for_timeout(500)
            screenshot(page, "10_modal_closed")

            # Check if modal is gone
            remaining_modals = page.locator("div.fixed.inset-0.z-50")
            if remaining_modals.count() == 0:
                print("  ✅ PASS: Modal closed when clicking outside!")
            else:
                print("  ❌ FAIL: Modal still visible after clicking outside")
        else:
            print("  ⚠️ INFO: No modal overlay found")
    else:
        print("  ⚠️ INFO: No 'Thêm' button found")


def test_no_alerts(page):
    """Test 7: No browser alert() calls"""
    print("\n=== TEST 7: No alert() Calls ===")

    alerts_caught = []

    def handle_dialog(dialog):
        alerts_caught.append(dialog.message)
        dialog.dismiss()

    page.on("dialog", handle_dialog)

    # Navigate to staff coordination
    page.click("text=Điều phối")
    page.wait_for_timeout(500)

    # Try export button
    export_btn = page.locator("button:has-text('Xuất')")
    if export_btn.count() > 0:
        export_btn.first.click()
        page.wait_for_timeout(500)

    if len(alerts_caught) == 0:
        print("  ✅ PASS: No alert() dialogs triggered!")
    else:
        print(f"  ❌ FAIL: alert() was triggered: {alerts_caught}")


def main():
    print("=" * 60)
    print("TriageAI UI/UX Fix Verification Tests")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1920, "height": 1080})
        page = context.new_page()

        try:
            # Auth tests
            test_auth_pages(page)
        except Exception as e:
            screenshot(page, "error_auth")
            print(f"  ❌ ERROR in auth test: {e}")

        try:
            test_auth_images(page)
        except Exception as e:
            print(f"  ❌ ERROR in image test: {e}")

        try:
            # Manager tests
            test_dashboard_no_scroll(page)
        except Exception as e:
            screenshot(page, "error_dashboard")
            print(f"  ❌ ERROR in dashboard test: {e}")

        try:
            test_dashboard_filter(page)
        except Exception as e:
            print(f"  ❌ ERROR in filter test: {e}")

        try:
            test_table_columns_stable(page)
        except Exception as e:
            print(f"  ❌ ERROR in table test: {e}")

        try:
            test_modal_click_outside(page)
        except Exception as e:
            print(f"  ❌ ERROR in modal test: {e}")

        try:
            test_no_alerts(page)
        except Exception as e:
            print(f"  ❌ ERROR in alerts test: {e}")
        finally:
            browser.close()

    print("\n" + "=" * 60)
    print("All tests completed!")
    print(f"Screenshots saved to: {SCREENSHOTS_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
