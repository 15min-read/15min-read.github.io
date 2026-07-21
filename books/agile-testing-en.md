# Agile Testing

## Metadata

- **Title:** Agile Testing: A Practical Guide for Testers and Agile Teams
- **Author:** Lisa Crispin & Janet Gregory
- **Year:** 2009
- **Category:** Technology / Software Engineering
- **Reading Time:** 15 minutes
- **Level:** Intermediate — recommended familiarity with agile software development

## Table of Contents

1. The Core Idea
2. Implementation Checklist
3. Quick Quiz
4. Connections with Other Books
5. Personal Review
6. Worth Reading the Full Book If...
7. Summarizer's Notes
8. Quick Recap

---

## The Core Idea

**Summary:**

Lisa Crispin and Janet Gregory argue that, in agile teams, testing shouldn't be an isolated phase at the end of the development process, executed only by a separate QA team, but rather a continuous and shared responsibility of the entire team — including developers, testers and product owners — from the beginning of each development cycle. This mindset shift is the core of the book: testing "together with" development, not "after it."

One of the central concepts is the **Agile Testing Quadrants**, a model that organizes the different types of tests into four quadrants, crossing two dimensions: whether the test supports the team (guiding development) or critiques the product (evaluating the final result), and whether the test is business-facing or technology-facing:

1. **Quadrant 1** — tests that support the team, technology-facing: unit tests and component tests, generally automated, which guide the technical design of the code.
2. **Quadrant 2** — tests that support the team, business-facing: functional tests, examples and prototypes that help clarify requirements before or during development (often linked to practices like BDD — Behavior-Driven Development).
3. **Quadrant 3** — tests that critique the product, business-facing: exploratory tests, usability tests and user acceptance tests, generally manual.
4. **Quadrant 4** — tests that critique the product, technology-facing: performance tests, security tests, load tests and other non-functional tests.

The authors advocate that effective agile teams must balance effort across the four quadrants, instead of concentrating all testing effort only on manual acceptance tests at the end of the cycle (a traditional approach that generates bottlenecks and delays).

Another pillar of the book is the concept of **"agile testers"** as an integrated part of the team, and not as an external quality control function. This implies that testers participate from the planning of each user story, helping clarify acceptance criteria even before code is written — a practice that connects with the concept of **"test before code,"** reducing rework and ambiguity.

The book also extensively addresses the importance of **test automation** in multiple layers (unit, integration, interface), as a way to enable frequent and continuous deliveries without sacrificing quality, since isolated manual tests don't scale at the pace required by short agile cycles (sprints).

Crispin and Gregory also emphasize collaboration between the "three amigos" (three amigos) — developer, tester and product owner — in short meetings before developing each feature, to align understanding about requirements, edge cases and acceptance criteria, preventing communication problems that would normally only be discovered late in the process, during final manual tests.

**Practical Example:**

The book describes the case of a team that, before adopting agile testing practices, only discovered misunderstood requirement problems during the final manual tests of each sprint, generating constant rework. By adopting "three amigos" meetings before developing each story, with concrete examples discussed between developer, tester and product owner, the team started identifying requirement ambiguities even before code was written, drastically reducing rework and accelerating the delivery cycle.

**Why It Matters:**

In agile development environments, with short cycles and frequent deliveries, treating testing as an isolated and late phase generates bottlenecks that compromise the very speed that agile methodology seeks to deliver. Integrating testing throughout the entire process — and not just at the end — is what allows maintaining quality without sacrificing delivery cadence.

---

## Implementation Checklist

### Before Getting Started

- [ ] Evaluate in which of the four Agile Testing Quadrants your team currently invests the most effort, and where there are gaps
- [ ] Check if testers participate in user story planning from the beginning, or only at the end of the cycle
- [ ] Identify recurring bottlenecks caused by late manual tests in the current process

### During Implementation

- [ ] Implement "three amigos" (dev, tester, product owner) meetings before developing each user story
- [ ] Prioritize creating automated tests in the unit and integration layers before expanding manual tests
- [ ] Define clear acceptance criteria and concrete examples before starting to code each feature
- [ ] Distribute quality responsibility across the entire team, not just in the QA role

### After Implementation

- [ ] Periodically review the balance of effort across the four test quadrants
- [ ] Monitor if rework due to misunderstood requirements is decreasing over time
- [ ] Evaluate automated test coverage and adjust where there's still excessive dependence on manual tests

---

## Quick Quiz (5 questions)

1. What's the central mindset shift advocated by the book regarding when to test in the development process?
2. How does the Agile Testing Quadrants model work and what are its two dimensions?
3. What does it mean for testers to be an integrated part of the team, and not an isolated QA function?
4. Why is multi-layer test automation considered essential in short agile cycles?
5. What's the "three amigos" practice and what problem does it seek to prevent?

---

## Connections with Other Books

### Related Books

- **Clean Code** (Robert C. Martin) — complements with code quality principles that facilitate the testability discussed in Agile Testing.
- **The Pragmatic Programmer** (David Thomas and Andrew Hunt) — reinforces broad quality and automation practices in software development.
- **Extreme Programming Explained** (Kent Beck) — deepens related agile practices, like test-driven development (TDD), cited as the basis for several ideas in the book.

### Suggested Reading Order

Extreme Programming Explained → Clean Code → Agile Testing → The Pragmatic Programmer (from agile foundations to specific code quality practices, integrated testing and general good engineering practices).

---

## Personal Review

### Strengths

- The Agile Testing Quadrants model offers a clear and widely adopted framework in the industry for organizing testing strategy
- Combines theory with extensive practical experience from the authors in real teams
- Reinforces an important cultural shift: quality as a shared responsibility, not just of a specific role

### Weaknesses

- Published in 2009, some references to specific automation tools are outdated
- More conceptual and cultural focus than detailed technical tutorials on implementing automated tests
- Considerable length of the original work, with repetition of concepts in different chapters

### For Whom

Testers, developers and technical leaders who work in agile teams and want to better structure their team's quality and testing strategy.

### Not For Whom

Developers looking for specific technical tutorials on test automation tools — the book is more conceptual and cultural than a step-by-step technical manual.

---

## Worth Reading the Full Book If...

- You lead or are part of an agile team and want to restructure your testing strategy more deeply
- You want more complete case studies on implementing the Agile Testing Quadrants in different contexts
- You're a tester looking to better understand your role within a multidisciplinary agile team

---

## Summarizer's Notes

The most lasting value of the book lies in the Agile Testing Quadrants, a framework that remains widely referenced in the software industry more than a decade after publication, precisely for offering a simple way to visualize and balance different test types within an agile cycle, preventing teams from concentrating excessively on just one type of quality check.

---

## QUICK RECAP (30 seconds)

**Remember the main thing in 30 seconds:**
Tests should be integrated into the agile development process from the start, not an isolated phase at the end. The Agile Testing Quadrants organize tests into four quadrants (support team/critique product × business/technology). Testers are part of the team, collaborating from story planning.

**Immediate action:**
Organize a "three amigos" (dev, tester, product owner) meeting before starting your team's next user story, to align acceptance criteria with concrete examples.
