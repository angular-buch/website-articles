---
title: "State Management mit NgRx – Teil 3: SignalStore"
published: "2026-06-11"
lastModified: "2026-06-12"
hidden: true
---

**Zusatzmaterial zum Buch *Angular: Das große Praxisbuch (4. Auflage)* von Ferdinand Malcher, Danny Koppenhagen und Johannes Hoppe.**

Dieser Artikel ist **Teil 3** einer dreiteiligen Serie zum Thema State Management mit NgRx.

- Teil 1: Wie kommen wir zu zentralem State Management? → [zum Artikel](/material/ngrx-intro)
- Teil 2: Global Store mit NgRx → [zum Artikel](/material/ngrx-global-store)
- Teil 3: SignalStore (dieser Artikel)

[[toc]]

> **Hinweis:** Dieser Teil wird gerade geschrieben. Der SignalStore aus dem Paket `@ngrx/signals` stellt eine leichtgewichtige, signal-basierte Alternative zum Global Store vor. Wir zeigen ihn am selben Beispiel wie in Teil 2 (Buchliste laden mit Ladeindikator) und geben eine Entscheidungshilfe, wann sich welcher Ansatz lohnt.

---

**Zurück zu Teil 2:** [Global Store mit NgRx](/material/ngrx-global-store)
