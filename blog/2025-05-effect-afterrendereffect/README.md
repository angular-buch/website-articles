---
title: 'Reactive Angular: effect and afterRenderEffect verstehen und einsetzen'
author: Johannes Hoppe
mail: johannes.hoppe@haushoppe-its.de
published: 2024-11-14
lastModified: 2024-11-17
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

Mit Angular 19 gibt es eine wichtige Neuerung: Die `effect()`-API wurde vereinfacht und die neue Funktion `afterRenderEffect()` wurde eingeführt. (siehe [PR 57549](https://github.com/angular/angular/pull/57549))
Diese Neuerung hat Auswirkungen darauf, wie Angular Aufgaben nach dem Rendern behandelt, und ist besonders nützlich für Anwendungen, die auf präzises Timing beim Rendern und bei DOM-Manipulationen angewiesen sind.
In diesem Artikel sehen wir uns an, wie sich diese beiden APIs unterscheiden, und wie man die phasenbasierte Ausführung mit `afterRenderEffect()` optimal nutzt.


## Angular 19 vs. vorherige Versionen: Was ist anders?

Die `effect()` API wurde als Teil des neuen Signal-basierten Reaktivitätsmodells von Angular [in Angular 16] eingeführt (https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d).
Angular 19 führt nun ein bedeutendes Update der `effect()` API ein. Jetzt ist es einfacher, Seiteneffekte direkt innerhalb von `effect()` Funktionen zu auszuführen - sogar wenn Signals verwendet werden.
Vor dieser Änderung war der Einsatz von `effect()` stark eingeschränkt: Es wurde davon abgeraten, innerhalb eines `effect()` Signals zu setzen. Um dieses Verhalten zu erlauben, musste das Flag `allowSignalWrites` aktiviert werden:

```ts
// ALTER WEG
effect(() => {
  this.mySignal.set('demo');
}, { allowSignalWrites: true })
```

Früher riet die Angular-Dokumentation davon ab, Signals in `effect()` zu setzen, da dies zu Problemen wie `ExpressionChangedAfterItHasBeenChecked`-Fehlern, zyklischen Aktualisierungen oder unnötigen Change-Detection-Zyklen führen konnte.
Es wurde empfohlen, `effect()` nur für bestimmte Seiteneffekte zu verwenden, wie z.B.:

- Logging von Änderungen zu Analyse- oder Debugging-Zwecken,
- Synchronisierung der Daten mit dem lokalen Speicher (z.B. `window.localStorage`),
- Implementierung von benutzerdefinierten DOM-Verhaltensweisen, die mit der Template-Syntax nicht erreicht werden können, oder
- Umgang mit UI-Bibliotheken von Drittanbietern, wie z.B. das Rendern auf ein `<canvas>`-Element oder die Integration von Charting-Bibliotheken.

Allerdings stellen sich heraus, dass das Flag `allowSignalWrites` in der Praxis viel zu häufig eingesetzt wurde. Das Flag war als Ausnahme geplant, aber es wurde zu oft in legitimen Fällen verwendet, in denen das Setzen von Signalschreiben sinnvoll oder sogar notwendig war, wie z.B. das Aktualisieren eines Signals nach einer Reihe von Änderungen oder das Verarbeiten von mehreren Signalen.
Als Reaktion darauf erlaubt der neue Ansatz von Angular nun standardmäßig das Setzen von Signalen innerhalb von `effect()`, wodurch die Notwendigkeit von `allowSignalWrites` entfällt.
Dieses flexiblere Design spiegelt das Engagement von Angular wider, die Entwicklung zu vereinfachen.
Siehe den [offiziellen Blog-Post] (https://blog.angular.dev/latest-updates-to-effect-in-angular-f2d2648defcd), der diese neue Anleitung bestätigt.

Wir interpretieren diese Neuerung wie folgt:
> 💡 **Es ist jetzt ein gültiger Anwendungsfall, `effect()` für Zustandsänderungen oder Seiteneffekte zu verwenden, die sich mit anderen reaktiven Konzepten wie `computed()` nur schwer umsetzen lassen.**

Dieser Paradigmenwechsel steht im Einklang mit neuen Funktionen, die in Angular 19 eingeführt wurden, wie [`linkedSignal()`](https://angular.schule/blog/2024-11-linked-signal) und `resource()`.
Beide helfen dabei, sauberere und deklarativere Code zu erreichen.
Gute Patterns werden nicht mehr durch das `allowSignalWrites`-Flag erzwungen, sondern durch nützliche High-Level-Signal-APIs, welche direkt vom Angular-Team bereit gestellt werden.

Mit diesem Wandel ergibt sich eine neue Faustregel:

* **Verwende `effect()`**, für Aufgaben, die traditionell in `ngOnInit` oder `ngOnChanges` erledigt wurden.
* **Verwende `afterRenderEffect()`**, für Aufgaben, die typischerweise in `ngAfterViewInit` oder `ngAfterViewChecked` stattfinden – oder wenn du direkt mit gerendertem DOM arbeiten musst.

Lass uns in die Details einsteigen! 🚀



## Kernunterschiede zwischen `effect()` und `afterRenderEffect()`

Sowohl `effect()` als auch `afterRenderEffect()` sind darauf ausgelegt, Änderungen in Signalen zu verfolgen und darauf zu reagieren, aber sie unterscheiden sich im Timing und in den Anwendungsfällen.

- **`effect()`** wird als Teil des Angular-Change-Detection ausgeführt und kann nun Signale sicher und ohne zusätzliche Flags verändern.
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


## Vorstellung von `Effekt()`

In diesem Artikel behandeln wir Effekte, die innerhalb einer Komponente erstellt werden. 
Diese werden **Komponenteneffekte** genannt und ermöglichen das sichere Lesen und Schreiben von Komponenteneigenschaften und Signalen. 
Es ist auch möglich, Effekte in Services zu erstellen. 
Wenn ein Dienst auf der Root-Level der Anwendung bereitgestellt wird (auch bekannt als Singleton), werden diese Effekte **root effects** genannt.

Der Hauptunterschied zwischen diesen Arten von Effekten ist ihr Timing. 
Komponenteneffekte arbeiten als Teil der Angular-Change-Detection, so dass wir sicher andere Eingangssignale lesen und Views verwalten können, die vom Komponentenzustand abhängen. 
Root-Effekte hingegen laufen als Microtasks, unabhängig vom Komponentenbaum oder der Change-Detection.

In diesem Artikel konzentrieren wir uns ausschließlich auf **Komponenteneffekte**, die das sichere Lesen und Schreiben von Signalen innerhalb von Komponenten ermöglichen.

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
        {{ isEditMode() ? 'Buch bearbeiten' : ‚Buch erstellen‘ }}
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
    / ...Logik für die Formularübermittlung
  }
}
```

In diesem Beispiel bietet sich `effect()` für die Behandlung des Seiteneffekts (Änderung des Formulars) an, ohne dass unnötige Berechnungen durchgeführt werden müssen. 
Zudem können wir jetzt problemlos Signale im Effekt setzen.
Um zu zeigen, dass dies nun vollkommen gültig ist, haben wir während dieser Phase ein weiteres Signal aktualisiert.
Wir haben ein Signal namens `isEditMode` definiert, das entsprechend aktualisiert wird.
In der Vergangenheit wäre hätte man `ngOnChanges` eingesetzt, um das Formular zu patchen, wen Input geändert wurden.


### Wann sollte man `effect()` anstatt `computed()` verwenden?

Die früheren Einschränkungen für `effect()` wurden entfernt, so dass es jetzt schwieriger ist, zu entscheiden, wann `computed()` oder `effect()` verwendet werden soll.
Unserer Meinung nach hängt es vom Anwendungsfall ab:
- **Verwenden Sie `computed()`** für die Ableitung eines Wertes, der auf anderen Signalen basiert, insbesondere wenn Sie einen reinen, nur lesbaren reaktiven Wert benötigen. Innerhalb eines berechneten Signals ist es grundsätzlich nicht erlaubt, andere Signale zu setzen.
  Wir haben `computed()` und `linkedSignal()` in diesem Artikel behandelt: **[Angular 19: Einführung von LinkedSignal für Responsive Local State Management](https://angular.schule/blog/2024-11-linked-signal)**
- **Verwenden Sie `effect()`**, wenn die Operation komplexer ist, das Setzen mehrerer Signale beinhaltet oder Seiteneffekte außerhalb der Welt der Signale erfordert, wie z.B. das Synchronisieren reaktiver Formularzustände oder das Protokollieren von Ereignissen.

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
> **💡 Werte werden von Phase zu Phase als Signale und nicht als einfache Werte weitergegeben.**

Dadurch ist es möglich, dass spätere Phasen nicht ausgeführt werden müssen, wenn sich die von früheren Phasen zurückgegebenen Werte nicht ändern - und wenn keine anderen Abhängigkeiten etabliert wurden (wir werden in Kürze genauer darauf eingehen).
Bevor wir beginnen, hier einige wichtige Fakten über die Effekte, die durch `afterRenderEffect()` erzeugt werden:

* **Post-Render Execution:** Diese Effekte werden ausgeführt, wenn es sicher ist, Änderungen am DOM vorzunehmen. ([Quelle: Keynote-Folien von ng-poland 2024](https://docs.google.com/presentation/d/1puZmyZ-dgnt6_b0nOBaDMpyf_FmQld1h8yAmWxjA6gk/edit?usp=sharing))
* **Phased Execution:** Diese Effekte können für bestimmte Phasen des Renderzyklus registriert werden. 
  Das Angular-Team empfiehlt, diese Phasen für eine optimale Leistung einzuhalten.
* **100% Signal-kompatibel** Diese Effekte arbeiten nahtlos mit dem Signal-Reaktivitätssystem von Angular zusammen, und Signale können während der Phasen gesetzt werden.
**Selektive Ausführung:** Diese Effekte werden mindestens einmal ausgeführt, aber nur dann erneut, wenn sie aufgrund von Signalabhängigkeiten als "schmutzig" markiert sind. Wenn sich kein Signal ändert, wird der Effekt nicht erneut ausgelöst.
**Keine SSR:** Diese Effekte werden nur in Browserumgebungen ausgeführt, nicht auf dem Server.


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
Jeder nachfolgenden Callbacks empfängt den Rückgabewert der vorherigen Phase **als Signal**.
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

[Laut der offizellen Dokumentation (https://
angular.dev/api/core/afterRenderEffect) sollte man, wenn möglich, die Phasen `read` und `write` den Phasen `earlyRead` und `mixedReadWrite` vorziehen, um Leistungseinbußen zu vermeiden.
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
Wenn der Effekt keine Signale verfolgt oder wenn die verfolgten Signale unverändert bleiben, wird der Effekt nicht als "dirty" markiert und der Code wird nicht erneut ausgeführt.

Es gibt zwei Möglichkeiten, Abhängigkeiten in `afterRenderEffect()` zu erstellen:

1. **Tracking des Wertes der Ausgabe einer vorherigen Phase**: 
  Jeder Effekt kann einen Wert zurückgeben, der als Eingabe an den nächsten Effekt übergeben wird (außer `earlyRead`, der keinen vorherigen Effekt hat). 
  Dieser Wert wird in ein Signal verpackt, und wenn wir dieses Signal dann im folgenden Effekt lesen, schaffen wir eine Abhängigkeit. 
  Es ist wichtig zu verstehen, dass wir die Getter-Funktion des Signals tatsächlich ausführen müssen, da die einfache Weitergabe des Signals nicht ausreicht, um eine Abhängigkeit herzustellen.

2. **Direktes Verfolgen von Komponenten-Signalen**: 
  Wir können auch Abhängigkeiten herstellen, indem wir direkt auf andere Signale unserer Komponente innerhalb des Effekts zugreifen. 
  Im folgenden Beispiel lesen wir ein Signal von der Komponente innerhalb des Effekts `earlyRead`, um eine Abhängigkeit zu schaffen und sicherzustellen, dass der Effekt mehrfach ausgeführt wird.

**💡 Angular stellt sicher, dass Effekte nur dann erneut ausgeführt werden, wenn sich ihre verfolgten Signale ändern, und markiert den Effekt selbst als "dirty".
  Ohne diese Signalabhängigkeiten wird jeder Effekt nur einmal ausgeführt!


### Example of `afterRenderEffect()`: Dynamically Resizing a Textarea

Lassen Sie uns mit Hilfe eines praktischen Beispiels einen genaueren Blick auf `afterRenderEffect()` werfen.

In diesem Beispiel wird demonstriert, wie `afterRenderEffect()` verwendet werden kann, um die Höhe einer `<textarea>` dynamisch anzupassen, und zwar sowohl auf der Basis von Benutzer- als auch von programmbasierten Änderungen.
Die Textarea ist so konzipiert, dass sie durch Ziehen der unteren rechten Ecke in der Größe verändert werden kann, aber wir wollen auch, dass sie ihre Höhe regelmäßig automatisch anpasst.
Um dies zu erreichen, lesen wir die aktuelle Höhe aus dem DOM und aktualisieren sie auf der Grundlage eines zentralen Signals namens `extraHeight`.

Dieses Beispiel wurde durch den Artikel [„Angular 19: afterRenderEffect“] (https://medium.com/@amosisaila/angular-19-afterrendereffect-5cf8e6482256) von Amos Lucian Isaila Onofrei inspiriert, den wir an entscheidender Stelle modifiziert haben. ( Das Originalbeispiel liest im `write`-Effekt aus dem DOM, was laut der Angular-Dokumentation ausdrücklich nicht empfohlen wird).

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

      // earlyRead: Captures the current height of the textarea from the DOM.
      earlyRead: (onCleanup) => {

        console.warn(`earlyRead executes`);

        // Make `extraHeight` a dependency of `earlyRead`
        // Now this code it will run again whenever `extraHeight` changes
        // Hint: remove this statement, and `earlyRead` will execute only once!
        console.log('earlyRead: extra height:', this.extraHeight());

        const currentHeight: number = this.myElement()?.nativeElement.offsetHeight;
        console.log('earlyRead: offset height:', currentHeight);

        // Pass the height to the next effect
        return currentHeight;
      },

      // write: Sets the new height by adding `extraHeight` to the captured DOM height.
      write: (currentHeight, onCleanup) => {

        console.warn(`write executes`);

        // Make `extraHeight` a dependency of `write`
        // Hint: change this code to `const newHeight = currentHeight();`, 
        // so that we have no dependency to a signal that is changed, and `write` will be executed only once
        // Hint 2: if `currentHeight` changes in `earlyRead`, `write` will re-run, too. 
        // resize the textarea manually to achieve this
        const newHeight = currentHeight() + this.extraHeight();

        this.myElement().nativeElement.style.height = `${newHeight}px`;
        console.log('write: written height:', newHeight);

        onCleanup(() => {
          console.log('write: cleanup is called', newHeight);
        });

        // Pass the height to the next effect
        // Hint: pass the same value to `read`, e.g. `return 100`, to see how `read` is skipped
        return newHeight;
      },

      // The read effect logs the updated height
      read: (newHeight, onCleanup) => {
        console.warn('read executes');
        console.log('read: new height:', newHeight());
      }
    });

    // Trigger a new run every 4 seconds by setting the signal `extraHeight`
    setInterval(() => {
      console.warn('---- new round ----');
      this.extraHeight.update(x => ++x)
    }, 4_000);

    // Try this, if the signal value stays the same, nothing will happen
    // setInterval(() => this.extraHeight.update(x => x), 4_000);

    // cleanup callbacks are also executed when we destroy the hook
    // setTimeout(() => effect.destroy(), 20_000);
  }
}
```

In our setup, an interval updates the `extraHeight` signal every 4 seconds.
By updating `extraHeight`, we create a "dirty" state that restarts the `afterRenderEffect()` phases, which checks and adjusts the height of the `<textarea>` as needed:

**Explanation of the Phases**

In this example, an interval updates `extraHeight` every 4 seconds, creating a new round of execution across the phases. 
Here's a breakdown of each effect:

1. **`earlyRead` Phase**: 
  The effect that runs in the `earlyRead` phase captures the current height of the `textarea` by reading the `offsetHeight` directly from the DOM. 
  This read operation from the DOM is necessary because the textarea can also be resized manually by the user, so its size must be checked before any adjustment.
  The result, `currentHeight`, is passed to the next effect. 
  In this effect, we use the `extraHeight` as our tracked dependency to ensure that the code will run multiple times.
  We encourage you to remove this statement: `console.log('earlyRead: extra height:', this.extraHeight());`.
  If you do this, you will see that the `earlyRead` effect will only execute once and that any manual change to the textarea will be ignored in the next run.

2. **`write` Phase**: 
  The effect that runs in the `write` phase adds the `extraHeight` value to the captured `currentHeight` and updates height style property of the `<textarea>`.
  This DOM write operation directly adjusts the element's height in pixels.
  An `onCleanup` function is provided to handle any required cleanup or resources before the next write operation.
  In this example no cleanup is required, but we wanted to mention the fact that long-running tasks (such as a timeout) should be cleaned up.
  The cleanup will be called before entering the same phase again, or if the effect itself is destroyed via the `AfterRenderRef`.
  The `write` effect then passes the new height, `newHeight`, to the `read` effect.
  Hint: Pass the same value to `read` (e.g. `return 100`) and you will see that the follow-up phase won't be executed.
  Setting the same number twice won't be considered a change, so the `write` effect won't mark the `read` effect as dirty.

3. **`read` Phase**: 
  The effect that runs in the `read` phase logs the `newHeight`. 
  We could also read from the DOM in that phase and store the result to a new signal.
  But in this example this work is not necessary, because the `earlyRead` is already doing that job.

> We encourage you to scroll down to check out our Demo Application. 
  Feel free to follow the hints in the comments to experiment with the specifics of each phase.


## Migration Guide: From Angular's Lifecycle Hooks to Signal-Based Reactivity

In April 2023, the Angular team outlined their vision of signal-based components in [RFC #49682](https://github.com/angular/angular/discussions/49682).
The long-term goal is to phase out traditional lifecycle hooks, though the RFC discusses retaining `ngOnInit` and `ngOnDestroy`. (Now, we also have replacements for these.)
The document proposed the introduction of `afterRenderEffect()` as part of a roadmap, and with Angular 19, the final vision of signal-based components is starting to take shape.

The addition of `effect()` and `afterRenderEffect()` showcases how Angular is moving in this direction. 
These effects are more intuitive for managing component state changes and post-render interactions, thus making the old lifecycle hooks redundant.
For instance, `afterRenderEffect()` is designed to handle tasks traditionally managed by `ngAfterViewInit` and `ngAfterViewChecked`.

Migrating from Angular lifecycle hooks to `effect()` and `afterRenderEffect()` is straightforward:
- **`ngOnInit` / `ngOnChanges`** → `effect()`: Handles signal-based logic and other state.
- **`ngAfterViewInit` / `ngAfterViewChecked`** → `afterRenderEffect()`: Manages DOM manipulations post-render.

Or to put it another way, here's a direct mapping:

| Lifecycle Hook        | Replacement            |
|-----------------------|------------------------|
| `ngOnInit`            | `effect()`             |
| `ngOnChanges`         | `effect()`             |
| `ngAfterViewInit`     | `afterRenderEffect()`  |
| `ngAfterViewChecked`  | `afterRenderEffect()`  |


**Hint:** If you're transitioning away from classic lifecycle hooks, consider using [`DestroyRef`](https://angular.dev/api/core/DestroyRef).
It allows you to set callbacks for cleanup or destruction tasks, so that you no longer need `ngOnDestroy` in your codebase. 


## Reminder: `afterRenderEffect()` shouldn't be used in line-of-business code

If you rarely needed `ngAfterViewInit` or `ngAfterContentChecked` in the past, `afterRenderEffect()` will likely be equally uncommon in your codebase. 
It's aimed at addressing rare tasks and won't be used as frequently as foundational features like 
[`signal()`](https://angular.dev/api/core/signal), 
[`computed()`](https://angular.dev/api/core/computed), 
`effect()`, `linkedSignal()`, or `resource()`.

In this context, think of `afterRenderEffect()` as similar in importance to `ngAfterViewInit`.
It's an advanced lifecycle tool rather than a daily necessity. 
Use `afterRenderEffect()` only when you need precise control over DOM operations, low-level APIs, or third-party libraries that require specific timing and coordination across rendering phases.
If you're not building your own component library (and there are already many component libraries available), `afterRenderEffect()` should be rarely seen.

In everyday application code, `effect()` and other signal-based APIs will cover most reactive needs without the added complexity that `afterRenderEffect()` brings. 
In short, reach for `afterRenderEffect()` only when standard approaches don't meet your specialized requirements.


## Best Practices for Using `effect()` and `afterRenderEffect()`

To make the most of these new APIs, here are a few best practices:

1. **Use `computed()` for simple dependencies:** Reserve `effect()` for more complex or state-dependent operations.
2. **Choose phases carefully in `afterRenderEffect()`:** Stick to the specific phases and avoid `mixedReadWrite` when possible.
3. **Use `onCleanup()` to manage resources:** Always use `onCleanup()` within effects for any resource that needs disposal, especially with animations or intervals.
4. **Direct DOM Manipulations only when necessary:** Remember, Angular's reactive approach minimizes the need for manual DOM manipulations. 
  Use `afterRenderEffect()` only when Angular's templating isn't enough.


## Demo Application

To make it easier to see the effects in action, we've created a demo application that showcases all the examples discussed in this article.
The first link leads to the source code on GitHub, where you can download it.
The second link opens a deployed version of the application for you to try out.
Last but not least, the third link provides an interactive demo on StackBlitz, where you can edit the source code and see the results in real time.

> **[1️⃣ Source on GitHub: demo-effect-and-afterRenderEffect](https://github.com/angular-schule/demo-effect-and-afterRenderEffect)**<br>
> **[2️⃣ Deployed application](https://angular-schule.github.io/demo-effect-and-afterRenderEffect/)**<br>
> **[3️⃣ StackBlitz Demo](https://stackblitz.com/github/angular-schule/demo-effect-and-afterRenderEffect)**


## Conclusion

Angular's new `effect()` API opens up new possibilities for reactive state management and `afterRenderEffect()` provides efficient DOM manipulation when needed.
By understanding when to use each API, developers can create responsive and powerful Angular applications with a clean new syntax.

> **⚠️ Please note that both APIs are in Developer Preview and may still be subject to change!**

But time flies by anyway.
Why not try `effect()` and `afterRenderEffect()` in your Angular project today and see how they simplify your state management and DOM interactions, it certainly will not take much time until the APIs are stable!


<hr>

<strong>Thanks to Ferdinand Malcher for _intensive_ review and feedback!</strong>

<small>**Cover image:** Composed with Dall-E and Adobe Firefly</small>
