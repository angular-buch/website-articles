---
title: 'Angular Signal Forms Part 5: Migration and Compatibility'
author: Danny Koppenhagen
mail: mail@d-koppenhagen.de
author2: Ferdinand Malcher
mail2: mail@fmalcher.de
published: 2026-04-20
lastModified: 2026-04-20
keywords:
  - Angular
  - Signals
  - Forms
  - Angular 22
  - Signal Forms
  - Reactive Forms
  - Template Driven Forms
  - ControlValueAccessor
  - FormUiControl
  - FormValueControl
  - FormCheckboxControl
  - Custom Controls
  - Migration
  - Compatibility
language: en
header: header-signalforms-part5.jpg
sticky: false
---

In the previous parts of this series, we've covered the fundamentals, validation patterns, modular form architecture, and accessibility handling with Signal Forms.
In this fifth part, we'll focus on the practical side of adopting Signal Forms in existing projects.
We'll look at migration strategies for moving from Reactive Forms to Signal Forms – and vice versa.
Finally, we'll see how `FormUiControl` bridges the gap between all three form approaches, making `ControlValueAccessor` a thing of the past.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- [Part 3: Child Forms, Custom UI Controls and SignalFormsConfig](/blog/2025-10-signal-forms-part3)
- [Part 4: Metadata and Accessibility Handling](/blog/2025-12-signal-forms-part4)
- *Part 5: Migration and Compatibility* (this post)

## Gradual Migration: No Big Bang Required

- Intro: Migrating to Signal Forms doesn't have to happen all at once – Angular provides interop tools for a step-by-step transition
- Two strategies depending on the direction of migration
- Both rely on the compat package `@angular/forms/signals/compat`

### Starting from the Top: Wrapping Existing Controls with `compatForm`

- Scenario: You want to move the overall form to Signal Forms, but some controls or groups should remain as Reactive Forms for now (e.g. complex async validators, RxJS-heavy logic, third-party integrations)
- `compatForm()` acts as a bridge: wraps a signal state object that can contain existing `FormControl` or `FormGroup` instances
- Existing validators and RxJS logic stay untouched

#### Embedding a Single `FormControl`

- Place an existing `FormControl` (e.g. with a specialized validator) directly into the signal state object
- Use `compatForm()` instead of `form()`
- Access values and state through the signal tree API (`f.password().value()`, `f.password().valid()`)
- In the template: `[formField]` works as usual
- Errors are passed through as `CompatValidationError`

#### Embedding a `FormGroup` as a Branch

- Embed an entire `FormGroup` (e.g. an address block) as a value in the signal state
- `compatForm()` recognizes the `FormGroup` and creates a branch in the signal tree
- In the template: access inner controls via `.control().controls.street` etc.
- Inner controls are still bound with `[formControl]` (not `[formField]`)

#### Caveat: Reading the Full Form Value

- Limitation: `form().value()` returns the `FormControl` instance for compat fields, not the plain value
- Workaround: manually build a `computed()` that assembles the individual values

### Starting from the Bottom: Exposing Signal Fields with `SignalFormControl`

- Scenario: The existing `FormGroup` structure should stay in place, but individual fields should be migrated to Signal Forms
- `SignalFormControl` exposes a signal-based field as a standard `FormControl`
- Bidirectional sync: Signal → Control and Control → Signal
- Schema validators propagate to `control.errors`

#### What Doesn't Work (and What to Do Instead)

- `disable()`/`enable()` are not supported → use the `disabled()` rule in the schema instead
- `addValidators()`/`removeValidators()`/`setValidators()` are not supported → use `applyWhen()` for conditional validation
- `setErrors()`/`markAsPending()` are not supported → define errors declaratively via validation rules in the schema
- Core principle: state is derived from signals and the schema, not set imperatively

## Bridging the Style Gap: CSS Status Classes

- Reactive Forms and TDF automatically apply CSS classes like `.ng-valid`, `.ng-dirty`, `.ng-touched`
- Signal Forms don't do this by default
- Solution: use the `NG_STATUS_CLASSES` preset or define a custom `SignalFormsConfig`
- For details on configuration and custom CSS classes, see [Part 3: Provide a custom SignalFormsConfig](/blog/2025-10-signal-forms-part3)

## Universal Form Components

