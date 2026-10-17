---
title: 'View Transitions in Angular: Shared-Element-Animationen zwischen Routen'
author: Danny Koppenhagen
mail: mail@k9n.dev
published: 2026-10-20
lastModified: 2026-10-20
keywords:
  - Angular
  - View Transitions
  - View Transitions API
  - Routing
  - Animations
  - Shared Element Transition
  - Router Resources
  - Chrome DevTools
  - Angular 22
language: de
header: view-transitions-header.png
sticky: false
---

Ein Routenwechsel in einer Single-Page-Anwendung ist meist ein harter Schnitt: Die eine Ansicht verschwindet, die nächste erscheint. Mit der View Transitions API des Browsers lässt sich dieser Wechsel in eine flüssige Animation verwandeln.
Das Beste dabei: Angular bringt die passende Integration gleich mit.

In diesem Artikel bauen wir eine Übergangsanimation zwischen einer Buchliste und einer Detailseite zu einem Buch.
Das Ziel: Die Listen-Card „zoomt“ zur Detailseite, während Cover, Titel, Untertitel und ISBN von ihrer Position in der Liste an ihre neue Position auf der Detailseite wandern.
Neu hinzukommende Inhalte wie Autoren und Beschreibung blenden sanft ein.
Das Ganze funktioniert ohne zusätzliche Abhängigkeit, allein mit der Browser-API und ein wenig CSS.
In Browsern ohne Unterstützung der View Transitions API findet der Routenwechsel wie gewohnt ohne Animation statt.

> ⚠️ **Developer Preview:** Die hier vorgestellten Funktionen `withViewTransitions()` und `withRouterResources()` sind (Stand Angular 22.2) als Developer Preview markiert.
> Die APIs können sich in zukünftigen Versionen noch ändern.

## Inhalt

[[toc]]

## Was sind View Transitions?

Die [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) ist eine native Browserschnittstelle, die Übergänge zwischen zwei Zuständen einer Oberfläche animiert.
Der Kern ist die Methode `document.startViewTransition()`: Sie bekommt ein Callback, das die eigentliche DOM-Änderung vornimmt.

Der Browser arbeitet dabei in vier Phasen:
Zuerst erfasst er den aktuellen Zustand der Seite als Momentaufnahme.
Dann führt er das DOM-Update aus unserem Callback aus.
Anschließend erfasst er den neuen Zustand.
Zum Schluss animiert er den Übergang zwischen beiden Momentaufnahmen.

![Ablaufdiagramm der View Transitions API: alten Zustand als Snapshot erfassen, DOM aktualisieren, neuen Zustand erfassen, zwischen beiden Snapshots animieren.](view-transitions-flow.svg "Die vier Phasen einer View Transition.")

Für die Animation legt der Browser im Hintergrund einen Baum aus Pseudo-Elementen an:
Pro benanntem Bereich entsteht eine `::view-transition-group()`, die Position und Größe interpoliert. Darin liegt ein `::view-transition-image-pair()` mit `::view-transition-old()` und `::view-transition-new()`, die vom alten zum neuen Zustand überblenden.
Diese Pseudo-Elemente lassen sich mit CSS gezielt ansprechen.
Darüber steuern wir später die Animation.

Wichtig zur Einordnung: Hier ist keine Animations-Engine von Angular im Spiel. Es handelt sich um eine reine Browser-API. Angular klinkt sich lediglich in den Navigationszyklus des Routers ein.

Noch ein Detail, das man kennen sollte: Während der Übergang läuft, legt der Browser die Pseudo-Element-Schicht als Überlagerung über die eigentliche Seite. Der alte Zustand wird dabei als statisches Bild festgehalten, der neue Zustand als Live-Abbild des neuen DOM.
Diese Überlagerung fängt standardmäßig Zeiger-Interaktionen ab, sodass die Seite für die Dauer der Animation praktisch nicht bedienbar ist.
Das ist ein guter Grund, Übergänge kurz zu halten (in unserem Beispiel eine halbe Sekunde): Je länger die Animation ist, desto länger kann die nutzende Person nicht klicken oder scrollen.

### Zwei Varianten: SPA (same-document) vs. MPA (cross-document)

Die View Transitions API deckt zwei unterschiedliche Szenarien ab, jedes mit einem eigenen Einstiegspunkt:

