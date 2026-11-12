# Playwright Automation Project

[![Playwright Tests](https://github.com/nishisameer/playwright-automation-project/actions/workflows/playwright.yml/badge.svg)](https://github.com/nishisameer/playwright-automation-project/actions/workflows/playwright.yml)

End-to-end UI and API test automation with **Playwright** and **TypeScript**, plus **Vitest**
component tests and an AI evaluation example, running in a **GitHub Actions** CI/CD pipeline that
publishes the test report as a website.

- **UI under test:** [saucedemo.com](https://www.saucedemo.com) (Chrome and Firefox)
- **API under test:** [restful-booker](https://restful-booker.herokuapp.com)
- **Live report:** https://nishisameer.github.io/playwright-automation-project/

New to the project? [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) walks through installing,
running, and pushing it to GitHub step by step.

## What it covers

| Area | Where | What it shows |
|---|---|---|
| UI tests | `tests/ui` | Login, sorting, cart and full checkout, in two browsers |
| API tests | `tests/api` | Full CRUD with an auth token, plus negative tests |
| Security tests | `tests/ui/security.spec.ts`, `tests/api/security.spec.ts` | Access control, login form safety (SQL injection, XSS, user enumeration), API changes rejected without a valid token |
| Network mocking | `tests/ui/network-mocking.spec.ts` | `page.route()` fakes slow, failed and empty API responses |
| AI agent testing | `tests/examples/ai-agent.spec.ts` | Checking key facts instead of exact wording, slow answers, "not found" instead of made-up answers |
| Page Object Model | `pages/` | Locators and actions in one place per page |
| API client | `api/BookingClient.ts` | The API version of a page object: endpoints and token logic in one place |
| Fixtures | `fixtures/` | Tests ask for `loggedInInventory` or `createBooking`; bookings are deleted again after each test |
| Log in once | `tests/setup/auth.setup.ts` | Logs in once per browser and saves the session (`storageState`), so UI tests start logged in |
| Test data | `test-data/` | Builders for default data (`buildBooking({ depositpaid: false })`) and scenario lists for data-driven tests: cart, checkout form and bookings |
| Config | `config/env.ts`, `.env.example` | URLs and credentials from environment variables or GitHub Secrets, never hard-coded in tests |
| Component tests | `component-tests/` | Vitest + Testing Library for small React components |
| AI evaluation | `ai-eval/` | Safety rules, a scoring rubric and an evaluation set with a release bar ([details](ai-eval/README.md)) |
| CI/CD | `.github/workflows/playwright.yml` | Type check → Vitest → Playwright in parallel → merged report → GitHub Pages |

## Quick start

Requires Node.js 20 or 22.

```bash
npm install
npx playwright install
cp .env.example .env    # optional: change URLs or credentials
npm test                # all Playwright tests
```

## Commands

| Command | Runs |
|---|---|
| `npm test` | All Playwright tests |
| `npm run test:ui` | UI tests in Chrome and Firefox |
| `npm run test:api` | API tests |
| `npm run test:smoke` | Quick `@smoke` subset |
| `npm run test:security` | `@security` tests (UI and API) |
| `npm run test:examples` | Technique examples (AI agent) |
| `npm run test:unit` | Vitest component tests and AI evaluation |
| `npm run test:eval` | AI evaluation only |
| `npm run test:headed` | Chrome with the browser visible |
| `npm run test:debug` | Step through a test line by line |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | TypeScript check |

## Project structure

```
.
├── .github/workflows/playwright.yml   CI/CD pipeline
├── api/                               API clients (BookingClient)
├── config/env.ts                      URLs and credentials from environment variables
├── fixtures/                          custom fixtures (pages, logged-in state, bookings with cleanup)
├── pages/                             page objects (Login, Inventory, Cart, Checkout)
├── test-data/                         users, builders and scenario lists
├── tests/
│   ├── setup/                         log in once and save the session
│   ├── ui/                            saucedemo: login, inventory, cart, checkout, security, network mocking
│   ├── api/                           restful-booker: booking CRUD, booking scenarios, security
│   └── examples/                      techniques on a fake page (AI agent answers)
├── component-tests/                   Vitest + React Testing Library
├── ai-eval/                           AI evaluation example (Vitest)
├── docs/GETTING_STARTED.md            step-by-step setup guide
├── .env.example                       template for local settings
├── playwright.config.ts
├── vitest.config.ts
└── tsconfig.json                      includes short import paths (@pages, @api, ...)
```

## Reports

Every run produces an HTML report, JUnit XML, and screenshots, video and a trace for failed
tests. In CI, the reports from all projects are merged into one, summarized on the run page,
and published to GitHub Pages from `main`.

## Test data

To add a scenario, add one entry to `test-data/scenarios.ts`; the specs create one test per entry.
All users, customers and members are synthetic. The credentials in `.env.example` are the
public demo values that saucedemo and restful-booker publish.
