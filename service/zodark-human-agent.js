const path = require('path');
const fs = require('fs');

// Try importing playwright from local node_modules
let chromium;
try {
  chromium = require('playwright').chromium;
} catch (e) {
  try {
    const playwrightPath = path.join(__dirname, 'youtube-automation-agent-master', 'node_modules', 'playwright');
    if (fs.existsSync(playwrightPath)) {
      chromium = require(playwrightPath).chromium;
    }
  } catch (err) {
    console.error("[Zodark Human Agent] Playwright load notice:", err.message);
  }
}

async function runHumanAgent() {
  const args = process.argv.slice(2);
  const actionArg = args.find(a => a.startsWith('--action='));
  const platformArg = args.find(a => a.startsWith('--platform='));
  const urlArg = args.find(a => a.startsWith('--url='));
  const queryArg = args.find(a => a.startsWith('--query='));

  const action = actionArg ? actionArg.split('=')[1] : 'open_url';
  const platform = platformArg ? platformArg.split('=')[1] : 'instagram';
  let targetUrl = urlArg ? urlArg.split('=')[1] : 'https://www.instagram.com';
  const query = queryArg ? decodeURIComponent(queryArg.split('=')[1]) : '';

  if (action === 'post_instagram') targetUrl = 'https://www.instagram.com';
  if (action === 'post_facebook') targetUrl = 'https://www.facebook.com';
  if (action === 'post_youtube') targetUrl = 'https://studio.youtube.com';

  console.log(`[ZODARK HUMAN OPERATOR AGENT] Executing action=${action}, platform=${platform}, URL=${targetUrl}, query="${query}"`);

  if (!chromium) {
    console.log("[ZODARK HUMAN AGENT] Launching System Chrome Window for User Verification...");
    const { exec } = require('child_process');
    exec(`start chrome --new-window --window-position=950,50 --window-size=950,980 "${targetUrl}"`);
    return;
  }

  try {
    // Launch Playwright with system installed Chrome on Windows
    let browser;
    try {
      browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
        args: [
          '--window-position=950,50',
          '--window-size=950,980',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ]
      });
    } catch (launchErr) {
      console.warn("[ZODARK HUMAN AGENT] Playwright Chrome channel failed, attempting default launch...", launchErr.message);
      try {
        browser = await chromium.launch({
          headless: false,
          args: [
            '--window-position=950,50',
            '--window-size=950,980',
          ]
        });
      } catch (e) {
        console.log("[ZODARK HUMAN AGENT] Launching System Chrome Window Fallback...");
        const { exec } = require('child_process');
        exec(`start chrome --new-window --window-position=950,50 --window-size=950,980 "${targetUrl}"`);
        return;
      }
    }

    const context = await browser.newContext({
      viewport: { width: 930, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    console.log(`[ZODARK HUMAN AGENT] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Action 1: Instagram Human Automation
    if (action === 'post_instagram' || targetUrl.includes('instagram.com')) {
      console.log(`[ZODARK HUMAN AGENT] Instagram Operator Active. Typing caption...`);
      await page.waitForTimeout(3000);

      // Check if user is logged in or needs login
      const createBtn = page.locator('svg[aria-label="New post"], svg[aria-label="Naya post"]').first();
      if (await createBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log(`[ZODARK HUMAN AGENT] Clicking Create New Post...`);
        await createBtn.click();
      }
    } 
    // Action 2: Facebook Human Automation
    else if (action === 'post_facebook' || targetUrl.includes('facebook.com')) {
      console.log(`[ZODARK HUMAN AGENT] Facebook Operator Active. Typing content...`);
      await page.waitForTimeout(3000);
      const postBox = page.locator('div[role="button"]:has-text("What\'s on your mind?"), div[role="button"]:has-text("Aapke mann mein kya hai?")').first();
      if (await postBox.isVisible({ timeout: 5000 }).catch(() => false)) {
        await postBox.click();
        await page.waitForTimeout(1000);
        if (query) {
          const inputArea = page.locator('div[role="textbox"]').first();
          await inputArea.pressSequentially(query, { delay: 75 });
        }
      }
    }
    // Action 3: YouTube Search & Automation
    else if (action === 'search_youtube' || (targetUrl.includes('youtube.com') && query)) {
      console.log(`[ZODARK HUMAN AGENT] Searching YouTube for: "${query}"`);
      const searchBox = page.locator('input[name="search_query"], input#search').first();
      await searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await searchBox.click();
      await searchBox.pressSequentially(query, { delay: 85 });
      await page.waitForTimeout(500);
      await searchBox.press('Enter');
    }
    // Action 4: Google Search
    else if (action === 'search_google' || (targetUrl.includes('google.com') && query)) {
      console.log(`[ZODARK HUMAN AGENT] Searching Google for: "${query}"`);
      const searchBox = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await searchBox.click();
      await searchBox.pressSequentially(query, { delay: 90 });
      await page.waitForTimeout(400);
      await searchBox.press('Enter');
    }
    // Action 5: ChatGPT Prompt Input
    else if (action === 'chatgpt_prompt' || (targetUrl.includes('chatgpt.com') && query)) {
      console.log(`[ZODARK HUMAN AGENT] Typing prompt into ChatGPT...`);
      const promptArea = page.locator('#prompt-textarea, textarea').first();
      await promptArea.waitFor({ state: 'visible', timeout: 10000 });
      await promptArea.click();
      await promptArea.pressSequentially(query, { delay: 75 });
      await page.waitForTimeout(500);
      await promptArea.press('Enter');
    }

    console.log(`[ZODARK HUMAN AGENT] Task executed. Browser window active on PC.`);
  } catch (err) {
    console.error("[ZODARK HUMAN AGENT] Error:", err.message);
    const { exec } = require('child_process');
    exec(`start chrome --new-window --window-position=950,50 --window-size=950,980 "${targetUrl}"`);
  }
}

runHumanAgent();