Beyond migration, Signal Forms also change how we think about building reusable form components.
In the past, creating a custom form control that works across different form approaches required a fair amount of ceremony.
With `FormUiControl`, Angular now provides a single interface that makes custom components compatible with Signal Forms, Reactive Forms, and Template-Driven Forms – all at once.

### RIP ControlValueAccessor: One Interface to Rule Them All

With the introduction of Signal Forms, Angular didn't just create a third approach to form handling – it also solved a problem that has been bugging developers for years: **How do I create a universal form control that works with all form approaches?**

The traditional answer was: `ControlValueAccessor` (CVA).
If you wanted to build custom form components that work with both Reactive Forms and Template-Driven Forms, you had to implement the CVA interface – with `writeValue()`, `registerOnChange()`, `registerOnTouched()` and the associated provider boilerplate.

The good news: That's over now.

In the past, creating a reusable form component – e.g. a custom input field with a label and error display – required implementing the `ControlValueAccessor` interface.
It looked something like this:

```typescript
@Component({
  selector: 'app-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `...`,
})
export class InputComponent implements ControlValueAccessor {
  value = '';
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // ...
  }
}
```

It works – but it's cumbersome, error-prone, and requires a lot of boilerplate.
On top of that, CVA was only designed for Reactive Forms and Template-Driven Forms.
For Signal Forms, a different approach was needed.

### The Solution: `FormUiControl`

Signal Forms ship with the `FormUiControl` interface, which we already introduced in [Part 3](/blog/2025-10-signal-forms-part3) of this series.
There, we showed how to use it to create custom controls for Signal Forms.

What we didn't cover back then: **Components that implement `FormValueControl` or `FormCheckboxControl` are automatically compatible with Reactive Forms and Template-Driven Forms as well.**

This means: One interface, one implementation – and the component works with all three form approaches.

### The Interfaces at a Glance

`FormUiControl` is the base interface.
In practice, we use the more specific variants:

```typescript
interface FormValueControl<T> extends FormUiControl {
  readonly value: ModelSignal<T>;
  readonly touched?: InputSignal<boolean>;
  readonly invalid?: InputSignal<boolean>;
  readonly errors?: InputSignal<readonly ValidationError[]>;
  readonly hidden?: InputSignal<boolean>;
  readonly readonly?: InputSignal<boolean>;
  readonly pending?: InputSignal<boolean>;
  readonly required?: InputSignal<boolean>;
  // ...
}

interface FormCheckboxControl extends FormUiControl {
  readonly checked: ModelSignal<boolean>;
  // ...
}
```

The key detail: `value` is a `ModelSignal` – a bidirectional signal that can both receive and emit values.
This is exactly what makes compatibility across all form approaches possible.

### In Practice: A Universal Input Component

Let's look at what a universal input component looks like that implements `FormValueControl<string>`:

```typescript
import { Component, computed, input, model } from '@angular/core';
import { FormValueControl, ValidationError } from '@angular/forms/signals';

@Component({
  selector: 'app-input',
  template: `
    <label>
      {{ label() }}
      <input
        #i
        type="text"
        [id]="id"
        [value]="value()"
        (input)="value.set(i.value)"
        [aria-invalid]="ariaInvalid()"
        [aria-describedby]="ariaInvalid() ? 'desc-' + id : null"
      />
      @if (errors().length) {
        <small [id]="'desc-' + id">Required</small>
      }
    </label>
  `,
})
export class Input implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly label = input.required<string>();
  readonly touched = input(false);
  readonly invalid = input(false);
  readonly hidden = input(false);
  readonly readonly = input(false);
  readonly pending = input(false);
  readonly required = input(false);
  readonly errors = input<readonly ValidationError[]>([]);

  protected readonly id =
    (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

  readonly ariaInvalid = computed(() => {
    return this.touched() && !this.pending()
      ? this.errors().length > 0
      : undefined;
  });
}
```

No `ControlValueAccessor`, no `NG_VALUE_ACCESSOR` provider, no `writeValue()`, no `registerOnChange()`.
Instead: a `model()` for the value and `input()` signals for the state.
That's it.

### Same Component – Three Form Approaches

Now for the exciting part: We use the exact same `Input` component with all three form approaches.

#### Signal Forms

