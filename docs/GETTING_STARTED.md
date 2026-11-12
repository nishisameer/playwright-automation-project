# Getting started: from zero to CI/CD

A step-by-step guide to running this project on your machine, pushing it to GitHub, and
watching the pipeline run. For a summary of what the project covers, see the [README](../README.md).

---

## Part 1 — Install the tools (one time, ~15 min)

1. **Node.js** (LTS, version 20 or 22): https://nodejs.org → download and install.
2. **Git**: https://git-scm.com/downloads → install with the default options.
3. **VS Code** (editor): https://code.visualstudio.com
   Then in VS Code → Extensions → install **"Playwright Test for VSCode"** (by Microsoft).

Check it worked — open a terminal (Windows: *PowerShell*, Mac: *Terminal*):

```bash
node -v     # should print v20.x or v22.x
git --version
```

Tell Git who you are (once):

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## Part 2 — Run the tests on your computer

Clone the repo (`git clone https://github.com/nishisameer/playwright-automation-project`), open the folder in VS Code, and open the terminal inside VS Code (**Terminal → New Terminal**):

```bash
npm install                      # downloads Playwright + TypeScript
npx playwright install           # downloads Chrome, Firefox, WebKit
cp .env.example .env             # optional: your own URLs / credentials
npm test                         # runs the Playwright tests
npm run test:unit                # runs the Vitest component tests (a few seconds)
npm run report                   # opens the HTML report in your browser
```

Other useful commands:

```bash
npm run test:unit:watch # Vitest re-runs tests as you edit
npm run test:smoke      # only @smoke tests
npm run test:api        # only API tests
npm run test:headed     # watch the browser click through the tests
npm run test:debug      # step through a test line by line
npx playwright test --ui   # Playwright's visual test runner (great for learning)
```

## Part 3 — Create your GitHub account and repository

1. Go to https://github.com/signup and create a free account.
2. Once logged in, click the **+** in the top-right → **New repository**.
3. Fill in:
   - **Repository name:** `playwright-automation-project`
   - **Visibility:** **Public** (needed for the free GitHub Pages report website; also good for your portfolio)
   - Do **not** tick "Add a README", ".gitignore" or "license" — the project already has them.
4. Click **Create repository**. Keep that page open; it shows your repo URL, like
   `https://github.com/YOUR-USERNAME/playwright-automation-project.git`

## Part 4 — Push the project to GitHub

In the VS Code terminal, inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit: Playwright framework + CI pipeline"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/playwright-automation-project.git
git push -u origin main
```

**Signing in:** the first push opens a browser window asking you to sign in to GitHub — approve it.
(GitHub no longer accepts your account password in the terminal. If no window appears, create a
*Personal access token* at GitHub → Settings → Developer settings → Personal access tokens → Fine-grained,
give it "Contents: Read and write" on this repo, and paste it when asked for a password.)

## Part 5 — Turn on the report website (one time)

1. In your repo on GitHub: **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Go to the **Actions** tab → click the latest run → **Re-run all jobs** (the first run's publish step fails if Pages wasn't on yet — that's expected).

## Part 6 — Watch the pipeline run

Open the **Actions** tab in your repo. Every push to `main` triggers this pipeline:

```
Type check ──► Vitest ──► Tests (chromium) ─┐
                         ├► Tests (firefox)  ─┤
                         ├► Tests (api)      ─┼─► Merge reports ──► Publish report to GitHub Pages
                         └► Tests (examples) ─┘
```

- Click a run to see each job; click a job to see its log line by line.
- The run page shows a **Test results** summary table (total / passed / failed).
- Scroll to **Artifacts** to download `playwright-html-report` (and, on failures, screenshots/videos/traces).
- The **Publish** job shows a link like `https://YOUR-USERNAME.github.io/playwright-automation-project/` — that's your live test report.

It also runs:
- on every **pull request** to `main`,
- **manually**: Actions → *Playwright Tests* → **Run workflow** → choose `all`, `smoke`, `security`, `ui` or `api`.

---

## Part 7 — Exercises to build real confidence

Do these in order. Each one teaches something you'll be asked about in interviews.

1. **See a red pipeline.** In `tests/ui/login.spec.ts` change `toHaveCount(6)` to `toHaveCount(7)`.
   Commit and push. Watch the build fail, download the `test-results-chromium` artifact, and open the
   trace with `npx playwright show-trace path/to/trace.zip`. Then fix it and push again → green.
2. **Work like a team (pull requests).**
   ```bash
   git checkout -b add-new-test
   # write a new test, e.g. "Continue shopping returns to inventory"
   git add . && git commit -m "Add continue shopping test"
   git push -u origin add-new-test
   ```
   On GitHub click **Compare & pull request**. The pipeline runs on the PR; merge only when green.
3. **Protect main.** Settings → Branches → Add rule for `main` → *Require status checks to pass* →
   select the test jobs. Now nobody can merge broken tests.
4. **Add a page object.** Create `pages/ProductDetailPage.ts` for the product detail page and a test
   that opens an item and checks its name and price match the list.
5. **Use a secret.** Add a repo secret `SAUCE_PASSWORD` (Settings → Secrets and variables → Actions).
   The workflow already passes it to the tests, and `config/env.ts` reads it. Without the secret,
   the public demo password is used.
6. **Try `problem_user`.** Log in as `problem_user` and write tests that *find* its bugs
   (wrong images, broken sorting). This is what real testing feels like.
7. **Explain the pipeline out loud** — what each job does, why tests retry 2× on CI only, why
   `fail-fast: false`, why reports are merged. If you can explain it, you own it.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npx: command not found` | Node isn't installed or terminal was open before install — reopen it |
| Tests time out locally | Check your internet; the test sites are public websites |
| `git push` rejected / 403 | Sign-in issue — use the browser prompt or a personal access token (Part 4) |
| Publish job fails | Turn on Pages with source **GitHub Actions** (Part 5), then re-run |
| API tests fail occasionally | restful-booker is a shared free demo that sometimes resets; CI retries 2× |
