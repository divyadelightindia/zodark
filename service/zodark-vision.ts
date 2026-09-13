import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const PS_SCRIPT = path.join(process.cwd(), 'service', 'capture_screen.ps1');
const TEMP_SCREENSHOT = path.join(os.tmpdir(), 'zodark_screen.png');

/**
 * Captures real-time user PC desktop screenshot
 * Returns base64 string of PNG image or null on error
 */
export function captureScreenBase64(): string | null {
  try {
    // Run PowerShell screen capture script
    execSync(`powershell -ExecutionPolicy Bypass -File "${PS_SCRIPT}"`, { timeout: 8000 });
    
    if (fs.existsSync(TEMP_SCREENSHOT)) {
      const imgBuffer = fs.readFileSync(TEMP_SCREENSHOT);
      return imgBuffer.toString('base64');
    }
  } catch (err) {
    console.error("[ZODARK VISION] Screen capture notice:", (err as Error).message);
  }
  return null;
}

/**
 * Automates Windows Typing (Writing) into focused input area
 */
export function typeTextOS(text: string): boolean {
  if (!text) return false;
  try {
    const escapedText = text.replace(/[{}^%~()]/g, '{$&}').replace(/"/g, '""');
    const psCmd = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("${escapedText}")`;
    execSync(`powershell -Command "${psCmd}"`, { timeout: 5000 });
    return true;
  } catch (e) {
    console.warn("[ZODARK OS OPERATOR] SendKeys notice:", (e as Error).message);
    return false;
  }
}

/**
 * Automates Windows Key Press (Enter, Space, Tab, etc.)
 */
export function pressKeyOS(key: string = '{ENTER}'): boolean {
  try {
    const psCmd = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait("${key}")`;
    execSync(`powershell -Command "${psCmd}"`, { timeout: 5000 });
    return true;
  } catch (e) {
    console.warn("[ZODARK OS OPERATOR] PressKey notice:", (e as Error).message);
    return false;
  }
}
