---
target: Sobre Nosotros
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\javie\\Desktop\\learningprjc\\front_learningprjct\\src\\pages\\SobreNosotros.jsx"
target_fingerprint: "sha256:2bea0132b1bbc040942f22b40a398db8674e00a4a51590b338c61e324f2bcdb0"
target_path: "C:\\Users\\javie\\Desktop\\learningprjc\\front_learningprjct\\src\\pages\\SobreNosotros.jsx"
timestamp: 2026-10-16T07-20-50Z
slug: front-learningprjct-src-pages-sobrenosotros-jsx
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Carousel dots are non-interactive spans; no slide count for AT |
| 2 | Match system / real world | 1 | Testimonials in English about "soil solutions", not training; jargon ("TIC") |
| 3 | User control and freedom | 3 | Arrows work, no autoplay; no swipe |
| 4 | Consistency and standards | 2 | Three heading sizes, raw text-gray-*, "Valores" heading after the values |
| 5 | Error prevention | 3 | Outlook-web deeplink forced for email |
| 6 | Recognition over recall | 3 | "LinkedIn" x5 without context |
| 7 | Flexibility | n/a | Brand page |
| 8 | Aesthetic and minimalist | 2 | 5 equal cards + 2 text walls + 3 card grids: no peak |
| 9 | Error recovery | 3 | Static content |
| 10 | Help | n/a | Brand page |
| Total | | 19/32 | Acceptable |

## Specificity verdict
Category-interchangeable "About us": stacked centred card grids, flat black past the hero, no relation to the home's night-green atmosphere/globe. Detector: CLI 0 findings; browser 3 at 1440 (dark-glow from Header — out of scope, kicker-above-heading — borderline, skipped-heading h1→h3 — real), 2 at 390.

## Priority issues
1. [P1] No "who we are" opening; page starts with adjectives; values above "Misión, Visión y Valores" (h1→h3 skip).
2. [P1] Ignores the redesign's visual language (flat black, generic surface cards, no atmosphere/light).
3. [P1] No conversion path: no Cursos / Comenzar ahora; ends in a small contact line + 200px void.
4. [P1] Testimonials in English, soil-services topic, wrong initials, 4-star — trust break.
5. [P2] Mobile: carousel arrows cover quote text; Misión/Visión ~30 lines of grey text; Globe icon duplicated; role text gray-400 at 12px.

## Persona red flags
- First-timer: can't tell what the campus teaches; no button to courses.
- Mobile: 5,600px scroll, values take first screen, arrows cover the quote.
- Screen reader: heading skip, dots not buttons, carousel not announced, "LinkedIn" x5 without names.

## Minor
Outlook deeplink vs mailto; hard-coded fill #a1db87; `<br/><br/>` instead of paragraphs; chip repeats the h1; /contacto via <a href> (full reload).
