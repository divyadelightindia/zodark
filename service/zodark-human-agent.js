const path = require('path');
const fs = require('fs');

// Try importing playwright from local node_modules or service directory
let chromium;
try {
  const playwrightPath = path.join(__dirname, 'youtube-automation-agent-master', 'node_modules', 'playwright');
  if (fs.existsSync(playwrightPath)) {
    chromium = require(playwrightPath).chromium;
  } else {
    chromium = require('playwright').chromium;
  }
} catch (e) {
  try {
    chromium = require('playwright').chromium;
  } catch (err) {
    console.error("Playwright module load notice:", err.message);
  }
}

async function runHumanAgent() {
  const args = process.argv.slice(2);
  const actionArg = args.find(a => a.startsWith('--action='));
  const urlArg = args.find(a => a.startsWith('--url='));
  const queryArg = args.find(a => a.startsWith('--query='));

  const action = actionArg ? actionArg.split('=')[1] : 'open_url';
  const targetUrl = urlArg ? urlArg.split('=')[1] : 'https://youtube.com';
  const query = queryArg ? decodeURIComponent(queryArg.split('=')[1]) : '';

  console.log(`[ZODARK HUMAN AGENT] Action: ${action}, URL: ${targetUrl}, Query: "${query}"`);

  if (!chromium) {
    console.log("[ZODARK HUMAN AGENT] Fallback: Launching system Chrome window side-by-side...");
    const { exec } = require('child_process');
    exec(`start chrome --new-window --window-position=960,0 --window-size=960,1050 "${targetUrl}"`);
    return;
  }

  try {
    // Launch Playwright Chromium in Headed Mode (Visible GUI) side-by-side (right half of screen)
    const browser = await chromium.launch({
      headless: false,
      args: [
        '--window-position=950,50',
        '--window-size=950,980',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized=false'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 930, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    console.log(`[ZODARK HUMAN AGENT] Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Action 1: YouTube Search
    if (action === 'search_youtube' || (targetUrl.includes('youtube.com') && query)) {
      console.log(`[ZODARK HUMAN AGENT] Searching YouTube for: "${query}"`);
      const searchBox = page.locator('input[name="search_query"], input#search').first();
      await searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await searchBox.click();
      
      // Type char-by-char like a human (80ms delay per key)
      await searchBox.pressSequentially(query, { delay: 85 });
      await page.waitForTimeout(500);
      await searchBox.press('Enter');

      console.log(`[ZODARK HUMAN AGENT] Search submitted. Waiting for results...`);
      await page.waitForTimeout(3000);

      // Click top video result if available
      const topVideo = page.locator('ytd-video-renderer a#video-title').first();
      if (await topVideo.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`[ZODARK HUMAN AGENT] Clicking top video result...`);
        await topVideo.click();
      }
    } 
    // Action 2: Google Search
    else if (action === 'search_google' || (targetUrl.includes('google.com') && query)) {
      console.log(`[ZODARK HUMAN AGENT] Searching Google for: "${query}"`);
      const searchBox = page.locator('textarea[name="q"], input[name="q"]').first();
      await searchBox.waitFor({ state: 'visible', timeout: 10000 });
      await searchBox.click();
      await searchBox.pressSequentially(query, { delay: 90 });
      await page.waitForTimeout(400);
      await searchBox.press('Enter');
    }
    // Action 3: ChatGPT Prompt Input
    else if (action === 'chatgpt_prompt' || (targetUrl.includes('chatgpt.com') && query)) {
      console.log(`[ZODARK HUMAN AGENT] Typing prompt into ChatGPT...`);
      const promptArea = page.locator('#prompt-textarea, textarea').first();
      await promptArea.waitFor({ state: 'visible', timeout: 10000 });
      await promptArea.click();
      await promptArea.pressSequentially(query, { delay: 75 });
      await page.waitForTimeout(500);
      await promptArea.press('Enter');
    }

    console.log(`[ZODARK HUMAN AGENT] Session active on screen. Browser window open.`);
    // Keep browser open for user interaction
  } catch (err) {
    console.error("[ZODARK HUMAN AGENT] Error:", err.message);
    // Fallback: system browser
    const { exec } = require('child_process');
    exec(`start chrome --new-window --window-position=950,50 --window-size=950,980 "${targetUrl}"`);
  }
}

runHumanAgent();
