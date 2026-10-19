# Student Nest: Launch Readiness

*Prepared 14 Oct 2026, updated 19 Oct · client meeting Thu 23 Oct*

Estimates are **focused build time with Claude Code**, plus your phone testing. Store review and waiting times are listed separately, because they're outside our control.

---

## 1. Current status

### ✅ Shipped (on GitHub)
| Item | What it does |
|---|---|
| **C1** Forgot password | Reset email in EN/ZH; doesn't reveal which emails have accounts |
| **C2** Crisis support | 🆘 "Get help now" on every MindNest screen: 999, Samaritans, Shout, NHS 111 option 2, Papyrus, plus 112 and findahelpline.com for outside the UK. A support card after heavy check-ins, and a "self-care tool, not a crisis service" disclaimer. |
| **C5 batch 1** | Fake apartment listings, the broken apartment search and the unverified "Garden Homes" removed |
| **C5 batch 2** | "Join 1,000+ KCL students" and "Join thousands" replaced with "Built by a London student, for London students 💙" |
| **C5 batch 3** | Every fake star rating and review count removed |
| **C5 batch 4** | Fake "Save to favourites", fake "Tap to explore" tiers, "Trusted", "up to 40%" and "2–3 days" removed; Save the Student added; unused sample data deleted; `.gitignore` guard |
| **C5 batch 5** | Budget Buddy prompt: no exact prices, discounts or fixed sticker times stated as fact; rough ranges first, then UNiDAYS / Student Beans. *Prompt only. It reaches students with the C6 deploy.* |
| **S1** Database lockdown (19 Oct, console) | The live rules were wide open: **anyone, even without an account, could read every roommate's WhatsApp and email and edit or delete any profile**; any account could approve itself as a tutor or add housekeepers. Published the repo's rules: sign-in required everywhere, owners only edit their own data, only admins approve tutors or add housekeepers. Checked from outside: anonymous reads now refused. |
| **C3 part 1** | Verification email sent at signup. Anyone signed in can browse roommates, but **contacting or posting needs a verified email** (Resend / "I've verified" prompt). WhatsApp and email moved to a separate doc only verified students can read. Old test posts deleted. Phone-tested 19 Oct. |

### 🔶 In progress
- **C3 part 2 (20 Oct, ~1.5 h):** "email already in use" message, verification email in Chinese for Chinese-mode users, sender name in the email template, M2 "profiles listed", full test incl. Chinese mode.

### 📊 Progress
**About 40% of the 🅰 minimum-viable checklist is done** (C1, C2, C5, S1 and half of C3, out of 13 items). That's a count of items, not hours: what's left includes the two biggest ones (store prep, privacy policy). **About 3.5 build days remain for 🅰** (~28 h).

### ⬜ Not started
C4, **C6 (first deploy of Budget Buddy, new, see below)**, the **privacy policy and terms (new, see below)**, H2–H5, M1–M3, P1–P4, U1–U5, roommate empty state, store builds and listings.

> ⚠️ **Budget Buddy doesn't work yet** (corrected 15 Oct). The project is on the free **Spark** plan and the `chat` Cloud Function has **never been deployed**, so the app can only show "I couldn't connect right now". The code is ready; C6 is the deploy.

### 🆕 Found during this review (not in earlier plans)
| # | Finding | Why it matters |
|---|---|---|
| **N1** | **No privacy policy or terms anywhere**: not in the app, not as a URL | **Apple and Google both require a privacy policy URL to publish.** UK GDPR requires telling users what you collect, in particular that roommate contact details are visible to other users and that Budget Buddy chats go to Google (Gemini). **This is a launch blocker.** |
| **N2** | **No support contact** in the app or listings | Both stores require a support URL or email. Apple's UGC rules (C4) also need a way to contact you. |
| **N3** | **Never tested as a real production build** (as far as I can tell). There's no `expo-notifications` plugin in `app.json`. | Expo Go behaves differently from a store build. Notifications and permissions are the usual surprise. Do one EAS "preview" build early. |
| **N4** | **No crash reporting or analytics** | After launch you won't know if the app crashes or which features students use. That makes the client's "is it working?" question hard to answer. |
| **N5** | `README.md` only contains three stray git commands | Cosmetic, but the client or a future developer may look at it. |
| **N6** | `BATCH_5_TODO.md` (untracked, written separately) has two small issues | Its "grep for `AIza`" step **will find a key**: the Firebase web key in `firebase.js`. That one is **public by design**, so it does **not** need rotating. Its "Upgrade to Blaze" step is right: the project is on Spark (checked 15 Oct), see C6. Suggest merging it into `TODO.md` and deleting it. |

