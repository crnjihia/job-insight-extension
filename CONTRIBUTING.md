# Contributing to Job Insight Extension

Thank you for your interest in contributing to **Job Insight Extension**! I welcome contributions to make job hunting smarter, more transparent, and more empowering.

---

## Code of Conduct

I expect all contributors to adhere to standard open-source citizenship: be respectful, constructive, and collaborative.

---

## Development Workflow

### 1. Prerequisites
- **Node.js**: v20.x or later
- **npm**: v9.x or later
- **Google Chrome** (or Chromium-based browser such as Brave, Edge)
- *(Optional)* Docker and Docker Compose

### 2. Fork and Clone
```bash
git clone https://github.com/crnjihia/job-insight-extension.git
cd job-insight-extension
npm install
```

### 3. Build & Test
Always ensure test suites pass and builds are clean before submitting a Pull Request:
```bash
# Run unit & integration tests
npm test

# Build extension and backend
npm run build

# Package extension zip
npm run package
```

### 4. Running the Dev Environment
```bash
# In terminal 1 (Backend API on http://localhost:4000):
npm --prefix backend run dev

# In terminal 2 (Extension watch mode):
npm --prefix extension run dev
```

Load the unpacked extension in Chrome by navigating to `chrome://extensions`, enabling **Developer Mode**, and clicking **Load unpacked** pointing to `extension/dist`.

---

## Coding Standards

- **TypeScript**: Strive for 100% strict type safety. Avoid using `any` or loose casts; prefer runtime guards (`typeof`, `instanceof`).
- **Styling**: Vanilla CSS in content scripts with scoped class prefixes (`.cie-` / `.jie-`) to prevent collision with host page styles.
- **Chrome Extensions (MV3)**: Follow Manifest V3 guidelines strictly. Do not execute remote code; use message passing for asynchronous background operations.
- **Backend**: Express with modular routers, rate limiting, and defensive validation.

---

## Commit Guidelines

I follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for the user
- `fix:` A bug fix
- `docs:` Documentation changes
- `test:` Adding or updating tests
- `refactor:` Code restructuring without behavioral changes
- `chore:` Tooling, dependency updates, or build script tweaks

**Example:**
```text
feat(extractor): add support for Indeed job listings
fix(storage): guard against undefined chrome.storage.sync
```

---

## Pull Request Checklist

Before submitting your PR, verify:
- [ ] Tests pass cleanly with `npm test`.
- [ ] TypeScript compiles with 0 errors via `npm run build`.
- [ ] No sensitive credentials (API keys, private tokens) are committed.
- [ ] Documentation or README has been updated if your change modifies behavior.
- [ ] Commit history is clean and follows conventional commit format.

---

## Security

If you discover a potential security vulnerability, please do NOT file a public issue. Contact the maintainers privately via GitHub or security contact channels.
