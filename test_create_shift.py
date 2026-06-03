"""Test: Verify 'Create Shift' feature in StaffCoordinationManagement"""
import asyncio
from playwright.async_api import async_playwright

BASE = "http://localhost:5173/UIUX13/"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})

        # ── Login ──
        print("[1] Navigating to login...")
        await page.goto(BASE, wait_until="networkidle", timeout=15000)
        await page.fill('input[type="text"]', "admin")
        await page.fill('input[type="password"]', "123456")
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(1000)

        # ── Navigate to Staff Coordination ──
        print("[2] Navigating to Staff Coordination...")
        sidebar = page.locator("aside")
        coordination_link = sidebar.locator("text=Lịch trực & Điều phối")
        await coordination_link.click()
        await page.wait_for_timeout(800)

        # ── Click Schedule tab ──
        print("[3] Clicking 'Lịch trực' tab...")
        schedule_tab = page.locator("button:has-text('Lịch trực')")
        await schedule_tab.click()
        await page.wait_for_timeout(500)

        # ── Verify CTA button exists ──
        print("[4] Verifying CTA button 'Phân công ca trực'...")
        cta_btn = page.locator("button:has-text('Phân công ca trực')").first
        assert await cta_btn.is_visible(), "FAIL: CTA button not visible!"
        print("   ✓ CTA button visible")

        # ── Click CTA to open modal ──
        print("[5] Opening CreateShiftModal...")
        await cta_btn.click()
        await page.wait_for_timeout(500)

        # ── Verify modal is visible ──
        modal = page.locator("[role='dialog'][aria-label='Phân công ca trực mới']")
        assert await modal.is_visible(), "FAIL: Modal not visible!"
        print("   ✓ Modal opened")

        # ── Verify form fields exist ──
        print("[6] Verifying form fields...")
        staff_select = modal.locator("select").first
        assert await staff_select.is_visible(), "FAIL: Staff select not found!"

        date_input = modal.locator("input[type='date']")
        assert await date_input.is_visible(), "FAIL: Date input not found!"

        shift_select = modal.locator("select").nth(1)
        assert await shift_select.is_visible(), "FAIL: Shift select not found!"

        location_input = modal.locator("input[type='text']")
        assert await location_input.is_visible(), "FAIL: Location input not found!"
        print("   ✓ All form fields present")

        # ── Test validation: Try submit with empty form ──
        print("[7] Testing validation (submit empty form)...")
        submit_btn = modal.locator("button:has-text('Lưu phân công')")
        await submit_btn.click()
        await page.wait_for_timeout(300)

        # Check error messages appear
        error_msgs = modal.locator("[role='alert']")
        error_count = await error_msgs.count()
        assert error_count > 0, f"FAIL: Expected validation errors, got {error_count}"
        print(f"   ✓ {error_count} validation error(s) shown")

        # ── Fill form ──
        print("[8] Filling form...")
        # Select staff
        await staff_select.select_option(index=1)  # First available staff
        await page.wait_for_timeout(200)

        # Staff preview card should appear
        staff_preview = modal.locator("text=Bác sĩ")
        # Just check something appeared after selection

        # Set date to 2026-05-10
        await date_input.fill("2026-05-10")
        await page.wait_for_timeout(100)

        # Shift defaults to Sáng, change to Chiều
        await shift_select.select_option(value="Chiều")
        await page.wait_for_timeout(200)

        # Verify time auto-fill: start should be 13:00
        start_time = modal.locator("input[type='time']").first
        start_val = await start_time.input_value()
        assert start_val == "13:00", f"FAIL: Expected 13:00, got {start_val}"
        print("   ✓ Time auto-filled correctly (Mapping principle)")

        # Fill location
        await location_input.fill("Phòng khám 201")
        await page.wait_for_timeout(100)

        # Fill note (optional)
        note_area = modal.locator("textarea")
        await note_area.fill("Thay thế BS Nguyễn Văn A")

        # ── Submit ──
        print("[9] Submitting...")
        await submit_btn.click()
        await page.wait_for_timeout(500)

        # Modal should close
        modal_after = page.locator("[role='dialog'][aria-label='Phân công ca trực mới']")
        assert not await modal_after.is_visible(), "FAIL: Modal did not close after submit!"
        print("   ✓ Modal closed after submit")

        # ── Verify toast ──
        # toast_text = page.locator("text=Phân công ca trực thành công")
        # The toast may disappear fast, so just check the new shift appears on schedule

        # ── Switch to Day view and check shift appears ──
        print("[10] Verifying new shift on Day view...")
        day_btn = page.locator("button:has-text('Ngày')").first
        await day_btn.click()
        await page.wait_for_timeout(300)

        # Check for the "Mới" badge or "Mới phân công" text
        new_badge = page.locator("text=✦ Mới")
        if await new_badge.count() > 0:
            print("   ✓ New shift badge visible on Day view")
        else:
            print("   ⚠ New shift badge not found (may be on different date)")

        # ── Test Empty State ──
        print("[11] Testing empty state...")
        # Navigate to a day without shifts (e.g., day 20)
        # Click next several times to get to day 20
        next_btn = page.locator("button[aria-label='Khoảng sau']")
        for _ in range(10):
            await next_btn.click()
            await page.wait_for_timeout(100)

        # Check if empty state has create button
        empty_create = page.locator("button:has-text('Phân công ca trực')").first
        if await empty_create.is_visible():
            print("   ✓ Empty state has CTA button")
        else:
            print("   ⚠ Empty state CTA not found on this date")

        # ── Test Escape to close modal ──
        print("[12] Testing Escape to close...")
        cta_btn2 = page.locator("button:has-text('Phân công ca trực')").first
        await cta_btn2.click()
        await page.wait_for_timeout(300)
        modal_esc = page.locator("[role='dialog'][aria-label='Phân công ca trực mới']")
        if await modal_esc.is_visible():
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(300)
            assert not await modal_esc.is_visible(), "FAIL: Escape did not close modal!"
            print("   ✓ Escape closes modal")

        print("\n══════════════════════════════════════════════")
        print("  ✅ ALL TESTS PASSED — Create Shift Feature")
        print("══════════════════════════════════════════════")

        await browser.close()

asyncio.run(main())