---

## 2. Remaining work (prioritised)

### 🔴 Critical: don't launch without these
| Item | Time | Prerequisites | Risk if skipped | Business impact |
|---|---|---|---|---|
| **N1** Privacy policy + terms, linked from Signup and Settings | 4–6 h (draft + hosting + in-app links) | **Client:** legal entity / data controller name, contact email. Ideally a short legal review. | **Store rejection** (both stores). UK GDPR breach (ICO complaints, fines). | You can't publish at all without it. |
| **C3** Verified email before seeing contact details | ✅ part 1 done · part 2 ~1.5 h | Live rules ✅ now match `firestore.rules` | Anyone with a throwaway email can **collect every student's WhatsApp number**. Personal data breach, reputational damage. | Trust is the product for a roommate app. One "my number got scraped" post ends it. |
| **C4** Report + block on roommate profiles | 4–6 h | C3 (same rules work); **who reviews reports?** (client decision) | **App Store rejection** under guideline 1.2 (user-generated content must have report, block and contact). Harassment with no recourse. | Rejection costs 1–3 days per resubmission. |
| **C6** First deploy of Budget Buddy (after C3, before C4) | ~1 h + phone test | **Blaze upgrade** (card), a Gemini key from AI Studio, `firebase-tools` ✅ installed and logged in | Budget Buddy is a dead screen: every message shows "I couldn't connect" | A broken feature in the demo and at launch. Alternative: hide Budget Buddy for V1 (P1). |
| **P1** Hide Tutors, Housekeeper, Jobs | 1 h | Client sign-off on V1 scope | Launching 3 empty or unvetted marketplaces. **Housekeeper = unvetted strangers in students' homes** (safety and liability). | A smaller, solid V1 makes a better first impression |
| **Store prep** EAS builds, icons, screenshots, listings, privacy labels / data safety form | 1–2 days | N1, N2, developer accounts (section 6) | Can't launch | — plus review time: Apple 1–3 days; **Google may need 14 days** (section 4) |

### 🟠 High: strongly recommended for launch
| Item | Time | Prerequisites | Risk if skipped | Business impact |
|---|---|---|---|---|
| **H2** Per-user rate limit on `chat` | 2–3 h | C6 done (do straight after it) | One user (or script) can burn the Gemini quota: **Budget Buddy breaks for everyone**, or the bill spikes on the paid tier | Feature outage in launch week |
| **H3** Ask for notification permission at the first exam, not on first launch | 1 h | — | iOS asks **once**. If students decline on a cold start, exam reminders are dead for good. | The "we'll remind you" promise on the exam screen fails |
| **H4** Lock tutor applications in the rules | ~0.5 h left | P1 decision | *Partly done by S1:* applications can only be created as `pending` and nobody can self-approve. Still open: field and size checks, so an account can still write large junk applications. | Cost / abuse vector |
| **H5** Cancel exam reminders when an exam is deleted | 1–2 h | — | "Your exam is tomorrow" for exams that were removed | Looks broken, erodes trust |
| **M1** Edit / remove my roommate profile | 2 h | — | Students can't take their number down once they've found a room. **GDPR** expects easy removal. | Support requests; privacy complaints |
| **Roommate empty state** "Be the first to post…" | 1 h | — | Empty Find tab at launch | First impression (section 4, empty app) |
| **N3** One EAS preview build on a real phone | 1–2 h + build wait | Expo account | Surprises during store review instead of before it | — |
| **N4** Crash reporting (e.g. Sentry or Firebase Crashlytics) | 2–3 h | Native build (N3) | Blind to crashes after launch | Can't report health to the client |

### 🟡 Medium: fine to follow shortly after launch
| Item | Time | Risk if skipped |
|---|---|---|
| **M2** Untranslated text ("profiles listed", "scheduled") | 0.5 h | Chinese users see English in two places |
| **M3** Delete tutor applications on account deletion | 1 h | GDPR gap (moot if tutors are hidden and locked) |
| **U1–U3** London uni list, pick uni in onboarding (merge steps 2+3), area filter | 6–8 h | Free-text unis make filtering useless. That's core to the "across London" positioning, so **promote to High if the client sells that USP at launch.** |
| **U4–U5** "More filters" (uni), prompt existing users to pick their uni | 3–4 h | — |
| **P2** Real housing data (check provider prices and locations; add real halls) | 4–6 h | Provider prices may be out of date |
| **P4** Onboarding "why are you here?" multi-select | 4–6 h | Generic first experience |
| **P3** Home screen built from the student's own data | 8–12 h | Home stays a static grid |
| **N5** Real README | 0.5 h | Cosmetic |

