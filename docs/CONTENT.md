# Content specification

All placeholder values are marked `TODO(owner)`. Never replace a placeholder with an invented fact.

---

## 1. Sitemap

```
/                         Home
/courses/                 Catalogue (all courses, filterable)
/courses/<subject>/       Subject page (e.g. /courses/computer-science/)
/courses/<subject>/<slug>/   Course page
/join/                    Admission: how to join as a student
/teach/                   Teach with us: vacancies and how to apply
/teach/#<vacancy-id>      Vacancies are listed on /teach/ with anchors (no separate pages yet)
/about/                   Manifesto, mission, people, how we work, transparency
/journal/                 News, announcements, essays
/journal/<slug>/          Post (with giscus reactions/comments)
/contact/                 Email, Discord, GitHub
/faq/
/code-of-conduct/
/licence/
/privacy/
/rss.xml                  Journal feed
/sitemap-index.xml        (@astrojs/sitemap)
/404                      "This page starved."
```

**Header nav:** Courses · Join · Teach · About · Journal · Contact · [Moodle ↗]
**Footer:** FAQ · Code of Conduct · Licence · Privacy · Discord · GitHub · RSS

---

## 2. Voice and copy rules

- **Earnest-academic by default.** Clear, precise, warm, unpretentious. Write like a good professor's syllabus, not a startup landing page.
- **Short sentences, concrete claims.** Say what happens, not how amazing it is.
- **Playful-hacker only in small doses:** the 404 page, status badges, the simulation caption, the occasional aside in Journal posts. Never in the manifesto, Join, Teach, or legal pages.
- **Banned phrases:** "unlock your potential", "journey", "empower", "cutting-edge", "world-class", "revolutionise", "seamless", "dive in", "elevate", "leverage", "in today's fast-paced world", "transform your future". No exclamation marks outside the 404 page.
- Address the reader as "you"; the Academy is "we".

---

## 3. Content collections (schemas)

Define with zod in `src/content.config.ts`. Fields marked ? are optional.

### `subjects`
```yaml
title: Computer Science
slug: computer-science          # from filename
colorToken: --subject-cs
order: 1
summary: One sentence.
```
Body: 1–2 paragraphs describing the subject at WoSM.

### `courses`
```yaml
title: Introduction to Informatics
code: CS101                     # suggested codes below; owner may change
subject: computer-science       # reference to subjects
level: introductory             # introductory | intermediate | advanced
summary: One sentence for lists.
status?: open                   # open | upcoming | archived — omit until confirmed (shows [tbc], no enrol button)
format?: self-paced             # self-paced | cohort — omit until confirmed (shows TODO)
durationWeeks?: 12
effortHoursPerWeek?: 4–6
startDate?: 2026-11-01          # only for cohort courses
prerequisites?: []              # references to other courses; omit = unknown (TODO), [] = none
recommended?: []                # softer than prerequisites
instructors: [founder]          # references to people
moodleUrl?: https://moodle.wosm.academy/course/view.php?id=…   # omit until known
order: 1
```
Body (Markdown): **About this course**, **What you will learn** (bulleted outcomes), **Syllabus** (table: week/unit → topics), **How it's assessed**, **Materials & licence**.

### `people`
```yaml
name: Ali Khudiyev
slug: ali-khudiyev              # from filename; used as the #anchor on /about/
role: Founder & Director
credentials:
  - PhD in Artificial Intelligence, University of Strasbourg (2025)
photo?: ./ali-khudiyev.jpg
photoAlt?: …
# courses taught are derived from the courses' `instructors` field (no `teaches` field)
links?: { website?, github?, scholar?, orcid?, linkedin? }
order: 1
```
Body: short biography (TODO(owner)).

### `vacancies`
```yaml
title: Volunteer instructor — Mathematics
area: mathematics               # subject slug or "any"
status: open                    # open | filled | closed
commitment?: e.g. "~4–6 hours per week for one term"
posted: 2026-10-05
summary: One sentence.
```
Body: what the role involves, who it suits, what we offer.

### `journal`
```yaml
title: ...
date: 2026-10-05
summary: ...
tags?: [announcement]
draft?: false
```

---

## 4. Launch content

### Subjects

| Slug | Title | Courses |
|---|---|---|
| `computer-science` | Computer Science | CS101, CS102, CS201 |
| `mathematics` | Mathematics | MATH101 |

### Courses

Confirmed by the owner (5 October 2026): three courses, all in Computer Science. The `-F26` suffix marks the term.

| Code | Title | Subject | Level | File |
|---|---|---|---|---|
| CS101-F26 | Introduction to Informatics | CS | introductory | `cs101-f26.md` |
| CS102-F26 | Introduction to Digital Design and Computer Architecture | CS | introductory | `cs102-f26.md` |
| CS103-F26 | Discrete Structures | CS | introductory | `cs103-f26.md` |

