---
marp: true
theme: woodmark
paginate: true
header: 'My Presentation'
footer: '<span class="foot-date">01.01.2026</span>My Presentation · Internal · © Woodmark Consulting GmbH'
---

<!-- _class: lead -->
<!-- _paginate: false -->

# Presentation Title
## A short, descriptive subtitle

<span class="small">Author · Date · Audience</span>

---

<!-- _class: banner -->

## Agenda

- Where we are today
- The proposed approach
- Architecture overview
- Next steps

---

<!-- _class: steps -->

## How to get started

- Clone the template and install dependencies
- Copy `starter.md` and set your title & footer
- Write slides in Markdown with a layout per section
- Add diagrams as ` ```mermaid ` code fences
- Preview live with the Marp VS Code extension
- Export on-brand PDF / PPTX via `npm run build`

---

## A standard content slide

Plain slides use a white background with a green title.

- Bullet points read cleanly at a distance.
- <span class="note">Recommendation:</span> keep to one idea per slide.
- <span class="muted">Secondary, de-emphasised detail.</span>

---

## Architecture (Mermaid)

```mermaid w=900
graph LR;
  A[Source] --> B[Processor];
  B --> C[(Store)];
  B --> D[Sink];
```

> Diagrams are rendered to themed SVG at build time — see the README.

---

<!-- _class: statement -->

# One big statement
worth pausing on.

---

<!-- _class: lead -->
<!-- _paginate: false -->

# Thank You

### Questions? Comments? Feedback?

<span class="muted">Woodmark Consulting</span>
