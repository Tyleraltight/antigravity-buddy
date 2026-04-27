const puppeteer = require('puppeteer');
const { GifFrame, GifUtil, BitmapImage } = require('gifwrap');
const { PNG } = require('pngjs');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to the target size 1000x104
  await page.setViewport({ width: 1000, height: 104, deviceScaleFactor: 1 });

  console.log('Navigating to local dev server...');
  await page.goto('http://localhost:1420', { waitUntil: 'networkidle0' });

  // Ensure backgrounds are transparent and center the capsule vertically for 104px height
  await page.evaluate(() => {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    const container = document.getElementById('island-container');
    if (container) {
      container.style.paddingTop = '24px'; // Adjusted to center a 50px capsule in 104px height (roughly)
    }
  });

  // Trigger error state manually
  await page.evaluate(() => {
    const capsule = document.getElementById("island-capsule");
    const textSpan = document.getElementById("state-text");
    if (capsule && textSpan) {
      capsule.className = "error expanded";
      textSpan.textContent = "T_T";
    }
  });
  
  // Wait for it to expand and settle
  await new Promise(r => setTimeout(r, 600));

  console.log('Capturing frames...');
  const frames = [];
  const totalFrames = 40; 
  const frameDelay = 50; 

  for (let i = 0; i < totalFrames; i++) {
    // Take full viewport screenshot (1000x104)
    const buffer = await page.screenshot({ type: 'png', omitBackground: true });
    
    const png = PNG.sync.read(buffer);
    const bitmap = new BitmapImage(png.width, png.height, png.data);
    const frame = new GifFrame(bitmap, { delayCentisecs: frameDelay / 10 });
    frames.push(frame);
  }

  await browser.close();

  console.log('Encoding GIF...');
  GifUtil.quantizeDekker(frames, 256);
  
  const outputPath = '../src/assets/error.gif';
  await GifUtil.write(outputPath, frames, { loops: 0 });
  console.log('GIF saved to', outputPath);

})();
