# Student Nest: pre-launch TODO

Working rules: plan first, one fix or batch per commit, test on a phone before moving on.

## Schedule to the client meeting (updated 19 Oct)
- Tue 20: C3 part 2 · Wed 21: C4 + C6 (Blaze + Budget Buddy deploy) · Thu 22: prep, then client meeting

## Next session: C3 part 2
- "Email already in use": point to Sign in / Forgot password.
- Send the verification email in Chinese for Chinese-mode users (`auth.languageCode`).
- Console: sender name "Student Nest" in Authentication → Templates (verification + password reset).
- M2: "profiles listed" untranslated on Roommates.
- Full phone test incl. Chinese mode, then commit "C3 part 2".

## Done 19 Oct
- S1: live Firestore rules were wide open (anyone could read roommate contact details without an
  account). Published the repo's `firestore.rules`; anonymous reads now refused.
- C3 part 1: verification email at signup; contacting or posting roommates needs a verified email;
  contact details live in `/roommates/{uid}/private/contact`. Test posts deleted.

## Done: C5 batch 5 (15 Oct)
Budget Buddy prompt (`functions/prompts.js`) no longer states prices, discounts or sticker times
as fact: rough ranges first, then UNiDAYS / Student Beans. Prompt only; it reaches students with C6.
Later: London-aware Budget Buddy (Oyster, Zone 1-2 travel, London rent).

## Still to do before launch

### Critical
- [ ] C3 part 2 (part 1 done 19 Oct). Rules changes go through the console.
- [ ] C4: report and block on roommate profiles (App Store guideline 1.2).
- [ ] C6 (Wed 21 Oct, with C4): first deploy of Budget Buddy. The project is on Spark and `chat` has
      never been deployed, so Budget Buddy can't answer yet. Needs Blaze + a Gemini key secret.
      Steps, region choice and phone test: LAUNCH_READINESS.md appendix. Never a plain `firebase deploy`.

### High
- [ ] H2: per-user rate limit on the `chat` function (straight after C6).
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
