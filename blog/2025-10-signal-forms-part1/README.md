---
title: 'Angular Signal Forms Part 1: Getting Started with the Basics'
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
language: en
header: signal-forms.jpg
sticky: false
---

Angular introduces Signal Forms with Version [21.0.0-next.2](https://github.com/angular/angular/releases/tag/21.0.0-next.2), an experimental but promising approach to form handling that leverages Angular's reactive Signal primitive.
This new API offers a declarative way to build forms with full control over the data model and built-in schema validation.
In this first part of our three-part series, we'll cover the fundamentals you need to get started with Signal Forms.

## What Makes Signal Forms Different

Signal Forms represent a paradigm shift from Angular's existing form approaches of Template Driven and Reactive Forms.

They follow three core principles:

1. **Full data model control**:
   Form data is managed as a Signal that we create, control, and can update directly at any time
2. **Declarative logic**:
   Validation logic is described through code in a schema
3. **Structural mapping**:
   The field structure mirrors the data structure 1:1

## Setting up the Data Model

The first step in creating a Signal Form is defining our data model.
For our registration form, we'll create an interface that defines all the fields we need:

```typescript
export interface RegisterFormData {
  username: string;
  age: number;
  email: string[];
  newsletter: boolean;
  agreeToTermsAndConditions: boolean;
}
```

Next, we create a Signal containing our initial form state.
We keep the `initialState` as a separate constant before, so we can re-use it later for resetting the form data after submission.

```typescript
const initialState: RegisterFormData = {
  username: '',
  age: 18,
  email: [''],
  newsletter: false,
  agreeToTermsAndConditions: false,
};

@Component({ /* .. */ })
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
}
```

This Signal serves as our single source of truth for form data.
It remains reactive and synchronizes automatically with any changes made through the form fields.

## Creating the Field Structure

Now that we have our data model defined, the next step is creating the field structure that connects our data model to the form model.
Signal Forms use the `form()` function to create a `Field` object that mirrors our data structure but adds metadata for each field node.

```typescript
import { form } from '@angular/forms/signals';
// ...
@Component({ /* ... */ })
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(this.registrationModel);
}
```

The `form()` function takes our data model Signal and creates a typed field structure.
This structure allows us to navigate through our form field paths exactly like we would navigate through our data structure.

### Accessing Field Properties

Once we have our form structure, we can access individual fields and their reactive properties:

```typescript
// Access field value
console.log(this.registrationForm.username().value());  // current username value

// Access field states
console.log(this.registrationForm.username().valid());   // validation status
console.log(this.registrationForm.username().touched()); // interaction status
console.log(this.registrationForm.username().errors());  // validation errors
```

Each `FieldState` provides several reactive properties that we can use in our templates and component logic:

- `value()` - A `WritableSignal` containing the current field value
- `valid()` - Boolean Signal indicating if the field passes all validations
- `touched()` - Boolean Signal indicating if the user has interacted with the field
- `errors()` - Signal containing an array of validation errors
- `pending()` - Boolean Signal indicating if async validations are running
- `disabled()` - Boolean Signal indicating a field is disabled or not
- `disabledReasons()` - Signal containing an array of reasons about the disabled state
- `hidden()` - Boolean Signal indicating a field should be hidden or not

## Connecting Fields to the Template

Now that we have our form structure in place, we need to connect it to our HTML template to create functional input fields with reactive data binding.
Signal Forms use the `Control` directive to bind form fields to HTML input elements.
To use the directive, we need to import it first.
Let us also import the `JsonPipe` alongside the `Control` directive, so we can use it in our template to display the current data model value.

```typescript
import { JsonPipe } from '@angular/common';
import { /* ... */, Control } from '@angular/forms/signals';
// ...
@Component({
  selector: 'app-registration-form',
  imports: [Control, JsonPipe],
  templateUrl: './registration-form.html',
})
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
}
```

The `Control` directive works directly with all standard HTML form elements like `<input>`, `<textarea>`, and `<select>`.
Let's start with a basic template that connects some of our form fields by using the `[control]` property Binding of the `Control` directive:

```html
<form (submit)="submit($event)">
  <div>
    <label for="username">Username</label>
    <input
      id="username"
      type="text"
      [control]="registrationForm.username"
    />
  </div>

  <div>
    <label for="age">Age</label>
    <input
      id="age"
      type="number"
      [control]="registrationForm.age"
    />
  </div>

  <div>
    <label for="newsletter">Subscribe to newsletter</label>
    <input
      id="newsletter"
      type="checkbox"
      [control]="registrationForm.newsletter"
    />
  </div>

  <button type="submit">Register</button>
</form>

<!-- Debug output to see current form data -->
<pre>{{ registrationModel() | json }}</pre>
```

We have now connected each input to its corresponding field in our form structure.
The `Control` directive handles the two-way data binding automatically, keeping our data model synchronized with user input.

### Working with Arrays

For our email array, we need to handle dynamic addition and removal of fields:
The `registrationForm.email` field returns an array of `Field` objects that we can iterate over using `@for()`.

```html
<!-- ... -->
<div>
  <label>Email addresses</label>
  @for (emailField of registrationForm.email; track $index) {
    <div>
      <input
        type="email"
        [control]="emailField"
        placeholder="Enter email address"
      />
      <button type="button" (click)="removeEmail($index)">Remove</button>
    </div>
  }
  <button type="button" (click)="addEmail($event)">Add Email</button>
</div>
<!-- ... -->
```

As you may have noticed, we also added two buttons for adding and removing e-mail input fields.
Let us implement the missing methods for array manipulation in our component.
We access the form models `value` signal and using the `update()` method to add or remove items on the form model.

```typescript
// ...
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(this.registrationModel);

  protected addEmail(e: Event): boolean {
    this.registrationForm.email.value.update((items) => [...items, '']);
    e.preventDefault();
    return false;
  }

  protected removeEmail(removeIndex: number): void {
    this.registrationForm.email.value.update((items) => items.filter((_, index) => index !== removeIndex));
  }
}
```

## Basic Form Submission

Now that we have our form connected to the template, let's properly implement form submission.
Signal Forms provide two approaches for handling form submission:
basic synchronous submission and the more powerful `submit()` function for asynchronous operations.

### Simple Synchronous Submission

For basic cases where you want to process form data synchronously, you can directly access the current form values:

```typescript
// ...
export class RegistrationForm {
  // ...
  protected async submit(e: Event) {
    e?.preventDefault();

    // Access current form data
    const formData = this.registrationModel();
    console.log('Form submitted:', formData);
  }
}
```

Since our data model Signal is always kept in sync with the form fields, we can access the current form state at any time using `this.registrationModel()`.

### Using the Signal Forms `submit()` Function

For more complex scenarios involving asynchronous operations, loading states, and error handling, Signal Forms provide a dedicated `submit()` function.
First, let's create a simple service to simulate handling the registration process.

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  registerUser(registrationData: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(registrationData);
      }, 2000);
    });
  }
}
```

Now let's enhance our `submit` function to use this service:

```typescript
// ...
import { /* ... */, submit } from '@angular/forms/signals';

