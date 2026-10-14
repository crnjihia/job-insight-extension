import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

function copyExtensionAssetsPlugin() {
  return {
    name: "copy-extension-assets",
    closeBundle() {
      const distDir = resolve(__dirname, "dist");
      const srcDir = resolve(__dirname, "src");
      const iconsDir = resolve(__dirname, "icons");

      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // 1. Copy manifest.json
      const manifestSrc = resolve(srcDir, "manifest.json");
      const manifestDest = resolve(distDir, "manifest.json");
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest);
      }

      // 2. Copy icons directory
      const distIconsDir = resolve(distDir, "icons");
      if (!fs.existsSync(distIconsDir)) {
        fs.mkdirSync(distIconsDir, { recursive: true });
      }
      if (fs.existsSync(iconsDir)) {
        const icons = fs.readdirSync(iconsDir);
        for (const icon of icons) {
          fs.copyFileSync(resolve(iconsDir, icon), resolve(distIconsDir, icon));
        }
      }

      // 3. Copy content/styles.css
      const contentDistDir = resolve(distDir, "content");
      if (!fs.existsSync(contentDistDir)) {
        fs.mkdirSync(contentDistDir, { recursive: true });
      }
      const cssSrc = resolve(srcDir, "content/styles.css");
      const cssDest = resolve(contentDistDir, "styles.css");
      if (fs.existsSync(cssSrc)) {
        fs.copyFileSync(cssSrc, cssDest);
      }

      // 4. Ensure popup/index.html and options/index.html are in dist/popup/ and dist/options/
      const popupDistDir = resolve(distDir, "popup");
      if (!fs.existsSync(popupDistDir)) {
        fs.mkdirSync(popupDistDir, { recursive: true });
      }
      const generatedPopup = resolve(distDir, "src/popup/index.html");
      if (fs.existsSync(generatedPopup)) {
        fs.copyFileSync(generatedPopup, resolve(popupDistDir, "index.html"));
      }

      const optionsDistDir = resolve(distDir, "options");
      if (!fs.existsSync(optionsDistDir)) {
        fs.mkdirSync(optionsDistDir, { recursive: true });
      }
      const generatedOptions = resolve(distDir, "src/options/index.html");
      if (fs.existsSync(generatedOptions)) {
        fs.copyFileSync(generatedOptions, resolve(optionsDistDir, "index.html"));
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionAssetsPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        options: resolve(__dirname, "src/options/index.html"),
        brightermonday: resolve(__dirname, "src/content/brightermonday.ts"),
        linkedin: resolve(__dirname, "src/content/linkedin.ts"),
        fuzu: resolve(__dirname, "src/content/fuzu.ts"),
        "background/service-worker": resolve(__dirname, "src/background/service-worker.ts")
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (["brightermonday", "linkedin", "fuzu"].includes(chunkInfo.name)) {
            return `content/${chunkInfo.name}.js`;
          }
          if (chunkInfo.name === "background/service-worker") {
            return `background/service-worker.js`;
          }
          return `[name].js`;
        },
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});
