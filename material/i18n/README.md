---
title: 'Lokalisierung (l10n) und Internationalisierung (i18n) mit Angular'
published: 2026-03-02
lastModified: 2026-03-03
---

In diesem Artikel geht es darum, wie wir unsere Angular-Anwendung für verschiedene Sprachräume lokalisieren und in mehreren Sprachen ausliefern können.
Dabei betrachten wir zunächst die Lokalisierung (l10n) für ein einzelnes Locale und anschließend die vollständige Internationalisierung (i18n) mit dem Übersetzungstooling der Angular CLI.

Anwendungen werden häufig von Menschen aus unterschiedlichen Sprachräumen genutzt.
Das gilt für öffentlich zugängliche und unternehmensinterne Systeme gleichermaßen.
Abhängig von Zielgruppe und Einsatzkontext kann es daher sinnvoll sein, die Software mehrsprachig anzubieten.
Dabei wollen wir in der Regel Übersetzungen zentral verwalten, um Anpassungen effizient durchführen zu können oder sogar die Arbeit an ein Übersetzungsteam auszulagern.
Angular bringt dafür ein eigenes i18n-Tooling mit, das uns bei Extraktion, Übersetzung und Auslieferung unterstützt.

## Inhalt

[[toc]]


## Lokalisierung vs. Internationalisierung

Bevor wir loslegen, werfen wir einen kurzen Blick auf zwei zentrale Begriffe.

Unter **Lokalisierung** (kurz: **l10n**) versteht man die Anpassung einer Anwendung für einen spezifischen Sprachraum (*Locale*).
Dazu gehören:

- Darstellung von Datums- und Zeitformaten
- Formatierung von Zahlen
- Darstellung von Währungen
- Schreibrichtung

Zum Beispiel wird als Dezimaltrennzeichen im deutschsprachigen Raum ein Komma verwendet, im Englischen hingegen ein Punkt.

Unter **Internationalisierung** (kurz: **i18n**) versteht man die weitergehende Anpassung für mehrere Sprachen und Kulturen.
Hier geht es zusätzlich darum, die Texte der Anwendung in mehreren Sprachen vorzuhalten und bei Bedarf die richtige Sprache zu laden.

> 💡 Übrigens: Die Bezeichnungen l10n und i18n sind sogenannte Numeronyme. Dabei wird die Anzahl der Buchstaben zwischen dem ersten und letzten Buchstaben eines Worts durch eine Zahl ersetzt – bei "localization" sind es 10, bei "internationalization" 18.

Prinzipiell kann man unter den Begriffen i18n und l10n viele Aufgaben zusammenfassen.
Neben Texten und Formaten müssen auch Währungen, Zeitzonen und Schreibrichtungen berücksichtigt werden.
Weiterhin werden unter anderem Farben und Bilder in verschiedenen Kulturkreisen unterschiedlich interpretiert.
Eines wird hier schnell klar: Eine Anwendung für mehrere Länder auszurichten, ist eine große Aufgabe.

Wir wollen in diesem Artikel zunächst betrachten, wie wir die Anwendung für einen spezifischen Sprachraum (im folgenden: _"Locale"_) lokalisieren.
Danach lernen wir, wie mehrsprachige Anwendungen für mehrere Locales umgesetzt werden.


## Lokalisierung (l10n): die Anwendung für ein Locale einrichten

Einige eingebaute Pipes von Angular benötigen Informationen zur Lokalisierung, um die Daten korrekt zu formatieren.
Im Buch haben wir die DatePipe, DecimalPipe, CurrencyPipe und PercentPipe bereits ausführlich besprochen.
Diese Pipes können individuell mit einem Locale konfiguriert werden. In der Regel wollen wir die Sprache aber zentral für die gesamte Anwendung festlegen.
Ohne weitere Konfiguration ist automatisch das Locale `en-US` gesetzt, also US-amerikanisches Englisch.
Die DatePipe verwendet für die Datumsformatierung damit stets die englischen Formate, z. B. `Jul 15, 2026, 8:45:04 PM`.
Auch die DecimalPipe zur Zahlformatierung, die CurrencyPipe zur Anzeige von Währungen und die PercentPipe zur Prozentformatierung richten sich nach dem eingestellten Locale.

### Locale einstellen

Ist die Anwendung nur für einen Sprachraum bestimmt, z. B. nur innerhalb eines national agierenden Unternehmens, können wir die Sprache fest einstellen.
Wollen wir die deutsche Lokalisierung verwenden, können wir das Locale auf den Wert `de` stellen.

Die Einstellung hierfür verbirgt sich in dem InjectionToken `LOCALE_ID`.
Um das Token mit dem gewünschten Wert zu überschreiben, müssen wir einen Provider registrieren.
Zusätzlich muss eine konkrete Sprachdefinition geladen werden.
Nur so kann Angular wissen, welche spezifischen Regeln für das eingestellte Locale gelten.
Den Provider registrieren wir in der Datei `app.config.ts`:

```typescript
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
// ...

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    { provide: LOCALE_ID, useValue: 'de' }
  ]
};
```

Die Sprachdefinition laden wir über einen globalen Import in der `main.ts`:

```typescript
import '@angular/common/locales/global/de';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig);
```

Durch den Import von `@angular/common/locales/global/de` wird die deutsche Sprachdefinition global registriert.
Angular kennt damit automatisch die spezifischen Regeln für das Locale `de`.

Im BookManager verwenden wir die DatePipe z. B. in der Buchdetailseite:

```html
{{ b.createdAt | date:'medium' }}
```

Starten wir nun die Anwendung mit den Änderungen neu, können wir die Auswirkungen direkt erkennen:
Das Datum wird im deutschsprachigen Format ausgegeben, z. B. `15.07.2026, 20:45:04` statt `Jul 15, 2026, 8:45:04 PM`.

Das Locale und die Sprachdefinition bilden eine Einheit.
Mit der Einstellung `LOCALE_ID` legen wir fest, welche spezifischen Formatierungsoptionen wir für Datumsangaben, Zahlen- und Währungsformate wünschen.
In der Sprachdefinition sind alle Informationen vorhanden, die dafür notwendig sind.
So finden wir unter anderem in der deutschen Sprachdefinition die Namen für die Monate und Wochentage, das Komma als Dezimaltrennzeichen und den Euro als Währung.

### Mehrere Sprachdefinitionen laden

Das Token `LOCALE_ID` legt das aktive Locale fest und bestimmt damit die gerade anzuwendende Sprachdefinition.
Da die Dependency Injection von Angular hierarchisch organisiert ist, kann man bei Bedarf die `LOCALE_ID` auch mit unterschiedlichen Werten bereitstellen und so in definierten Teilen der Applikation unterschiedliche Lokalisierungen einsetzen.

Um die aktuell eingestellte Sprache zu prüfen, können wir das Token `LOCALE_ID` mit `inject()` injizieren und den Wert ausgeben:

```typescript
import { Component, inject, LOCALE_ID } from '@angular/core';

@Component({ /* ... */ })
export class MyComponent {
  locale = inject(LOCALE_ID);

  constructor() {
    // Ausgabe: "Current Locale: de"
    console.log('Current Locale:', this.locale);
  }
}
```

Sollen mehrere Sprachdefinitionen parallel verfügbar sein, können wir weitere globale Importe hinzufügen:

```typescript
import '@angular/common/locales/global/de';
import '@angular/common/locales/global/fr';
```

