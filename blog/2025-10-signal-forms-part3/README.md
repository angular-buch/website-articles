---
title: 'Angular Signal Forms Part 3: Child Forms, Custom UI Controls and SignalFormsConfig'
author: Danny Koppenhagen
mail: mail@d-koppenhagen.de
author2: Ferdinand Malcher
mail2: mail@fmalcher.de
published: 2025-10-20
lastModified: 2026-01-08
keywords:
  - Angular
  - Signals
  - Forms
  - Angular 21
  - Signal Forms
  - Custom Controls
  - Child Forms
  - ControlValueAccessor
  - NG_STATUS_CLASSES
  - SignalFormsConfig
language: en
header: header-signalforms-part3.jpg
sticky: false
---


We covered fundamentals and advanced validation patterns of Signal Forms in [Part 1](/blog/2025-10-signal-forms-part1) and [Part 2](/blog/2025-10-signal-forms-part2) of this blog series.
In this final part, we'll explore more specialized topics that are relevant for large and modular forms: child forms and custom UI controls.
Last but not least, we'll have a look at providing a custom `SignalFormsConfig`.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- *Part 3: Child Forms, Custom UI Controls and SignalFormsConfig* (this post)
- [Part 4: Metadata and Accessibility Handling](/blog/2025-12-signal-forms-part4)

## Integrating Child Forms

As forms grow in complexity, it becomes essential to break them down into smaller, reusable components.
This modular approach not only enhances code maintainability but also allows to reuse form parts across the application.

The architectural idea is straightforward: Instead of defining the entire form in a single component, we create child components that contain specific sections of the HTML form.
The form and data models still live in the parent component, and the child components receive the relevant parts of the `FieldTree` via property binding.
To separate the data structure and validation logic, we can define individual schemas for each child form and apply them in the parent schema using the `apply()` function.

In our registration form example, we want to allow new users to define identity information such as gender and an optional salutation and pronoun when the gender is set to `diverse`.
All these fields should be wrapped in a separate component `IdentityForm` that we want to use in our main `RegistrationForm`.

### Creating a Child Form Component

In our new `IdentityForm` component, we start by defining the data model and initial state for the identity information.
Instead of including these directly in the main registration form data model, we define a new interface `GenderIdentity` that holds the relevant fields.

```typescript
// identity-form.ts
export interface GenderIdentity {
  gender: '' | 'male' | 'female' | 'diverse';
  salutation: string; // e. g. "Mx.", "Dr.", etc.
  pronoun: string; // e. g. "they/them"
}

export const initialGenderIdentityState: GenderIdentity = {
  gender: '',
  salutation: '',
  pronoun: '',
};
```

As for every form, we define a schema that holds the validation and visibility logic.
We mark the fields for salutation and pronoun as `hidden` when the selected gender is not `diverse`.

Also we want both fields to be required and validated.
To apply a schema conditionally, we can use the `applyWhen()` function as covered in [Part 2](/blog/2025-10-signal-forms-part2) of this series.
However, here's an interesting detail of the `required` validator: We can add a `when` property to apply this validation conditionally – without the need of using `applyWhen()`.
This way we define that `salutation` and `pronoun` are only required when the gender is set to `diverse`.

We export the whole schema so that we can use it in the parent `RegistrationForm` component later and apply it to the main schema.

```typescript
// identity-form.ts
export const identitySchema = schema<GenderIdentity>((path) => {
  hidden(path.salutation, (ctx) => {
    return !ctx.valueOf(path.gender) || ctx.valueOf(path.gender) !== 'diverse';
  });
  hidden(path.pronoun, (ctx) => {
    return !ctx.valueOf(path.gender) || ctx.valueOf(path.gender) !== 'diverse';
  });

  required(path.salutation, {
    when: (ctx) => ctx.valueOf(path.gender) === 'diverse',
    message: 'Please choose a salutation, when diverse gender selected',
  });
  required(path.pronoun, {
    when: (ctx) => ctx.valueOf(path.gender) === 'diverse',
    message: 'Please choose a pronoun, when diverse gender selected',
  });
});
```

The full form model still has to be defined in the parent component that manages the form.
However, parts of the `FieldTree` can be passed to child components via property binding.
From the perspective of our `IdentityForm`, we receive the model from the parent component via an `input()`.

