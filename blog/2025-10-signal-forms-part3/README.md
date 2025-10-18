---
title: 'Angular Signal Forms Part 3: Child Forms and Custom UI Controls'
author: Danny Koppenhagen and Ferdinand Malcher
mail: dannyferdigravatar@fmalcher.de # Gravatar
published: 2025-10-27
lastModified: 2025-10-27
keywords:
  - Angular
  - Signals
  - Forms
  - Angular 21
  - Signal Forms
  - Custom Controls
  - Child Forms
language: en
header: header-signalforms-part3.jpg
sticky: false
hidden: true
---



We covered fundamentals and advanced validation patterns of Signal Forms in [Part 1](/blog/2025-10-signal-forms-part1) and [Part 2](/blog/2025-10-signal-forms-part2) of this blog series.
In this final part, we'll explore two specialized topics that are relevant for large and modular forms: child forms and custom UI controls.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- *Part 3: Child Forms and Custom UI Controls* (this post)

## Integrating Child Forms

As forms grow in complexity, it becomes essential to break them down into smaller, reusable components.
This modular approach not only enhances code maintainability but also allows to reuse form parts across the application.

In our registration form example, we want to allow new users to define identity information such as gender and an optional salutation and pronoun when the gender is set to `diverse`.
All these fields should be wrapped in a separate component `IdentityForm` that we want to use in our main `RegistrationForm`.

### Creating a Child Form Component

In our new `IdentityForm` component, we start by defining the data model and initial state for the identity information.
Instead of including these directly in the main registration form data model, we define a new interface `GenderIdentity` that holds the relevant fields.

```typescript
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

As for every form, we want to define a schema that holds the validation and visibility logic.
We mark the fields for salutation and pronoun as `hidden` when the selected gender is not `diverse`.

Also we want both fields to be required and validated.
To apply a schema conditionally, we can use the `applyWhen()` function as covered in [Part 2](/blog/2025-10-signal-forms-part2) of this series.
However, here's an interesting detail of the `required` validator: We can add a `when` property to apply this validation conditionally – without the need of using `applyWhen()`.
This way we define that `salutation` and `pronoun` are only required when the gender is set to `diverse`.

We export the whole schema so that we can use it in the parent `RegistrationForm` component later and apply it to the main schema.

```typescript
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

Our components needs to hold a `FieldTree` that represents the form model. Previously, we created this tree with the `form()` function.
However, since the identity form is a child form, we want to receive the model from the parent component via an `input()`.

While we're at it, we also define a method `maybeUpdateSalutationAndPronoun()` that resets the salutation and pronoun fields when the user changes the gender from `diverse` to `male` or `female`.
Finally, we import the `Field` directive for binding the fields to our form elements in the template and our `FormError` component to be able to display validation errors.

```typescript
@Component({
  // ...
  imports: [Field, FormError]
})
export class IdentityForm {
  readonly identity = model.required<FieldTree<GenderIdentity>>();

  protected maybeUpdateSalutationAndPronoun(event: Event) {
    const gender = (event.target as HTMLSelectElement).value;
    if (gender !== 'diverse') {
      this.identity().salutation().value.set('');
      this.identity().pronoun().value.set('');
    }
  }
}
```

In the template, things are straightforward and don't differ much from what we've seen so far:
We use the `field` directive to bind our fields with the form model.
To conditionally show the additional fields for salutation and pronoun, we use the `hidden()` signal of the respective fields.
To trigger the reset logic, we bind the `change` event of the gender `<select>` to our method `maybeUpdateSalutationAndPronoun()`.

> Note: Resetting the fields could have been solved with an `effect` as well.
> However, in our evaluation this led to an infinite loop, even if the value didn't change. This is most likely a bug that will be fixed in future releases of Signal Forms.

```html
<label
  >Gender
  <select
    name="gender-identity"
    [field]="identity().gender"
    (change)="maybeUpdateSalutationAndPronoun($event)"
  >
    <option value="" selected>Please select</option>
    <option value="male">Male</option>
    <option value="female">Female</option>
    <option value="diverse">Diverse</option>
  </select>
</label>

<div class="group-with-gap">
  @if (!identity().salutation().hidden()) {
  <label
    >Salutation
    <input type="text" placeholder="e. g. Mx." [field]="identity().salutation" />
    <app-form-error [fieldRef]="identity().salutation" />
  </label>
  } @if (!identity().pronoun().hidden()) {
  <label
    >Pronoun
    <input type="text" placeholder="e. g. they/them" [field]="identity().pronoun" />
    <app-form-error [fieldRef]="identity().pronoun" />
  </label>
  }
</div>
```

### Integrating the Child Form

Our child form is now ready to be used: It receives a `FieldTree` and binds all its fields to the template.
The next step is to integrate it into our main `RegistrationForm`.
This is the place where the data model and state of the whole form is defined, including the identity information.
We create a new data property `identity` which holds a nested object of type `GenderIdentity`.
The `initialState` has to be updated accordingly.

```typescript
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
import { GenderIdentity, IdentityForm, identitySchema, initialGenderIdentityState } from '../identity-form/identity-form';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // apply child schema for identity checks
  apply(fieldPath.identity, identitySchema);
});
```

Finally, we integrate the `IdentityForm` component in our main form template.
To make things work, we pass the `identity` field tree of our main form to the child component via property binding.

```html
<form (submit)="submit($event)">
  <!-- ... -->
  <app-identity-form [identity]="registrationForm.identity" />
  <!-- ... -->
</form>
```

The child form now seamlessly integrates with the parent form, sharing the same validation lifecycle and state management.
`RegistrationForm` as the main form component puts all thinsg together: It holds the complete data model, applies the schemas (including the child schema), and manages form submission and validation.
Parts of the form are passed to sub components like `IdentityForm`, which bind to the fields and handle their own UI logic.



