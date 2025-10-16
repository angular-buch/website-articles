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

In [Part 1](../2025-10-signal-forms-part1/README.md) and [Part 2](../2025-10-signal-forms-part2/README.md), we covered the fundamentals and advanced validation patterns of Signal Forms. In this final part, we'll explore specialized topics that help you build complex, modular forms: child forms and custom UI controls.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- *Part 3: Child Forms and Custom UI Controls* (this post)

## Integrate a Child Form

As forms grow in complexity, it becomes essential to break them down into smaller, reusable components.
Let's have a look at an example.
We want to allow new users to define identity information such as gender and also an optional salutation and pronoun when the gender is set to `diverse`.
All these fields we want to wrap in a separate component `IdentityForm` which we can integrate into our main `RegistrationForm`.

### Creating a Child Form Component

We will start by creating the data model and the initial state.

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

Now we think about the form schema we want to apply.
First, we want to mark the fields for salutation and pronoun as `hidden` when the gender is not `diverse`.
Also we want both fields to be required and validated.
Therefore, we can add a `when` condition to the `required()` validation function.
We export the schema so we can use it in the parent `RegistrationForm` component later and apply it to the main schema.

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

Next, we create the component class.
We want to use the `model()` signal which should be required to pass into the component.
We use the `model()` instead of a simple `input()` here since we also want to add a `maybeUpdateSalutationAndPronoun` method which resets the salutation and pronoun once a user will change back the selection of the gender from *diverse* to *male* or *female*.
We also include the `Field` directive for binding the fields to our form elements in the template and our `FormError` component to be able to display validation errors.

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

In the template we use the `field` directive to bind our fields with the form model.
We check for the `hidden()` signal to conditionally show the additional fields for salutation and pronoun.

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
    <app-form-error [field]="identity().salutation" />
  </label>
  } @if (!identity().pronoun().hidden()) {
  <label
    >Pronoun
    <input type="text" placeholder="e. g. they/them" [field]="identity().pronoun" />
    <app-form-error [field]="identity().pronoun" />
  </label>
  }
</div>
```

### Integrating the Child Form

Now we can integrate the identity form into our main registration form.
First, let's update our main data model to include the identity information:

```typescript
import { apply } from '@angular/forms/signals';
import { IdentityForm, identitySchema, GenderIdentity, initialGenderIdentityState } from './identity-form/identity-form';

export interface RegisterFormData {
  username: string;
  identity: GenderIdentity;
  age: number;
  password: { pw1: string; pw2: string };
  email: string[];
  newsletter: boolean;
  newsletterTopics: string[];
  agreeToTermsAndConditions: boolean;
}

const initialState: RegisterFormData = {
  username: '',
  identity: initialGenderIdentityState,
  age: 18,
  password: { pw1: '', pw2: '' },
  email: [''],
  newsletter: false,
  newsletterTopics: ['Angular'],
  agreeToTermsAndConditions: false,
};
```

Next, we use the `apply()` function within our main schema to integrate the child schema:

```typescript
export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // apply child schema for identity checks
  apply(fieldPath.identity, identitySchema);
});
```

Finally, we integrate the component in our main form template.
We pass the whole `FieldTree` for the identity.

```html
<form (submit)="submit($event)">
  <!-- ... -->
  <app-identity-form [identity]="registrationForm.identity"></app-identity-form>
  <!-- ... -->
</form>
```

The child form now seamlessly integrates with the parent form, sharing the same validation lifecycle and state management.


## Create your own FormUiControl

In real-world applications, we often need form controls that go beyond standard HTML input elements.
This can be, for example, a custom form component or a wrapper for a third-party component library.
Signal Forms provide the `FormUiControl` interface that allows you to create custom form components that integrate seamlessly with the Signal Forms ecosystem.

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
  newsletterTopics: [''],
};
```

As we can see, custom component integrates seamlessly with Signal Forms validation and state management, just like native HTML form controls.



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
- Creating modular child forms with `apply()`
- Building custom UI controls with `FormUiControl`

Signal Forms represent a powerful evolution in Angular's form handling capabilities, offering:
- **Type safety** throughout the entire form structure
- **Reactive patterns** that integrate seamlessly with Angular's Signal primitive
- **Declarative validation** through schema-based approaches
- **Modular architecture** supporting complex, reusable form components

As Signal Forms continue to evolve from their experimental status, they promise to become a cornerstone of modern Angular application development, providing developers with the tools needed to build sophisticated, maintainable forms with confidence.

Ready to start building with Signal Forms? Check out the [official Angular documentation](https://angular.dev/guide/signals) and experiment with these patterns in your own projects!


<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
