import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";
import * as esbuild from "esbuild";

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

      // 5. Build standalone IIFE content scripts (no external import statements)
      const contentScripts = ["brightermonday", "linkedin", "fuzu"];
      for (const name of contentScripts) {
        esbuild.buildSync({
          entryPoints: [resolve(srcDir, `content/${name}.ts`)],
          outfile: resolve(contentDistDir, `${name}.js`),
          bundle: true,
          format: "iife",
          define: { "process.env.NODE_ENV": '"production"' }
        });
      }

      // 6. Build standalone background service worker (single-file ESM)
      const bgDistDir = resolve(distDir, "background");
      if (!fs.existsSync(bgDistDir)) {
        fs.mkdirSync(bgDistDir, { recursive: true });
      }
      esbuild.buildSync({
        entryPoints: [resolve(srcDir, "background/service-worker.ts")],
        outfile: resolve(bgDistDir, "service-worker.js"),
        bundle: true,
        format: "esm",
        define: { "process.env.NODE_ENV": '"production"' }
      });
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
        options: resolve(__dirname, "src/options/index.html")
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
});