### Alternative: Locale über die Build-Konfiguration setzen

Alternativ zum manuellen Provider können wir das Locale auch direkt in der Datei `angular.json` konfigurieren.
Mit dem Eintrag `sourceLocale` im Abschnitt `i18n` des Projekts setzen wir das Standard-Locale:

```json
{
  "projects": {
    "book-manager": {
      "i18n": {
        "sourceLocale": "de"
      }
      // ...
    }
  }
}
```

Der Wert von `sourceLocale` kann entweder ein einfacher String sein oder ein Objekt mit den Eigenschaften `code` und `baseHref` bzw. `subPath`.
Die Objekt-Variante ist nützlich, wenn die Ausgangssprache beim Build unter einem bestimmten Pfad bereitgestellt werden soll:

```json
"sourceLocale": {
  "code": "de",
  "baseHref": "/de/"
}
```

Durch die Angabe von `sourceLocale` wird das InjectionToken `LOCALE_ID` beim Build automatisch auf den konfigurierten Wert gesetzt.
Auch die passende Sprachdefinition wird automatisch geladen — der manuelle Provider in der `app.config.ts` und der Import in der `main.ts` sind damit nicht mehr notwendig.
In dieser einfachen Form unterstützt `sourceLocale` allerdings nur ein einzelnes Locale.
Wie wir mehrere Sprachen über die `angular.json` konfigurieren und die Anwendung in verschiedenen Sprachvarianten bauen können, zeigen wir im Abschnitt [Übersetzung während des Build-Prozesses](#übersetzung-während-des-build-prozesses).

### Pipes mit einem spezifischen Locale nutzen

Einige der eingebauten Pipes besitzen ein optionales Argument, um ein spezifisches Locale zu setzen.
Geben wir ein Locale explizit an, wird es von der Pipe bei der Darstellung berücksichtigt, und das global eingestellte Locale wird ignoriert.
Damit die Formatierung funktioniert, muss das angegebene Locale bereits in der Anwendung bekannt gemacht worden sein, so wie wir es im vorhergehenden Abschnitt beschrieben haben.

```html
<p>{{ myDate | date: 'longDate':'+0200':'de' }}</p>
<!-- Ausgabe: 7. August 2026 -->
<p>{{ 13.674566 | number: '1.2-3':'de' }}</p>
<!-- Ausgabe: 13,675 -->
<p>{{ 2.456 | currency: 'EUR':'EUR':'1.2-2':'de' }}</p>
<!-- Ausgabe: 2,46 EUR -->
<p>{{ 0.77 | percent: '1.2-2':'de' }}</p>
<!-- Ausgabe: 77,00 % -->
```

### Format-Funktionen im TypeScript-Code

Im Gegensatz zu den Pipes wie DatePipe oder DecimalPipe, die das Locale automatisch über Dependency Injection beziehen, sind die Hilfsfunktionen `formatDate()`, `formatNumber()`, `formatCurrency()` und `formatPercent()` reine Utility-Funktionen ohne DI.
Das Locale muss daher immer explizit als Parameter übergeben werden.
Dazu injecten wir das Token `LOCALE_ID` und reichen den Wert an die Funktion durch:

```typescript
import { Component, inject, LOCALE_ID } from '@angular/core';
import { formatDate, formatCurrency,
  formatPercent, formatNumber } from '@angular/common';

@Component({ /* ... */ })
export class MyComponent {
  #locale = inject(LOCALE_ID);
  myDate = new Date();

  constructor() {
    formatDate(this.myDate, 'longDate', this.#locale);
    formatNumber(13.674566, this.#locale, '1.2-3');
    formatCurrency(2.456, this.#locale, 'EUR', 'EUR');
    formatPercent(0.77, this.#locale);
  }
}
```


## Internationalisierung (i18n): die Anwendung übersetzen

Im vorhergehenden Abschnitt zur Lokalisierung haben wir betrachtet, wie wir Formate für ein einzelnes Locale anpassen.
Damit sind Datumsangaben, Zahlen und Währungen bereits korrekt formatiert — aber die eigentlichen Texte der Anwendung werden noch nicht übersetzt.
Buttons, Überschriften, Hinweistexte und Fehlermeldungen erscheinen weiterhin in der Ursprungssprache.
Nun geht es darum, die Anwendung mehrsprachig anzubieten.
Bei der Übersetzung von Texten hilft uns das i18n-Tooling der Angular CLI.

Dafür müssen wir zunächst alle Texte in der Anwendung markieren.
Sie können anschließend extrahiert und zentral übersetzt werden.
Danach können wir aus zwei Varianten wählen, *wann* die übersetzten Texte in die Anwendung eingebaut werden sollen: beim Build oder zur Laufzeit.

Wir wollen zunächst den Fokus darauf legen, die Übersetzungen zur Build-Zeit einzubauen.
Im letzten Teil schauen wir uns dann den zweiten Ansatz an:
Hier laden wir die Übersetzungen zur Laufzeit der Anwendung aus einer Datei herunter.

Als Alternative zu diesen Ansätzen haben sich mehrere Community-Projekte herausgebildet, mit denen wir die Übersetzungen zur Laufzeit laden und in die Anwendung integrieren können.
Wir betrachten in diesem Artikel jedoch nur das mitgelieferte Tooling von Angular.

### Der Übersetzungsprozess in Angular

Der grundlegende Prozess für die Übersetzung ist zunächst unabhängig davon, ob wir die Texte zur Build- oder Laufzeit laden möchten.
Folgende Schritte sind immer notwendig:

1. Nachrichten im Quellcode markieren
2. Nachrichten aus der Anwendung extrahieren
3. Nachrichten übersetzen
4. Übersetzung abspeichern
5. Das übersetzte Projekt bauen bzw. Übersetzungen laden

![Der Prozess bei der Übersetzung der Anwendung](./process.svg "Der Prozess bei der Übersetzung der Anwendung")

### Projekt vorbereiten

Um die Angular-Features zur Internationalisierung zu nutzen, installieren wir das Paket `@angular/localize`:

```bash
ng add @angular/localize
```

Der Befehl `ng add` installiert nicht nur das Paket, sondern passt auch die Projektkonfiguration an:
Er ergänzt `@angular/localize` in den TypeScript-Konfigurationsdateien (`tsconfig.app.json` und `tsconfig.spec.json`) unter `types` und fügt in der Datei `main.ts` eine Typreferenz hinzu (`/// <reference types="@angular/localize" />`).
Damit steht die Funktion `$localize` global zur Verfügung, die Angular intern für die Übersetzung verwendet.
Nun können wir als Nächstes die Texte in der Anwendung für die Übersetzung markieren.

### Nachrichten im HTML mit dem i18n-Attribut markieren

Bei der Entwicklung haben wir alle Texte in den Templates auf Englisch definiert.
Die Anwendung lässt sich so auch ohne das i18n-Tooling kompilieren.
Um die fest eingebauten Texte zu übersetzen, verwenden wir das spezielle Attribut `i18n` auf den zugehörigen HTML-Elementen.
Es teilt dem Tooling mit, dass hier ein übersetzbarer Text zu finden ist.
Im nächsten Schritt werden wir ein Extraktionstool einsetzen, um die markierten Nachrichten in den Templates zu identifizieren und in eine neue Datei zu speichern.

Um der übersetzenden Person eine Hilfestellung zu leisten, können wir zusätzlich noch die Bedeutung (engl. *meaning*) und eine Beschreibung (engl. *description*) für die Nachricht hinterlegen.
Bedeutung und Beschreibung werden durch einen senkrechten Strich getrennt, der hier allerdings nichts mit den Pipes aus Angular zu tun hat.
Ohne dieses Zeichen repräsentiert der gesamte String die Beschreibung.
Beide Angaben sind optional.

```html
<h1 i18n="meaning|description">Hallo Welt!</h1>
<h1 i18n="description">Salut!</h1>
```

Steht kein DOM-Element zur Verfügung, auf dem wir das Attribut `i18n` setzen könnten, können wir die Markierung mit einem `<ng-container>` vornehmen. Angular rendert dieses Element nicht im DOM — es erzeugt also kein zusätzliches HTML-Element, sondern dient ausschließlich als Hilfskonstrukt für die Übersetzung:

```html
<ng-container i18n="meaning|description">
  Meine Nachricht
</ng-container>
```

In der `App`-Komponente setzen wir das Attribut `i18n` für alle Navigationslinks:

```html
<nav>
  <ul>
    <li>
      <a routerLink="/home" routerLinkActive="active"
        ariaCurrentWhenActive="page"
        i18n="nav home">Home</a>
    </li>
    <li>
      <a routerLink="/books" routerLinkActive="active"
        ariaCurrentWhenActive="page"
        i18n="nav books">Books</a>
    </li>
    <li>
      <a routerLink="/admin" routerLinkActive="active"
        ariaCurrentWhenActive="page"
        i18n="nav admin">Admin</a>
    </li>
  </ul>
</nav>
<!-- ... -->
```

Übersetzbare Inhalte kommen nicht nur im Text eines HTML-Dokuments vor, sondern auch in Attributen der Elemente können Nachrichten hinterlegt sein.
Um ein Attribut wie `title` oder `placeholder` zu markieren, schreiben wir entsprechend `i18n-title` bzw. `i18n-placeholder`.
Ein gutes Beispiel hierfür finden wir in der `BooksOverviewPage`:
Hier nutzen wir auf dem Suchfeld ein ARIA-Attribut, um eine Beschreibung zu setzen.
Wir benötigen hier also das zusätzliche Attribut `i18n-aria-label`.
An dieser Stelle sollten wir mithilfe der *meaning* darauf hinweisen, wofür diese Übersetzung genau dient.

```html
<input type="search"
  [value]="searchTerm()"
  (input)="searchTerm.set($event.target.value)"
  placeholder="Search"
  i18n-placeholder="search input placeholder"
  aria-label="Search"
  i18n-aria-label="search input ARIA label|input search">
<!-- ... -->
```

### Nachrichten im TypeScript-Code mit `$localize` markieren

Übersetzbare Texte können nicht nur im HTML-Template stehen, sondern auch der TypeScript-Code kann Strings beinhalten, die wir bei der Internationalisierung berücksichtigen müssen.
Hier kommt die Funktion `$localize` zum Einsatz.
Sie ist bereits global verfügbar und muss deshalb nicht im Code importiert werden.

`$localize` wird als *Tagged Template String* verwendet.
Dazu notiert man einen Template-String mit Backticks, der mit dem Namen einer Funktion eingeleitet wird.
Diese Funktion wird aufgerufen, und der Template-String wird als Argument übergeben.
Auch hier können wir wieder *description* und *meaning* angeben, indem wir zwei Doppelpunkte vor dem Standardtext setzen.

```typescript
const hallo = $localize`:meaning|description:Hallo Welt`;
console.log(hallo); // Ausgabe: Hallo Welt
```

Da `$localize` ein Tagged Template String ist, können wir auch Ausdrücke interpolieren:

```typescript
const greeting = $localize`:personal greeting:Hello, ${name}!`;
```

In unserem BookManager können wir `$localize` zum Beispiel in der `BookDetailsPage` nutzen.
Hier wollen wir die Bestätigungsmeldung übersetzen, die beim Löschen eines Buchs angezeigt wird:

```typescript
removeBook() {
  const confirmed = confirm(
    $localize`:confirm delete|delete confirmation:Delete book?`
  );
  if (confirmed) {
    this.#bookStore.remove(this.isbn()).subscribe(() => {
      this.#router.navigateByUrl('/books');
    });
  }
}
```

### Pluralisierung und ICU-Ausdrücke

Nicht alle Texte lassen sich 1:1 übersetzen — manchmal hängt die korrekte Formulierung von einem konkreten Wert ab.
Angular unterstützt dafür die sogenannte [ICU Message Syntax](https://unicode-org.github.io/icu/userguide/format_parse/messages) (*International Components for Unicode*).
Ein ICU-Ausdruck besteht aus einem Ausdruck (z. B. einem Signal), einem ICU-Typ und den zugehörigen Varianten, eingeschlossen in geschweifte Klammern:

```
{ ausdruck, typ, varianten }
```

Angular unterstützt die beiden wichtigsten ICU-Typen: `plural` und `select`.
Ein ICU-Ausdruck steht direkt im Textinhalt eines Elements, das mit `i18n` markiert ist.

#### `plural`: Pluralisierung anhand von Zahlwerten

Mit `plural` unterscheiden wir Textbausteine anhand eines numerischen Werts:

```html
<p i18n>
  {count(), plural,
    =0 {Keine Bücher gefunden.}
    =1 {Ein Buch gefunden.}
    other {{{count()}} Bücher gefunden.}
  }
</p>
```

Dabei ist `count` ein Signal der Komponente.
Die geschweiften Klammern um `{{count()}}` innerhalb der `other`-Variante sind die gewohnte Interpolation von Angular — die äußeren Klammern gehören zur ICU-Syntax.

Neben exakten Werten wie `=0` oder `=1` definiert die ICU-Spezifikation auch benannte Kategorien: `zero`, `one`, `two`, `few`, `many` und `other`.
Welche dieser Kategorien tatsächlich greifen, wird durch die [CLDR Plural Rules](https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) festgelegt und hängt vom eingestellten Locale ab.
Die Bezeichnungen `few` und `many` sind dabei leicht irreführend: Sie beschreiben keine Größenordnungen, sondern sprachspezifische grammatische Kategorien.
Im Polnischen etwa gilt `few` für Zahlen mit den Endziffern 2–4 (außer 12–14), im Arabischen für 3–10.
Deutsch und Englisch verwenden lediglich `one` und `other` — die übrigen Kategorien existieren für diese Sprachen nicht.
Die Kategorie `other` ist der Fallback und muss immer angegeben werden. Nicht zutreffende Kategorien werden stillschweigend ignoriert — solange `other` vorhanden ist, kann es nicht zu einem Laufzeitfehler kommen.

Im Idealfall definieren wir im Quelltext alle Kategorien, die für eine der Zielsprachen relevant sein könnten.
Das Übersetzungsteam muss dann aber nur diejenigen Kategorien übersetzen, die in der jeweiligen Zielsprache auch tatsächlich greifen.
Für eine deutsche Übersetzung reicht es aus, `one` und `other` zu übersetzen — `two`, `few` und `many` werden hier nie ausgewertet.
Für eine arabische Übersetzung hingegen sollten alle sechs Kategorien berücksichtigt werden.
Exakte Werte wie `=0` oder `=2` funktionieren unabhängig vom Locale immer und können zusätzlich zu den benannten Kategorien verwendet werden.

#### `select`: Auswahl anhand von String-Werten

Mit `select` wählen wir eine Variante anhand eines Strings aus.
Angular vergleicht den Wert des Ausdrucks mit den angegebenen Schlüsseln und gibt den passenden Text aus:

```html
<p i18n>
  {role(), select,
    admin {Willkommen, Administrator!}
    other {Willkommen!}
  }
</p>
```

Auch hier dient `other` als Fallback, wenn keiner der Schlüssel passt.

Beide ICU-Ausdrücke werden vom Extraktionstool erkannt und in die Übersetzungsdatei aufgenommen.
Die übersetzende Person kann die Varianten dann unabhängig voneinander übersetzen.

### Feste IDs vergeben

Wenn wir im nächsten Schritt das Extraktionstool der Angular CLI verwenden, finden wir in der erzeugten Datei zu jedem Eintrag eine automatisch generierte ID.
<!-- Siehe Angular-Quellcode: https://github.com/angular/angular/blob/main/packages/compiler/src/i18n/digest.ts, Funktion computeDecimalDigest() und computeMsgId() -->
Diese IDs werden aus dem Inhalt des i18n-Blocks berechnet: Der gesamte Textinhalt und die HTML-Struktur innerhalb des Elements werden in eine String-Repräsentation überführt und daraus ein Hash gebildet.
Jede inhaltliche oder strukturelle Änderung am Element erzeugt damit eine andere ID.
Das Übersetzungstool verliert dann den Bezug zur bisherigen Übersetzung, und der Eintrag muss erneut übersetzt werden.
Die automatisch generierten IDs sind deshalb nur eine Notlösung: Wir sollten immer davon ausgehen, dass sich Texte im Laufe der Entwicklung noch ändern werden.

Deshalb empfehlen wir, immer feste IDs zu vergeben.
Dazu setzen wir zwei `@`-Zeichen und notieren dahinter die eigene feste ID.
Dieser Weg funktioniert gleichermaßen im `i18n`-Attribut und bei der Verwendung von `$localize`.

Im BookManager sieht eine Vergabe von festen IDs in der `App`-Komponente wie folgt aus:

```html
<nav>
  <ul>
    <li>
      <a routerLink="/home" routerLinkActive="active"
        ariaCurrentWhenActive="page"
        i18n="nav home@@AppHome">Home</a>
    </li>
    <li>
      <a routerLink="/books" routerLinkActive="active"
        ariaCurrentWhenActive="page"
        i18n="nav books@@AppBooks">Books</a>
    </li>
    <li>
      <a routerLink="/admin" routerLinkActive="active"
        ariaCurrentWhenActive="page"
        i18n="nav admin@@AppAdmin">Admin</a>
    </li>
  </ul>
</nav>
<!-- ... -->
```

Das Attribut `i18n-aria-label` in der `BooksOverviewPage` kann so definiert werden:

```html
i18n-aria-label="search input ARIA label|input search@@BooksOverviewSearch"
```

Im TypeScript-Code für die `BookDetailsPage` können wir ebenso eine feste ID vergeben:

```typescript
const confirmed = confirm(
  $localize`:confirm delete|delete confirmation@@BookDetailsDeleteConfirm:Delete book?`
);
```

### Nachrichten extrahieren und übersetzen

Wenn alle Nachrichten markiert sind, können wir das eingebaute Extraktionstool der Angular CLI einsetzen, um die Nachrichten aus dem Code in einer Übersetzungsdatei zu sammeln.
Um alle Nachrichten im Standardformat zu extrahieren, führen wir den folgenden Befehl aus:

```bash
ng extract-i18n
```

Durch das Kommando wird eine Datei mit dem Namen `messages.xlf` generiert.
Der Befehl unterstützt auch andere Dateiformate.
Dazu verwenden wir die Option `--format=<format>`.
Die unterstützten Dateitypen und ihre Endungen sind in der folgenden Tabelle aufgelistet:

| Kürzel | Bezeichnung | Dateiendung | CLI-Option (`<format>`) |
|--------|-------------|-------------|------------------------|
| ARB | Application Resource Bundle | `.arb` | `arb` |
| JSON | JavaScript Object Notation | `.json` | `json` |
| XLIFF 1.2 | XML Localization Interchange File Format | `.xlf` | `xlf` |
| XLIFF 2 | XML Localization Interchange File Format | `.xlf` | `xlf2` |
| XMB | XML Message Bundle | `.xmb` | `xmb` |

Alle Dateiformate erfüllen grundsätzlich den gleichen Zweck: Die markierten Nachrichten werden zusammen mit den festgelegten Metadaten (*meaning* und *description*) strukturiert anhand einer ID gespeichert.
Hier gilt eine Ausnahme: Verwenden wir das JSON-Format, werden lediglich die generierte ID und der Text extrahiert.

Nun muss noch für alle Nachrichten ein Gegenstück in der gewünschten Zielsprache definiert werden.
Der Übersetzungsprozess kann unterschiedlich durchgeführt werden: Während in manchen Teams auf externe Dienstleister oder Community-Übersetzungen zurückgegriffen wird, pflegen andere die Übersetzungen selbst ein.
In jedem Fall erhalten wir aber als Resultat eine neue Datei in einem der unterstützten Formate.
Wir verwenden in diesem Abschnitt das Standardformat XLIFF.
Dieses Format wird von vielen bekannten Übersetzungstools wie [POEditor](https://poeditor.com/), [Poedit](https://poedit.net/) und [BabelEdit](https://www.codeandweb.com/babeledit) unterstützt.

Wir empfehlen, die übersetzte Datei mit einem aussagekräftigen Namen zu speichern, z. B. `messages.de.xlf` oder `messages.de.json`.
Danach existieren also zwei dieser Dateien: `messages.de.xlf` mit den deutschsprachigen Übersetzungen und `messages.xlf` mit den originalen englischen Texten.


## Übersetzung während des Build-Prozesses

Wie bereits erwähnt, bietet Angular zwei Wege, um die übersetzten Texte in die Anwendung zu integrieren: zur **Build-Zeit** oder zur **Laufzeit**.
Wir beginnen mit dem ersten der beiden Ansätze: Die Anwendung wird direkt beim Build in mehreren Sprachen erzeugt.
Das Ergebnis sind mehrere gebaute Varianten der gesamten Angular-Anwendung in jeweils einer Sprache.
Da keine Übersetzungen zur Laufzeit geladen werden müssen, ist die Anwendung sofort einsatzbereit.
Ein Nachteil ist jedoch, dass die Texte nach dem Build nicht mehr angepasst werden können — sie sind fester Bestandteil des Quellcodes.

### Die App mit Übersetzungen bauen

Wir haben bereits alle Nachrichten markiert, extrahiert und übersetzt.
Die Datei mit den übersetzten Nachrichten liegt ebenfalls im Projekt — und nun muss die Anwendung nur noch gebaut werden.

Der empfohlene Weg ist, dass die Anwendung für jedes Locale separat kompiliert wird.
Das Ergebnis ist eine kleine, schnelle und sofort einsatzbereite App mit einer einzigen eingebauten Sprache.
Die Startzeit wird nicht durch das dynamische Nachladen der Übersetzungen verlängert.

Zunächst konfigurieren wir das Standard-Locale in der `angular.json`.
Den Eintrag `sourceLocale` im Abschnitt `i18n` haben wir [weiter oben](#alternative-locale-über-die-build-konfiguration-setzen) bereits kennengelernt — er setzt das InjectionToken `LOCALE_ID` und lädt die passende Sprachdefinition automatisch.
Im BookManager verwenden wir als Ausgangssprache `en-US`:

```json
{
  // ...
  "projects": {
    "book-manager": {
      "i18n": {
        "sourceLocale": "en-US"
      }
      // ...
    }
  }
}
```

Wollen wir weitere Sprachen anbieten, können wir diese mit dem Eintrag `locales` unter dem Abschnitt `i18n` definieren.
Wir geben dazu pro Locale die gewünschte Übersetzungsdatei an, die bei der Übersetzung erzeugt wurde.
Konkret verwenden wir die übersetzte Datei `messages.de.xlf`, die wir im Hauptverzeichnis des Projekts abgelegt haben.

```json
{
  // ...
  "projects": {
    "book-manager": {
      "i18n": {
        "sourceLocale": "en-US",
        "locales": {
          "de": "messages.de.xlf"
        }
      }
      // ...
    }
  }
}
```

Jetzt sind die Locales und deren Übersetzungsdateien zwar definiert, aber noch geschieht nichts Neues, wenn wir die Anwendung neu bauen bzw. starten.
Das liegt daran, dass wir die Übersetzungen erst aktivieren müssen.
Dazu fügen wir in den Optionen zum Projekt den Eintrag `localize` hinzu:

```json
{
  // ...
  "projects": {
    "book-manager": {
      "architect": {
        "build": {
          "options": {
            // ...
            "localize": true
          }
        }
      }
      // ...
    }
  }
}
```

Anschließend können wir einen Build mit den festgelegten Einstellungen starten:

```bash
ng build
```

Fehlt eine Übersetzung in der Datei, gibt Angular beim Build standardmäßig eine Warnung aus.
Mit der Option `i18nMissingTranslation` in der `angular.json` können wir das Verhalten anpassen und den Build stattdessen abbrechen lassen:

```json
"options": {
  "localize": true,
  "i18nMissingTranslation": "error"
}
```

Haben wir die Einstellung `localize` auf `true` gesetzt, werden nun alle verfügbaren Varianten der Anwendung gebaut.
Wir finden die gebauten Apps im Ordner `dist`:

```
dist
└─ book-manager
   └─ browser
      ├─ de
      └─ en-US
```

Das momentane Ergebnis können wir überprüfen, indem wir mit einem einfachen Webserver die verschiedenen Varianten ausprobieren.
In diesem Beispiel verwenden wir das Paket `http-server`, mit dem wir einen lokalen Webserver starten können:

```bash
npx http-server dist/book-manager/browser
```

Mit diesem Aufruf starten wir den Webserver für den Ordner `dist/book-manager/browser`, sodass alle erstellten Unterordner aufgerufen werden können.
Öffnen wir danach die URL `http://localhost:8080/de/` im Browser, sehen wir die deutschsprachige Variante der Anwendung.
Beim Build wurden bereits passend dazu die Basisadresse und die Sprache der Webseite angepasst:

```html
<!doctype html>
<html lang="de" dir="ltr">
<head>
  <base href="/de/">
```

Die Angular CLI setzt beim Build automatisch das Attribut `lang` auf die aktuelle Sprache und `dir` auf die passende Textflussrichtung (z. B. `rtl` für Arabisch oder Hebräisch).
Das ist ein wichtiger Aspekt der Barrierefreiheit, den wir beim Build-Zeit-Ansatz nicht manuell umsetzen müssen.
Beim Laufzeit-Ansatz hingegen werden diese Attribute nicht automatisch gesetzt.
Angular bietet dafür auch keinen fertigen Service an (anders als z. B. den `Title`-Service für den Seitentitel).
Wir müssen die Attribute daher manuell über die DOM-API setzen:

```typescript
document.documentElement.lang = 'de';
document.documentElement.dir = 'ltr';
```

### Entwicklungsserver mit einzelnem Locale

Wir können jetzt mehrere übersetzte Varianten einer Anwendung erstellen.
Mit dieser Konfiguration stoßen wir allerdings auf ein Problem:
Der Entwicklungswebserver (`ng serve`) unterstützt nur ein einzelnes Locale pro Build.
Sind mehrere Locales konfiguriert und `localize` ist auf `true` gesetzt, wird die Lokalisierung beim Entwicklungsserver deaktiviert oder der Start schlägt fehl.
Um das Problem zu lösen, betrachten wir die Option `localize` etwas näher, denn hier können wir verschiedene Werte angeben:

| Wert | Beschreibung |
|------|-------------|
| `"localize": true` | Es werden alle Sprachvarianten gebaut. |
| `"localize": false` | Es werden keine Sprachvarianten gebaut (Standard). |
| `"localize": ["de", "fr"]` | Es werden die im Array aufgelisteten Sprachvarianten gebaut. |

Wollen wir also nur die deutsche Variante der Anwendung ausprobieren, tragen wir für `localize` einen einzigen Wert ein:

```json
{
  // ...
  "projects": {
    "book-manager": {
      "architect": {
        "build": {
          "options": {
            // ...
            "localize": ["de"]
          }
        }
      }
      // ...
    }
  }
}
```

Anschließend können wir mit `ng serve` die Anwendung mit der jeweiligen Übersetzung starten.
Der Webserver funktioniert wieder und liefert die Anwendung wie gewohnt ohne ein Unterverzeichnis aus.

Es wäre allerdings unpraktisch, wenn wir ständig die Konfigurationsdatei ändern müssten, um verschiedene Sprachen auszuprobieren.
Deshalb schauen wir uns im folgenden Abschnitt an, wie wir einzelne Konfigurationen für die jeweiligen Locales erstellen.

### Übersetzte Apps mit unterschiedlichen Konfigurationen bauen

Der Entwicklungswebserver unterstützt nur ein einziges Locale.
Das ist aber kein Problem, denn sehr häufig wollen wir für eine Variante der Anwendung sowieso nicht nur das Locale und die Übersetzungsdatei austauschen, sondern weitere Einstellungen setzen.
Zum Beispiel wollen wir bei einer fortgeschrittenen App auch die statischen Assets austauschen und andere Umgebungseinstellungen setzen.
Um das zu realisieren, verwenden wir unterschiedliche Konfigurationen.

Jede Angular-Anwendung besitzt Standardeinstellungen, die in der Datei `angular.json` unter `options` definiert werden können.
Diese Einstellungen können über `configurations` differenziert angepasst werden.
So besitzt jede Anwendung die Konfiguration `production`, mit der verschiedene Optimierungen aktiviert werden.

Beim produktiven Build funktioniert für uns bereits alles wie erwartet:
Die Definition von `localize` in den `options` sorgt dafür, dass wir per Default mehrere Sprachversionen der Anwendung bauen.
Während der Entwicklung jedoch wird beim Start mit `ng serve` die Build-Konfiguration `development` geladen.
Genau an dieser Stelle können wir nun ansetzen und für den Entwicklungsserver ein explizites Locale festlegen.
Wir nutzen hier das Locale `en-US`.
Danach können wir die Anwendung wieder wie gewohnt mit `ng serve` starten.

```json
{
  // ...
  "projects": {
    "book-manager": {
      "architect": {
        "build": {
          "options": {
            // ...
            "localize": true
          },
          "configurations": {
            "production": {
              // ...
            },
            "development": {
              // ...
              "localize": ["en-US"]
            }
          }
        }
      }
      // ...
    }
  }
}
```

Zusätzlich wollen wir aber auch den Entwicklungsserver mit der Anwendung in deutscher Sprache starten können.
Zu diesem Zweck legen wir eine neue Konfiguration im Abschnitt `build` mit dem Namen `locale-de` an.
Hier setzen wir lediglich `localize` auf den Wert `de`.
Anschließend müssen wir festlegen, dass für den Entwicklungsserver diese neue Build-Konfiguration verwendet werden soll.
Dafür fügen wir im Abschnitt `serve` unter `configurations` einen neuen Block `development-de` ein.
Dort verweisen wir im `buildTarget` auf die Build-Konfigurationen für `development` und die zuvor hinzugefügte Konfiguration `locale-de`.
Die Reihenfolge ist hierbei entscheidend, da weiter rechts angegebene Optionen die vorherigen überschreiben.

```json
{
  // ...
  "projects": {
    "book-manager": {
      "architect": {
        "build": {
          // ...
          "configurations": {
            // ...
            "locale-de": {
              "localize": ["de"]
            }
          }
        },
        "serve": {
          // ...
          "configurations": {
            // ...
            "development-de": {
              "buildTarget": "book-manager:build:development,locale-de"
            }
          }
        },
      }
      // ...
    }
  }
}
```

Im Anschluss können wir beim Start des Entwicklungsservers die neue Konfiguration auswählen und sehen den BookManager in deutscher Sprache:

```bash
ng serve --configuration=development-de
```

### Fazit: Build-Zeit-Übersetzung

Die Übersetzung zur Build-Zeit ist der einfachste und performanteste Ansatz: Jede Sprachvariante wird als eigenständige Anwendung gebaut und ist sofort einsatzbereit. Dafür müssen wir bei jeder Textänderung einen neuen Build erstellen, und die Anzahl der Varianten wächst mit jeder unterstützten Sprache.


## Übersetzung zur Laufzeit

Wir haben bis hierhin gelernt, wie wir die Anwendung für verschiedene Sprachen bauen können.
Die Texte werden beim Build fest in die Anwendung eingebaut und können nur verändert werden, indem die App erneut kompiliert wird.

Für mehr Flexibilität können wir einen alternativen Weg wählen:
Wir laden die Übersetzungen beim Start der Anwendung über einen HTTP-Aufruf.
So benötigen wir lediglich einen einzigen Build-Vorgang, denn die Texte werden zur Laufzeit in die Anwendung geladen.
Ein großer Vorteil hierbei ist, dass wir die Texte anpassen können, ohne einen erneuten Build-Prozess durchzuführen.

Die Übersetzungen werden geladen, bevor die Anwendung das Bootstrapping durchführt.
Beim Aufruf der Anwendung müssen wir also eine kurze Verzögerung in Kauf nehmen, die allerdings im Vergleich zum restlichen heruntergeladenen Code kaum ins Gewicht fällt.
Ist die Sprache einmal gewählt, verhält sich die Anwendung genau so, als hätten wir sie mit dieser Sprache gebaut.

### Texte im JSON-Format extrahieren

Unabhängig vom gewählten Ansatz markieren wir zunächst die zu übersetzenden Nachrichten im Template und in den TypeScript-Klassen, wie im Abschnitt zum Übersetzungsprozess beschrieben.
Danach müssen wir die markierten Texte extrahieren.

Angular erwartet die Texte in Form von Schlüssel-Wert-Paaren in einem einfachen JavaScript-Objekt.
Deshalb ist es naheliegend, die Übersetzungen als JSON bereitzustellen.
Wir können die geladenen Texte dann sofort weiterverarbeiten, ohne das Format konvertieren zu müssen.

Beim Extrahieren wählen wir dazu das Format `json` aus.
Außerdem legen wir die erzeugte Datei im Verzeichnis `public` mit dem Namen `messages.de.json` ab.
Nur so ist es möglich, dass die Datei später zur Laufzeit mittels HTTP heruntergeladen werden kann.

```bash
ng extract-i18n --format=json --output-path=public --out-file=messages.de.json
```

Im Anschluss übersetzen wir die einzelnen Texte: Die Datei `messages.de.json` enthält danach alle deutschsprachigen Übersetzungen für die Anwendung.

### Anpassungen der Build-Konfiguration entfernen

Wir wollen die Übersetzungen nun nicht mehr beim Build berücksichtigen.
Deshalb müssen wir alle spezifischen Änderungen in der Datei `angular.json` rückgängig machen, die im vorherigen Abschnitt dort notwendig waren.
Das betrifft insbesondere die verschiedenen Abschnitte mit `localize` und die Konfiguration `development-de`.

### Übersetzungen zur Laufzeit laden

Jetzt betrachten wir die zweite Variante: Statt die Übersetzungen beim Build einzubauen, laden wir sie zur Laufzeit.
Dafür müssen die Übersetzungen verfügbar sein, bevor die Anwendung startet — damit Angular die Texte beim Bootstrapping direkt austauschen kann.
Deshalb müssen wir den Code in der Datei `main.ts` unterbringen, bevor wir `bootstrapApplication()` aufrufen.
Hier legen wir uns eine neue Funktion `setupLocale()` an.
Sie soll alle Schritte erledigen, die vor dem Start der Anwendung notwendig sind:

- Übersetzungen als JSON laden
- Übersetzungen in der Anwendung registrieren
- Locale setzen

Wir werden für diese Implementierung Promises nutzen, da wir mit den nativen Schnittstellen des Browsers arbeiten.
Wir markieren die Funktion deshalb als `async`, sodass wir darin das Schlüsselwort `await` zur Behandlung von Promises verwenden können.

Um die JSON-Datei herunterzuladen, müssen wir zur Laufzeit einen HTTP-Request starten.
Üblicherweise würden wir für diese Aufgabe den `HttpClient` von Angular verwenden.
Die Anwendung ist allerdings noch nicht gestartet, und die Dependency Injection funktioniert noch nicht.
Wir greifen daher auf die native Funktion `fetch()` zurück, mit der wir ebenso HTTP-Requests verarbeiten können.

An `fetch()` übergeben wir als URL den Pfad zur Datei `messages.de.json`.
Sie wird als statisches Asset mit ausgeliefert, da sie sich im Verzeichnis `public` befindet.
Der Aufruf liefert eine Promise zurück, die wir mit `await` auflösen.

Nachdem die Response eingetroffen ist, verwenden wir die Methode `json()`, um die Antwort von JSON in ein echtes JavaScript-Objekt umzuwandeln.
Auch hier erhalten wir eine Promise, die wir mithilfe von `await` auflösen.

Unser Ziel ist es, die Übersetzungen an die Angular-Anwendung zu übermitteln.
Dazu stellt Angular die Funktion `loadTranslations()` bereit, die wir aus dem Paket `@angular/localize` importieren.
Sie erwartet als Argument ein JavaScript-Objekt mit allen Texten.
Wir rufen `loadTranslations()` auf, nachdem wir die Daten aus der JSON-Datei geladen haben, und übermitteln die übersetzten Texte.

```typescript
import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

async function setupLocale() {
  const response = await fetch('messages.de.json');
  const result = await response.json();
  loadTranslations(result.translations);
}

setupLocale().then(() => {
  bootstrapApplication(App, appConfig);
});
```

Bisher hatten wir das Paket `@angular/localize` stets nur zur Build-Zeit genutzt.
Wenn wir nun allerdings die Funktion `loadTranslations()` verwenden, wird das Paket ein Teil des produktiven Quellcodes.
Wir sollten deshalb in der Datei `package.json` den Eintrag für `@angular/localize` aus dem Abschnitt `devDependencies` nach `dependencies` verschieben.
Wissen wir schon vorher, dass wir das Paket zur Laufzeit verwenden wollen, können wir bei der Installation die Option `--use-at-runtime` angeben.
Das Paket wird dann automatisch im Abschnitt `dependencies` eingetragen.

```bash
ng add @angular/localize --use-at-runtime
```

### Locale beim Bootstrapping setzen

Obwohl die Anwendung ursprünglich mit dem Standard-Locale `en-US` gebaut wurde, wird sie nun in deutscher Sprache angezeigt.
Noch vor dem Bootstrapping werden die deutschen Übersetzungen per HTTP geladen und an die Anwendung übermittelt.
Navigieren wir aber beispielsweise zur Buchdetailseite, sehen wir, dass die Formatierung für das Datum noch nicht dem deutschsprachigen Format entspricht.

Um dieses Problem zu beheben, müssen wir das passende Locale für unsere Sprache setzen.
Die Grundlagen hierfür haben wir bereits im Abschnitt zur Lokalisierung kennengelernt.
Nachdem die Übersetzungen geladen wurden, laden wir die deutsche Sprachdefinition über einen globalen Import, um das Locale in der Anwendung bekannt zu machen.

Außerdem müssen wir das InjectionToken `LOCALE_ID` setzen.
Da der Wert erst zur Laufzeit feststeht, erweitern wir die bestehende `appConfig` direkt in der `main.ts`:

```typescript
import '@angular/common/locales/global/de';
import { loadTranslations } from '@angular/localize';
import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { App } from './app/app';
import { appConfig } from './app/app.config';

async function setupLocale() {
  const response = await fetch('messages.de.json');
  const result = await response.json();
  loadTranslations(result.translations);
}

setupLocale().then(() => {
  bootstrapApplication(App, {
    ...appConfig,
    providers: [
      ...(appConfig.providers || []),
      { provide: LOCALE_ID, useValue: 'de' }
    ]
  });
});
```

Nun wird neben den deutschsprachigen Texten auch die deutsche Lokalisierung verwendet.

### Die Sprache wechseln

Auf der aktuellen Grundlage können wir nun einen einfachen Sprachwechsel implementieren.
Dafür müssen wir die gewählte Sprache persistieren und beim Start entscheiden, welche Sprachdatei geladen wird.
Je nach Architektur der Anwendung bieten sich dafür unterschiedliche Mechanismen an:

- **`localStorage`**: Die einfachste Lösung im Browser — die Sprachauswahl wird lokal gespeichert und steht beim nächsten Seitenaufruf sofort zur Verfügung. Auf dem Server (SSR) ist `localStorage` allerdings nicht verfügbar (mehr dazu später im Artikel).
- **Session oder Identity-Token**: Verfügt die Anwendung über ein Session-Management oder eine Authentifizierung, kann die Sprachpräferenz im Nutzerprofil oder in der Session hinterlegt werden. Dieser Ansatz funktioniert sowohl im Browser als auch auf dem Server.
- **`Accept-Language`-Header**: Der Browser sendet bei jeder Anfrage einen Header mit den im Browser eingestellten Sprachen. Dieser kann als Fallback dienen, wenn keine explizite Auswahl vorliegt.
- **Cookies**: Cookies werden bei jedem HTTP-Request an den Server gesendet und könnten die Sprachauswahl transportieren. Allerdings bringen Cookies zahlreiche Nachteile mit sich: Sie erhöhen die Größe jedes Requests, erfordern besondere Sicherheitsmaßnahmen (z. B. `HttpOnly`, `Secure`, `SameSite`) und unterliegen strengen datenschutzrechtlichen Anforderungen. In der Regel sind die anderen genannten Ansätze vorzuziehen.

Im Folgenden verwenden wir exemplarisch `localStorage` — die einfachste Variante für eine rein clientseitige Anwendung.
Dies ist keine generelle Handlungsempfehlung: Für das jeweilige Projekt können die anderen Ansätze besser geeignet sein, insbesondere wenn Server-Side Rendering zum Einsatz kommt.

Damit die Sprache in der Oberfläche umgeschaltet werden kann, erstellen wir in der `App`-Komponente eine Methode `changeLocale()`:
Ihre Aufgabe ist es, die gewählte Sprache im Browser zu speichern und dann die Anwendung neu zu laden.
Das Neuladen ist notwendig, damit die Routine zum Laden der Übersetzungen in der Datei `main.ts` erneut ausgeführt wird.
Es ist nicht möglich, die Sprache in der laufenden Anwendung zu wechseln.

```typescript
@Component({ /* ... */ })
export class App {
  // ...
  changeLocale(targetLang: string) {
    localStorage.setItem('locale', targetLang);
    location.reload();
  }
}
```

> **Hinweis:** Bei Anwendungen mit Server-Side Rendering (SSR) ist zu beachten, dass `localStorage` und `location` Browser-APIs sind, die in Node.js nicht zur Verfügung stehen.
> Eine Verwendung auf dem Server würde zu einem Laufzeitfehler führen.
> Die Methode `changeLocale()` wird hier ausschließlich durch ein Click-Event ausgelöst und ist daher unkritisch — Events finden nur im Browser statt.
> Auf die Besonderheiten beim Zusammenspiel mit SSR gehen wir weiter unten noch einmal ein.

Im Template der Komponente erzeugen wir zwei Buttons, um die Methode `changeLocale()` aufzurufen.
So ist es möglich, die Sprache zwischen Deutsch und Englisch zu wechseln.

```html
<nav>
  <!-- ... -->
  <div class="actions">
    <!-- ... -->
    <button (click)="changeLocale('de')">DE</button>
    <button (click)="changeLocale('en')">EN</button>
  </div>
</nav>
<!-- ... -->
```

Die gewählte Sprache wird nun im Browser gespeichert — jetzt müssen wir diese Entscheidung beim Start der Anwendung in der Datei `main.ts` berücksichtigen.

Unsere Funktion `setupLocale()` soll dazu als Rückgabewert die gewählte Sprache liefern.
Diese Information können wir dann beim Bootstrapping verwenden, um den Provider für die `LOCALE_ID` zu setzen.
Falls nicht die deutsche Sprache gewählt wurde, starten wir die Anwendung ohne Übersetzungen, und sie wird in englischer Sprache angezeigt.
Andernfalls laden wir die Übersetzungen aus der Datei `messages.de.json` nach.

Der Aufruf von `setupLocale()` liefert nun den korrekten Wert für das Locale.
Wir können das Argument innerhalb von `then()` empfangen und daraus den Provider konstruieren.

```typescript
// ...
async function setupLocale() {
  if (localStorage.getItem('locale') !== 'de') {
    return 'en-US';
  }
  const response = await fetch('messages.de.json');
  const result = await response.json();
  loadTranslations(result.translations);
  return 'de';
}

setupLocale().then(localeValue => {
  bootstrapApplication(App, {
    ...appConfig,
    providers: [
      ...(appConfig.providers || []),
      { provide: LOCALE_ID, useValue: localeValue }
    ]
  });
});
```

Wir haben die Umsetzung sehr einfach gehalten und auf das Notwendigste begrenzt.
In einer produktiven Anwendung solltest du diesen Ansatz weiter ausbauen:
Zum Beispiel solltest du prüfen, ob die gewählte Sprache auch wirklich existiert.
Sollen mehrere Sprachen unterstützt werden, ist eine differenziertere Fallunterscheidung notwendig.
Außerdem kannst du die Sprachvoreinstellung des Browsers abfragen und verwenden, sofern keine andere Sprache gewählt wurde.

Wenn mehrere Sprachen unterstützt werden, kann es außerdem sinnvoll sein, nur die jeweils benötigte Sprachdefinition zu importieren.
Statt eines statischen Imports können wir deshalb auch ein dynamisches Import-Statement verwenden:

```typescript
async function setupLocale() {
  // ...
  await import('@angular/common/locales/global/de');
  return 'de';
}
```

### Fazit: Laufzeit-Übersetzung

Die Übersetzung zur Laufzeit bietet maximale Flexibilität: Ein einziger Build genügt, und die Texte können jederzeit ausgetauscht werden. Dafür nehmen wir eine kurze Ladezeit beim Start in Kauf, und wir müssen das Laden und den Sprachwechsel selbst implementieren.


<a name="ssr"></a>
## i18n mit Server-Side Rendering (SSR)

Wenn wir unsere Anwendung mit Server-Side Rendering betreiben (siehe unseren [Online-Artikel zu SSR](/material/ssr)), gibt es einige Besonderheiten im Zusammenspiel mit i18n.

### Separate Server-Bundles pro Locale

Beim Build-Zeit-Ansatz mit `localize: true` und `outputMode: "server"` erzeugt Angular pro Locale ein eigenes Server-Bundle.
Die `AngularAppEngine` routet eingehende Anfragen anhand des URL-Pfads automatisch an das passende Bundle weiter — ein Aufruf von `/de/books` wird vom deutschen Server-Bundle bedient, `/en-US/books` vom englischen.

### Automatische Sprachweiterleitung

Ruft jemand die Wurzel-URL `/` auf, wertet Angular den `Accept-Language`-Header des Browsers aus und leitet mit einem HTTP-302-Redirect an die passende Sprachvariante weiter.
Diese Weiterleitung funktioniert nur mit `outputMode: "server"` und ist dort automatisch aktiv — eine manuelle Konfiguration im Webserver (z. B. Nginx oder Apache) ist nicht notwendig.
Ohne SSR muss die Weiterleitung hingegen manuell im Webserver eingerichtet werden.

### Hydration mit i18n-Blöcken

Damit die Hydration für i18n-Blöcke korrekt funktioniert, muss das Feature explizit aktiviert werden:

```typescript
import { provideClientHydration, withI18nSupport } from '@angular/platform-browser';

// in der App-Konfiguration:
provideClientHydration(withI18nSupport())
```

Ohne `withI18nSupport()` werden Elemente mit i18n-Attributen bei der Hydration übersprungen und komplett neu gerendert.

### Laufzeit-Übersetzung und SSR: Sprachauswahl auf dem Server

Beim Laufzeit-Ansatz haben wir die Sprachauswahl exemplarisch im `localStorage` gespeichert.
Auf dem Server steht `localStorage` jedoch nicht zur Verfügung. Es handelt sich um eine reine Browser-API, die in Node.js nicht existiert.
Anders als beim Build-Zeit-Ansatz existieren beim Laufzeit-Ansatz auch keine sprachspezifischen URL-Pfade wie `/de/` oder `/en/` — das Locale lässt sich also nicht aus der URL ableiten.

Kommt Server-Side Rendering zum Einsatz, sollte deshalb einer der im [Abschnitt zum Sprachwechsel](#die-sprache-wechseln) genannten servertauglichen Ansätze gewählt werden, etwa Session-basierte Speicherung oder die Auswertung des `Accept-Language`-Headers.
Eine pauschale Lösung gibt es hier nicht — die Wahl hängt davon ab, wie die Anwendung generell Daten persistiert und welche Infrastruktur zur Verfügung steht.
Am unkompliziertesten ist es in der Praxis, die Sprache bereits zur Build-Zeit festzulegen und so den Build-Zeit-Ansatz mit SSR zu kombinieren.

## Deployment: Unterverzeichnisse mit `subPath` anpassen

Beim Build-Zeit-Ansatz werden die lokalisierten Varianten standardmäßig in Unterverzeichnissen abgelegt, die dem Locale-Namen entsprechen (z. B. `/de/`, `/en-US/`).
Mit der Option `subPath` in der Locale-Konfiguration können wir den Namen des Unterverzeichnisses anpassen:

```json
"locales": {
  "de": {
    "translation": "messages.de.xlf",
    "subPath": "deutsch"
  }
}
```

In diesem Beispiel wird die deutsche Variante unter `/deutsch/` statt unter `/de/` ausgeliefert.


## Technische Einschränkungen

Bei beiden vorgestellten Ansätzen wurde eine technische Einschränkung deutlich:
Wir können nur jeweils eine einzelne Sprache laden.
Dazu können wir entweder eine speziell dafür gebaute Anwendung erzeugen, oder wir können die Sprache einmalig vor dem Start der App laden und festlegen.
Ein Wechsel zur Laufzeit ist mit den Bordmitteln von Angular nicht möglich — zum Laden einer Sprache muss immer die App gewechselt bzw. die Seite neu geladen werden.
Dafür haben wir den Vorteil, dass wir keine Einbußen bei der Performance in Kauf nehmen müssen.
Zur Laufzeit ist die Sprache immer schon festgelegt, und es müssen keine zusätzlichen Ressourcen dafür beansprucht werden.

Eine weitere Einschränkung betrifft dynamische Inhalte: Das i18n-Tooling von Angular übersetzt ausschließlich statische Texte in Templates und im TypeScript-Code.
Inhalte, die zur Laufzeit von einer API geladen werden, können damit nicht übersetzt werden — hier muss entweder die API selbst die Texte in der richtigen Sprache liefern, oder wir müssen im Code eine eigene Logik dafür bereitstellen.

Wenn du die Anwendung beim Sprachwechsel auf keinen Fall neu laden willst, kannst du die mitgelieferten Ansätze von Angular nicht verwenden.
Wir empfehlen dann, auf eine externe Bibliothek zurückzugreifen, z. B. [Transloco](https://github.com/jsverse/transloco) oder [ngx-translate](https://github.com/ngx-translate/core).
Beachte bei solchen externen Lösungen allerdings immer, dass die Übersetzungen dynamisch zur Laufzeit mithilfe von Bindings ausgewertet werden.
Dieser Ansatz kann niemals so performant sein wie eine Anwendung, die gezielt für eine Sprache gebaut wurde bzw. bei der die Übersetzungen vor dem Start der Anwendung geladen wurden.

## Fazit

Angular liefert ein ausgereiftes Tooling für Lokalisierung und Internationalisierung mit.
In diesem Artikel haben wir den gesamten Weg kennengelernt: von der Lokalisierung für ein einzelnes Locale über die Extraktion und Übersetzung von Texten bis hin zur mehrsprachigen Auslieferung — sowohl zur Build-Zeit als auch zur Laufzeit.
Wir können jetzt eine Angular-Anwendung vollständig internationalisieren, ohne auf externe Bibliotheken angewiesen zu sein.
Das i18n-Tooling der Angular CLI übernimmt dabei die schwere Arbeit: Es extrahiert die Texte, erzeugt Übersetzungsdateien und baut die lokalisierten Varianten automatisch.
Wir wünschen viel Erfolg bei der Bereitstellung eurer Anwendung für eine internationale Zielgruppe!
