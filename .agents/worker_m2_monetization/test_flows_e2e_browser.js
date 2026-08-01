const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://new-tracker-orpin.vercel.app/?tgUserId=8319427555';
const TEST_USER_ID = '8319427555';

async function runBrowserE2E() {
  console.log('=== STARTING BROWSER E2E DOM AUDIT FOR FLOWS 6-8 ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Mobile viewport (Telegram MiniApp style)
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36 Telegram-Android/10.0.0'
  });

  const page = await context.newPage();

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const domResults = {
    flow6_ui: {},
    flow7_ui: {},
    flow8_ui: {}
  };

  try {
    console.log(`Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Take screenshot of home screen
    await page.screenshot({ path: path.join(screenshotsDir, '01_home_screen.png') });
    console.log('Home screen loaded.');

    // --- AUDIT FLOW 6 UI: AI Chat & Limit Paywall Trigger ---
    console.log('\n--- AUDITING FLOW 6 UI: AI Chat & Limit Paywall ---');

    // Click chat button in dock (middle button with MessageCircle icon)
    const chatDockBtn = page.locator('button:has(svg.opacity-80), button:has(svg.w-\\[22px\\])').first();
    await chatDockBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotsDir, '02_ai_chat_modal.png') });

    // Check header text
    const chatHeader = await page.locator('h3:has-text("ИИ-Наставник"), h3:has-text("AI Nutrition Coach")').textContent().catch(() => null);
    console.log('Chat header text:', chatHeader);

    // Check count / limit text
    const limitText = await page.locator('p:has-text("Использовано"), p:has-text("Used")').textContent().catch(() => null);
    console.log('Chat limit header subtitle:', limitText);

    // Check if limit amber banner is displayed
    const amberBannerText = await page.locator('div.bg-amber-50 p').textContent().catch(() => null);
    console.log('Amber banner text:', amberBannerText);

    const chatPaywallBtn = page.locator('button:has-text("Купить Premium"), button:has-text("Premium kaufen")');
    const isChatPaywallBtnVisible = await chatPaywallBtn.isVisible().catch(() => false);
    console.log('Chat Paywall trigger button visible:', isChatPaywallBtnVisible);

    domResults.flow6_ui = {
      chatHeader,
      limitSubtitle: limitText,
      amberBannerText,
      chatPaywallBtnVisible: isChatPaywallBtnVisible
    };

    if (isChatPaywallBtnVisible) {
      console.log('Clicking "Купить Premium" inside AI Chat...');
      await chatPaywallBtn.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '03_paywall_modal_from_chat.png') });

      const upgradeModalHeader = await page.locator('h3:has-text("GainTracker Premium")').textContent().catch(() => null);
      console.log('Upgrade modal triggered from chat header:', upgradeModalHeader);

      const closeModalBtn = page.locator('button:has-text("Закрыть"), button:has-text("Schließen")');
      if (await closeModalBtn.isVisible()) {
        await closeModalBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Close chat bottomsheet
    const closeChatBtn = page.locator('div.shrink-0 button svg path[d="M6 18L18 6M6 6l12 12"]').locator('xpath=ancestor::button');
    if (await closeChatBtn.isVisible()) {
      await closeChatBtn.click();
      await page.waitForTimeout(500);
    }

    // --- AUDIT FLOW 7 UI: Premium Paywall Modal & Payment Button Interactivity ---
    console.log('\n--- AUDITING FLOW 7 UI: Premium Paywall Modal & Payment Button ---');

    // Navigate to Profile tab (last icon in dock)
    const dockButtons = page.locator('div.grid-cols-5 button');
    const profileDockBtn = dockButtons.nth(4); // 5th button (Profile / User icon)
    await profileDockBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(screenshotsDir, '04_profile_tab.png') });

    // Check Subscription Card
    const subCardText = await page.locator('div:has-text("ПОДПИСКА"), div:has-text("ABO")').first().textContent().catch(() => null);
    console.log('Profile Subscription card:', subCardText ? subCardText.trim().replace(/\s+/g, ' ') : null);

    const upgradeBtnProfile = page.locator('button:has-text("Upgrade до Premium"), button:has-text("Upgrade auf Premium")').first();
    const isUpgradeBtnProfileVisible = await upgradeBtnProfile.isVisible().catch(() => false);
    console.log('Upgrade button on Profile tab visible:', isUpgradeBtnProfileVisible);

    domResults.flow7_ui = {
      subscriptionCardSummary: subCardText ? subCardText.trim().replace(/\s+/g, ' ') : null,
      upgradeButtonVisible: isUpgradeBtnProfileVisible
    };

    if (isUpgradeBtnProfileVisible) {
      console.log('Clicking "Upgrade до Premium" on Profile tab...');

      // Listen for network requests to /api/profile/subscribe
      let subscribeApiCalled = false;
      let subscribeApiResponsePayload = null;

      page.on('response', async (response) => {
        if (response.url().includes('/api/profile/subscribe')) {
          subscribeApiCalled = true;
          subscribeApiResponsePayload = await response.json().catch(() => ({}));
          console.log('[Network] Intercepted /api/profile/subscribe response:', response.status(), subscribeApiResponsePayload);
        }
      });

      await upgradeBtnProfile.click();
      await page.waitForTimeout(2000);

      domResults.flow7_ui.subscribeApiCalled = subscribeApiCalled;
      domResults.flow7_ui.subscribeApiResponsePayload = subscribeApiResponsePayload;
    }

    // --- AUDIT FLOW 8 UI: Referral System ---
    console.log('\n--- AUDITING FLOW 8 UI: Referral System ---');

    // On Profile tab, find ReferralCard
    const refCardHeader = await page.locator('h3:has-text("Реферальная программа"), h3:has-text("Empfehlungsprogramm")').textContent().catch(() => null);
    console.log('Referral Card header:', refCardHeader);

    // Points badge text
    const pointsBadge = await page.locator('span:has-text("баллов"), span:has-text("Punkte")').first().textContent().catch(() => null);
    console.log('Points badge text:', pointsBadge ? pointsBadge.trim() : null);

    // Referral link input value
    const refLinkInput = page.locator('input[readonly][value*="t.me/TrackerCPFC_bot"]');
    const refLinkValue = await refLinkInput.getAttribute('value').catch(() => null);
    console.log('Referral Link Input value:', refLinkValue);

    // Test Copy button
    const copyBtn = page.locator('button:has-text("Скопировать"), button:has-text("Kopieren")').first();
    const isCopyBtnVisible = await copyBtn.isVisible().catch(() => false);
    let copyButtonTested = false;
    let copiedStateText = null;

    if (isCopyBtnVisible) {
      await copyBtn.click();
      await page.waitForTimeout(500);
      copiedStateText = await page.locator('button:has-text("Скопировано"), button:has-text("Kopiert")').textContent().catch(() => null);
      console.log('After clicking Copy button, button state text:', copiedStateText ? copiedStateText.trim() : null);
      copyButtonTested = Boolean(copiedStateText);
    }

    // Check Share button
    const shareBtn = page.locator('button:has-text("Поделиться"), button:has-text("Teilen")').first();
    const isShareBtnVisible = await shareBtn.isVisible().catch(() => false);
    console.log('Share button visible:', isShareBtnVisible);

    // Check Redeem button
    const redeemBtn = page.locator('button:has-text("Получить 1 месяц Premium"), button:has-text("1 Monat Premium einlösen")').first();
    const isRedeemBtnVisible = await redeemBtn.isVisible().catch(() => false);
    const isRedeemBtnDisabled = await redeemBtn.isDisabled().catch(() => false);
    console.log('Redeem button visible:', isRedeemBtnVisible, '| disabled:', isRedeemBtnDisabled);

    await page.screenshot({ path: path.join(screenshotsDir, '05_referral_card.png') });

    domResults.flow8_ui = {
      cardHeader: refCardHeader,
      pointsBadgeText: pointsBadge ? pointsBadge.trim() : null,
      referralLinkValue: refLinkValue,
      referralLinkValidFormat: refLinkValue === `https://t.me/TrackerCPFC_bot?start=ref_${TEST_USER_ID}`,
      copyButtonTested,
      copiedStateText: copiedStateText ? copiedStateText.trim() : null,
      shareBtnVisible: isShareBtnVisible,
      redeemBtnVisible: isRedeemBtnVisible,
      redeemBtnDisabled: isRedeemBtnDisabled
    };

  } catch (err) {
    console.error('Browser E2E Audit Exception:', err);
    domResults.error = err.message;
  } finally {
    await browser.close();
  }

  fs.writeFileSync(
    path.join(__dirname, 'browser_e2e_results.json'),
    JSON.stringify(domResults, null, 2)
  );
  console.log('\nSaved Browser E2E results to browser_e2e_results.json');
}

runBrowserE2E();