## Creating custom Form UI Controls

In real-world applications, we often need form controls that go beyond standard HTML input elements.
This can be, for example, a wrapper for a third-party component library or a completely custom UI element that fits specific design requirements.
Signal Forms provide an interface that allows you to create custom form components that integrate seamlessly with the Signal Forms ecosystem.

### Understanding FormUiControl

The `FormUiControl` interface defines the contract for custom form components:

```typescript
interface FormUiControl {
  readonly disabled?: InputSignal<boolean>;
  readonly readonly?: InputSignal<boolean>;
  readonly hidden?: InputSignal<boolean>;
  // ...
}
```

This interface is the base, but typically we don't implement it directly but rather the more specific interfaces `FormValueControl` or `FormCheckboxControl` that extend the `FormUiControl` interface with specific properties needed for handling common value inputs or checkboxes.

```typescript
interface FormValueControl<T> extends FormUiControl {
  readonly value: ModelSignal<TValue>;
  // ...
}

interface FormCheckboxControl<T> extends FormUiControl {
  readonly checked: ModelSignal<boolean>;
  // ...
}
```

Your custom component needs to implement this interface to work with the `Field` directive.

### Creating a Custom Multiselect Component

Let's create a custom multiselect component for selecting newsletter topics.
We want to allow users to select one or multiple topics from a list defined in `allTopics`.
The component must implement `FormValueControl` with the type that we use for the model value - in our case an array of strings.
We also have to define a required input for the form label.
The two input properties `errors` and `disabled` we want to initialize with default values.
Last but not least, we want to ensure that once our custom field is disabled, its value is set to an empty list.
This we can handle with an `effect`.

```typescript
import { Component, effect, input, model } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({ /* ... */ })
export class Multiselect implements FormValueControl<string[]> {
  readonly allTopics = ['Angular', 'Vue', 'React'];
  readonly value = model<string[]>([]);
  readonly label = input.required<string>();
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly disabled = input<boolean>(false);

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.value.set([]);
      }
    });
  }
}
```

Next, we implement the template where we use native HTML elements for accessibility.

> For styling we use [picocss](https://picocss.com/) which is a minimalistic and lightweight and accessible styling framework for semantic HTML.

We wrap the selection in a `<details>` element and place the label in the `<summary>`.
Also we apply the attribute `aria-disabled` and hide the selection list, when the component is marked as disabled.
The selections itself are HTML `<input>` elements of type checkbox that we display by iterating over the list of `allTopics`.
To show the current selection state, we can simply bind the `checked` attribute to the components `value` which is a list of strings and check if the current topic is part of this list.
For changing the input we call a method `changeInput()` (we create it right after) with the topic name and the native event.

```html
<details class="dropdown" [ariaDisabled]="disabled()">
  <summary>
    {{ label() }}
  </summary>
  @if (!disabled()) {
    <ul>
      @for (topic of allTopics; track $index) {
        <li>
          <label>
            <input
              type="checkbox"
              [name]="topic"
              [checked]="value().includes(topic)"
              (input)="changeInput(topic, $event)"
            />
            {{ topic }}
          </label>
        </li>
      }
    </ul>
  }
</details>
```

Now we need to implement the method `changeInput()`.
The method has two input information: the topic for which the value should be changed and the native input event with the state, wether the checkbox is `checked` or not.
If the input was checked and it is not already in the current list of selected topics, we add it.
If it was unchecked, we remove it from the list.

```typescript
// ...
@Component({ /* ... */ })
export class Multiselect implements FormValueControl<string[]> {
  // ...
  changeInput(topic: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const isInModel = this.value().includes(topic) && checked;
    if (!isInModel && checked) {
      this.value.update((current) => [...current, topic]);
      return;
    }
    if (!checked) {
      this.value.update((current) => current.filter((t) => t !== topic));
    }
  }
}
```

### Using the Custom Component

Perfect, now we can add the new custom multiselect control to our app and replace the existing implementation for topic selection.
This is straightforward: We handle the `MultiSelect` component just like a native input and use the `field` directive to bind the `newsletterTopics` of the form model.

```html
<!--- ... -->
<app-multiselect
  [field]="registrationForm.newsletterTopics"
  label="Topics (multiple possible):"
/>
<app-form-error [field]="registrationForm.newsletterTopics" />
<!--- ... -->
```

To make it work, we have to change one last thing:
We need to slightly adjust our data model, since we allow now to select multiple topics for the newsletter, it has to be an array.
The validation must not be touched, since we already check for the `length` property which works perfectly with the string array.

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

As we can see, custom components integrate seamlessly with Signal Forms validation and state management, just like native HTML form controls.



## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)




## Conclusion

In this three-part series, we've explored the full spectrum of Angular Signal Forms:

**Part 1** covered the fundamentals:
- Data models and field structures
- Template connections with the `Field` directive
- Basic form submission and validation
- Built-in validators and error display

**Part 2** dove into advanced patterns:
- Custom validation functions
- Cross-field and conditional validation
- Asynchronous validation
- Server-side error handling

**Part 3** explored specialized topics:
- Creating modular child forms and combining schemas with `apply()`
- Building custom UI controls with `FormUiControl`

Signal Forms represent a powerful evolution in Angular's form handling capabilities, offering:
- **Type safety** throughout the entire form structure
- **Reactive patterns** that integrate seamlessly with Angular's Signal primitive
- **Declarative validation** through schema-based approaches
- **Modular architecture** supporting complex, reusable form components

As Signal Forms continue to evolve from their experimental status, they promise to become a cornerstone of modern Angular application development.

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