While we're at it, we also define a method `updateSalutationAndPronoun()` that resets the salutation and pronoun fields when the user changes the gender field.
We set an empty value for the fields and call `reset()` which resets the `touched` and `dirty` state.
Finally, we import the `FormField` directive for binding the fields to our form elements in the template and our `FormError` component to be able to display validation errors.

```typescript
@Component({
  // ...
  imports: [Field, FormError]
})
export class IdentityForm {
  readonly identity = model.required<FieldTree<GenderIdentity>>();

  protected updateSalutationAndPronoun() {
    this.identity().salutation().value.set('');
    this.identity().salutation().reset();
    this.identity().pronoun().value.set('');
    this.identity().pronoun().reset();
  }
}
```

> Note: Resetting the fields could have been solved with an `effect` as well.
> However, in our evaluation this led to an infinite loop, even if the value didn't change. This is most likely a bug that will be fixed in future releases of Signal Forms.

In the template, things are straightforward and don't differ much from what we've seen so far:
We use the `FormField` directive to bind our fields to the form model.
To conditionally show the fields for salutation and pronoun, we use the `hidden()` signal to determine whether the fields are marked as hidden.
To trigger the reset logic, we bind the `change` event of the gender `<select>` to our method `updateSalutationAndPronoun()`.

```html
<label>
  Gender
  <select
    name="gender-identity"
    [formField]="identity().gender"
    (change)="updateSalutationAndPronoun()"
  >
    <option value="" selected>Please select</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="diverse">Diverse</option>
  </select>
</label>

<div class="group-with-gap">
  @if (!identity().salutation().hidden()) {
  <label>
    Salutation
    <input type="text" placeholder="e. g. Mx." [formField]="identity().salutation" />
    <app-form-error [fieldRef]="identity().salutation" />
  </label>
  }
  @if (!identity().pronoun().hidden()) {
  <label>
    Pronoun
    <input type="text" placeholder="e. g. they/them" [formField]="identity().pronoun" />
    <app-form-error [fieldRef]="identity().pronoun" />
  </label>
  }
</div>
```

### Integrating the Child Form

Our child form is now ready to be used: It receives a `FieldTree` and binds all its fields to the template.
It also exports the data model interface, initial state and schema for validation.
The next step is to integrate all these parts into our main `RegistrationForm`.

This is the place where the data model and state of the whole form are defined, including the identity information.
We create a new data property `identity` which holds a nested object of type `GenderIdentity`.
The `initialState` has to be updated accordingly.

```typescript
// registrsation-form.ts
// ...
import { GenderIdentity, initialGenderIdentityState } from '../identity-form/identity-form';

export interface RegisterFormData {
  // ...
  identity: GenderIdentity;
}

const initialState: RegisterFormData = {
  // ...
  identity: initialGenderIdentityState,
};
```

Next, we use the `apply()` function within our main schema to integrate the child schema:

```typescript
// registrsation-form.ts
import { GenderIdentity, IdentityForm, identitySchema, initialGenderIdentityState } from '../identity-form/identity-form';

export const registrationSchema = schema<RegisterFormData>((path) => {
  // ...

  // apply child schema for identity checks
  apply(path.identity, identitySchema);
});
```

Finally, we integrate the `IdentityForm` component in our main form template.
To make things work, we pass the `identity` field tree of our main form to the child component via property binding.

```html
<form (submit)="submit()">
  <!-- ... -->
  <app-identity-form [identity]="registrationForm.identity" />
  <!-- ... -->
</form>
```

The child form now integrates with the parent form.
`RegistrationForm` as the main form component puts all things together: It holds the complete data model, applies the schemas (including the child schema), and manages form submission and validation.
Parts of the form are passed to sub components like `IdentityForm`, which bind to the fields and handle their own UI logic.


## Creating custom Form UI Controls

So far, we've used standard HTML form elements like `<input>`, `<select>`, and `<textarea>` to build our forms.
However, in real-world applications, we often need form controls that go beyond standard HTML input elements:
Think of a date picker, a rich text editor, a multi-select dropdown, a counter control, wrappers for third-party component libraries, or custom UI elements that fit specific design requirements.
This is something that was relatively complicated with Angular' *Reactive Forms* approach using `ControlValueAccessor`.