- **Same-document (SPA):** Der Übergang findet zwischen zwei DOM-Zuständen *innerhalb* derselben Seite statt. Er wird imperativ über `document.startViewTransition(callback)` ausgelöst. Diesen Weg nutzt der Angular-Router intern.
- **Cross-document (MPA, Multi-Page Application):** Der Übergang findet bei der Navigation *zwischen* zwei Dokumenten statt. Er wird deklarativ über die CSS-At-Rule `@view-transition { navigation: auto; }` aktiviert, und beide Seiten müssen von derselben Origin stammen. Das ist der Weg für klassische, serverseitig gerenderte Seiten ohne Framework.

Da eine Angular-Anwendung eine Single-Page-Anwendung (SPA) ist, geht es im weiteren Verlauf ausschließlich um den same-document-Weg.
Die MPA-Variante kommt ganz ohne JavaScript aus. Sie ist ein eigenes Thema und hier nur zur Einordnung erwähnt.

### Browsersupport und Stand

*Same-document View Transitions* sind seit Oktober 2025 in allen großen Browsern verfügbar („Baseline Newly available“): Chrome und Edge ab 111, Safari ab 18, Firefox ab 144.
Die in diesem Artikel verwendeten View-Transition-Klassen (`view-transition-class`) benötigen allerdings Chrome und Edge ab 125 bzw. Safari ab 18.2.

Der Charakter als *Progressive Enhancement* bleibt trotzdem wichtig: In Browsern ohne Unterstützung führt Angular den Routenwechsel einfach ohne Animation aus.
Somit bleibt die Anwendung voll funktionsfähig.
Da sich der Support laufend ändert, lohnt sich ein Blick auf die aktuelle [Browserkompatibilitätstabelle bei MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API#browser_compatibility).

## Das Beispielprojekt

Als Grundlage dient der [BookManager aus dem Angular-Buch in der Variante `15-rxjs`](https://bm1.angular-buch.com/#bm15). Die Anwendung hat zwei relevante Routen: eine Buchliste (`BooksOverviewPage`, die pro Buch eine `BookCard` rendert) und eine Detailseite (`BookDetailsPage`). Beide arbeiten mit demselben Datenmodell `Book`, das unter anderem ISBN, Titel, Autoren, die Cover-URL und weitere Metadaten enthält.

Ohne weitere Konfiguration ist der Wechsel von der Liste zur Detailansicht ein harter Schnitt. Diesen Übergang bauen wir Schritt für Schritt zu einer zusammenhängenden Animation aus.
Der Artikel zeigt dabei nur die relevanten Ausschnitte. Den vollständigen, lauffähigen Stand mit allen Namen und Styles gibt es als [StackBlitz-Projekt zum Nachbauen und Ausprobieren](https://stackblitz.com/edit/angular-buch-book-manager1-view-transition-api).

![Animierte Demo im Book Manager: Beim Klick auf ein Buch in der Liste morpht das Cover zusammen mit Titel, Untertitel und ISBN flüssig in die Detailansicht.](view-transition-book-manager-demo.webp "Das Ziel: ein zusammenhängender Übergang von der Buchliste zur Detailseite.")

### View Transitions im Router aktivieren

Damit der Router die View Transitions unterstützt, müssen wir das Feature zunächst aktivieren.
Wir ergänzen die Router-Konfiguration um das Feature `withViewTransitions()`.
Von da an ruft der Router bei jeder Navigation automatisch `document.startViewTransition()` auf und wickelt den Routenwechsel darin ab.

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()       // aktiviert View Transitions
    )
  ]
};
```

Unterstützt der Browser die API nicht, bleibt alles beim normalen DOM-Wechsel und es treten keine Fehler auf.

Schon jetzt gibt es einen sichtbaren Effekt: Der gesamte Seiteninhalt wird beim Routenwechsel sanft übergeblendet.
Das ist das Standardverhalten des Browsers: Er gibt dem `<html>`-Element automatisch den `view-transition-name` `root` und blendet es als Ganzes über.

### Ein grundlegender Seitenübergang per CSS

Bevor wir zu den geteilten Elementen kommen, lohnt ein Blick auf den einfachsten Fall: ein gleichmäßiger Übergang des gerouteten Inhalts.
Dazu geben wir dem Element direkt hinter dem `router-outlet` einen `view-transition-name` und definieren zwei Keyframe-Animationen für das Ein- und Ausblenden.

```css
/* styles.css */
router-outlet + * {
  view-transition-name: route-content;
}