export class RegistrationForm {
  // ...
  private readonly registrationService = inject(RegistrationService);
  // ...
  protected async submit(e: Event) {
    e?.preventDefault();

    await submit(this.registrationForm, async (form) => {
      await this.registrationService.registerUser(form().value);
      console.log('Registration successful!');
      this.reset();
    });
  }

  protected reset() {
    this.registrationModel.set(initialState);
    this.registrationForm().reset();
  }
}
```

### Handling Submission States

We can use the submission state in our template to provide better user feedback:

```html
<form (submit)="submit($event)">
  <!-- ... -->

  <button
    type="submit"
    [disabled]="registrationForm().submitting()"
    [attr.aria-busy]="registrationForm().submitting()"
  >
    @if (registrationForm().submitting()) {
      Registering...
    } @else {
      Register
    }
  </button>
</form>
```

## Basic Schema-Based Validation

One of the most powerful features of Signal Forms is schema-based validation.
Instead of defining validation rules directly on form controls, we create a declarative schema that describes all validation rules for our form.

### Creating a Basic Schema

Signal Forms use the `schema()` function to define validation rules:

```typescript
import {
  // ...
  schema,
  required,
  minLength,
  maxLength,
  min
} from '@angular/forms/signals';
// ...
export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // Username validation
  required(fieldPath.username, { message: 'Username is required' });
  minLength(fieldPath.username, 3, {
    message: 'A username must be at least 3 characters long',
  });
  maxLength(fieldPath.username, 12, {
    message: 'A username can be max. 12 characters long',
  });

  // Age validation
  min(fieldPath.age, 18, { message: 'You must be >=18 years old' });

  // Terms and conditions
  required(fieldPath.agreeToTermsAndConditions, {
    message: 'You must agree to the terms and conditions',
  });
});
// ...
```

### Applying the Schema to our Form

To use the schema, we pass it as the second parameter to the `form()` function:

```typescript
// ...
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(this.registrationModel, registrationSchema);
  // ...
}
```

Now our form will automatically validate fields according to the rules defined in our schema.

### Built-in Validator Functions

Signal Forms provide several built-in validation functions:

| Validator                        | Description                                                 | Example                                         |
| -------------------------------- | ----------------------------------------------------------- | ----------------------------------------------- |
| `required(field, opts)`          | Field must be filled. For boolean values, checks for `true` | `required(fieldPath.username)`                  |
| `minLength(field, length, opts)` | Minimum character count                                     | `minLength(fieldPath.username, 3)`              |
| `maxLength(field, length, opts)` | Maximum character count                                     | `maxLength(fieldPath.username, 10)`             |
| `min(field, value, opts)`        | Minimum numeric value                                       | `min(fieldPath.age, 18)`                        |
| `max(field, value, opts)`        | Maximum numeric value                                       | `max(fieldPath.age, 120)`                       |
| `email(field, opts)`             | Valid email address format                                  | `email(fieldPath.email)`                        |
| `pattern(field, regex, opts)`    | Regular expression match                                    | `pattern(fieldPath.username, /^[a-zA-Z0-9]+$/)` |

Each validator function accepts an optional `opts` parameter where you can specify a custom error message.

### Form-Level Validation State

The form itself also provides validation state that aggregates all field validations:

```html
<!-- ... -->
<button
  type="submit"
  [disabled]="!registrationForm().valid() || registrationForm().submitting()"
  [attr.aria-busy]="registrationForm().submitting()"
