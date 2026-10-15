# Student Nest: pre-launch TODO

Working rules: plan first, one fix or batch per commit, test on a phone before moving on.

## Schedule to the client meeting (agreed 15 Oct)
- Oct 16-17/18: C3 · Oct 18-19: C6 (Blaze + Budget Buddy deploy) · Oct 19-20: C4
- Oct 20: H3 · Oct 21: buffer · Oct 22: prep · Oct 23: client meeting
- Budget Buddy confirmed broken on the phone (15 Oct): shows "I couldn't connect right now".

## Next session: C3 (verified email before roommate contact details)
Copy the live rules from the Firebase console first; they may differ from `firestore.rules`.
Budget Buddy still can't answer at all (connection error) until C6 deploys `chat` with the new prompt.

## Done: C5 batch 5 (15 Oct)
Budget Buddy prompt (`functions/prompts.js`) no longer states prices, discounts or sticker times
as fact: rough ranges first, then UNiDAYS / Student Beans. Prompt only; it reaches students with C6.
Later: London-aware Budget Buddy (Oyster, Zone 1-2 travel, London rent).

## Still to do before launch

### Critical
- [ ] C3: require a verified email (any domain) before students can read roommate contact details. Rules change goes through the console.
- [ ] C4: report and block on roommate profiles (App Store guideline 1.2).
- [ ] C6 (after C3, before C4): first deploy of Budget Buddy. The project is on Spark and `chat` has
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