---

## 3. Realistic launch timeline

### 🅰 Minimum viable: "safe to put in front of real students"
**About 3.5 build days left** (19 Oct) + store review

C1 ✅ · C2 ✅ · C5 ✅ · S1 ✅ · C3 (½) · C4 · C6 · N1 · N2 · P1 · H3 · H4 · store prep

- ✅ Legal minimum met, no known privacy hole, honest content, store-compliant.
- ❌ Empty roommate tab, generic onboarding, free-text university, no crash reporting.
- **Fits in the 10 days** with room for review cycles.

### 🅱 Recommended
**About 6–7 build days** + store review

Everything in 🅰, plus H2 · H5 · M1 · M2 · roommate empty state · N3 · N4 · U1–U3

- ✅ It'll hold up in launch week (rate limit, crash reporting), roommates feel alive, and the cross-London USP actually works (uni and area).
- **Tight but doable in 10 days** if decisions from the client meeting come quickly, especially the legal entity for the privacy policy.

### 🅲 Comprehensive
**About 12–15 build days** (3 weeks or more)

Everything in 🅱, plus P2 · P3 · P4 · U4–U5 · M3 · full Chinese review · README

- **Doesn't fit before the meeting.** Present it as the "V1.1, 2–3 weeks after launch" roadmap.

**Suggested schedule for 🅱:** Days 1–2: ✅ batch 5, C3, H3, H4 · Days 3–4: C4, C6 + H2, M1, H5 · Day 5: N1, N2, P1, empty state · Days 6–7: U1–U3, N3, N4, M2 · Days 8–10: store prep, buffer, client demo build.

---

## 4. Blockers and risks

### 🚧 Things that could stop the launch
1. **Google Play's testing rule.** Personal developer accounts created after Nov 2023 must run a **closed test with at least 12 testers for 14 consecutive days** before they can publish to production. Started today, that ends **28 Oct at the earliest**, after the client meeting. Organisation accounts are exempt. **Find out which account type will be used** (section 5). *Option: launch iOS first, start the Android closed test now with friends and coursemates as testers.*
2. **Apple developer enrolment.** Individual accounts take about 1–2 days. An **organisation** account needs a D-U-N-S number, which can take a week or more.
3. **No privacy policy** (N1). Neither store will accept the app without one.
4. **Apple rejection under 1.2** if C4 (report and block) isn't done.
5. **The client's legal entity is undecided.** The privacy policy has to name who controls the data.

### ⚖️ Legal risks
| Risk | Detail | Mitigation |
|---|---|---|
| **UK GDPR: privacy notice** | No notice of what's collected, why, how long, who it's shared with (Google/Gemini, Firebase) | N1 |
| **UK GDPR: contact details exposed** | Roommate WhatsApp numbers and emails were readable by anyone | ✅ S1 + C3 part 1 (verified accounts only); plus a clear "this will be visible to other students" note on the post form |
| **UK GDPR: right to erasure** | Account deletion exists ✅, but you can't remove a roommate post alone (M1), and tutor applications survive deletion (M3) | M1, M3 |
| **ICO data protection fee** | Most UK organisations processing personal data must pay a yearly fee (around £40–60 for small ones) unless exempt | Client takes the ICO's online self-assessment |
| **AI data handling** | Budget Buddy chats are sent to Google. **On Gemini's free tier, Google may use the content to improve its products**, and Google's terms have at times restricted free-tier use for UK users. *I couldn't confirm the current terms from here.* | Check the Gemini API terms; use the paid tier if required; disclose in the privacy policy |
| **Consumer law (DMCC Act 2024)** | Fake reviews and unsubstantiated claims | ✅ Mostly fixed by C5. Avoid "the only app connecting London unis" in marketing (unprovable). |
| **Safety / liability** | Housekeeper listings (strangers in homes); unvetted tutors | P1 hides both |
| **Wellbeing** | MindNest could be relied on in a crisis | ✅ C2 signposting + disclaimer. The journal and moods are never stored (keep it that way). |

