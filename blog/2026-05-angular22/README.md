---
title: 'Angular 22 ist da!'
author: Angular Buch Team
mail: team@angular-buch.com
published: 2026-05-18
lastModified: 2026-05-18
keywords:
  - Angular
  - Angular 22
language: de
header: angular22.jpg
sticky: true
hidden: true
isUpdatePost: true
---


Im [Angular-Blog](TODO) findest du die offiziellen Informationen zum neuen Release.
Um ein bestehendes Projekt auf Angular 22 zu migrieren, kannst du den Befehl `ng update` verwenden, siehe [Angular Update Guide](https://angular.dev/update-guide).

<!-- > 🇬🇧 This article is available in English language here: [Angular 22 is here!](https://angular.schule/blog/TODO) -->

## TODO: Versionen von TypeScript und Node.js

Die folgenden Versionen von TypeScript und Node.js sind für Angular 21 notwendig:

- TypeScript: >=5.9.0 <6.0.0
- Node.js: ^20.19.0 || ^22.12.0 || ^24.0.0

Ausführliche Infos zu den unterstützten Versionen findest du in der [Angular-Dokumentation](https://angular.dev/reference/versions).


## Der neue Decorator `@Service()`

Mit Angular 22 wurde der neue Decorator `@Service()` eingeführt.
Er ist die moderne und ergonomische Alternative zum etablierten Decorator `@Injectable()` mit der Einstellung `providedIn: 'root'`.

Da das Klassennamen-Suffix `Service` [mit Angular 20 weggefallen ist](/blog/2025-05-angular20), ist der neue Decorator aus unserer Sicht eine sinnvolle Ergänzung.
So ist auf den ersten Blick erkennbar, dass es sich bei einer Klasse um einen Service handelt.

Der Decorator kann in den meisten Fällen direkt ersetzt werden:

```ts
// VORHER
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookStore {}
```

```ts
// NACHHER
import { Service } from '@angular/core';

@Service()
export class BookStore {}
```

Die Angular CLI generiert Services mit `ng generate service` nun ebenfalls standardmäßig mit dem neuen Decorator.
Um beim Generieren den älteren Decorator `@Injectable()` zu erhalten, können wir das Flag `--injectable` verwenden.

```bash
# mit Decorator `@Service()`
ng g service book-store

# mit Decorator `@Injectable()`
ng g service book-store --injectable
```

Der Decorator `@Injectable()` wird also zunächst nicht abgeschafft, sodass bestehende Anwendungen nicht sofort migriert werden müssen.
Wir empfehlen dennoch, neue Services mit dem neuen Decorator auszustatten – die Syntax ist kürzer und es sieht auch ein wenig schicker aus.




## Sonstiges

Im Changelog von [Angular](https://github.com/angular/angular/releases) und der [Angular CLI](https://github.com/angular/angular-cli/releases) findest du stets alle Detailinformationen zur aktuellen Entwicklung des Frameworks.
Einige interessante Aspekte haben wir hier zusammengetragen:

- **TODO:** TODO (siehe [PR]()).
- **TODO:** TODO (siehe [Commit]()).

<hr>


Wir wünschen dir viel Spaß beim Entwickeln mit Angular 22!
Hast du Fragen zur neuen Version von Angular oder zu unserem Buch? Schreibe uns!

**Viel Spaß wünschen
Ferdinand, Danny und Johannes**

<hr>

<small>**Titelbild:** TODO. Foto von Ferdinand Malcher</small>
