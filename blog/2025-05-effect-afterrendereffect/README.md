---
title: 'Reactive Angular: effect and afterRenderEffect verstehen und einsetzen'
author: Johannes Hoppe
mail: johannes.hoppe@haushoppe-its.de
published: 2025-05-01
lastModified: 2025-05-01
keywords:
  - Angular
  - JavaScript
  - Signals
  - Reactive Programming
  - Effect
  - afterRenderEffect
  - Angular 19
language: de
header: effect.jpg
---

Mit Angular 19 gibt es eine wichtige Neuerung: Die `effect()`-API wurde vereinfacht und die neue Funktion `afterRenderEffect()` wurde eingeführt (siehe [PR 57549](https://github.com/angular/angular/pull/57549)).
Diese Neuerung hat Auswirkungen darauf, wie Angular Aufgaben nach dem Rendern behandelt, und ist besonders nützlich für Anwendungen, die auf präzises Timing beim Rendern und bei DOM-Manipulationen angewiesen sind.
In diesem Artikel sehen wir uns an, wie sich diese beiden APIs unterscheiden und wie man die phasenbasierte Ausführung mit `afterRenderEffect()` optimal nutzt.


## Angular 19 vs. vorherige Versionen: Was ist anders?

Die `effect()` API wurde als Teil des neuen Signal-basierten Reaktivitätsmodells von Angular [in Angular 16](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d) eingeführt .
Angular 19 führt nun ein bedeutendes Update der `effect()` API ein. Jetzt ist es einfacher, Seiteneffekte direkt innerhalb von `effect()` Funktionen auszuführen - sogar wenn Signals verwendet werden.
Vor dieser Änderung war der Einsatz von `effect()` stark eingeschränkt: Es wurde davon abgeraten, innerhalb eines `effect()` Signals zu setzen. Um dieses Verhalten zu erlauben, musste das Flag `allowSignalWrites` aktiviert werden:

```ts
// ALTER WEG
effect(() => {
  this.mySignal.set('demo');
}, { allowSignalWrites: true })
```

Früher riet die Angular-Dokumentation davon ab, Signals in `effect()` zu setzen, da dies zu Problemen wie `ExpressionChangedAfterItHasBeenChecked`-Fehlern, zyklischen Aktualisierungen oder unnötigen Change Detection-Zyklen führen konnte.
Es wurde empfohlen, `effect()` nur für bestimmte Seiteneffekte zu verwenden, wie z. B.:

- Logging von Änderungen zu Analyse- oder Debugging-Zwecken,
- Synchronisierung der Daten mit dem lokalen Speicher (z. B. `window.localStorage`),
- Implementierung von benutzerdefinierten DOM-Verhaltensweisen, die mit der Template-Syntax nicht erreicht werden können, oder
- Umgang mit UI-Bibliotheken von Drittanbietern, wie z. B. das Rendern auf ein `<canvas>`-Element oder die Integration von Charting-Bibliotheken.

Allerdings stellte sich heraus, dass das Flag `allowSignalWrites` in der Praxis viel zu häufig eingesetzt wurde. Das Flag war als Ausnahme geplant, doch es kam in der Praxis regelmäßig in legitimen Fällen zum Einsatz, in denen das Setzen von Signals sinnvoll oder sogar notwendig war, wie z. B. das Aktualisieren eines Signals nach einer Reihe von Änderungen oder das Verarbeiten von mehreren Signals.
Als Reaktion darauf erlaubt der neue Ansatz von Angular nun standardmäßig das Setzen von Signals innerhalb von `effect()`, wodurch die Notwendigkeit von `allowSignalWrites` entfällt.
Dieses flexiblere Design spiegelt das Engagement von Angular wider, die Entwicklung zu vereinfachen.
Siehe den [offiziellen Blog-Post](https://blog.angular.dev/latest-updates-to-effect-in-angular-f2d2648defcd), der diese neue Anleitung bestätigt.

Wir interpretieren diese Neuerung wie folgt:
> 💡 **Es ist jetzt ein gültiger Anwendungsfall, `effect()` für Zustandsänderungen oder Seiteneffekte zu verwenden, die sich mit anderen reaktiven Konzepten wie `computed()` nur schwer umsetzen lassen.**

Dieser Paradigmenwechsel steht im Einklang mit neuen Funktionen, die in Angular 19 eingeführt wurden, wie [`linkedSignal()`](https://angular.schule/blog/2024-11-linked-signal) und `resource()`.
Beide helfen dabei, sauberere und deklarativeren Code zu erreichen.
Gute Patterns werden nicht mehr durch das `allowSignalWrites`-Flag erzwungen, sondern durch nützliche High-Level-Signal-APIs, welche direkt vom Angular-Team bereitgestellt werden.

Mit diesem Wandel ergibt sich eine neue Faustregel:

* **Verwende `effect()`**, für Aufgaben, die traditionell in `ngOnInit` oder `ngOnChanges` erledigt wurden.
* **Verwende `afterRenderEffect()`**, für Aufgaben, die typischerweise in `ngAfterViewInit` oder `ngAfterViewChecked` stattfinden – oder wenn du direkt mit gerendertem DOM arbeiten musst.

Lass uns in die Details einsteigen! 🚀



## Kernunterschiede zwischen `effect()` und `afterRenderEffect()`

Sowohl `effect()` als auch `afterRenderEffect()` sind darauf ausgelegt, Änderungen in Signals zu verfolgen und darauf zu reagieren, aber sie unterscheiden sich im Timing und in den Anwendungsfällen.

- **`effect()`** wird als Teil des Change Detection ausgeführt und kann nun Signals sicher und ohne zusätzliche Flags verändern.
- **`afterRenderEffect()`** ist eine API auf niedrigerer Ebene, die ausgeführt wird, nachdem das DOM aktualisiert wurde. 
  Sie eignet sich besonders für Aufgaben, die eine direkte Interaktion mit dem DOM erfordern, wie das Messen von Elementgrößen oder komplexe visuelle Aktualisierungen.

Hier ist ein einfacher Vergleich, um die Funktionsweise dieser Funktionen zu veranschaulichen:

```typescript
counter = signal(0);

effect(() => {
 console.log(`Aktueller Zählerwert: ${this.counter()}`);
});

afterRenderEffect(() => {
 console.log('DOM-Rendering für diese Komponente abgeschlossen');
});
```

Wie erwartet, wird die Konsolenausgabe für `afterRenderEffect()` nach der Ausgabe von `effect()` ausgelöst.


## Vorstellung von `effect()`

In diesem Artikel behandeln wir Effekte, die innerhalb einer Komponente erstellt werden. 
Diese werden **Komponenteneffekte** genannt und ermöglichen das sichere Lesen und Schreiben von Komponenteneigenschaften und Signals. 
Es ist auch möglich, Effekte in Services zu erstellen. 
Wenn ein Dienst auf der Root-Level der Anwendung bereitgestellt wird (auch bekannt als Singleton), werden diese Effekte **root effects** genannt.

Der Hauptunterschied zwischen diesen Arten von Effekten ist ihr Timing. 
Komponenteneffekte arbeiten als Teil der Change Detection, so dass wir sicher andere Input-Signals lesen und Views verwalten können, die vom Komponentenzustand abhängen. 
Root-Effekte hingegen laufen als Microtasks, unabhängig vom Komponentenbaum oder der Change Detection.

In diesem Artikel konzentrieren wir uns ausschließlich auf **Komponenteneffekte**, die das sichere Lesen und Schreiben von Signals innerhalb von Komponenten ermöglichen.

### Beispiel für `effect()`: mehrere Dinge auf einmal einstellen

Im folgenden Beispiel verwenden wir `effect()`, um Formularfelder basierend auf dem Eingabesignal `currentBook` zu synchronisieren.
Die API für Reactive Forms wurde leider noch nicht aktualisiert - Signal Forms sind aktuell noch in einer frühen Entwicklungs-Phase (siehe das Projekt [Experimental Signal Forms](https://github.com/orgs/angular/projects/60)). Daher müssen wir unsere Formulare immer noch patchen, sowie wir es in der Vergangenheit bereits stets tun mussten.
Wir wollen auch ein weiteres Signal setzen, nachdem wir das Formular gepatcht haben.

Hier ist unser Beispiel für ein Formular, das ein neues Buch erstellen und ein bestehendes Buch bearbeiten kann:

```typescript
@Component({
  selector: 'app-book-form',
  imports: [ReactiveFormsModule],
  template: `
    @let c = bookForm.controls;

    <form [formGroup]="bookForm" (ngSubmit)="submitForm()">
      <label for="isbn">ISBN</label>
      <input id="isbn" [formControl]="c.isbn" />

      <label for="Titel">Titel</label>
      <input id="Titel" [formControl]="c.Titel" />

      <label for="description">Beschreibung</label>
      <textarea id="description" [formControl]="c.description"></textarea>

      <button type="submit" aria-label="Submit Form">
        {{ isEditMode() ? 'Buch bearbeiten' : 'Buch erstellen' }}
      </button>
    </form>
  `,
})
export class BookFormComponent {

  currentBook = input<Book | undefined>();

  bookForm = new FormGroup({
    isbn: new FormControl(/* ... */),
    title: new FormControl(/* ... */),
    description: new FormControl(/* ... */),
  });
  
  isEditMode = signal(false);

  constructor() {
    effect(() => {
      const book = this.currentBook();
      if (book) {
        this.bookForm.patchValue(book);
        this.bookForm.controls.isbn.disable();
        this.isEditMode.set(true);
      } else {
        this.bookForm.controls.isbn.enable();
        this.isEditMode.set(false);
      }
    });
 }

  submitForm() {
    // ...Logik für die Formularübermittlung
  }
}
```

In diesem Beispiel bietet sich `effect()` für die Behandlung des Seiteneffekts (Änderung des Formulars) an, ohne dass unnötige Berechnungen durchgeführt werden müssen. 
Zudem können wir jetzt problemlos Signals im Effekt setzen.
Um zu zeigen, dass dies nun vollkommen gültig ist, haben wir während dieser Phase ein weiteres Signal aktualisiert.
Wir haben ein Signal namens `isEditMode` definiert, das entsprechend aktualisiert wird.
In der Vergangenheit hätte man `ngOnChanges` eingesetzt, um das Formular zu patchen, wenn Inputs geändert wurden.


### Wann sollte man `effect()` anstatt `computed()` verwenden?

Die früheren Einschränkungen für `effect()` wurden entfernt, so dass es jetzt schwieriger ist, zu entscheiden, wann `computed()` oder `effect()` verwendet werden soll.
Unserer Meinung nach hängt es vom Anwendungsfall ab:
- **Verwenden Sie `computed()`** für die Ableitung eines Wertes, der auf anderen Signals basiert, insbesondere wenn Sie einen reinen, nur lesbaren reaktiven Wert benötigen. Innerhalb eines Computed-Signals ist es grundsätzlich nicht erlaubt, andere Signals zu setzen.
  Wir haben `computed()` und `linkedSignal()` in diesem Artikel behandelt: **[Neu in Angular 19: LinkedSignal für reaktive Zustandsverwaltung](https://angular-buch.com/blog/2024-11-linked-signal)**
- **Verwenden Sie `effect()`**, wenn die Operation komplexer ist, das Setzen mehrerer Signals beinhaltet oder Seiteneffekte außerhalb der Welt der Signals erfordert, wie zum Beispiel das Synchronisieren reaktiver Formularzustände oder das Protokollieren von Ereignissen.

Für das Patchen von Formularen gibt es derzeit keinen besseren Ansatz als die Verwendung von Effekten. 
Der Einsatz von Effekten kann auch gut für die Migration von bestehendem Code verwendet werden, der zuvor auf `ngOnChanges` gesetzt hat.
Es bleibt übrigens fraglich, ob ein Computed-Signal nicht besser für den `isEditMode` geeignet gewesen wäre.
Folgendes ist nämlich ebenso möglich:

```ts
isEditMode = computed(() => !!this.currentBook());
```

Es ist nicht einfach, hier eine Entscheidung zu treffen, und wir vermuten, dass es stark vom persönlichen Geschmack abhängt.
Vielleicht müssen wir akzeptieren, dass in manchen Situationen beide Optionen absolut gültig sind 🙂 .


## Vorstellung von `afterRenderEffect()`

Während `effect()` für die generelle reaktive Zustandsverwaltung gedacht ist und täglich zum Einsatz kommen wird, ist `afterRenderEffect()` spezieller und im Allgemeinen für fortgeschrittene Fälle reserviert. 
Die API wurde speziell für Szenarien entwickelt, die ein präzises Timing erfordern, nachdem Angular einen Rendering-Zyklus abgeschlossen hat. 
Dies ist nützlich für komplexe DOM-Manipulationen, die nicht allein mit Angulars Reaktivität erreicht werden können und oft an Low-Level-Updates gebunden sind,
wie das Messen von Elementgrößen, die direkte Verwaltung von Animationen oder die Orchestrierung von Drittanbieter-Bibliotheken.

Mit der neuen Funktion `afterRenderEffect()` können wir steuern, wann bestimmte Aufgaben während des DOM-Aktualisierungsprozesses ausgeführt werden.
Die API selbst spiegelt die Funktionalität von 
* [`afterRender`](https://next.angular.dev/api/core/afterRender) *(registriert einen Callback, der jedes Mal aufgerufen wird, wenn die Anwendung das Rendern beendet)* und 
* [`afterNextRender`](https://next.angular.dev/api/core/afterNextRender) *(registriert Callbacks, die das nächste Mal aufgerufen werden, wenn die Anwendung das Rendering beendet, während der angegebenen Phasen)* 

die sich beide im **Developer Preview** befinden!

Die Angular-Dokumentation empfiehlt, `afterRender` wenn möglich zu vermeiden und schlägt vor, explizite Phasen mit `afterNextRender` anzugeben, um erhebliche Leistungseinbußen zu vermeiden. 
Eine ähnliche Empfehlung gibt es auch für `afterRenderEffect()`. Es gibt eine Signatur, die für die Verwendung vorgesehen ist, und eine andere, die zwar existiert, aber nicht empfohlen wird.

Es zudem einen großen Unterschied zwischen den bestehenden Hook-Methoden und dem neuen `afterRenderEffect()`:
> **💡 Werte werden von Phase zu Phase als Signals und nicht als einfache Werte weitergegeben.**

Dadurch ist es möglich, dass spätere Phasen nicht ausgeführt werden müssen, wenn sich die von früheren Phasen zurückgegebenen Werte nicht ändern - und wenn keine anderen Abhängigkeiten etabliert wurden (wir werden in Kürze genauer darauf eingehen).
Bevor wir beginnen, hier einige wichtige Fakten über die Effekte, die durch `afterRenderEffect()` erzeugt werden:

* **Post-Render Execution:** Diese Effekte werden ausgeführt, wenn es sicher ist, Änderungen am DOM vorzunehmen. ([Quelle: Keynote-Folien von ng-poland 2024](https://docs.google.com/presentation/d/1puZmyZ-dgnt6_b0nOBaDMpyf_FmQld1h8yAmWxjA6gk/edit?usp=sharing))
* **Phased Execution:** Diese Effekte können für bestimmte Phasen des Renderzyklus registriert werden. 
  Das Angular-Team empfiehlt, diese Phasen für eine optimale Leistung einzuhalten.
* **Vollständig kompatibel mit Signals** Diese Effekte arbeiten nahtlos mit dem Signal-Reaktivitätssystem von Angular zusammen, und Signals können während der Phasen gesetzt werden.
* **Selektive Ausführung:** Diese Effekte werden mindestens einmal ausgeführt, aber nur dann erneut, wenn sie aufgrund von Signalabhängigkeiten als "schmutzig" markiert sind. Wenn sich kein Signal ändert, wird der Effekt nicht erneut ausgelöst.
* **Keine SSR:** Diese Effekte werden nur in Browserumgebungen ausgeführt, nicht auf dem Server.


### Die Effekt-Phasen verstehen

Die phasenweise Ausführung hilft, unnötige Neuberechnungen zu vermeiden.
Wir können Effekte für jede Phase registrieren, indem wir eine Callback-Funktion angeben:

```ts
afterRenderEffect({

  // DOM-Eigenschaften vor dem Schreiben lesen.
  earlyRead: (onCleanup: EffectCleanupRegisterFn) => E,

  // Ausführen von DOM-Schreiboperationen.
  write: (signal1: firstAvailableSignal<[E]>, onCleanup: EffectCleanupRegisterFn) => W,

  // Ermöglicht kombinierte Lese- und Schreibvorgänge, sollte aber sparsam eingesetzt werden!
  mixedReadWrite: (signal2: firstAvailableSignal<[W, E]>, onCleanup: EffectCleanupRegisterFn) => M,

  // Führt DOM-Lesevorgänge aus, nachdem Schreibvorgänge abgeschlossen sind.
  read: (signal3: firstAvailableSignal<[M, W, E]>, onCleanup: EffectCleanupRegisterFn) => void
}): AfterRenderRef;
```

Dies ist eine vereinfachte Version der [echten `afterRenderEffect()` Signatur](https://github.com/angular/angular/blob/f3d931627523843281efb6f4207008ebbbbbb668/packages/core/src/render3/reactivity/after_render_effect.ts#L331).
Der erste Callback erhält keine Parameter.
Jeder nachfolgende Callback empfängt den Rückgabewert der vorherigen Phase **als Signal**.
Wenn also der Effekt `earlyRead` einen Wert vom Typ `E` zurückgibt und der nächste registrierte Effekt `write` ist, dann erhält `write` ein Signal vom Typ `E`.
Wenn jedoch der nächste registrierte Effekt `mixedReadWrite` ist, wird dieser Effekt ein Signal vom Typ `E` erhalten, und so weiter.
Der Effekt `read` hat keinen Rückgabewert.
Die Weitergabe von Werten zwischen Phasen kann zur Koordinierung der Arbeit über mehrere Phasen hinweg verwendet werden.


Die Effekte laufen in der folgenden Reihenfolge ab, und zwar nur dann, wenn sie durch Signalabhängigkeiten als "dirty" markiert wurden:

| Phase | Regel |
|-----------------------|------------------------|
| 1. `earlyRead` | Verwenden Sie diese Phase zum **Lesen** aus dem DOM vor einem nachfolgenden Schreib-Callback. Bevorzugen Sie die `read`-Phase, wenn das Lesen bis nach der `write`-Phase warten kann. **Niemals** in dieser Phase in das DOM schreiben. |
| 2. `write` | Verwenden Sie diese Phase zum **Schreiben** in das DOM. **Niemals** in dieser Phase aus dem DOM lesen. |
| 3. `mixedReadWrite` | Verwenden Sie diese Phase, um gleichzeitig vom DOM zu lesen und in das DOM zu schreiben. Verwenden Sie diese Phase **nicht** , wenn es möglich ist, die Arbeit stattdessen auf die anderen Phasen aufzuteilen. |
| 4. `read` | Verwenden Sie diese Phase zum **Lesen** aus dem DOM. **Niemals** in dieser Phase in das DOM schreiben. |

[Laut der offiziellen Dokumentation](https://angular.dev/api/core/afterRenderEffect) sollte man, wenn möglich, die Phasen `read` und `write` den Phasen `earlyRead` und `mixedReadWrite` vorziehen, um Leistungseinbußen zu vermeiden.
Angular ist nicht in der Lage, die korrekte Verwendung von Phasen zu verifizieren oder zu erzwingen, und verlässt sich stattdessen darauf, dass jeder Entwickler die dokumentierten Richtlinien befolgt.

Wie bereits erwähnt, gibt es auch eine zweite Signatur von `afterRenderEffect()`, die einen einzelnen Callback akzeptiert. 
Diese Funktion registriert einen Effekt, der nach Abschluss des Renderings ausgeführt werden soll, insbesondere während der Phase `mixedReadWrite`.
Die Angular-Dokumentation empfiehlt jedoch, wann immer möglich, eine explizite Phase für den Effekt anzugeben, um mögliche Leistungsprobleme zu vermeiden.
Daher werden wir diese Signatur in unserem Artikel nicht behandeln, da ihre Verwendung nicht empfohlen wird.


### Phasen werden nur dann erneut ausgeführt, wenn sie durch Signalabhängigkeiten "dirty" sind

Wenn `afterRenderEffect()` zum ersten Mal aufgerufen wird, werden alle registrierten Effekte einmal nacheinander ausgeführt.
Damit ein Effekt jedoch erneut ausgeführt werden kann, muss er aufgrund einer Änderung der Signalabhängigkeiten als "dirty" markiert werden. 
Dieses auf das Tracking von Abhängigkeiten basierende System hilft Angular, die Leistung zu optimieren, indem es überflüssige Ausführungen verhindert.

Damit ein Effekt als "dirty" markiert wird und erneut ausgeführt werden kann, muss zuvor er eine Abhängigkeit zu einem Signal hergestellt worden sein, und dieses muss sich geändert haben. 
Wenn der Effekt keine Signals verfolgt oder wenn die verfolgten Signals unverändert bleiben, wird der Effekt nicht als "dirty" markiert und der Code wird nicht erneut ausgeführt.

Es gibt zwei Möglichkeiten, Abhängigkeiten in `afterRenderEffect()` zu erstellen:

1. **Tracking des Wertes der Ausgabe einer vorherigen Phase**: 
  Jeder Effekt kann einen Wert zurückgeben, der als Eingabe an den nächsten Effekt übergeben wird (außer `earlyRead`, der keinen vorherigen Effekt hat). 
  Dieser Wert wird in ein Signal verpackt, und wenn wir dieses Signal dann im folgenden Effekt lesen, schaffen wir eine Abhängigkeit. 
  Es ist wichtig zu verstehen, dass wir die Getter-Funktion des Signals tatsächlich ausführen müssen, da die einfache Weitergabe des Signals nicht ausreicht, um eine Abhängigkeit herzustellen.

2. **Direktes Verfolgen von Komponenten-Signals**: 
  Wir können auch Abhängigkeiten herstellen, indem wir direkt auf andere Signals unserer Komponente innerhalb des Effekts zugreifen. 
  Im folgenden Beispiel lesen wir ein Signal von der Komponente innerhalb des Effekts `earlyRead`, um eine Abhängigkeit zu schaffen und sicherzustellen, dass der Effekt mehrfach ausgeführt wird.

**💡 Angular stellt sicher, dass Effekte nur dann erneut ausgeführt werden, wenn sich ihre verfolgten Signals ändern, und markiert den Effekt selbst als "dirty".
  Ohne diese Signalabhängigkeiten wird jeder Effekt nur einmal ausgeführt!


### Example of `afterRenderEffect()`: Dynamically Resizing a Textarea

Lassen Sie uns mit Hilfe eines praktischen Beispiels einen genaueren Blick auf `afterRenderEffect()` werfen.

In diesem Beispiel wird demonstriert, wie `afterRenderEffect()` verwendet werden kann, um die Höhe einer `<textarea>` dynamisch anzupassen, und zwar sowohl auf der Basis von Benutzer- als auch von programmbasierten Änderungen.
Die Textarea ist so konzipiert, dass sie durch Ziehen der unteren rechten Ecke in der Größe verändert werden kann, aber wir wollen auch, dass sie ihre Höhe regelmäßig automatisch anpasst.
Um dies zu erreichen, lesen wir die aktuelle Höhe aus dem DOM und aktualisieren sie auf der Grundlage eines zentralen Signals namens `extraHeight`.

Dieses Beispiel wurde durch den Artikel [Angular 19: afterRenderEffect](https://medium.com/@amosisaila/angular-19-afterrendereffect-5cf8e6482256) von Amos Lucian Isaila Onofrei inspiriert, den wir an entscheidender Stelle modifiziert haben. (Das Originalbeispiel liest im `write`-Effekt aus dem DOM, was laut der Angular-Dokumentation ausdrücklich nicht empfohlen wird).

Unser Beispiel zeigt, wie man mehrere Phasen (`earlyRead`, `write` und `read`) in `afterRenderEffect()` verwendet, um DOM-Manipulationen effizient zu verarbeiten und dabei die Richtlinien vom Angular-Team für die Trennung von Lese- und Schreibvorgängen einhält:

```typescript
import { Component, viewChild, ElementRef, signal, afterRenderEffect } from "@angular/core";

@Component({
  selector: 'app-resizable',
  template: `<textarea #myElement style="border: 1px solid black; height: 100px; resize: vertical;">
    Resizable Element
  </textarea>`,
})
export class ResizableComponent {

  myElement = viewChild.required<ElementRef>('myElement');
  extraHeight = signal(0);

  constructor() {

    const effect = afterRenderEffect({

      // earlyRead: Erfasst die aktuelle Höhe der Textarea aus dem DOM.
      earlyRead: (onCleanup) => {

        console.warn(`earlyRead executes`);

        // Macht `extraHeight` zu einer Abhängigkeit von `earlyRead`
        // Jetzt wird dieser Code immer wieder ausgeführt, wenn sich `extraHeight` ändert
        // Tipp: Entfernen Sie diese Anweisung, und `earlyRead` wird nur einmal ausgeführt!
        console.log('earlyRead: extra height:', this.extraHeight());

        const currentHeight: number = this.myElement()?.nativeElement.offsetHeight;
        console.log('earlyRead: offset height:', currentHeight);

        // Übergabe der Höhe an den nächsten Effekt
        return currentHeight;
      },

      // write: Setzt die neue Höhe, indem `extraHeight` zur erfassten DOM-Höhe addiert wird.
      write: (currentHeight, onCleanup) => {

        console.warn(`write executes`);

        // Macht `extraHeight` zu einer Abhängigkeit von `write`
        // Tipp: Ändern Sie diesen Code in `const newHeight = currentHeight();`, 
        // damit wir keine Abhängigkeit zu einem Signal haben, das geändert wird, und `write` nur einmal ausgeführt wird
        // Tipp 2: wenn sich `currentHeight` in `earlyRead` ändert, wird auch `write` neu ausgeführt. 
        // Ändern Sie die Größe der Textarea manuell, um dies zu erreichen
        const newHeight = currentHeight() + this.extraHeight();

        this.myElement().nativeElement.style.height = `${newHeight}px`;
        console.log('write: written height:', newHeight);

        onCleanup(() => {
          console.log('write: cleanup is called', newHeight);
        });

        // Übergeben Sie die Höhe an den nächsten Effekt
        // Tipp: übergeben Sie den gleichen Wert an `read`, z. B. `return 100`, um zu sehen, wie `read` übersprungen wird
        return newHeight;
      },

      // Der `read`-Effekt protokolliert die aktualisierte Höhe
      read: (newHeight, onCleanup) => {
        console.warn('read executes');
        console.log('read: new height:', newHeight());
      }
    });

    // Triggert alle 4 Sekunden einen neuen Durchlauf, indem das Signal `extraHeight` gesetzt wird
    setInterval(() => {
      console.warn('---- neue Runde ----');
      this.extraHeight.update(x => ++x)
    }, 4_000);

    // Probieren Sie diese Zeile aus, wenn der Signalwert gleich bleibt, passiert nichts
    // setInterval(() => this.extraHeight.update(x => x), 4_000);

    // Die `onCleanup`-Callbacks werden ausgeführt, wenn wir den Hook zerstören, hierzu folgende Zeile einkommentieren
    // setTimeout(() => effect.destroy(), 20_000);
  }
}
```

In unserem Beispiel aktualisiert ein Intervall das Signal `extraHeight` alle 4 Sekunden.
Durch die Aktualisierung von `extraHeight` schaffen wir einen „schmutzigen“ Zustand, der die `afterRenderEffect()`-Phasen neu startet, welche die Höhe des `<textarea>` bei Bedarf überprüfen und anpassen:

**Erläuterung zu den Phasen**

In unserem Beispiel aktualisiert ein Intervall das Signal `extraHeight` alle 4 Sekunden, wodurch eine neue Runde der Ausführung über die Phasen hinweg entsteht. 
Hier ist eine Aufschlüsselung der einzelnen Effekte:

1. **`earlyRead` Phase**: 
  Der Effekt, der in der `earlyRead`-Phase ausgeführt wird, erfasst die aktuelle Höhe der Textarea, indem er die `offsetHeight` direkt aus dem DOM liest. 
  Dieser Lesevorgang aus dem DOM ist notwendig, weil die Textarea auch manuell vom Benutzer in der Größe verändert werden kann, so dass ihre Größe vor jeder Anpassung überprüft werden muss.
  Das Ergebnis, `currentHeight`, wird an den nächsten Effekt weitergegeben. 
  In diesem Effekt verwenden wir `extraHeight` als unsere verfolgte Abhängigkeit, um sicherzustellen, dass der Code mehrfach ausgeführt werden kann.
  Wir empfehlen Ihnen, diese Anweisung zu entfernen: `console.log('earlyRead: extra height:', this.extraHeight());`.
  Wenn Sie dies tun, werden Sie sehen, dass der `earlyRead`-Effekt nur einmal ausgeführt wird und dass jede manuelle Änderung der Textarea bei der nächsten Ausführung ignoriert wird.

2. **`write` Phase**: 
  Der Effekt, der in der `write`-Phase ausgeführt wird, fügt den `extraHeight`-Wert zur erfassten `currentHeight` hinzu und aktualisiert die Height-Style-Eigenschaft der Textarea.
  Diese DOM-Schreiboperation passt die Höhe des Elements direkt in Pixeln an.
  Die Funktion `onCleanup` wird bereitgestellt, um alle erforderlichen Aufräumarbeiten oder Ressourcen vor dem nächsten Schreibvorgang zu erledigen.
  In unserem Beispiel sind keine Aufräumarbeiten erforderlich, aber wir darauf hinweisen, dass lang laufende Aufgaben (wie ein Timeout) aufgeräumt werden sollten.
  Die Bereinigung wird vor dem erneuten Eintritt in dieselbe Phase aufgerufen, oder wenn der Effekt selbst zerstört wird.
  Der `write`-Effekt übergibt dann die neue Höhe, `newHeight`, an den `read`-Effekt.
  Tipp: Übergeben Sie denselben Wert an `read` (z. B. `return 100`) und Sie werden sehen, dass die Folgephase nicht ausgeführt wird.
  Wird dieselbe Zahl zweimal gesetzt, wird dies nicht als Änderung betrachtet, so dass der Effekt `write` den Effekt `read` nicht als "dirty" markiert.

3. **`read` Phase**: 
  Der Effekt, der in der `read`-Phase ausgeführt wird, protokolliert die `newHeight`. 
  Wir könnten in dieser Phase auch aus dem DOM lesen und das Ergebnis in einem neuen Signal speichern.
  Aber in diesem Beispiel ist diese Arbeit nicht notwendig, weil `earlyRead` diese Aufgabe bereits erledigt.

> Wir empfehlen Ihnen, nach unten zu scrollen und sich unsere Demo-Anwendung anzuschauen. 
  Folgen Sie den Hinweisen in den Kommentaren, um mit den Besonderheiten der einzelnen Phasen zu experimentieren.
  So lassen sich die unterschiedlichen Phasen am besten verstehen.


## Migrationsleitfaden: Von Angulars Lifecycle Hooks zu signalbasierter Reaktivität

Im April 2023 skizzierte das Angular-Team in [RFC #49682](https://github.com/angular/angular/discussions/49682) seine Vision von signalbasierten Komponenten.
Das langfristige Ziel ist es, die traditionellen Lifecycle Hooks abzuschaffen, obwohl der RFC die Beibehaltung von `ngOnInit` und `ngOnDestroy` diskutiert. (Jetzt haben wir auch Ersatz für diese, daher wären wir nicht überrascht, wenn diese auch verschwinden werden.)
Das Dokument schlug die Einführung von `afterRenderEffect()` als Teil einer Roadmap vor, und mit Angular 19 beginnt die finale Vision von signalbasierten Komponenten Gestalt anzunehmen.

Die Einführung von `effect()` und `afterRenderEffect()` zeigt, wie Angular sich in diese Richtung bewegt. 
Diese Effekte sind intuitiver für die Verwaltung von Zustandsänderungen und Interaktionen nach dem Rendern, wodurch die alten Lebenszyklus-Hooks überflüssig werden.
So übernimmt `afterRenderEffect()` Aufgaben, die traditionell von `ngAfterViewInit` und `ngAfterViewChecked` erledigt wurden.

Die Migration von Angular Lifecycle Hooks hin zu `effect()` und `afterRenderEffect()` ist relativ einfach zu bewerkstelligen: Sie können die Hooks einfach in Angular einfügen:
- **`ngOnInit` / `ngOnChanges`** → `effect()`: Behandelt signalbasierte Logik und andere Zustände.
- **`ngAfterViewInit` / `ngAfterViewChecked`** → `afterRenderEffect()`: Verwaltet DOM-Manipulationen nach dem Rendern.

Oder anders ausgedrückt, hier ist eine direkte Gegenüberstellung:

| Lifecycle Hook        | Wird ersetzt durch     |
|-----------------------|------------------------|
| `ngOnInit`            | `effect()`             |
| `ngOnChanges`         | `effect()`             |
| `ngAfterViewInit`     | `afterRenderEffect()`  |
| `ngAfterViewChecked`  | `afterRenderEffect()`  |


**Hinweis:** Wenn Sie von den klassischen Lifecycle-Hooks vollständig wegmigrieren wollen, können Sie [`DestroyRef`](https://angular.dev/api/core/DestroyRef) verwenden.
Damit können Sie Callbacks für Aufräum- oder Zerstörungsaufgaben definieren, so dass Sie `ngOnDestroy` in Ihrer Codebasis im Prinzip nicht mehr benötigen.


## Erinnerung: `afterRenderEffect()` sollte nicht in Business-Code verwendet werden

Wenn Sie `ngAfterViewInit` oder `ngAfterContentChecked` in der Vergangenheit selten gebraucht haben, wird `afterRenderEffect()` in Ihrer Codebasis wahrscheinlich ebenso selten vorkommen. 
Es zielt auf spezielle Aufgaben ab und wird nicht so häufig verwendet werden wie die grundlegenden Signal-APIs 
[`signal()`](https://angular.dev/api/core/signal), 
[`computed()`](https://angular.dev/api/core/computed), 
`effect()`, `linkedSignal()`, oder `resource()`.

Betrachten Sie `afterRenderEffect()` in diesem Zusammenhang als ähnlich wichtig wie `ngAfterViewInit`.
Diese Effekte sind eher ein fortgeschrittenes Lebenszyklus-Werkzeug als eine tägliche Notwendigkeit. 
Verwenden Sie `afterRenderEffect()` nur, wenn Sie eine präzise Kontrolle über DOM-Operationen, Low-Level-APIs oder Bibliotheken von Drittanbietern benötigen, die ein spezifisches Timing und eine Koordination über Rendering-Phasen hinweg erfordern.
Wenn Sie also nicht Ihre eigene Komponentenbibliothek bauen (und es gibt bereits viele gute Komponentenbibliotheken), sollten Sie `afterRenderEffect()` nur selten sehen.

Im alltäglichen Anwendungscode werden `effect()` und andere signalbasierte APIs die meisten Anforderungen an Reaktivität bedienen, ohne die zusätzliche Komplexität, die `afterRenderEffect()` mit sich bringt. 
Kurz gesagt, greifen Sie nur dann zu `afterRenderEffect()`, wenn Standardansätze Ihren speziellen Anforderungen nicht mehr gerecht werden – und wirklich erst dann!


## Best Practices für die Verwendung von `effect()` und `afterRenderEffect()`

Hier sind einige bewährte Praxisempfehlungen, um das Optimum aus den neuen Signal-APIs herauszuholen:

1. **Verwenden Sie `computed()` für einfache Abhängigkeiten:** Nutzen Sie `effect()` hingegen für komplexere oder zustandsabhängige Operationen.
2. **Wählen Sie die Phasen in `afterRenderEffect()` sorgfältig aus:** Halten Sie sich an die spezifischen Phasen und vermeiden Sie `mixedReadWrite` wenn möglich.
3. **Verwenden Sie `onCleanup()` zur Verwaltung von langlebigen Ressourcen:** Verwenden Sie immer `onCleanup()` innerhalb von Effekten für jede Ressource, die entsorgt werden muss, insbesondere bei Animationen oder Intervallen.
4. **Direkte DOM-Manipulationen nur wenn nötig:** Denken Sie daran, dass der reaktive Ansatz von Angular die Notwendigkeit manueller DOM-Manipulationen minimiert. 
  Verwenden Sie `afterRenderEffect()` nur, wenn Angulars Templating nicht mehr ausreicht.


## Demo-Anwendung

Um es einfacher zu machen, die beiden Effekt-APIs in Aktion zu sehen, haben wir eine Demo-Anwendung für Sie erstellt, die alle in diesem Artikel besprochenen Beispiele vorführt.
Der erste Link führt zum Quellcode auf GitHub, den Sie gerne herunterladen können.
Der zweite Link öffnet eine veröffentlichte Version der Anwendung, die Sie direkt im Browser ausprobieren können.
Zu guter Letzt bietet der dritte Link eine interaktive Demo auf StackBlitz, wo Sie den Quellcode bearbeiten und die Ergebnisse in Echtzeit sehen können.

> **[1️⃣ Sourcecode auf GitHub: demo-effect-and-afterRenderEffect](https://github.com/angular-schule/demo-effect-and-afterRenderEffect)**<br>
> **[2️⃣ Veröffentlichte Anwendung](https://angular-schule.github.io/demo-effect-and-afterRenderEffect/)**<br>
> **[3️⃣ StackBlitz Demo](https://stackblitz.com/github/angular-schule/demo-effect-and-afterRenderEffect)**


## Fazit

Beide APIs eröffnen neue, elegante Wege zur Zustands- und DOM-Verwaltung in Angular – reaktiv, präzise und klar. 
Wer sich frühzeitig mit `effect()` und `afterRenderEffect()` vertraut macht, profitiert schon heute von der Architektur von morgen.

> **⚠️ Bitte beachten Sie, dass sich beide APIs noch im "Developer Preview" befinden und noch Änderungen unterliegen können!

Nutzen Sie die Gelegenheit, `effect()` und `afterRenderEffect()` in Ihrer Anwendung auszuprobieren – die APIs werden schon bald stabil sein.

<hr>

<strong>Vielen Dank an Ferdinand Malcher für _intensive_ Rezension und Feedback!</strong>

<small>**Coverbild:** Erstellt mit Dall-E und Adobe Firefly</small>