Signal Forms provide a simple interface that allows us to create custom form components that integrate seamlessly with the Signal Forms ecosystem.
Our goal is to create a custom component that can be used just like native HTML form elements with the `FormField` directive.

### The `FormUiControl` interface

Signal Forms provide the `FormUiControl` interface that defines the contract for custom form components:

```typescript
interface FormUiControl {
  readonly disabled?: InputSignal<boolean>;
  readonly readonly?: InputSignal<boolean>;
  readonly hidden?: InputSignal<boolean>;
  // ...
}
```

This interface is the base structure, but typically we don't implement it directly.
Instead, we use the more specific interfaces `FormValueControl` or `FormCheckboxControl` that extend the `FormUiControl` interface with specific properties needed for handling common value inputs or checkboxes:

```typescript
interface FormValueControl<T> extends FormUiControl {
  readonly value: ModelSignal<TValue>;
  // ...
}

interface FormCheckboxControl extends FormUiControl {
  readonly checked: ModelSignal<boolean>;
  // ...
}
```

Our custom components need to implement this interface to work with the `FormField` directive.
You can see that most of the fields are optional, and only `value` or `checked` are required.

### Creating a Custom Multiselect Component

We want to create a custom multiselect component that can later be used to select newsletter topics.
Users can choose one or multiple topics from a list.
The component must implement `FormValueControl` with the type that we use for the model value, which is a `string[]` in our case.

The most important part is the `value` property that holds the current selection as a model signal.
`model` is a semantic combination of *input* and *output*: It receives values from the parent component but can also be updated locally.
All local changes are automatically sent back to the parent component as an *output*.
This way, data flows bidirectionally between the parent form and the custom component.

The inputs `errors` and `disabled` are optional: These values are automatically provided by the `FormField` directive when the control has errors or is disabled.
We can use the `disabled` input signal to clear the value when the control is disabled by using an `effect`.

Our component can define additional inputs as needed:
The inputs `label` and `selectOptions` receive the label for the form control and the list of all options to select from.

```typescript
import { Component, effect, input, model } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({ /* ... */ })
export class Multiselect implements FormValueControl<string[]> {
  readonly value = model<string[]>([]);
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly disabled = input<boolean>(false);

  readonly selectOptions = input.required<string[]>();
  readonly label = input.required<string>();

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.value.set([]);
      }
    });
  }
}
```

Next, we implement the template where we use native HTML elements.
We want to keep the example as simple as possible, so please remember that for a production-ready multiselect component we need to address a few more details, e.g. proper keyboard navigation.