>
  @if (registrationForm().submitting()) { Registering... } @else { Register }
</button>
<!-- ... -->
```

## Displaying Validation Errors

Let's create a simple component to display validation errors:

```typescript
import { Component, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({
  selector: 'app-form-error',
  template: `
    <small>
      @for (error of errors(); track $index) {
        {{ error.message }}
        @if (!$last) {
          <br />
        }
      }
    </small>
  `,
})
export class FormError {
  errors = input<readonly WithOptionalField<ValidationError>[]>([]);
}
```

Now we can use this component in our form:

```html
<label>
  Username
  <input
    type="text"
    [control]="registrationForm.username"
  />
  @if (registrationForm.username().touched() && registrationForm.username().errors().length) {
    <app-form-error [errors]="registrationForm.username().errors()" />
  }
</label>
```

## What's Next?

In this first part, we've covered the fundamentals of Signal Forms:
- Setting up data models and field structures
- Connecting forms to templates
- Basic form submission
- Schema-based validation with built-in validators
- Displaying validation errors

In **Part 2**, we'll dive deeper into advanced validation scenarios, including custom validation functions, cross-field validation, asynchronous validation, and handling server-side errors.

In **Part 3**, we'll explore specialized topics like creating child forms and building custom UI controls that integrate seamlessly with Signal Forms.

Ready to continue? Check out [Part 2: Advanced Validation and Schema Patterns](../2025-10-signal-forms-part2/README.md)!