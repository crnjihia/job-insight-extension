const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "extension/dist");
const zipFile = path.resolve(rootDir, "job-insight-extension-v0.1.0.zip");

if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

if (!fs.existsSync(distDir)) {
  console.error("extension/dist does not exist. Run build first.");
  process.exit(1);
}

console.log("Packaging Chrome Extension v0.1.0 from:", distDir);

try {
  if (process.platform === "win32") {
    execSync(
      `powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipFile}' -Force"`,
      { stdio: "inherit" }
    );
  } else {
    execSync(`cd "${distDir}" && zip -r "${zipFile}" ./*`, { stdio: "inherit" });
  }

  const stats = fs.statSync(zipFile);
  const chunguzaZip = path.resolve(rootDir, "chunguza-extension-v0.1.0.zip");
  fs.copyFileSync(zipFile, chunguzaZip);
  console.log(`\n✓ Chrome Web Store Package created successfully!`);
  console.log(`  File: ${zipFile}`);
  console.log(`  File: ${chunguzaZip}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
} catch (err) {
  console.error("Packaging failed:", err);
  process.exit(1);
}
