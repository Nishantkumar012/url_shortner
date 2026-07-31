# Frontend Phases – To‑Do Checklist

## Phase 1 – Project Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Install core dependencies (`react`, `react-dom`, `react-router-dom`, `axios`, `@hookform/resolvers`, `yup`, `tailwindcss`, `postcss`, `eslint`, `prettier`)
- [x] Configure ESLint, Prettier, and TypeScript
- [x] Add Tailwind CSS configuration
- [x] Create basic folder structure (`src/components`, `src/pages`, `src/api`, `src/assets`, `src/styles`)

## Phase 2 – Layout & UI Foundations
- [ ] Create `src/components/Layout.tsx`
- [ ] Build reusable `InputField.tsx` and `ButtonPrimary.tsx`
- [ ] Add Tailwind base styles to `src/index.css` & `App.css`
- [ ] Implement responsive grid and typography utilities

## Phase 3 – Authentication UI
- [ ] Scaffold `src/pages/Register.tsx`, `src/pages/Login.tsx`
- [ ] Add form validation with React Hook Form + Zod
- [ ] Integrate API calls to `/auth/register` & `/auth/login`
- [ ] Store JWT in `localStorage` and set up token refresh

## Phase 4 – URL Management UI
- [ ] Implement `src/pages/UrlList.tsx` (fetch/display URLs)
- [ ] Add `CreateUrlForm` for short URL generation
- [ ] Enable inline edit/delete actions
- [ ] Add auth guard for routes

## Phase 5 – Redirect Service Integration
- [ ] Wire redirect lookup (`GET /:code`) with analytics enqueue
- [ ] Add loading & error states for redirects
- [ ] Verify end‑to‑end flow (register → create URL → resolve)

## Phase 6 – Analytics & Dashboard
- [ ] Develop `AnalyticsDashboard.tsx` (Recharts/Chart.js)
- [ ] Track clicks, browsers, countries, devices
- [ ] Implement filtering/date‑range toggles

## Phase 7 – Advanced Features
- [ ] Add Account Settings page
- [ ] Implement API Keys management
- [ ] Build Billing/Subscription page (Razorpay)
- [ ] Create Admin Panel for workspace & abuse detection

## Phase 8 – Testing, Linting, Deployment
- [ ] Write unit tests for components
- [ ] Add integration tests for auth & URL flows
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run format` (auto‑fix)
- [ ] Set up GitHub Actions CI workflow
- [ ] Deploy to Vercel/Netlify and test live URLs

---

**Crossed‑out items (`[x]`) indicate tasks that are already completed.**