@keyframes route-fade-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-10px); }
}

@keyframes route-fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

::view-transition-old(route-content) {
  animation: 200ms ease-out both route-fade-out;
}

::view-transition-new(route-content) {
  animation: 300ms ease-in both route-fade-in;
}
```

Diese Regeln gehören in die **globalen** Styles, nicht in die gekapselten Styles einer Komponente.
Angulars View Encapsulation versieht komponentenlokale Stile mit Attributselektoren.
Die vom Browser erzeugten `::view-transition-*`-Pseudo-Elemente liegen aber außerhalb jeder Komponente und werden von solchen Selektoren nicht erreicht.

### Shared-Element-Transitions für Cover und Titel

Spannender werden View Transitions mit sogenannten *Shared Elements*:
Trägt ein Element in *beiden* Ansichten den gleichen `view-transition-name`, erkennt der Browser es als dasselbe Element wieder und interpoliert Position und Größe von der alten zur neuen Lage.
Der Effekt: Das Element *wandert* sichtbar, statt zu verschwinden und neu zu erscheinen.

![Shared-Element-Morph: Das Cover sitzt in der Listen-Card rechts und klein, auf der Detailseite groß und unten links. Ein Pfeil verdeutlicht, dass derselbe view-transition-name den Browser Position und Größe interpolieren lässt.](shared-element-morph.svg "Dasselbe Cover in beiden Ansichten: der Browser interpoliert Position und Größe.")

Die Namen müssen dabei pro Übergang eindeutig sein.
In der Liste gibt es aber viele `BookCard`-Instanzen gleichzeitig, die über `@for` iteriert werden.
Würden alle Cover denselben Namen tragen, käme es zum Konflikt.
Deshalb leiten wir den Namen aus der ISBN des jeweiligen Buchs ab, etwa `book-cover-<isbn>` und `book-title-<isbn>`.
Zusätzlich vergeben wir eine `view-transition-class`, über die wir später alle gleichartigen Elemente mit einer einzigen CSS-Regel ansprechen können.

In der `BookCard` sieht das für Cover und Titel so aus:

```html
<!-- book-card.html (Ausschnitt) -->
@let b = book();
@let titleId = `title-${b.isbn}`;

<img alt="Buchcover"
  [src]="b.imageUrl"
  [style.view-transition-name]="'book-cover-' + b.isbn"
  [style.view-transition-class]="'book-cover'" />
<h2 [id]="titleId"
  [style.view-transition-name]="'book-title-' + b.isbn"
  [style.view-transition-class]="'book-title'">{{ b.title }}</h2>
```

Auf der Detailseite geben wir im Anschluss dem großen Cover und der Überschrift dieselben Namen.
Damit kann der Browser nun die entsprechenden Paare finden:

```html
<!-- book-details-page.html (Ausschnitt) -->
<h1 [id]="titleId"
  [style.view-transition-name]="'book-title-' + b.isbn"
  [style.view-transition-class]="'book-title'">{{ b.title }}</h1>
<img alt="Buchcover"
  [src]="b.imageUrl"
  [style.view-transition-name]="'book-cover-' + b.isbn"
  [style.view-transition-class]="'book-cover'" />
```

Beim Styling lauert ein verbreiteter Stolperstein.
Verlockend wäre es, auf `::view-transition-old()` und `::view-transition-new()` eigene `transform`-Keyframes zu legen, um die Bewegung direkt zu steuern.
Das würde aber den Effekt zerstören: Die automatische Interpolation von Position und Größe steckt bereits in der `::view-transition-group()`.
Überschreibt man `old`/`new` mit eigenen Transforms, bleibt nur noch ein Überblenden: das Element fadet, statt zu wandern.

Richtig ist, die Bewegung dem Browser zu überlassen und über die Gruppe nur Dauer und Easing vorzugeben.
Das `old`/`new`-Paar überblenden wir lediglich ineinander:

```css
::view-transition-group(.book-cover) {
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
}

