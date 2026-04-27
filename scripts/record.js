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

  // IMPORTANT: Match the background and style of the originals
  // We'll use a dark background instead of transparency to ensure it fills the README table cell
  await page.evaluate(() => {
    document.body.style.background = '#0d1117'; // GitHub dark mode background or just solid black
    document.documentElement.style.background = '#0d1117';
    
    const container = document.getElementById('island-container');
    const capsule = document.getElementById('island-capsule');
    const textSpan = document.getElementById('state-text');
    
    if (container) {
      container.style.paddingTop = '24px'; 
    }
    
    if (capsule) {
      // Make it slightly wider to match the "feel" of the others if they look wider
      capsule.style.width = '600px'; 
      capsule.className = "error expanded";
    }
    
    if (textSpan) {
      textSpan.textContent = "T_T Critical Error";
      textSpan.style.fontSize = "16px";
    }
  });
  
  // Wait for it to expand and settle
  await new Promise(r => setTimeout(r, 600));

  console.log('Capturing frames...');
  const frames = [];
  const totalFrames = 30; 
  const frameDelay = 60; 

  for (let i = 0; i < totalFrames; i++) {
    // Take full viewport screenshot (1000x104)
    // omitBackground: false to keep the solid background
    const buffer = await page.screenshot({ type: 'png', omitBackground: false });
    
    const png = PNG.sync.read(buffer);
    const bitmap = new BitmapImage(png.width, png.height, png.data);
    const frame = new GifFrame(bitmap, { delayCentisecs: frameDelay / 10 });
    frames.push(frame);
  }

  await browser.close();

  console.log('Encoding GIF...');
  GifUtil.quantizeDekker(frames, 256);
  
  const outputPath = '../src/assets/error_v4.gif';
  await GifUtil.write(outputPath, frames, { loops: 0 });
  console.log('GIF saved to', outputPath);

})();