The earlier draft (CS201 Data Structures and Algorithms; MATH101 Discrete Structures under Mathematics) is superseded.
Mathematics therefore has no courses at launch; its subject page says so and links to /teach/.

Draft one-line summaries (owner to confirm):
- **CS101-F26** — What computation is, how information is represented, and how to think and write like a programmer.
- **CS102-F26** — From logic gates to a working processor: how digital circuits are designed and how computers are built.
- **CS103-F26** — The mathematics of computer science: logic, proofs, sets, relations, functions, combinatorics and graphs.

Prerequisites, syllabus, duration, effort, format, status and Moodle URL: `TODO(owner)` for every course.

### People
One entry: **Ali Khudiyev**, Founder & Director. Known: PhD in Artificial Intelligence, University of Strasbourg, 2025; instructor for all launch courses. Bio, photo, links: `TODO(owner)`.

### Vacancies
One standing entry: **Volunteer instructor (any area)** — open application, status open. Optionally one per subject.

### Journal
One launch post: "Founding WoSM Academy" — TODO(owner) to write; provide a skeleton with headings only.

---

## 5. Page specifications

### Home `/`

1. **Hero** (left-aligned, not centred billboard):
   - Eyebrow (mono): `WISDOM OF STARVING MINDS`
   - H1: **Knowledge should not be rationed.**
   - Lead (1–2 sentences): WoSM Academy offers free, rigorous courses in computer science and mathematics to anyone who wants to learn.
   - Buttons: `Browse courses` (primary) · `How to join` (secondary)
2. **Manifesto (short)** — the five short paragraphs below, then a link "Read the full manifesto →" to `/about/#manifesto`.
3. **Subjects** — one block per subject: title, summary, list of its courses (code + title + status). Link to subject page.
4. **How it works** — three numbered steps (mono numerals): Choose a course → Create a Moodle account and confirm your email → Enrol and start learning, with others on Discord.
5. **What we promise / what we ask** — two columns (stacked on mobile).
   - We promise: free access, always · no ads, no tracking · openly licensed materials · courses built and reviewed with care · honest feedback on your work.
   - We ask: curiosity · honest effort and academic integrity · respect for others in the community · passing knowledge on when you can.
6. **Teach with us** — one paragraph + link to `/teach/`.
7. **From the Journal** — latest 2–3 posts (hide the section if none).

### Draft short manifesto (owner to edit)

> Minds go hungry when knowledge is locked away behind fees, borders, and gatekeepers. Many people who would love to learn never get the chance.
>
> We believe understanding is not a luxury. The ideas that shaped computing and mathematics belong to everyone who wants to learn them.
>
> WoSM Academy teaches these ideas rigorously and for free. Our courses are demanding because we take our students seriously, not to keep anyone out.
>
> Learning is not a solitary act. In Conway's Game of Life, a cell with too few neighbours starves; a cell among others lives. Minds work the same way, so we learn in company.
>
> What you learn here is yours to keep and yours to pass on.

The full manifesto on `/about/` may expand each point. TODO(owner): approve or rewrite.

### Courses `/courses/`
- H1 "Courses", short intro.
- Filter bar (progressive enhancement): Subject, Level, Status. Without JS: show all, grouped by subject. A filter is only rendered when it has at least two values among the courses, so at launch (three introductory CS courses with unconfirmed status) no filter bar appears; it appears by itself as courses are added. Filters are reflected in the URL (`?subject=…&level=…&status=…`).
- Course items per `DESIGN.md` → Components.
- Note at bottom: "More subjects and courses are on the way. Want to teach one? → /teach/"

### Subject page `/courses/<subject>/`
Subject title + body + its courses + a suggested learning path (simple ordered list derived from prerequisites).