::view-transition-old(.book-cover),
::view-transition-new(.book-cover) {
  animation-duration: 500ms;
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  /* Momentaufnahme füllt die Gruppe, Seitenverhältnis bleibt erhalten */
  height: 100%;
  object-fit: cover;
}
```

### Daten synchron bereitstellen mit Router Resources

An dieser Stelle stößt man schnell auf ein (vielleicht überraschendes) Problem: Das Cover fadet statt zu wandern, obwohl alles korrekt benannt ist.
Der Grund liegt im Timing.

Angular wartet bei View Transitions bewusst *nicht* auf asynchrone Daten.
Lädt die Detailseite ihr Buch erst nach der Aktivierung, werden die Daten noch nicht angezeigt, wenn der Browser den neuen Zustand erfasst.
Es existiert also weder die Überschrift noch das Cover.
Für die geteilten Elemente existiert dann nur ein `::view-transition-old()`, aber kein `::view-transition-new()`.
Es gibt also kein Gegenstück, zu dem hin interpoliert werden könnte.
Das Ergebnis ist genau das beobachtete Ausblenden statt eines Morphs.

![Timeline-Vergleich: Bei async geladenem httpResource läuft der HTTP-Request noch, wenn der Browser den neuen Zustand erfasst. Die Daten kommen zu spät, es bleibt beim Fade. Bei einer blockierenden Router Resource sind die Daten vor dem Capture da und das DOM ist vollständig, der Morph gelingt.](resource-timing.svg "Warum das Timing entscheidet: Das DOM muss beim Capture vollständig sein.")

Die Lösung: Das Buch muss schon beim Aktivieren der Route synchron vorliegen.
Ein vorab gefüllter Cache ist dafür ein möglicher Weg: Liegt das Buch bereits im Speicher, steht es ohne Verzögerung bereit.
Verlässlich erzwingen lässt sich das synchrone Vorliegen aber über eine *blockierende* Router Resource, die mit Angular 22.2 als Developer Preview eingeführt wurde.
Dafür aktivieren wir jetzt das Router-Feature `withRouterResources()`:

```typescript
// app.config.ts (Ausschnitt)
provideRouter(
  routes,
  withComponentInputBinding(),
  withViewTransitions(),
  withRouterResources()       // aktiviert Router Resources
)
```

In den Routen können wir nun Resources angeben, die automatisch vom Router aufgelöst werden.
Bevor die Komponente aktiviert wird, wird blockierend auf den geladenen Wert der Resource gewartet. Erst danach wird die Komponente geladen.
Unser `BookStore` stellt bereits eine Methode `getSingle()` bereit, die auf einem signalbasierten `httpResource` aufsetzt und auf einen wechselnden ISBN-Parameter reagiert.
Diese Resource können wir direkt verwenden. Wir übergeben den Routenparameter als Funktion, die die ISBN zurückgibt:

```typescript
// book-store.ts (Ausschnitt)
getSingle(isbn: () => string): HttpResourceRef<Book | undefined> {
  return httpResource<Book>(
    () => `${this.#apiUrl}/books/${isbn()}`
  );
}
```

```typescript
// books-portal.routes.ts (Ausschnitt)
{
  path: 'details/:isbn',
  component: BookDetailsPage,
  resources: (ctx) => {
    const bookStore = inject(BookStore);
    return {
      book: bookStore.getSingle(() => ctx.params()['isbn'] || '')
    };
  }
}
```

Die Komponente schrumpft dadurch auf das Wesentliche.
Das Ergebnis wird mittels *Component Input Binding* an ein Input der Komponente gebunden: Der Schlüssel `book` aus dem `resources`-Objekt landet im gleichnamigen Input `book`.
Statt eine Resource selbst zu verwalten, nimmt die Komponente also das fertige Buch einfach als Input entgegen:

```typescript
// book-details-page.ts
export class BookDetailsPage {
  readonly book = input.required<Book>();   // kommt aus der blockierenden Resource
  // ...
}
```

Dass eine *Non-Blocking Router Resource* hier keine Alternative ist, ergibt sich aus demselben Timing-Argument: Die Komponente bekäme dann die Resource selbst als Input und würde gerendert, bevor die Daten da sind.
Der Effekt: Wir landen wieder beim Fade.

Einen Trade-off haben Router Resources allerdings: Die Navigation wartet kurz auf den Request, bevor der Übergang startet.
Bei einer schnellen Server-API ist das kaum wahrnehmbar.
Dafür gibt es einen praktischen Zusatznutzen: Im Fall einer unbekannten ISBN, bei dem die blockierende Resource die Navigation abbrechen würde, lässt sich in der ladenden Funktion der Resource ein `RedirectCommand` werfen und so umleiten.
Im Minimalbeispiel haben wir an dieser Stelle aber darauf verzichtet.

> **Router Resources oder klassischer Resolver?** Der Gedanke, Daten „vor der Aktivierung“ blockierend zu laden, ist nicht neu: Klassischerweise haben wir dafür einen *Resolver* genutzt (`ResolveFn<T>`, registriert unter `resolve` in der Route).
> Resolver und Router Resource teilen genau die Eigenschaft, auf die es uns hier ankommt: Beide blockieren die Navigation und stellen das Ergebnis über ein Component Input Binding synchron als Input bereit.
> Für unseren Shared-Element-Morph wäre ein Resolver also grundsätzlich ebenso geeignet.
>
> Wir setzen hier trotzdem Router Resources ein, weil sie signal-basiert und damit reaktiv sind: ändert sich ein Routenparameter, lädt die Resource neu, und ein `reload()` ist ohne erneute Navigation möglich.
> Über die Routen-Hierarchie laufen mehrere Resources zudem *parallel*, während Resolver von der Eltern- zur Kindroute nacheinander abgearbeitet werden.
> Außerdem fügen sie sich konsistent in ein Projekt ein, das ohnehin mit `httpResource` und Signals arbeitet, und `nonBlocking()` steht als expliziter Opt-out bereit, wenn man den Ladezustand doch in der Komponente behandeln möchte.
> Die Fehlerbehandlung funktioniert in beiden Welten ähnlich: Resolver fangen Fehler an der Quelle ab (z. B. mit `catchError()`) oder nutzen `withNavigationErrorHandler()`. Eine Router Resource wirft in ihrer ladenden Funktion ein `RedirectCommand`.
>
> Wer Resolver im Projekt hat und zufrieden damit ist, muss nichts umbauen. Resolver bleiben ein valides Werkzeug. Eine ausführliche Behandlung inklusive Fehlerbehandlung und der UX-Problematik blockierender Navigation findet sich im Buch-Zusatzmaterial [Resolvers: Daten beim Routing vorladen](/material/resolvers).
> Dort argumentieren wir, dass blockierende Resolver aus UX-Sicht meist ungünstig sind.
> Unser Fall ist die begründete Ausnahme: Hier müssen die Daten synchron vorliegen, sonst kann die View Transition nicht morphen.
> Hinzu kommt, dass die View Transition selbst die wahrgenommene Wartezeit überbrückt: Ein harter Schnitt mit kurzer Pause wirkt wie ein Hänger, der animierte Übergang zeigt dagegen, dass etwas passiert.

### Weitere zuordenbare Elemente und das Ein- und Ausblenden

Nach dem Prinzip, das wir eben kennengelernt haben, lassen sich beliebig viele Elemente paaren.
Alles, was in beiden Ansichten vorkommt, bekommt einen geteilten Namen.
Zusätzlich zum Cover und Titel verknüpfen wir also auch Untertitel (`book-subtitle-<isbn>`) und ISBN (`book-isbn-<isbn>`).
Selbst dem umgebenden `<article>` geben wir einen Namen (`book-frame-<isbn>`).
Dadurch morpht der Rahmen als Ganzes, und die kompakte Listen-Card „zoomt“ sichtbar zur ausgedehnten Detailseite.
Wo genau diese Namen im Markup sitzen, zeigt das vollständige [`book-card.html` im StackBlitz-Projekt](https://stackblitz.com/edit/angular-buch-book-manager1-view-transition-api).

Elemente, die nur in einer der beiden Ansichten existieren, behandelt der Browser automatisch sinnvoll: Neue Inhalte wie Autoren, Beschreibung und Datum blenden über den Standard-Überblendeffekt des Frames ein.

Interessant ist das Zusammenspiel von Rahmen und Inhalt. Ein benanntes Kind-Element wird aus seinem benannten Vorfahren „herausgehoben“ und als eigene Top-Level-Gruppe animiert.
Der Frame morpht also, ohne Cover, Titel und Co. mitzuzerren: Diese wandern unabhängig obendrauf.
So entsteht die zusammengesetzte Choreografie aus einem zoomenden Rahmen und mehreren eigenständig wandernden Elementen.

### Bereiche gezielt sofort ausblenden statt faden

Der `<footer>` der Card mit dem Link „Details“ und dem Button „Like“ existiert auf der Detailseite nicht.
Über den Überblendeffekt des Frames würde er langsam ausfaden.
Wir wollen aber, dass der gesamte Footer sofort verschwindet.

Die Lösung ist, dem gesamten `<footer>` einen eigenen `view-transition-name` samt Klasse `book-actions` zu geben.
Da das Element nur in der Liste vorkommt, enthält seine Gruppe nur ein `::view-transition-old()` und kein `::view-transition-new()`.

Hier lauert noch eine Feinheit: `animation: none` wäre falsch, denn das ließe die Momentaufnahme über die gesamte Transition stehen.
Der Footer bliebe also sichtbar.
Stattdessen setzen wir ihn in einem einzigen Schritt einfach auf `opacity: 0`:

```css
::view-transition-old(.book-actions) {
  animation: 1ms step-end both book-actions-hide;
}

