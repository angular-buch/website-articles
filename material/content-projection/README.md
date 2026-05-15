---
title: "Content Projection: Inhalte an Komponenten übergeben"
published: 2026-05-15
lastModified: 2026-05-15
---

Wenn wir eine Komponente in unser Template einbinden, notieren wir sie üblicherweise ohne weiteren Inhalt zwischen dem öffnenden und schließenden Tag.
Manchmal ist es aber sinnvoll, einer Komponente eigenes Markup oder auch andere Komponenten als Kindelemente mitzugeben – zum Beispiel bei Cards, Dialogen oder Layouts.
Angular ermöglicht das mit **Content Projection** und dem Element `<ng-content>`.
In diesem Artikel erklären wir das Konzept im Detail und zeigen, wie du es in deinen Komponenten einsetzen kannst.

## Inhalt

[[toc]]

## Was ist Content Projection?

Wer bereits mit anderen Frameworks wie Vue.js, Svelte oder mit Web Components gearbeitet hat, kennt dieses Konzept vielleicht unter dem Begriff **Slot**.
Der Name stammt vom nativen [`<slot>`-Element](https://developer.mozilla.org/docs/Web/HTML/Element/slot) aus der Web-Components-Spezifikation.
In Angular heißt das Konzept _Content Projection_ (früher auch _Transclusion_ genannt) und funktioniert über das spezielle Element `<ng-content>`.

Die Grundidee: Wenn wir eine Komponente verwenden, können wir zwischen dem öffnenden und schließenden Tag beliebige Inhalte notieren.
Diese Inhalte werden als **Content** der Komponente bezeichnet.
Die Komponente entscheidet dann in ihrem eigenen Template, _wo_ dieser Content dargestellt wird.

## Content einer Komponente

Um Komponenten in unsere Templates einzubinden, erstellen wir ein Host-Element, das zum Selektor der Komponente passt.
Üblicherweise notieren wir dieses Element ohne weiteren Inhalt zwischen dem öffnenden und schließenden Tag.
Geben wir dort Inhalte an, sind sie zunächst nicht sichtbar, denn das Element wird vollständig mit dem Template der Komponente gefüllt.
Der Beispieltext `Lorem ipsum dolor` wird im folgenden Beispiel also nicht dargestellt:

```html
<my-component>Lorem ipsum dolor</my-component>
```

Auch wenn der Content zunächst nicht sichtbar ist, so ist er nicht verloren:
Wir können auf den Inhalt zugreifen und auf diese Weise selbstdefiniertes Markup an eine Komponente übergeben.
Das ist vor allem sinnvoll für generische UI-Komponenten wie Widgets, Cards oder Layouts.

## Der Platzhalter `<ng-content>`

Verwenden wir den Platzhalter `<ng-content>` im Template unserer Komponente, wird an dieser Stelle der Content eingesetzt, der im Host-Element notiert ist.

```typescript
@Component({
  selector: "custom-card",
  template: `
    <div class="card-shadow">
      <ng-content />
    </div>
  `,
})
export class CustomCard {}
```

Wenn wir die Komponente nun verwenden, wird der Content an der Stelle von `<ng-content>` gerendert:

```html
<!-- Verwendung der Komponente -->
<custom-card>
  <p>This is the projected content</p>
</custom-card>

<!-- Gerendertes DOM -->
<custom-card>
  <div class="card-shadow">
    <p>This is the projected content</p>
  </div>
</custom-card>
```

Angular bezeichnet alle Kindelemente einer Komponente, die auf diese Weise übergeben werden, als den _Content_ der Komponente.
Das ist zu unterscheiden von der _View_ der Komponente, die sich auf die Elemente im eigenen Template bezieht.

### Wichtige Hinweise zu `<ng-content>`

Das Element `<ng-content>` ist weder eine Komponente noch ein DOM-Element.
Es ist ein spezieller Platzhalter, der Angular mitteilt, wo Content gerendert werden soll.
Der Angular-Compiler verarbeitet alle `<ng-content>`-Elemente zur Build-Zeit.
Wir können `<ng-content>` zur Laufzeit nicht einfügen, entfernen oder verändern.
Auch Direktiven, Styles oder beliebige Attribute können nicht auf `<ng-content>` angewendet werden.

> **Wichtig:** `<ng-content>` sollte nicht mit `@if`, `@for` oder `@switch` bedingt eingebunden werden.
> Angular erzeugt immer DOM-Knoten für Content, der an einen `<ng-content>`-Platzhalter gerendert wird – auch wenn dieser Platzhalter versteckt ist.
> Für bedingtes Rendern von Content sollte stattdessen [`ng-template`](https://angular.dev/api/core/ng-template) verwendet werden.

## Multi-Slot Projection

Um mehrere Abschnitte gezielt an verschiedene Stellen im Template einzusetzen, unterstützt Angular die sogenannte **Multi-Slot Projection**.
Der Platzhalter `<ng-content>` erhält dafür das Attribut `select`, in dem ein CSS-Selektor angegeben wird.
Damit können wir einzelne Elemente aus dem Content gezielt "herausziehen" und an verschiedenen Stellen platzieren.

Nehmen wir an, wir binden eine Komponente ein und geben verschiedene HTML-Inhalte in ihrem Host-Element an:

```html
<my-component>
  <h1>My Card</h1>
  <button (click)="doSth()">Action</button>
  <a href="/details">Link</a>
  This cat is awesome!
</my-component>
```

Im Template der Komponente können wir nun einzelne Teile des Contents gezielt auswählen und an verschiedenen Stellen einsetzen:

```html
<div class="card">
  <ng-content select="h1"></ng-content>
  <div class="body">
    <ng-content></ng-content>
  </div>
  <div class="footer">
    <ng-content select="a,button"></ng-content>
  </div>
</div>
```

Im `select`-Attribut können wir die gleichen CSS-Selektoren verwenden wie bei [Komponentenselektoren](https://angular.dev/guide/components/selectors).
Wir können auch mehrere Selektoren kombinieren (z. B. `select="a,button"`), um mehrere Elemente in denselben Slot zu projizieren.

Jedes Element aus dem Content kann nur **genau einmal** eingesetzt werden.
Wurde ein Element bereits von einem `select`-Selektor erfasst, steht es nicht für weitere Selektionen zur Verfügung.
Ein `<ng-content>` ohne `select`-Attribut fängt dann den gesamten restlichen Content auf, der noch nicht von anderen Platzhaltern erfasst wurde.

Das obige Beispiel führt zum folgenden Ergebnis:

```html
<div class="card">
  <h1>My Card</h1>
  <div class="body">This cat is awesome!</div>
  <div class="footer">
    <button (click)="doSth()">Action</button>
    <a href="/details">Link</a>
  </div>
</div>
```

Wenn eine Komponente kein `<ng-content>` ohne `select`-Attribut enthält, werden Elemente, die keinem Selektor entsprechen, nicht ins DOM gerendert.

## Fallback Content

Seit Angular 18 können wir für `<ng-content>` einen **Fallback-Inhalt** definieren.
Wird kein passender Content von außen übergeben, zeigt Angular stattdessen den Fallback an.
Dazu notieren wir den Fallback-Inhalt einfach als Kindelement von `<ng-content>`:

```html
<!-- Template der Komponente -->
<div class="card-shadow">
  <ng-content select="card-title">Standardtitel</ng-content>
  <div class="card-divider"></div>
  <ng-content select="card-body">Kein Inhalt vorhanden.</ng-content>
</div>
```

```html
<!-- Verwendung -->
<custom-card>
  <card-title>Hello</card-title>
  <!-- Kein card-body angegeben -->
</custom-card>

<!-- Gerendertes DOM -->
<custom-card>
  <div class="card-shadow">
    <card-title>Hello</card-title>
    <div class="card-divider"></div>
    Kein Inhalt vorhanden.
  </div>
</custom-card>
```

Fallback Content ist besonders nützlich für optionale Bereiche in generischen Komponenten, z. B. für einen Standard-Footer oder eine Platzhalter-Nachricht.

## Aliasing mit `ngProjectAs`

Angular unterstützt das spezielle Attribut `ngProjectAs`, mit dem wir ein Element unter einem anderen Selektor projizieren können.
Wenn Angular ein Element mit `ngProjectAs` gegen einen `<ng-content>`-Platzhalter prüft, wird der Wert von `ngProjectAs` anstelle der tatsächlichen Identität des Elements verwendet:

```html
<!-- Verwendung -->
<custom-card>
  <h3 ngProjectAs="card-title">Hello</h3>
  <p>Welcome to the example</p>
</custom-card>

<!-- Gerendertes DOM -->
<custom-card>
  <div class="card-shadow">
    <h3>Hello</h3>
    <div class="card-divider"></div>
    <p>Welcome to the example</p>
  </div>
</custom-card>
```

Das `<h3>`-Element wird hier in den Slot für `card-title` projiziert, obwohl es kein `<card-title>`-Element ist.
So können wir semantisch korrekte HTML-Elemente verwenden und trotzdem die Projektion steuern.

> **Hinweis:** `ngProjectAs` unterstützt nur statische Werte und kann nicht an dynamische Ausdrücke gebunden werden.

## Praxisbeispiel: Eine Card-Komponente

Fassen wir das Gelernte in einem vollständigen Beispiel zusammen.
Wir erstellen eine wiederverwendbare Card-Komponente mit Header, Body und Footer:

```typescript
@Component({
  selector: "app-card",
  template: `
    <article class="card">
      <header class="card-header">
        <ng-content select="[card-header]">Überschrift</ng-content>
      </header>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <footer class="card-footer">
        <ng-content select="[card-footer]"></ng-content>
      </footer>
    </article>
  `,
  styles: `
    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }
    .card-header {
      padding: 1rem;
      background: #f5f5f5;
      font-weight: bold;
    }
    .card-body {
      padding: 1rem;
    }
    .card-footer {
      padding: 1rem;
      background: #fafafa;
      display: flex;
      gap: 0.5rem;
    }
  `,
})
export class CardComponent {}
```

Die Verwendung sieht dann so aus:

```html
<app-card>
  <h3 card-header>Meine Karte</h3>
  <p>Hier steht der Hauptinhalt der Karte.</p>
  <p>Er kann beliebig komplex sein.</p>
  <button card-footer (click)="save()">Speichern</button>
  <button card-footer (click)="cancel()">Abbrechen</button>
</app-card>
```

Hier verwenden wir Attributselektoren (`[card-header]`, `[card-footer]`), um die Slots zu definieren.
Das hat den Vorteil, dass wir beliebige HTML-Elemente verwenden können und nicht auf spezifische Elementnamen angewiesen sind.

## Zusammenfassung

- **Content Projection** ermöglicht es, beliebiges Markup von außen an eine Komponente zu übergeben.
- Das Konzept ist vergleichbar mit **Slots** in Web Components, Vue.js oder Svelte.
- Der Platzhalter `<ng-content>` bestimmt, wo der Content im Template der Komponente gerendert wird.
- Mit dem Attribut `select` auf `<ng-content>` können wir **Multi-Slot Projection** umsetzen und verschiedene Teile des Contents gezielt platzieren.
- Jedes Element kann nur einmal projiziert werden. Ein `<ng-content>` ohne `select` fängt den restlichen Content auf.
- **Fallback Content** (ab Angular 18) erlaubt es, Standardinhalte zu definieren, wenn kein passender Content übergeben wird.
- Mit `ngProjectAs` können wir Elemente unter einem anderen Selektor projizieren.
- `<ng-content>` sollte nicht mit `@if`, `@for` oder `@switch` bedingt eingebunden werden.

Content Projection ist ein mächtiges Werkzeug, um flexible und wiederverwendbare UI-Komponenten zu bauen.
Es trennt die Struktur einer Komponente von ihrem konkreten Inhalt und macht sie dadurch universell einsetzbar.