### Course page
- Eyebrow: `CS101 · Computer Science · Introductory`
- H1 title, summary as lead
- Facts list (definition list): Format, Duration, Effort, Status, Start date, Prerequisites (linked), Instructor (linked to About#person)
- Primary button: `Enrol on Moodle ↗` (disabled-looking with text "Enrolment opens soon" when `upcoming`; hidden when `archived`)
- Body sections from Markdown
- Footer note: "Free. No application needed. New to Moodle? See How to join."

### Join `/join/`
- H1 "How to join". Lead: Joining is free and open to everyone. There is no application.
- **Who can join** — anyone, any age (TODO(owner): minimum age / under-18 policy?), any country, any background. What you need: an internet connection, an email address, and time.
- **Step-by-step** (numbered, each with a short explanation):
  1. Choose a course from the catalogue.
  2. Create an account at moodle.wosm.academy (link directly to the signup page: TODO(owner) confirm URL, usually `/login/signup.php`).
  3. Confirm your email — check spam if the message doesn't arrive.
  4. Open the course page on Moodle and select *Enrol me*.
  5. Join the Discord to meet other students.
- **What to expect from us** — reuse the promises, expanded: materials, exercises, feedback, response times (TODO(owner): realistic response time?), certificates (TODO(owner): are completion certificates issued? If unknown, say nothing).
- **What we expect from you** — integrity, respect, Code of Conduct link.
- Callout: trouble signing up? → Contact.
- Short FAQ subset with link to `/faq/`.

### Teach `/teach/`
- H1 "Teach with us". Lead: WoSM Academy grows through volunteers who care about teaching. If you know a subject well and want to share it, we would like to hear from you.
- **Open roles** — list from `vacancies` collection (status open). If none besides the standing one, show only the standing open application.
- **What the role involves** — design and teach your own course on Moodle: materials, exercises, assessments; answer student questions; keep the course up to date.
- **Who we're looking for** — deep knowledge of the subject (formal qualification welcome but not required — TODO(owner): confirm), clear communication, reliability.
- **What you get** — TODO(owner): e.g. instructor profile on the site, credit on course materials, teaching experience, a reference letter. Do not invent; offer this list to the owner as options.
- **How to apply** (callout):
  - Email `teach@wosm.academy` with subject `Teaching application — <area> — <your name>`.
  - Attach a CV and/or motivation letter (PDF). Say which area/course you'd like to teach and a rough outline if you have one.
  - Provide a `mailto:` link with subject and body template pre-filled (URL-encoded); body template contains headings only — no personal data in URLs.
- **What happens next** — numbered process:
  1. We read every application and reply within TODO(owner) days.
  2. A short conversation (video call) about your area and plans.
  3. You receive course-creator access on Moodle and build your course.
  4. Quality review by the Academy (the Director acts as QA): content accuracy, structure, accessibility, licence.
  5. Your course is published and listed on this website.
- **Licensing note** — course materials are published under the Academy's content licence (see /licence/); confirm before you apply.
- Privacy note: how CVs are handled and how long they are kept (TODO(owner)); link /privacy/.
- **Never** collect CVs through GitHub issues, Discussions or any public channel.

### About `/about/`
Sections with anchor links at top:
1. **Manifesto** (`#manifesto`) — full version.
2. **Our mission** — democratise knowledge; free, open, rigorous; why CS and Mathematics first.
3. **The name** — short explanation of "Wisdom of Starving Minds" and the Game of Life metaphor; mention the glider logo.
4. **People** (`#people`) — from `people` collection: photo, name, role, credentials, short bio, courses taught, links. Each person has an anchor `#<slug>`. Scales to a grid when > 3 people.
5. **How we work** — courses are taught on Moodle; volunteer instructors; quality review process; materials licence.
6. **Transparency** — who runs the Academy, how it's funded and what it costs to run (TODO(owner): fill in or remove the section). Do not invent numbers.
7. **Get involved** — links to Join, Teach, Discord.

### Journal `/journal/`
Reverse-chronological list: date (mono), title, summary. Post pages: title, date, reading time, body, tags, giscus at the bottom (lazy-loaded, theme synced with site theme: use giscus light/dark themes or a custom CSS URL matching tokens). RSS link.

### Contact `/contact/`
- General enquiries: `hello@wosm.academy`
- Teaching applications: link to /teach/
- Community & quick questions: Discord invite `TODO(owner)`
- Website issues: GitHub repo issues link
- Note: no contact form (static site); expected reply time TODO(owner).

### FAQ `/faq/`
Use `<details>` accordions. Seed questions (answers TODO(owner) where unknown):
- Is it really free? (Yes.)
- Do I need any prior knowledge?
- Do I get a certificate? (TODO)
- Is WoSM Academy accredited? (Answer honestly; TODO(owner))
- How much time do I need per week?
- Can I take several courses at once?
- I didn't receive the confirmation email.
- How can I teach at WoSM?
- In what language are courses taught? (English)
- How can I support the Academy? (TODO)

### Code of Conduct, Licence, Privacy
- **Code of Conduct:** adapt the Contributor Covenant (credit it) to a learning community: respect, academic integrity, no harassment, how to report (email), enforcement.
- **Licence:** website code MIT; course and website content CC BY-SA 4.0 (both confirmed by the owner).
- **Privacy:** what the website collects (nothing; no cookies, no analytics), what giscus does on Journal pages (GitHub sign-in to comment), what Moodle collects (link to Moodle's own privacy policy page), how teaching applications by email are handled.

### 404
Heading: **This page starved.** Text: "It had no neighbours and didn't survive the last generation." A static glider SVG. Links to Home and Courses. (The one place the hacker voice can be a little louder.)

---

## 6. Metadata
- `<title>`: `Page — WoSM Academy`; home: `WoSM Academy — Wisdom of Starving Minds`.
- Meta description per page (≤ 155 chars).
- Open Graph + Twitter card tags; default OG image from `DESIGN.md`.
- JSON-LD: `EducationalOrganization` on Home; `Course` on course pages (name, description, provider, `isAccessibleForFree: true`, `inLanguage: en`).
- Canonical URLs using `https://wosm.academy`.