@keyframes book-actions-hide {
  from, to { opacity: 0; }
}
```

Ein eigener Name kombiniert mit einem `opacity: 0`-Keyframe ist der allgemeine Weg, um Bereiche, die nur in einer Ansicht vorkommen, gezielt sofort ein- oder auszublenden, statt sie zu faden.

### Feinschliff: zeitlicher Versatz

Ein Übergang wirkt lebendiger, wenn sich nicht alle Elemente exakt gleichzeitig bewegen, sondern leicht gestaffelt.
In unserem Beispiel startet das Cover seine Wanderung bewusst 100 Millisekunden nach dem Rahmen und den übrigen Elementen.
Umgesetzt wird das über `animation-delay` auf der Cover-Gruppe.
Mit `animation-fill-mode: both` bleibt das Cover während der Verzögerung an seiner Startposition stehen, statt zu springen:

```css
::view-transition-group(.book-cover) {
  animation-duration: 500ms;
  animation-delay: 100ms;      /* startet versetzt */
  animation-fill-mode: both;   /* hält Start-/Endbild in der Verzögerung */
  animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

Die gleichen Werte für `animation-delay` und `animation-fill-mode` setzen wir auch auf `::view-transition-old(.book-cover)` und `::view-transition-new(.book-cover)`, damit Überblendung und Positions-Morph synchron bleiben.
Im nächsten Abschnitt sehen wir, dass dieser Versatz in den DevTools gut sichtbar wird: In der Zeitleiste beginnt die Cover-Spur erkennbar später als die des Rahmens.

## Untersuchung und Nachvollziehbarkeit mit den Chrome DevTools

Eine View Transition läuft in etwa einer halben Sekunde ab.
Das ist oftmals zu schnell, um mit bloßem Auge zu beurteilen, ob ein Element wirklich wandert oder nur überblendet.
Die Chrome DevTools bringen mit dem Animations-Panel ein Werkzeug mit, das genau diese Analyse ermöglicht.
Die offizielle Dokumentation dazu findet sich unter [Inspect CSS animations](https://developer.chrome.com/docs/devtools/css/animations/).

### Das Animations-Panel öffnen

Am schnellsten geht es über das Command-Menü: Mit `Cmd`/`Ctrl` + `Shift` + `P` die Eingabe „Show Animations“ aufrufen.
Alternativ lässt sich das Panel über das Drawer-Menü („More tools“ → „Animations“) öffnen.
Das Panel zeigt die aufgezeichneten Animationsgruppen untereinander, jeweils als Balken auf einer gemeinsamen Zeitleiste, und bietet einen Abspielmarker, mit dem man die Animation manuell durch die Zeit ziehen kann.

![Annotiertes Chrome-DevTools-Animations-Panel: Buttons für „Clear all“ und „Pause all“, Geschwindigkeits-Buttons und eine Zeitleiste mit je einer Spur pro view-transition-Gruppe (Rahmen, Cover, Titel, Untertitel, ISBN) sowie dem Seiten-Crossfade.](devtools-animations-panel.svg "Das Animations-Panel: Zeitleiste, Geschwindigkeit und Abspielmarker.")

### Aufzeichnen und wiederholen

Das Panel zeichnet automatisch auf, sobald eine Animation startet.
Es genügt also, bei geöffnetem Panel die Navigation auszulösen: In unserem Fall also ein Klick auf „Details“.
Die aufgezeichnete Transition erscheint als Gruppe von Zeitleisten-Spuren, und über den Replay-Button lässt sie sich beliebig oft erneut abspielen, ohne erneut navigieren zu müssen.
Hier tauchen die einzelnen Gruppen namentlich auf, etwa `::view-transition-group(book-cover-…)`.
Mit dem Abspielmarker lässt sich der Übergang von Hand durch die Zeit ziehen, sodass man jeden Zwischenzustand in Ruhe betrachten kann.

### Verlangsamen für die Analyse

Im Panel lässt sich die Abspielgeschwindigkeit reduzieren, etwa auf 25 % oder 10 %. In dieser Zeitlupe wird unmittelbar sichtbar, was im Normaltempo verborgen bleibt: Verändert ein Element Position und Größe, läuft also tatsächlich eine `group`-Animation, dann funktioniert die Shared-Element-Transition.
Blendet es dagegen nur ein oder aus, handelt es sich um ein reines Fade. Dann fehlt das Gegenstück im neuen DOM.

### Nachweis: Morph oder Fade?

Wer es genau wissen will, kann die laufenden Pseudo-Element-Animationen auch programmatisch auslesen.
`document.getAnimations()` liefert alle aktiven Animationen, über deren `effect.pseudoElement` sich die zugehörigen `::view-transition-*`-Namen ablesen lassen.
Das Erfolgskriterium ist eindeutig: Existiert für ein geteiltes Element sowohl eine `::view-transition-group(name)` als auch ein `::view-transition-new(name)`, handelt es sich um einen echten Morph.
Findet sich dagegen nur ein `::view-transition-old(name)` ohne `::view-transition-new(name)`, fehlt das Element im neuen DOM. Es kann nur ausblenden.
Das ist typischerweise die Signatur asynchron geladener Daten und führt direkt zurück zu unserer Lösung mit den Router Resources oder alternativ Resolvern.
Zusätzlich lassen sich `transform`, `width` und `height` der Gruppe am Anfang und Ende auslesen, um die Interpolation schwarz auf weiß zu belegen.

## Barrierefreiheit: `prefers-reduced-motion`

Beim Thema Bewegung sind zwei Konzepte auseinanderzuhalten. Das eine ist Progressive Enhancement im Sinne fehlender Browserfähigkeiten.
Das deckt die View Transitions API bereits selbst ab, indem Angular ohne Unterstützung ein normales DOM-Update macht.
Das andere ist `prefers-reduced-motion`: eine bewusste Nutzerpräferenz, etwa bei vestibulären Beschwerden.
Das ist kein Fähigkeits-Fallback, sondern eine Opt-out-Entscheidung der nutzenden Person.

Die eigentliche Lösung liefert Angulars View-Transitions-Integration.
`withViewTransitions()` akzeptiert ein Optionsobjekt mit dem Callback `onViewTransitionCreated`.
Dieses läuft in einem Injection Context und bekommt unter anderem die native Instanz von `ViewTransition` übergeben.
Darauf rufen wir bei `reduce` `skipTransition()` auf. Das überspringt die Animation, während das DOM-Update (also der Routenwechsel) trotzdem ausgeführt wird:

```typescript
// app.config.ts
provideRouter(
  routes,
  withComponentInputBinding(),
  withViewTransitions({
    onViewTransitionCreated: ({ transition }) => {
      const prefersReducedMotion =
        matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        transition.skipTransition();
      }
    }
  }),
  withRouterResources()
)
```

`skipTransition()` deckt den View-Transition-Fall vollständig ab: Es unterbindet sowohl unsere eigenen Keyframes als auch den browsereigenen Standard-Überblendeffekt, der den gesamten Seiteninhalt betrifft.
Inhalt und Navigation bleiben dabei voll funktionsfähig, lediglich die zusätzliche Bewegung entfällt.

Als zweite Absicherung können wir unsere eigenen Keyframes zusätzlich in `@media (prefers-reduced-motion: no-preference)` kapseln.
Für die Angular-Integration ist das zwar nicht mehr nötig, da `skipTransition()` den Übergang ohnehin überspringt. Es ist aber eine gute Angewohnheit und greift auch dort, wo View Transitions ohne die Router-Integration zum Einsatz kommen:

```css
/* Animationen nur, wenn keine Reduktion gewünscht ist (opt-in) */
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-group(.book-cover) {
    animation-duration: 500ms;
    animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  /* … alle weiteren View-Transition-Regeln hier hinein … */
}
```

### Übergänge bei reinen Query-Parameter-Wechseln überspringen

`onViewTransitionCreated` eignet sich noch für einen weiteren Fall.
Der Router löst bei *jeder* Navigation einen Übergang aus, also auch dann, wenn sich nur Query-Parameter oder das Fragment ändern.
Ein typisches Beispiel ist ein Suchfeld, das den Suchbegriff als Query-Parameter in die URL schreibt: Jeder Tastendruck würde eine View Transition samt Überblendung und blockierender Overlay-Schicht auslösen.

Die Angular-Dokumentation zeigt dafür das passende Muster: den Übergang überspringen, wenn sich die eigentliche Route gar nicht ändert.
Die Prüfung lässt sich mit der Bedingung für reduzierte Bewegung aus dem vorigen Abschnitt im selben Callback kombinieren:

```typescript
import { inject } from '@angular/core';
import { Router, withViewTransitions, isActive, IsActiveMatchOptions } from '@angular/router';

withViewTransitions({
  onViewTransitionCreated: ({ transition }) => {
    const router = inject(Router);
    const targetUrl = router.currentNavigation()!.finalUrl!;

    // Übergang überspringen, wenn sich nur Fragment oder Query-Parameter ändern
    const config: Partial<IsActiveMatchOptions> = {
      paths: 'exact',
      matrixParams: 'exact',
      fragment: 'ignored',
      queryParams: 'ignored'
    };
    const isTargetRouteCurrent = isActive(targetUrl, router, config);

    if (isTargetRouteCurrent()) {
      transition.skipTransition();
    }
  }
})
```

## Fazit

Mit der View Transitions API lassen sich Routenwechsel in Angular ohne zusätzliche Abhängigkeit animieren.
Es funktioniert als Progressive Enhancement, das in nicht unterstützenden Browsern zum normalen Verhalten degradiert.
Drei Bausteine tragen das Ergebnis:

- `withViewTransitions()` aktiviert die Integration,
- geteilte `view-transition-name`-Werte verwandeln einzelne Elemente in wandernde Shared Elements, und
- eine blockierende Router Resource stellt die Daten synchron bereit, damit beim Erfassen des neuen Zustands die zu morphenden Elemente tatsächlich vorhanden sind.

Die Chrome DevTools mit ihrem Animations-Panel und der Möglichkeit zum Verlangsamen sind dabei das Werkzeug der Wahl, um einen Übergang Schritt für Schritt zu analysieren.

Von hier aus lässt sich weiterdenken: View Transition Types für unterschiedliche Übergangsstile je nach Navigationsrichtung, eine eigene Choreografie für den Rückweg von der Detailseite zur Liste oder komplexere gestaffelte Abläufe.
Und nicht vergessen: Die Angular-Implementierungen für View Transitions und Router Resources sind in Angular 22.2 noch Developer Preview.

Wie setzt ihr View Transitions in euren Projekten ein? Schreibt uns gern eure Erfahrungen und Fragen.

## Weiterführende Links

- Demo: [BookManager mit View Transitions auf StackBlitz](https://stackblitz.com/edit/angular-buch-book-manager1-view-transition-api)
- Angular Guide: [Route transition animations](https://angular.dev/guide/routing/route-transition-animations)
- Angular Guide: [Data fetching with resources](https://angular.dev/guide/routing/data-fetching-with-resources)
- Buch-Zusatzmaterial: [Resolvers – Daten beim Routing vorladen](/material/resolvers)
- Chrome DevTools: [Animationen inspizieren](https://developer.chrome.com/docs/devtools/css/animations/)
- Chrome Blog: [What's new in view transitions (2025)](https://developer.chrome.com/blog/view-transitions-in-2025)
- MDN: [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- MDN: [Browserkompatibilität der View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API#browser_compatibility)
- MDN: [`@view-transition` – cross-document / MPA](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition)
