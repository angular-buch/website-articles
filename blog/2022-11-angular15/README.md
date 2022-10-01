---
title: 'Angular 15 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2022-11-02
lastModified: 2022-11-02
keywords:
  - Angular
  - Angular 15
  - Update
language: de
thumbnail: ./angular15.jpg
sticky: true
---

Noch bevor die Sommer- und Urlaubszeit beginnt, wartet Angular mit tollen Neuigkeiten auf: Am 2. Juni 2022 erschien die neue Major-Version **Angular 14**!
Während die letzten Hauptreleases vor allem interne Verbesserungen für das Tooling mitbrachten, hat Angular 14 einige spannende neue Features mit an Bord.

In diesem Blogpost fassen wir wie immer die wichtigsten Neuigkeiten zusammen.
Im englischsprachigen [Angular-Blog](TODO) finden Sie außerdem die offizielle Mitteilung des Angular-Teams.
Außerdem empfehlen wir Ihnen einen Blick in die Changelogs von [Angular](https://github.com/angular/angular/blob/master/CHANGELOG.md) und der [Angular CLI](https://github.com/angular/angular-cli/blob/master/CHANGELOG.md).



## Projekt updaten

Um ein existierendes Projekt zu aktualisieren, nutzen Sie bitte den [Angular Update Guide](https://update.angular.io/?v=14.0-15.0).
Der Befehl `ng update` liefert außerdem Infos zu möglichen Updates direkt im Projekt.

```bash
# Projekt auf Angular 15 aktualisieren
ng update @angular/core@15 @angular/cli@15
```

Dadurch werden nicht nur die Pakete aktualisiert, sondern auch notwendige Migrationen im Code durchgeführt.
Prüfen Sie danach am Besten mithilfe der Differenzansicht von Git die Änderungen.



## Sonstiges

Neben den großen neuen Features hat das neue Release viele kleine Verbesserungen und Bug Fixes an Bord.
Eine Auswahl haben wir hier zusammengestellt:

- TODO
- **TypeScript-Unterstützung:** Angular unterstützt offiziell TypeScript in der Version 4.7, siehe [Commit](https://github.com/angular/angular/commit/29039fcdbcb8cab040d88dabe2dcb1abae34cb4e). Ältere Versionen als 4.6 werden hingegen nicht mehr supportet, siehe [Commit](https://github.com/angular/angular/commit/c9d566ce4b6e9097d9eceb7ac3964a0b25c404ad).

<br>
<br>

Die Roadmap für die zukünftige Entwicklung von Angular wird regelmäßig in der Dokumentation veröffentlicht: [https://angular.io/guide/roadmap](https://angular.io/guide/roadmap).

Wir wünschen Ihnen viel Spaß mit Angular 15!
Haben Sie Fragen zur neuen Version, zum Update oder zu Angular? Schreiben Sie uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** 20XX. Foto von Ferdinand Malcher</small>
