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

### Courses (`src/content/courses/*.md`) — for each of CS101-F26, CS102-F26, CS103-F26
- [ ] `status`: open / upcoming / archived (until set, the course shows `[tbc]` and no enrol button)
- [ ] `moodleUrl`: the course's Moodle URL (`https://moodle.wosm.academy/course/view.php?id=…`)
- [ ] `format`: self-paced or cohort; `startDate` if cohort
- [ ] `durationWeeks`, `effortHoursPerWeek`
- [ ] `prerequisites` (`[]` means none) and `recommended`. Earlier suggestion from `docs/CONTENT.md`:
      CS102 recommends CS101; CS101 and CS103 have no prerequisites — **confirm or change**
- [ ] Confirm the one-line `summary` (drafts from `docs/CONTENT.md`)
- [ ] `durationWeeks: 12` and `effortHoursPerWeek: 4–6` are identical for all three courses — the same values as the
      examples in the original file comments. Confirm they are real (CS102 has 22 syllabus units, CS103 has 27).
- [ ] Note: the codes carry a term suffix (`-F26`), so URLs are `/courses/computer-science/cs101-f26/`. If a course
      will run again next term, decide whether to add a new file (e.g. `cs101-s27.md`) or rename.

### Module descriptions (`src/content/module-descriptions/*.tex`) — CS101, CS102, CS103
The course pages now show these LaTeX files (the Markdown course bodies were merged into them).
- [ ] `\Credits` (e.g. `10 ECTS`; the number is used for semester totals on /programme/)
- [ ] `\Email` and `\OfficeHours` (shown on the course page as written)
- [ ] Hours table in *Teaching and Learning Methods* (Lectures, Labs / Tutorials, Independent study, **Total** — the
      total appears on /programme/)
- [ ] *Aims*; assessment weights; *Policies* → Attendance and Late submissions
- [ ] `\Semester{Fall 2026}` was inferred from the `-F26` code suffix (as in your template, CS222-F26 = Fall 2026) — confirm
- [ ] Obvious typos were fixed while merging — check you agree: “respondible”, “trasfer”, “relvant”, “sicnece”,
      “grpah”, “Preidates”, “Propostional”, “Davind Harris”, “SPringer”, Gries & Schneider publisher “Spring” → Springer,
      the RISC-V link `httsp://` → `https://`; CS101: “help them learn” → “help you learn”; Sedgewick & Wayne title
      “Computer Science -- An Interdisciplinary Approach” → “Computer Science: An Interdisciplinary Approach”

### Programme (`src/content/programmes/`, page `/programme/`)
- [ ] **CS102 title**: the plan calls it “Digital Design and Computer Architecture I”, the course is still
      “Introduction to Digital Design and Computer Architecture”. Rename the course (title in `cs102-f26.md` and
      `\ModuleTitle` in the .tex) or the plan entry, so the two match.
- [ ] Approve the programme copy: summaries, “later modules build on earlier ones”, and the credits note (“They are not
      formally transferable credits.”)
- [ ] Credits/hours for the thesis (after Semester 5)
- [ ] Advanced programme (3–4 semesters): structure and modules when ready — set `status: available` and add semesters
- [ ] When a new module is offered: add its course `.md`, its `…-module-description.tex`, and set `course:` on the
      module in `src/content/programmes/foundation.md`

### Subjects (`src/content/subjects/`)
- [ ] Confirm the draft summaries and body text for Computer Science and Mathematics
- [ ] **Mathematics has no courses** (Discrete Structures is listed under Computer Science as CS103-F26). The subject
      page says so and invites teachers. Describe the planned mathematics programme, or remove the subject until its
      first course exists. The home page lead (“…courses in computer science and mathematics…”) assumes it stays.

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

## 4. Later / nice to have

- [ ] Custom giscus themes matching the site tokens (currently giscus’s built-in `light` and `dark_dimmed`)
- [ ] Analytics: none. If ever added, cookieless only (e.g. GoatCounter) and update the Privacy page first
- [ ] Course codes and slugs: consider whether future terms reuse the page or get a new one (see §1)
