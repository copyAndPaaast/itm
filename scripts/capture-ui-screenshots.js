/**
 * UI Screenshot Capture Script
 * Captures screenshots of GraphViewer components for visual validation
 */

import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'screenshots')

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOTS_DIR)) {
  mkdirSync(SCREENSHOTS_DIR, { recursive: true })
}

const UI_SCENARIOS = [
  {
    name: 'current-ui-v2-demo',
    url: 'http://localhost:3000/',
    description: 'Current UI - GraphViewer V2 Demo with fixed data'
  }
]

async function captureScreenshots() {
  console.log('🎬 Starting UI screenshot capture...')
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    defaultViewport: { width: 1920, height: 1080 }
  })

  try {
    const page = await browser.newPage()
    
    // Set a longer timeout for complex graph rendering
    page.setDefaultTimeout(10000)
    
    for (const scenario of UI_SCENARIOS) {
      console.log(`📸 Capturing: ${scenario.name}`)
      console.log(`   URL: ${scenario.url}`)
      
      try {
        await page.goto(scenario.url, { waitUntil: 'networkidle2' })
        
        // Wait for any graph rendering to complete
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Take screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `${scenario.name}_${timestamp}.png`
        const filepath = join(SCREENSHOTS_DIR, filename)
        
        await page.screenshot({
          path: filepath,
          fullPage: true
        })
        
        console.log(`   ✅ Saved: ${filename}`)
        
      } catch (error) {
        console.log(`   ❌ Failed to capture ${scenario.name}: ${error.message}`)
      }
    }
    
  } finally {
    await browser.close()
  }
  
  console.log(`🎯 Screenshots saved to: ${SCREENSHOTS_DIR}`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  captureScreenshots().catch(console.error)
}

export { captureScreenshots }