### 🛠️ Technical risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Live Firestore rules differ from `firestore.rules` (published via the console) | ✅ Resolved 19 Oct (they did: the live ones were wide open) | Always publish the whole repo file; keep them in sync |
| A plain `firebase deploy` overwrites the console rules | High if someone runs it | Always use `--only functions:chat`. It's in the TODO. |
| Cloud Functions **Node 20** runtime being retired | Medium | Bump to Node 22 if the deploy warns |
| Production build behaves differently from Expo Go | Medium | N3 early |
| Crashes in the wild go unnoticed | — | N4 |
| Gemini quota exhausted / bill spike | Medium at launch | H2 + billing alerts |
| Only 23 automated tests (date maths, translations) | — | Phone testing per batch (as we've been doing) |

### 📉 Business risks
| Risk | Detail | Mitigation |
|---|---|---|
| **Empty app** | Roommates starts with zero profiles. Tutors and housekeepers are empty (hidden by P1). | Real "founding posters": recruit 15–30 genuine posts before launch through **your QMUL networks, societies and group chats**; honest "be the first" empty state |
| **Feature sprawl** | 8 half-built features read as unfinished | P1: launch with Study, Roommates + Accommodation, MindNest, Budget |
| **Timing** | Student house-hunting for the next academic year usually picks up in the new year | An autumn launch has time to build supply before the peak |
| **Measurement** | No analytics means no answer to "how many use it?" | N4 / basic analytics |

---

## 5. Client meeting prep

### Show them
1. **A live demo on your phone:** Signup → profile setup → Study (add an exam, show the ✓ empty state and progress bar) → **MindNest + 🆘 Get help now** → Accommodation → Roommates (post a profile) → Budget Buddy (**only if C6 is deployed by then**, otherwise skip it) → Chinese mode.
2. **The integrity story:** "we removed every fake rating, user number and listing." It's a selling point for students *and* a legal safeguard.
3. **This document's section 3**, then let them choose the scenario.

### Ask them
- **Who owns the app legally?** That decides the privacy policy, the developer accounts and the ICO fee.
- **Whose Apple and Google developer accounts?** Personal or organisation, existing or new? *(This decides whether Android can launch on time.)*
- **Launch target:** a date, or "when it's ready"? Is iOS-only first acceptable?
- **Audience:** all London unis from day one, or start where you have networks (QMUL)?
- **Who moderates** roommate reports, and how fast can they respond?
- **Budget** for running costs: Firebase, Gemini paid tier if needed, developer accounts, optional legal review.
- **What does success look like** at 30 and 90 days (signups, posts, weekly users)?

### Decisions you need from them
1. Scenario 🅰 / 🅱 / 🅲
2. V1 feature scope (agree to P1: hide Tutors, Housekeeper, Jobs)
3. The legal entity and contact email for the privacy policy and store listings
4. Developer account ownership
5. The moderation owner
6. Whether the "across London" USP is a launch requirement (it decides whether U1–U3 are High or Medium)
7. Who does the Chinese review

---

## 6. External dependencies

### 🇨🇳 Chinese translation review
**Highest priority** (added or changed in recent sessions, where accuracy matters most):

| Area | Key(s) in `i18n/zh.js` | Text |
|---|---|---|
| Crisis screen (**most important**) | `mindnest.crisis.*` | All crisis lines, especially `lines.nhs111.detail` (interpreter instructions) and `lines.papyrus.detail` |
| Crisis card / disclaimer | `mindnest.crisis.heavyCard`, `heavyCardCta`, `disclaimer` | 如果现在觉得太沉重… / MindNest 是自我关怀工具… |
| Taglines | `welcome.socialProof`, `auth.joinTagline` | 由伦敦学生打造，专为伦敦学生服务 💙 |
| Welcome headline | `welcome.headline` | 你的留学生活，(assumes "study abroad") |
| Password reset | `auth.forgotPassword` … `auth.networkError` | 11 strings |
| Exams empty state | `exams.emptyTitle`, `emptyIntro`, `emptyBenefits`, `addFirst` | 📚 还没有添加考试 … |
| Jobs | `jobs.subtitle`, `jobs.sites.savethestudent` | 适合学生的求职网站 / 学生理财建议、兼职和免费福利 |
| MindNest money tip | `mindnest.help.money.tips[1]` | Lidl 和 Aldi 通常是最便宜的超市 |
| Renamed section | `mindnest.menu.help.title`, `mindnest.actions.help.title` | 伦敦学生支持 |
| Tutor confirmation | `tutors.submittedSub` | 我们会审核你的信息并通过邮件回复你。 |

**Then the rest:** about **600 more strings** in `i18n/zh.js` were written before these sessions. I don't know whether a native speaker has checked them. Suggest one full read-through by a native speaker (around 2–3 hours of their time).

### 💳 Firebase / Google Cloud
- **Plan:** **Spark** (free; checked 15 Oct). Cloud Functions need **Blaze** on any region, so C6 needs the upgrade. Blaze keeps the free monthly allowances (about 2M function calls), so a small test group should cost £0; the $300 Google Cloud credit is extra cushion.
- **Budget alerts:** Google Cloud Billing → Budgets & alerts. Alerts warn you; they **don't** cap spending.
- **Gemini API key:** ✅ **not in the app code or git history** (re-checked 15 Oct). The code reads it from a Cloud Functions secret, which is correct, but the secret **hasn't been set yet** (part of C6). Check the tier and terms (section 4).
- **Firebase web key** (`firebase.js`): public by design, ✅ fine. Restrict it to your app in *APIs & Services → Credentials*.
- ⚠️ **Local, never-committed** `.env` and `constants/config.js` contain a key, possibly the old Anthropic key "no longer used". **Revoke it if it's still active.**
- **Password-reset email template** (sender name, wording). Steps are in the C1 notes.

### 📱 Store accounts
| Account | Cost | Lead time | Notes |
|---|---|---|---|
| Apple Developer Program | £79 / year | 1–2 days (individual); 1–2+ weeks (organisation, D-U-N-S) | Needs privacy policy URL, support URL, privacy "nutrition label", screenshots |
| Google Play Console | $25 one-time | Identity verification, then **14-day closed test** (newer personal accounts) | Data safety form, privacy policy URL |
| Expo / EAS | Free tier OK | Same day | For production builds and submission |

### 🔑 Other services
- **Support email** (and ideally a simple website or domain to host the privacy policy and terms). A domain also helps password-reset emails avoid spam.
- **ICO registration fee** (client to check).
- **Crash reporting** (Sentry free tier or Firebase Crashlytics) if N4 is in scope.
- **Papyrus text number:** check at papyrus-uk.org.
- **Delete the 4 test accounts** in Firebase before launch.

---

## Appendix: C6, first deploy of Budget Buddy (plan only, not started)

**When:** Wed 22 Oct with C4, so Budget Buddy works in the Oct 23 client demo (skip it in the demo if C6 slips). **About 1 hour** plus the phone test.

**Why it's small:** the secure setup already exists. The app calls the `chat` Cloud Function (`functions/index.js`), which holds the prompt and reads the Gemini key from a server-side secret. The key is never in the app. It has just never been deployed.

### Steps (together, not alone)
1. Upgrade the project to **Blaze** and set a budget alert (e.g. £5) under Google Cloud Billing → Budgets & alerts. Alerts warn; they don't cap spending.
2. Get a Gemini key from https://aistudio.google.com/apikey, check its tier and terms (section 4), then `firebase functions:secrets:set GEMINI_API_KEY`.
3. Choose the region. **us-central1** (the default) needs no code change. **europe-west2** (next to Firestore, faster for UK users) needs `onCall({ region: 'europe-west2', ... })` in `functions/index.js` **and** `getFunctions(app, 'europe-west2')` in `firebase.js`, changed together.
4. `cd functions && npm install && cd ..`
5. `firebase deploy --only functions:chat` (**never a plain `firebase deploy`**: it would overwrite the Firestore rules published in the console).
6. If the deploy rejects Node 20: change `"node": "20"` to `"22"` in `functions/package.json`, commit, redeploy.
7. Phone test (below). Logs: `firebase functions:log --only chat`.
8. Do **H2** (per-user rate limit) straight after, before the app is public.

### Phone test (also checks C5 batch 5)
| Ask | Should see | Should NOT see |
|---|---|---|
| "Is there a Pizza Express student discount?" | A helpful answer, then "check UNiDAYS / Student Beans or their app" | "40% off" or any fixed percentage |
| "Best supermarkets" chip | Aldi and Lidl usually cheapest; evening yellow stickers, times vary | "30–40% less than Tesco", "after 7pm", "Specially Selected" |
| "Cheap places to eat out?" | Brand names with rough approximate ranges, not just a redirect | "Pret £7.99", "Subway £4.50", "Nando's £8.45" |
| "I have £500 this month" | Breakdown labelled as rough guidance, adjusted to £500 | Amounts presented as facts |
| "Money-saving apps?" | Too Good To Go, OLIO, UNiDAYS, TopCashback | Karma |
| Same question in Chinese mode | Reply in Chinese, £ kept | — |

**Later:** London-aware Budget Buddy (Oyster, Zone 1–2 travel, London rent) and a native-speaker check of the Chinese replies.