> For styling we use [picocss](https://picocss.com/) which is a minimalistic and lightweight and accessible styling framework for semantic HTML.

We wrap the selection in a `<details>` element and place the label in the `<summary>`.
Also we apply the attribute `aria-disabled` and hide the selection list when the component is marked as disabled.
The selection options are HTML `<input>` elements of type checkbox that we display by iterating over the list of `selectOptions`.
To show the current selection state, we can bind to the `checked` property: The component's `value` is a list of strings, and we can check whether the current option is part of this list.
For changing the input we call a method `changeInput()` (we create it right after) with the (un)selected name and the native event.

```html
<details class="dropdown" [ariaDisabled]="disabled()">
  <summary>
    {{ label() }}
  </summary>
  @if (!disabled()) {
    <ul>
      @for (option of selectOptions(); track $index) {
        <li>
          <label>
            <input
              type="checkbox"
              [name]="option"
              [checked]="value().includes(option)"
              (input)="changeInput(option, $event)"
            />
            {{ option }}
          </label>
        </li>
      }
    </ul>
  }
</details>
```

Now we need to implement the method `changeInput()` that handles the changes of the checkbox inputs:

- When an option is checked, we have to add it to the list of selected options.
- When an option is unchecked, we have to remove it from the list.

This is why the method needs to read the checkbox state from the native event to decide whether to add or remove the option from the list.
We update the list by changing the `value` signal.

```typescript
// ...
@Component({ /* ... */ })
export class Multiselect implements FormValueControl<string[]> {
  // ...
  changeInput(option: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;

    if (checked) {
      // option checked, add to list
      this.value.update((current) => [...current, option]);
    } else {
      // option unchecked, remove from list
      this.value.update((current) => current.filter((o) => o !== option));
    }
  }
}
```


### Using the Custom Component

Our custom form control is now ready to be used!
Since it implements the `FormValueControl` interface, we can use the component just like a native HTML form element.
In our `RegistrationForm` template, we include the `MultiSelect` component and pass the field tree `newsletterTopics` to the `FormField` directive.
All inputs defined in the `FormValueControl` interface are now automatically managed by the directive.

Our additional custom inputs `selectOptions` and `label` are set via property binding.

```html
<!--- ... -->
<app-multiselect
  [formField]="registrationForm.newsletterTopics"
  [selectOptions]="['Angular', 'React', 'Vue', 'Svelte']"
  label="Topics (multiple possible):"
/>
<app-form-error [formField]="registrationForm.newsletterTopics" />
<!--- ... -->
```

To make the form work, we have to change one last thing:
We need to adjust our data model to allow multiple topics: `newsletterTopics` becomes `string[]`;
The validation doesn't have to be changed, since we already check for the `length` property which works perfectly with the string array.

```typescript
export interface RegisterFormData {
  // ...
  newsletterTopics: string[];
}

const initialState: RegisterFormData = {
  // ...
  newsletterTopics: ['Angular'],
};
```

And this is how we can create and use custom form UI controls with Signal Forms!
Any component that implements the necessary interface can be directly integrated into Signal Forms with the `FormField` directive.


## Provide a custom `SignalFormsConfig`

Now that we know how to create large and modular forms and how to implement validation rules, we want to explore how we can customize Signal Forms.
Signal Forms offer us a way to configure how they behave in terms of automatically applying CSS classes based on a form field's state.
To do so, we need to create a `SignalFormsConfig` which accepts a `classes` object.
The keys of this object are the names of the CSS classes that should be applied whenever the assigned value, which is a predicate function with access to a form field's state, evaluates to `true`.
Looking at the example below, the CSS class `error` is applied for each form field that is touched and has at least one error assigned to it.

```ts
// signal-forms.config.ts
import { SignalFormsConfig } from '@angular/forms/signals';

export const signalFormsConfig: SignalFormsConfig = {
  classes: {
    valid: (state) => state.valid(),
    error: (state) => state.touched() && state.errors().length > 0,
  },
};
```

If you used Angular Reactive or Template-Driven Forms before, you may have noticed that this behavior was applied automatically.
For example, valid input fields have always had the class `ng-valid` applied to them and we could use these classes in our CSS for styling elements.
However, this wasn't really flexible, especially when working with CSS libraries that used their own classes.
Also, a bunch of CSS classes were applied even if we didn't use them.
If we still want to have the behavior from before, we can use the provided compatibility config:

```ts
// signal-forms.config.ts
import { SignalFormsConfig } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';

export const signalFormsConfig: SignalFormsConfig = {
  classes: NG_STATUS_CLASSES,
};
```

Once we create our config, we need to provide it.
We can either provide it at application level, route level or only for a specific component by passing it to `provideSignalFormsConfig()` into the `providers` array.

```ts
// app.config.ts
import { provideSignalFormsConfig } from '@angular/forms/signals';
// ...
import { signalFormsConfig } from './signal-forms.config';

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideSignalFormsConfig(signalFormsConfig),
  ],
};
```

If we run the app with the form now and we investigate the DOM, we can see that the CSS classes are always applied based on our defined predicate function.

## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)



## Conclusion

In this four-part series, we've explored the full spectrum of Angular Signal Forms:

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

**Part 3** explored specialized topics:
- Creating modular child forms and combining schemas with `apply()`
- Building custom UI controls with `FormValueControl`
- Providing custom `SignalFormsConfig` for CSS class management

**[Part 4](/blog/2025-12-signal-forms-part4/)** covers metadata and accessibility:
- Providing field metadata
- Provide a generic component for displaying form field information
- Creating a directive for adding ARIA attributes based on a field state

Signal Forms are the third major approach of form handling in Angular.
After Template-Driven Forms and Reactive Forms, Signal Forms aim to make form handling more type-safe, reactive, and declarative.
As the new approach continues to evolve from its experimental status, Signal Forms promise to become a cornerstone of modern Angular application development!

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
