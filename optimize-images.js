import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputFolder = "./public/assets/images";
const outputFolder = "./public/assets/images-optimized";

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

async function optimizeImages() {
  const files = fs.readdirSync(inputFolder);

  for (const file of files) {
    const inputPath = path.join(inputFolder, file);
    const outputPath = path.join(outputFolder, file);

    if (!fs.lstatSync(inputPath).isFile()) continue;

    const ext = path.extname(file).toLowerCase();

    try {
      if (ext === ".jpg" || ext === ".jpeg") {
        await sharp(inputPath)
          .jpeg({ quality: 90, mozjpeg: true })
          .toFile(outputPath);
      } else if (ext === ".png") {
        await sharp(inputPath)
          .png({ compressionLevel: 9, quality: 100 })
          .toFile(outputPath);
      } else if (ext === ".webp") {
        await sharp(inputPath).webp({ quality: 90 }).toFile(outputPath);
      }

      console.log("Optimized:", file);
    } catch (err) {
      console.log("Error:", file, err.message);
    }
  }

  console.log("✅ Done");
}

optimizeImages();
