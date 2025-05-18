// Image optimization script for production builds
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Directories to scan for images
  imageDirectories: [
    path.resolve(__dirname, '../src/assets'),
    path.resolve(__dirname, '../public')
  ],
  // Image extensions to process
  extensions: ['.jpg', '.jpeg', '.png', '.gif'],
  // Maximum image dimension (larger will be resized)
  maxDimension: 1920,
  // JPEG quality (1-100)
  jpegQuality: 85,
  // PNG compression level (1-9)
  pngCompressionLevel: 9,
  // Convert images to WebP format
  convertToWebP: true,
  // WebP quality (1-100)
  webpQuality: 85
};

console.log('🖼️ Starting image optimization...');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp for image processing...');
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');

// Process all image directories
let totalSaved = 0;
let totalProcessed = 0;

config.imageDirectories.forEach(dir => {
  processDirectory(dir);
});

console.log(`✅ Optimization complete! Processed ${totalProcessed} images, saved ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);

// Function to process a directory recursively
function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Directory not found: ${directory}`);
    return;
  }

  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (isImage(file)) {
      optimizeImage(filePath);
    }
  });
}

// Check if a file is an image based on its extension
function isImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return config.extensions.includes(ext);
}

// Optimize an image file
async function optimizeImage(filePath) {
  try {
    const originalSize = fs.statSync(filePath).size;
    const ext = path.extname(filePath).toLowerCase();
    const filename = path.basename(filePath, ext);
    const dirname = path.dirname(filePath);
    
    // Create a sharp instance with the image
    let image = sharp(filePath);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Resize if needed
    if (metadata.width > config.maxDimension || metadata.height > config.maxDimension) {
      image = image.resize({
        width: Math.min(metadata.width, config.maxDimension),
        height: Math.min(metadata.height, config.maxDimension),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Optimize based on format
    if (ext === '.jpg' || ext === '.jpeg') {
      await image
        .jpeg({ quality: config.jpegQuality, progressive: true })
        .toFile(`${dirname}/${filename}.optimized${ext}`);
    } else if (ext === '.png') {
      await image
        .png({ compressionLevel: config.pngCompressionLevel })
        .toFile(`${dirname}/${filename}.optimized${ext}`);
    } else if (ext === '.gif') {
      await image
        .gif()
        .toFile(`${dirname}/${filename}.optimized${ext}`);
    }
    
    // Also convert to WebP if enabled
    if (config.convertToWebP && ext !== '.gif') {
      await image
        .webp({ quality: config.webpQuality })
        .toFile(`${dirname}/${filename}.webp`);
      
      console.log(`Created WebP version: ${filename}.webp`);
    }
    
    // Replace original with optimized version
    const optimizedPath = `${dirname}/${filename}.optimized${ext}`;
    const optimizedSize = fs.statSync(optimizedPath).size;
    fs.renameSync(optimizedPath, filePath);
    
    const saved = originalSize - optimizedSize;
    totalSaved += saved;
    totalProcessed++;
    
    console.log(`Optimized: ${path.basename(filePath)} - Saved ${(saved / 1024).toFixed(2)} KB (${Math.round((saved / originalSize) * 100)}%)`);
  } catch (error) {
    console.error(`Error optimizing ${filePath}:`, error.message);
  }
}
