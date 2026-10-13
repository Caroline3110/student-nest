# Student Nest: pre-launch TODO

Working rules: plan first, one fix or batch per commit, test on a phone before moving on.

## Next: C5 batch 5, Budget Buddy AI prompt (`functions/prompts.js`)

The prompt is sent to Gemini on every Budget Buddy chat and states unverified prices as fact.

- [ ] Remove "30-40% less than Tesco". Match the in-app wording from batch 4:
      "Aldi and Lidl are usually the cheapest supermarkets" (Which? monthly tracker, 2026).
- [ ] Remove exact restaurant prices and discounts (Pret £7.99, Subway £4.50, Greggs under £4,
      Nando's ~£8.45 with UNiDAYS, Pizza Express 40%). Keep the brand names.
- [ ] Add a ground rule: never state exact prices, discount percentages or deal details as fact;
      give rough ranges marked approximate and point to the brand's app/site, UNiDAYS or Student Beans.
- [ ] Yellow stickers: "usually in the evening; times vary by store" (no fixed times).
- [ ] Remove "Aldi Specially Selected" (a premium range, not a saving).
- [ ] Remove the Karma app (can't confirm it still operates in the UK).
- [ ] Present recipe costs and the monthly budget breakdown as rough estimates.
- [ ] Optional: make Budget Buddy London-aware (Oyster, Zone 1-2 travel, London rent).
- [ ] Commit ("C5 batch 5: remove unverified prices from Budget Buddy prompt") BEFORE deploying.

### Deploy checklist
1. `npm install -g firebase-tools`, then `firebase login`
2. `cd functions && npm install && cd ..`
3. `firebase deploy --only functions:chat`
   **Never run a plain `firebase deploy`**: it would also publish `firestore.rules` from this
   folder and overwrite the rules published in the Firebase console.
4. If the deploy rejects Node 20, change `"node": "20"` to `"22"` in `functions/package.json`.
5. Verify in the app: "Best supermarkets" chip, and ask about a Pizza Express student discount.
   Logs: `firebase functions:log --only chat`

## Still to do before launch

### Critical
- [ ] C3: require a verified email (any domain) before students can read roommate contact details. Rules change goes through the console.
- [ ] C4: report and block on roommate profiles (App Store guideline 1.2).

### High
- [ ] H2: per-user rate limit on the `chat` function.
- [ ] H3: ask for notification permission when a student adds their first exam, not on first launch.
- [ ] H4: validate fields and sizes on tutor applications in the rules.
- [ ] H5: cancel exam reminders when an exam is deleted.

### Medium
- [ ] M1: let students edit or remove their own roommate profile.
- [ ] M2: untranslated text ("profiles listed" on Roommates, "scheduled" on Exams).
- [ ] M3: delete pending tutor applications when an account is deleted.

### Product
- [ ] P1: hide Tutors, Housekeeper and Jobs until V2.
- [ ] U1-U5: London university list (20+ unis plus BPP and Regent's, plus "Other"), area as the
      primary filter and uni under "More filters"; merge onboarding steps 2 and 3.
- [ ] P2: real housing data (check provider prices and locations; real halls).
- [ ] P3: home screen built from the student's own data.
- [ ] P4: onboarding with a multi-select "why are you here" question.
- [ ] Roommate empty state: "Be the first to post, earliest posters get the most interest".

## Manual checks before launch
- [ ] Customise the Firebase password-reset email template.
- [ ] Check Papyrus's text number and age range (papyrus-uk.org).
- [ ] Get a native speaker to review the Chinese copy (crisis screen, taglines, exam empty state).
- [ ] Delete the 4 test user accounts in Firebase.
