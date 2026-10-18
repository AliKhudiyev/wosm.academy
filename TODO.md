# TODO — open questions and placeholders for the owner

Every item below appears on the site as a visible `TODO(owner): …` highlight (or is a decision that affects one).
Nothing here has been filled in by guesswork. Tick items off and delete them as you go.

To find them all in the source: `grep -rn "TODO(owner)\|<Todo" src`.

---

## 1. Before launch (blocking)

### Brand
- [ ] **Choose the logo variation** (A, B or C) at `/brand-preview/` (run `npm run dev`, open http://localhost:4321/brand-preview/).
      Then set `logoVariant` in `src/config/brand.ts`, run `npm run brand` (regenerates favicon, touch icon, OG image and
      the outlined SVGs in `src/assets/brand/`), and **delete `src/pages/brand-preview.astro`**. A is in use until then.

### Courses (`src/content/courses/*.md`)
Offered now (`status: open`): CS101-F26, CS102-F26, MAT101-F26. Planned (`status: planned`, no enrol button): CS103-S27,
CS232-F27, CS203-S28, CS204-S28, CS301-F28, CS302-F28, CS303-F28, MAT102-S27, MAT103-S27, MAT231-F27, MAT202-S28.
Codes follow the convention in CLAUDE.md (“Course codes”).
- [ ] `durationWeeks: 12` and `effortHoursPerWeek: 4–6` are identical for CS101, CS102 and MAT101 — the same values as
      the examples in the original file comments. Confirm they are real (CS102 has 22 syllabus units, MAT101 has 27).
- [ ] Confirm the one-line `summary` of every course. The planned modules' summaries were drafted from the first
      paragraph of their module descriptions.
- [ ] When a planned module opens: set `status: open`, `moodleUrl`, `durationWeeks` and `effortHoursPerWeek`.

### Module descriptions (`src/content/module-descriptions/*.tex`)
Each course page shows its .tex file; `npm run pdfs` recompiles the PDFs offered for download (run it after every edit).
- [ ] Computer science credits were set from the study hours at 30 hours per credit, rounded, as in the maths modules
      (CS103/CS232/CS203/CS302: 7, CS204/CS303: 8, CS301: 6). CS101 and CS102 have no hours yet and were given 7 ECTS,
      like MAT101 — confirm, and fill in their hours tables.
- [ ] CS101, CS102: hours table, *Aims*, assessment weights, *Policies* → Attendance and Late submissions
- [ ] **Digital Design and Computer Architecture II** (CS221-F27, Semester 3) has no module description yet
- [ ] Obvious typos were fixed when the course texts were merged — check you agree: “respondible”, “trasfer”,
      “relvant”, “sicnece”, “grpah”, “Preidates”, “Propostional”, “Davind Harris”, “SPringer”, Gries & Schneider
      publisher “Spring” → Springer, the RISC-V link `httsp://` → `https://`; CS101: “help them learn” → “help you learn”;
      Sedgewick & Wayne title “Computer Science -- An Interdisciplinary Approach” → “Computer Science: An
      Interdisciplinary Approach”

### Programme (`src/content/programmes/`, page `/programme/`)
- [ ] Approve the programme copy: summaries, “later modules build on earlier ones”, and the credits note (“They are not
      formally transferable credits.”)
- [ ] Credits/hours for the thesis (after Semester 5)
- [ ] Advanced programme (3–4 semesters): structure and modules when ready — set `status: available` and add semesters
- [ ] New module: give it a code (CLAUDE.md, “Course codes”), add its course `.md` and its
      `<code>-module-description.tex` (copy `_template.tex`), run `npm run pdfs`, and set `course:` on the module in
      `src/content/programmes/foundation.md`

### Subjects (`src/content/subjects/`)
- [ ] Confirm the summaries and body text for Computer Science and Mathematics (rewritten from the module descriptions
      when Discrete Structures moved to Mathematics)

### Founder (`src/content/people/ali-khudiyev.md`)
- [ ] Biography (80–150 words)
- [ ] Portrait photo (square, ≥ 600 × 600 px; put it next to the .md file and uncomment `photo`/`photoAlt`)
- [ ] Links: website, GitHub, Google Scholar, ORCID, LinkedIn (any)

### Links and services (`src/config/site.ts`, `src/config/giscus.ts`)
- [ ] **Discord invite URL** → `site.discord` (shown in the footer and on Join, Contact and About)
- [ ] **giscus**: enable Discussions on `AliKhudiyev/wosm.academy`, create an announcement-type category “Journal”,
      install the giscus app, generate IDs at https://giscus.app, set `repoId` and `categoryId` (see `docs/DEPLOYMENT.md` §6)
- [ ] Moodle privacy policy URL → `site.moodle.privacy`
- [ ] Confirm `hello@wosm.academy` and `teach@wosm.academy` mailboxes actually receive mail (MX/SPF/DKIM/DMARC)

### Journal
- [ ] Write “Founding WoSM Academy” (`src/content/journal/founding-wosm-academy.md`): summary, body, publication date —
      or set `draft: true` to hide it (the home page section and RSS hide automatically when there are no posts)

### Deployment (see `docs/DEPLOYMENT.md`)
- [ ] Settings → Pages → Source: **GitHub Actions**
- [ ] DNS A/AAAA records for the apex, `www` CNAME; keep the `moodle` record; CAA allows `letsencrypt.org`
- [ ] Custom domain `wosm.academy`, Enforce HTTPS, verify the domain
- [ ] Push `main` (nothing has been pushed yet)

---

## 2. Policy questions shown on the site

| Where | Question |
|---|---|
| Join → Who can join | Minimum age, or a policy for students under 18 |
| Join → What to expect from us | Realistic response time for student questions |
| Contact | Expected reply time for email |
| Teach → Open roles | Time commitment for the standing volunteer role (`commitment` in `src/content/vacancies/volunteer-instructor.md`) |
| Teach → Who we’re looking for | Is a formal qualification required? (copy currently says “welcome but not required”) |
| Teach → What you get | What instructors receive — see options below |
| Teach → What happens next | Reply time for applications (days) |
| Teach / Privacy | How long CVs and letters are kept, and when they are deleted |
| FAQ | Are completion certificates issued? (Join page says nothing about certificates until this is known) |
| FAQ | Is WoSM Academy accredited? (honest answer) |
| FAQ | Can students take several courses at once? Any limit or workload advice? |
| FAQ | How can people support the Academy? (donations? volunteering? none?) |
| About → Our mission | Why computer science and mathematics first |
| About → Transparency | How the Academy is funded and what it costs to run — or remove the section |
| Privacy | Who is the data controller, and which law applies |
| Licence | Are the WoSM Academy name and glider logo covered by CC BY-SA 4.0, or excluded? |

**“What you get” — options to choose from (do not publish any you can’t honour):**
- an instructor profile on the About page
- credit on the course materials (author line, licence attribution)
- teaching experience and a public course you can point to
- a reference letter on request
- access to the Academy community of instructors

---

## 3. Copy to approve

Drafted from the spec; please read and approve or rewrite:
- [ ] Manifesto (home page and About, `src/components/Manifesto.astro`) — the full version on About is currently the
      same five paragraphs; expand if you wish
- [ ] About → Our mission, The name (incl. “A starving mind is one that wants to learn and has nothing to feed on.”),
      How we work
- [ ] Code of Conduct (adapted from Contributor Covenant 2.1). Reports go to `hello@wosm.academy` — consider a
      dedicated address such as `conduct@wosm.academy`
- [ ] Privacy page as a whole (written from what the site actually does today)
- [ ] Teach → “We use your CV and letter only to consider your application.”
- [ ] `LICENSE` (MIT) names “WoSM Academy” as the copyright holder — confirm, or use your name

---

## 4. Course materials (`materials/`)

- [ ] **`wosm.sty`**: it was not among the uploaded template files (`wosm-article.cls` came twice), so
      `materials/templates/wosm.sty` is a reconstruction (site colours, Latin Modern, glider mark). If you have the
      original, replace it and run `npm run materials`; the lectures only use `\course{…}{…}` from it
- [ ] MAT231-F27 Lectures 01–25 (`materials/mat231-f27/`, all units of the module): review the content. The title
      slides give the semester as “Fall 2027” and the author as “Dr. Ali Khudiyev”, both from the module
      description. Lectures 07 and 11–13 follow your guidance documents. Reading references are to Strang & Herman,
      *Calculus, Volume 2* (OpenStax), Sections 4.1–4.5, 5.2–5.6 and 6.1–6.4, *Calculus, Volume 3*, Sections
      4.1–4.8, 5.1–5.7, 6.1–6.3 and 7.1–7.3, Marsden & Tromba, *Vector Calculus*, Sections 3.1–3.2 (Lecture 13),
      3.4 (Lecture 16), 3.5 (Lecture 17), 6.4 (Lecture 21) and Chapter 8 (mentioned in Lecture 22), Boyd &
      Vandenberghe, *Convex Optimization*, Section 3.1 (Lecture 14) and Sections 9.1–9.3 (Lecture 15), Apostol,
      *Calculus, Volume 2*, Chapter 7 (Lecture 25), and Wilf, *generatingfunctionology*, Chapter 1 (Lecture 07) —
      check the section numbers against your copies. Lecture 15 points students to Project 2 but does not solve any
      part of it. Lecture 25's last slide restates the final exam details from the module description
- [ ] **MAT231-F27 Lecture 08 reading** (Stirling's approximation): none of the books on the reading list covers it.
      The “This lecture” slide shows a `TODO(owner)` placeholder until you choose a text
- [ ] **MAT231-F27 Lecture 04 reading**: none of the books on the module's reading list covers uniform convergence
      (Unit 4). The “This lecture” slide shows a `TODO(owner)` placeholder until you choose a text

---

## 5. Later / nice to have

- [ ] Custom giscus themes matching the site tokens (currently giscus’s built-in `light` and `dark_dimmed`)
- [ ] Analytics: none. If ever added, cookieless only (e.g. GoatCounter) and update the Privacy page first
- [ ] Course codes and slugs: consider whether future terms reuse the page or get a new one (see §1)
