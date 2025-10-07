---
title: 'Angular Signal Forms Part 3: Child Forms and Custom UI Controls'
author: Danny Koppenhagen and Ferdinand Malcher
mail: team@angular.schule
published: 2025-10-06
lastModified: 2025-10-06
keywords:
  - Angular
  - JavaScript
  - Signals
  - Forms
  - Angular 21
  - Signal Forms
  - Custom Controls
  - Child Forms
language: en
header: signal-forms.jpg
sticky: false
hidden: true
---

In [Part 1](../2025-10-signal-forms-part1/README.md) and [Part 2](../2025-10-signal-forms-part2/README.md), we covered the fundamentals and advanced validation patterns of Signal Forms. In this final part, we'll explore specialized topics that help you build complex, modular forms: child forms and custom UI controls.

## Integrate a Child Form

As forms grow in complexity, it becomes essential to break them down into smaller, reusable components.
Signal Forms support child forms through the `apply()` function, which allows you to integrate separate form components with their own schemas.

This approach promotes modularity, reusability, and better maintainability of complex forms.

### Creating a Child Form Component

Let's create an identity form component that handles gender identity information.
First, we'll define the interface and schema for our child form:

```typescript
import { Component, input } from '@angular/core';
import { Control, Field, hidden, schema } from '@angular/forms/signals';

export interface GenderIdentity {
  gender: '' | 'male' | 'female' | 'diverse';
  salutation: string; // e.g. "Mx.", "Dr.", etc.
  pronoun: string; // e.g. "they/them"
}

export const identitySchema = schema<GenderIdentity>((path) => {
  hidden(path.salutation, ({ valueOf }) => {
    return !valueOf(path.gender) || valueOf(path.gender) !== 'diverse';
  });
  hidden(path.pronoun, ({ valueOf }) => {
    return !valueOf(path.gender) || valueOf(path.gender) !== 'diverse';
  });
});

@Component({
  selector: 'app-identity-form',
  imports: [Control],
  templateUrl: './identity-form.html',
  styleUrl: './identity-form.scss',
})
export class IdentityForm {
  readonly identity = input.required<Field<GenderIdentity>>();
}
```

The template uses the `hidden()` signal to conditionally show additional fields:

```html
<label>
  Gender
  <select name="gender-identity" [control]="identity().gender">
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
      <input type="text" placeholder="e.g. Mx." [control]="identity().salutation" />
    </label>
  }
  @if (!identity().pronoun().hidden()) {
    <label>
      Pronoun
      <input type="text" placeholder="e.g. they/them" [control]="identity().pronoun" />
    </label>
  }
</div>
```

### Integrating the Child Form

Now we can integrate the identity form into our main registration form.
First, let's update our main data model to include the identity information:

```typescript
import { apply } from '@angular/forms/signals';
import { IdentityForm, identitySchema, GenderIdentity } from './identity-form/identity-form';

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
  identity: {
    gender: '',
    salutation: '',
    pronoun: '',
  },
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
  // ... existing validations ...

  // Apply the identity schema to the identity field
  apply(fieldPath.identity, identitySchema);
});
```

Finally, we integrate the component in our main form template:

```typescript
@Component({
  selector: 'app-registration-form',
  imports: [Control, JsonPipe, IdentityForm, FormError],
  template: `
    <form (submit)="submit($event)">
      <!-- ... other fields ... -->

      <app-identity-form [identity]="registrationForm.identity"></app-identity-form>

      <!-- ... rest of form ... -->
      <button type="submit">Register</button>
    </form>
  `,
})
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(this.registrationModel, registrationSchema);
  // ...
}
```

The child form now seamlessly integrates with the parent form, sharing the same validation lifecycle and state management.

## Create your own FormUiControl

Sometimes you need form controls that go beyond standard HTML input elements.
Signal Forms provide the `FormUiControl` interface that allows you to create custom form components that integrate seamlessly with the Signal Forms ecosystem.

### Understanding FormUiControl

The `FormUiControl` interface defines the contract for custom form components:

```typescript
interface FormUiControl<T = unknown> {
  value: WritableSignal<T>;
  disabled?: Signal<boolean>;
  readonly?: Signal<boolean>;
  hidden?: Signal<boolean>;
}
```

Your custom component needs to implement this interface to work with the `Control` directive.

### Creating a Custom Multiselect Component

Let's create a custom multiselect component for selecting newsletter topics:

```typescript
import { Component, effect, input, model } from '@angular/core';
import { FormValueControl, ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({
  selector: 'app-multiselect',
  templateUrl: './multiselect.html',
  styleUrl: './multiselect.scss',
})
export class Multiselect implements FormValueControl<string[]> {
  readonly allTopics = ['Angular', 'Vue', 'React'];
  readonly value = model<string[]>([]);
  readonly label = input.required<string>();
  readonly errors = input<readonly WithOptionalField<ValidationError>[]>([]);
  readonly disabled = input<boolean>(false);

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

  constructor() {
    effect(() => {
      if (this.disabled()) {
        this.value.set([]);
      }
    });
  }
}
```

The corresponding template uses native HTML elements for accessibility:

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

And some basic styling to make it look like a dropdown:

```scss
.dropdown {
  border: 1px solid #ccc;
  border-radius: 4px;
  position: relative;

  summary {
    padding: 8px 12px;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }
  }

  ul {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 4px 4px;
    list-style: none;
    margin: 0;
    padding: 0;
    z-index: 1000;

    li {
      padding: 4px 12px;

      &:hover {
        background-color: #f5f5f5;
      }

      label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }
    }
  }

  &[aria-disabled="true"] {
    opacity: 0.6;
    pointer-events: none;
  }
}
```

Key features of this implementation:

1. **FormValueControl Interface**: Implements the `FormValueControl<string[]>` interface which is specifically designed for value-based form controls
2. **Model Signal**: Uses `model()` for two-way binding with the form field
3. **Built-in Topics**: Has predefined topics (Angular, Vue, React)
4. **Accessibility**: Uses `<details>` and `<summary>` elements for native accessibility support
5. **Disabled State Effect**: Automatically clears selections when the control becomes disabled
6. **Validation Support**: Accepts validation errors for display

### Using the Custom Component

Now you can use your custom multiselect component in forms:

```typescript
@Component({
  selector: 'app-registration-form',
  imports: [Control, JsonPipe, IdentityForm, FormError, Multiselect],
  template: `
    <form (submit)="submit($event)">
      <!-- ... other form fields ... -->

      <div>
        <app-multiselect
          [control]="registrationForm.newsletterTopics"
          label="Newsletter Topics"
        ></app-multiselect>
        @if (registrationForm.newsletterTopics().touched() && registrationForm.newsletterTopics().errors().length) {
          <app-form-error [errors]="registrationForm.newsletterTopics().errors()" />
        }
      </div>

      <button type="submit">Register</button>
    </form>
  `,
})
export class RegistrationForm {
  // ...
}
```

The custom component integrates seamlessly with Signal Forms validation and state management, just like native HTML form controls.

## Conclusion

In this three-part series, we've explored the full spectrum of Angular Signal Forms:

**Part 1** covered the fundamentals:
- Data models and field structures
- Template connections with the Control directive
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