```typescript
@Component({
  selector: 'app-sf',
  imports: [FormField, Input],
  template: `
    <app-input label="SF Name" [formField]="name" />
    <pre>{{ name().value() }}</pre>
  `,
})
export class Sf {
  protected readonly name = form(signal(''), (p) => {
    required(p, { message: 'Required' });
  });
}
```

#### Reactive Forms

```typescript
@Component({
  selector: 'app-rf',
  imports: [ReactiveFormsModule, Input],
  template: `
    <app-input label="RF Name" [formControl]="name" />
    <pre>{{ name.value }}</pre>
  `,
})
export class Rf {
  readonly name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
}
```

#### Template-Driven Forms

```typescript
@Component({
  selector: 'app-tdf',
  imports: [FormsModule, Input],
  template: `
    <app-input
      label="TDF Name"
      name="tdf-name"
      [(ngModel)]="name"
      [required]="true"
    />
    <pre>{{ name() }}</pre>
  `,
})
export class Tdf {
  readonly name = signal('');
}
```

Three different form approaches, one component. No adjustments needed.

### Why Does This Work?

The key lies in the `ModelSignal`.
A `model()` in Angular is both an input and an output at the same time.
This means:

- **Signal Forms** bind directly to the `value` signal via the `[formField]` directive.
- **Reactive Forms** recognize the `model()` signal and use it via the `[formControl]` directive as a bidirectional bridge – similar to a CVA, but without the boilerplate.
- **Template-Driven Forms** bind to the `value` signal via `[(ngModel)]`, since `ngModel` also supports `ModelSignal`.

Angular automatically detects that the component implements `FormValueControl` and selects the appropriate binding mechanism.

### CVA vs. FormUiControl Compared

|  | ControlValueAccessor | FormValueControl |
| --- | --- | --- |
| Boilerplate | High (`writeValue`, `registerOnChange`, `registerOnTouched`, Provider) | Minimal (`model()` + optional `input()` signals) |
| Signal Forms | ❌ Not compatible | ✅ Natively supported |
| Reactive Forms | ✅ Supported | ✅ Supported |
| Template-Driven Forms | ✅ Supported | ✅ Supported |
| State information | Manual (e.g. `setDisabledState`) | Automatic via `input()` signals (`touched`, `errors`, `disabled`, ...) |
| Reactivity | Callback-based | Signal-based |

## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)


## Conclusion

In this five-part series, we've explored the full spectrum of Angular Signal Forms:

**[Part 1](/blog/2025-10-signal-forms-part1/)** covered the fundamentals:

- Data models and field structures
- Template connections with the `FormField` directive
- Basic form submission and validation
- Built-in validators and error display

**[Part 2](/blog/2025-10-signal-forms-part2/)** dove into schema validation patterns:

- Custom validation functions
- Cross-field and conditional validation
- Asynchronous validation
- Server-side error handling

**[Part 3](/blog/2025-10-signal-forms-part3/)** explored specialized topics:

- Creating modular child forms and combining schemas with `apply()`
- Building custom UI controls with `FormValueControl`
- Providing custom `SignalFormsConfig` for CSS class management

**[Part 4](/blog/2025-12-signal-forms-part4/)** covered metadata and accessibility:

- Assigning and accessing field metadata for enhanced user guidance
- Creating a unified component for displaying field information, errors, and loading states
- Building a directive that automatically adds ARIA attributes for better accessibility
- Handling invalid form submissions by focusing the first invalid field

**Part 5** addressed migration and compatibility:

- Gradual migration strategies with `compatForm` (top-down) and `SignalFormControl` (bottom-up)
- Limitations of the compat layer and how to work around them declaratively
- Automatic status classes and `SignalFormsConfig`
- How `FormUiControl` makes `ControlValueAccessor` obsolete for most use cases
- Building universal form controls that work with Signal Forms, Reactive Forms, and Template-Driven Forms
- The role of `ModelSignal` as the bridge between all three form approaches

Signal Forms are the third major approach of form handling in Angular.
After Template-Driven Forms and Reactive Forms, Signal Forms aim to make form handling more type-safe, reactive, and declarative.
With `FormUiControl`, they also provide a unified interface for building custom form controls that work across all form approaches – making `ControlValueAccessor` a thing of the past.

One Interface to Rule Them All. 💍
