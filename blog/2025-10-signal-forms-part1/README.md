---
title: "Angular Signal Forms Part 1: Getting Started with the Basics"
author: Danny Koppenhagen
mail: mail@d-koppenhagen.de
author2: Ferdinand Malcher
mail2: mail@fmalcher.de
published: 2025-10-13
lastModified: 2026-02-21
keywords:
  - Angular
  - Signals
  - Forms
  - Angular 21
  - Signal Forms
  - Schema Validation
language: en
header: header-signalforms-part1.jpg
sticky: false
---

Angular introduces Signal Forms with Version [21.0.0](https://github.com/angular/angular/releases/tag/21.0.0), an experimental but promising approach to form handling that leverages Angular's reactive Signal primitive.
This new API offers a declarative way to build forms with full control over the data model and built-in schema validation.
In this first part of our four-part series, we'll cover the fundamentals you need to get started with Signal Forms.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- *Part 1: Getting Started with Signal Forms* (this post)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- [Part 3: Child Forms, Custom UI Controls and SignalFormsConfig](/blog/2025-10-signal-forms-part3)
- [Part 4: Metadata and Accessibility Handling](/blog/2025-12-signal-forms-part4)

## What Makes Signal Forms Different

Signal Forms represent a paradigm shift from Angular's existing form approaches of Template-Driven and Reactive Forms.
The new approach follows three core principles:

1. **Full data model control**:
   Form data is managed as a signal that we create, control, and can update directly at any time.
2. **Declarative logic**:
   Validation logic is described through code in a reusable schema.
3. **Structural mapping**:
   The field structure mirrors the data structure 1:1. It is not necessary to create the form model manually, but it is automatically derived from the data model.

## Setting up the Data Model

The first step in creating a Signal Form is to define our data model.
For this blog post, we will create a user registration form.
A TypeScript interface defines all the fields we need:
New users can provide name and age, multiple email addresses, and choose whether to subscribe to a newsletter via a checkbox.
Finally, they must agree to the terms and conditions.

```typescript
export interface RegisterFormData {
  username: string;
  age: number;
  email: string[];
  newsletter: boolean;
  agreeToTermsAndConditions: boolean;
}
```

Next, we create a signal property containing our initial form state.
In this example, we keep the `initialState` as a separate constant, so we can re-use it later for resetting the form data after submission.
Of course, it is also possible to define the initial state directly inlined when creating the signal.

```typescript
const initialState: RegisterFormData = {
  username: '',
  age: 18,
  email: [''],
  newsletter: false,
  agreeToTermsAndConditions: false,
};

@Component({ /* ... */ })
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
}
```

This signal serves as our single source of truth for all form data.
It remains reactive and automatically synchronizes with any changes made through the form fields.

## Creating the Field Structure

Now that we have our data model defined, the next step is to create the field structure that connects our data to the form.
Angular provides a `form()` function to create a field tree that derives its structure from the data.
The result is a `FieldTree` object that mirrors our data structure and maintains metadata for each field node.

```typescript
import { form } from '@angular/forms/signals';
// ...
@Component({ /* ... */ })
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(this.registrationModel);
}
```

### Accessing Field Properties

This form model structure allows us to navigate through our form field paths exactly like we would navigate through our data structure.
Each nested call returns another `FieldTree` that represents the corresponding part of the form.
We can call a `FieldTree` as a function to receive a `FieldState` object.
It provides several reactive properties that we can use in our templates and component logic:

```typescript
// FieldTree
const username = this.registrationForm.username;

// FieldState
const usernameState = this.registrationForm.username();

// Access field value
console.log(usernameState.value()); // current username value

// Access field states
console.log(usernameState.valid()); // validation status
console.log(usernameState.touched()); // interaction status
console.log(usernameState.errors()); // validation errors
```


| State             | Type                        | Description                                      |
| ----------------- | --------------------------- | ------------------------------------------------ |
| `value`           | `WritableSignal<TValue>`    | current value of this part of the field tree     |
| `valid`           | `Signal<boolean>`           | `true` if the field passes all validations       |
| `touched`         | `Signal<boolean>`           | `true` if the user has interacted with the field |
| `errors`          | `Signal<ValidationError[]>` | array of validation errors                       |
| `pending`         | `Signal<boolean>`           | `true` if async validations are running          |
| `disabled`        | `Signal<boolean>`           | `true` if the field is disabled                  |
| `disabledReasons` | `Signal<string[]>`          | array of reasons about the disabled state        |
| `hidden`          | `Signal<boolean>`           | `true` if the field is semantically hidden       |

It is important to stay aware of the difference between `FieldTree` and `FieldState`:
`FieldTree` represents the structure of the form and allows us to navigate through the tree of fields.
`FieldState` provides the current state and value of a specific field.
Once we call a `FieldTree` as a function, we get a `FieldState` as the result.

## Connecting Fields to the Template

Now that we have our form structure in place, we need to connect it to our HTML template to create functional input fields with reactive data binding.
Signal Forms use the `FormField` directive to bind form fields to HTML input elements.
To use the directive, we need to import it first.
In our example, we also import `JsonPipe` so we can use it in our template to display the current form value.

```typescript
import { JsonPipe } from '@angular/common';
import { /* ... */, FormField } from '@angular/forms/signals';
// ...
@Component({
  selector: 'app-registration-form',
  imports: [FormField, JsonPipe],
  templateUrl: './registration-form.html',
})
export class RegistrationForm {
  // ...
}
```

The `FormField` directive works directly with all standard HTML form elements like `<input>`, `<textarea>`, and `<select>`.
Let's start with a basic template that connects some of our form fields: We apply the directive to the HTML element by using the `[formField]` property binding.
On the right side of the binding, we pass the corresponding `FieldTree` from our form structure.

```html
<form>
  <div>
    <label for="username">Username</label>
    <input id="username" type="text" [formField]="registrationForm.username" />
  </div>

  <div>
    <label for="age">Age</label>
    <input id="age" type="number" [formField]="registrationForm.age" />
  </div>

  <div>
    <label for="newsletter">Subscribe to newsletter</label>
    <input
      id="newsletter"
      type="checkbox"
      [formField]="registrationForm.newsletter"
    />
  </div>

  <button type="submit">Register</button>
</form>

<!-- Debug output to see current form data -->
<pre>{{ registrationModel() | json }}</pre>
<pre>{{ registrationForm().value() | json }}</pre>
```

We have now connected each input to its corresponding field in our form structure.
The `FormField` directive handles the two-way data binding automatically, keeping our data model synchronized with user input.
The form model automatically synchronizes with the data signal: To read the value, we can use the signal as well as the `FieldState` with its `value` property.

### Working with Arrays

For our email array, we need to handle dynamic addition and removal of fields:
The `registrationForm.email` field is an array we can iterate over using `@for()`.

```html
<!-- ... -->
<fieldset>
  <legend>
    E-mail Addresses
    <button type="button" (click)="addEmail()">+</button>
  </legend>
  <div>
    @for (emailField of registrationForm.email; track $index) {
    <div>
      <div role="group">
        <input
          type="email"
          [formField]="emailField"
          [aria-label]="'E-mail ' + $index"
        />
        <button type="button" (click)="removeEmail($index)">-</button>
      </div>
    </div>
    }
  </div>
</fieldset>
<!-- ... -->
```

We also add two buttons for adding and removing e-mail input fields.
In the corresponding methods, we access the `value` signal within the form model.
The signal's `update()` method allows us to to add or remove items on the `email` array.

Please keep in mind that changes to signal values must be done immutably.
Instead of directly manipulating the array, we always create a new array with the updated values.
This is why we use the spread syntax (`...`) to create a new array when adding an email and the `filter()` method to create a new array when removing an email.

```typescript
// ...
export class RegistrationForm {
  // ...
  protected addEmail(): void {
    this.registrationForm.email().value.update((items) => [...items, '']);
  }

  protected removeEmail(removeIndex: number): void {
    this.registrationForm.email().value.update((items) =>
      items.filter((_, index) => index !== removeIndex)
    );
  }
}
```

## Form Submission

Now that we have connected our form to the template, we want to submit the form data.
Signal Forms directly support this workflow.

To demonstrate this, we want to simulate a registration process that involves a fake asynchronous operation.
This service method returns a `Promise` that resolves after a two-second delay, simulating a network request.

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
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

### Defining the Submission Action

We define the submission action inline in the `form()` call.
The second argument is a validation schema – we use an empty `schema(() => {})` for now and will fill it with validation rules later.
The third argument accepts a `submission` config with an `action` callback.
This callback receives the form tree and can access the current form values via `form().value`.
This function must return a `Promise`, which is why we use the native `async`/`await`.
Once we called our service to send the data, we call our own `resetForm()` method: It resets the data signal to the initial state and also clears form states like `touched` by calling `reset()`.

```typescript
// ...
export class RegistrationForm {
  // ...
  readonly #registrationService = inject(RegistrationService);
  // ...
  protected readonly registrationForm = form(
    this.registrationModel,
    schema(() => { /* TODO Schema */ }),
    {
      submission: {
        action: async (form) => {
          await this.#registrationService.registerUser(form().value);
          console.log('Registration successful!');
          this.resetForm();
        },
      },
    }
  );

  protected resetForm() {
    this.registrationModel.set(initialState);
    this.registrationForm().reset();
  }
}
```

It is important to know that the submission action is only executed when the form is not in the state `invalid` (we will learn more about validation later on).
Also, once the form is submitted, it marks all form fields as `touched`, which is very helpful if we only show error messages related to a form field when a field has been touched.

With the logic defined, we need to trigger it.
Angular offers two ways to react to form submission: the `submit()` function and the `FormRoot` directive.


### The Manual Way: the `submit()` Function

We can trigger the submission action manually using the `submit()` function.
When a form is submitted, the `<form>` element emits the native `submit` event.
We can listen to this event with an event binding and call `submit()` in the handler method.

Additionally, we must prevent the default browser behavior: Without this step, the page would reload on form submission, and the Angular application would restart.
We return `false` from the handler to suppress this behavior.

```typescript
import { /* ... */, submit } from '@angular/forms/signals';

@Component({
  // ...
  template: `
    <form (submit)="submitForm()">
      <!-- ... -->
      <button type="submit">Register</button>
    </form>`
})
export class RegistrationForm {
  // ...
  protected readonly registrationForm = form(this.registrationModel, schema(() => {}), {
    submission: { action: async (form) => { /* ... */ } },
  });

  submitForm() {
    submit(this.registrationForm);
    return false;
  }
}
```


### The Elegant Way: the `FormRoot` Directive

All these manuel steps can be automated by using the `FormRoot` directive.
It is the recommended way to trigger form submission.
We import it from `@angular/forms/signals` and add it to the component's `imports` array.
By binding it to our form model with `[formRoot]="registrationForm"`, it automates the full submission process: It subscribes to the submit event, prevents default browser behavior (page reload), suppresses native validation (`novalidate`), and triggers the submission action defined in the form config.
There is no need for a separate method or manual `return false`.

```typescript
import { /* ... */, FormRoot } from '@angular/forms/signals';

@Component({
  // ...
  imports: [/* ... */, FormRoot],
  template: `
    <form [formRoot]="registrationForm">
      <!-- ... -->
      <button type="submit">Register</button>
    </form>`
})
export class RegistrationForm {
  // ...
  protected readonly registrationForm = form(this.registrationModel, schema(() => {}), {
    submission: { action: async (form) => { /* ... */ } },
  });
}
```


### Handling Submission State

To see how the submission state actually changes, we can use it in our template to provide better user feedback.
When submitting the form we can now see that the value of the `submitting()` signal switches to `true` as long as the form data is being submitted via our fake service.
After the asynchronous operation is complete, it switches back to `false`.

```html
<form [formRoot]="registrationForm">
  <!-- ... -->

  <button
    type="submit"
    [disabled]="registrationForm().submitting()"
    [aria-busy]="registrationForm().submitting()"
  >
    @if (registrationForm().submitting()) { Registering ... } @else { Register }
  </button>
</form>
```

## Basic Schema-Based Validation

One of the most powerful features of Signal Forms is schema-based validation.
Instead of defining validation rules directly on form controls (as it was usual with Reactive Forms), we now create a declarative schema that describes all validation rules for our form.
The interesting part is that this schema is written as code. It is not just a static configuration but can involve additional logic if needed.

In this first part of our article series, we will give you a very short introduction to schema-based validation.
The next part will cover more advanced and complex scenarios – so stay tuned!

### Creating a Basic Schema

Signal Forms use the `schema()` function to define validation rules.
Angular comes with some very common rules by default, such as `required` and `minLength`.
The provided `path` parameter allows us to navigate through the form structure and apply validation rules to specific fields.

```typescript
import {
  // ...
  schema,
  required,
  minLength,
} from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((path) => {
  required(path.username, { message: 'Username is required.' });
  minLength(path.username, 3, {
    message: 'A username must be at least 3 characters long.',
  });
  // ...
});
```

### Applying the Schema to our Form

To actually use the schema, we pass it as the second argument to the `form()` function, replacing the empty dummy schema we used before:

```typescript
// ...
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(
    this.registrationModel,
    registrationSchema, // NEW
    {
      submission: {
        action: async (form) => {
          // ...
        },
      },
    }
  );
  // ...
}
```

Now our form will automatically validate fields according to the rules defined in our schema.

It is not strictly necessary to define the schema in a separate variable.
However, this approach makes the schema independent and reusable.

### Built-in Validator Functions

Signal Forms provide several built-in validation functions:

| Validator                       | Description                                                 | Example                                    |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `required(path, opts)`          | Field must be filled. For boolean values, checks for `true` | `required(path.username)`                  |
| `minLength(path, length, opts)` | Minimum character count                                     | `minLength(path.username, 3)`              |
| `maxLength(path, length, opts)` | Maximum character count                                     | `maxLength(path.username, 10)`             |
| `min(path, value, opts)`        | Minimum numeric value                                       | `min(path.age, 18)`                        |
| `max(path, value, opts)`        | Maximum numeric value                                       | `max(path.age, 120)`                       |
| `email(path, opts)`             | Valid email address format                                  | `email(path.email)`                        |
| `pattern(path, regex, opts)`    | Regular expression match                                    | `pattern(path.username, /^[a-zA-Z0-9]+$/)` |

Each validator function accepts an optional `opts` parameter where you can specify a custom error message.
We can use this message later to display it in the component template.

A validation schema for our registration form could look like this:

```typescript
export const registrationSchema = schema<RegisterFormData>((path) => {
  // Username validation
  required(path.username, { message: 'Username is required.' });
  minLength(path.username, 3, {
    message: 'A username must be at least 3 characters long.',
  });
  maxLength(path.username, 12, {
    message: 'A username can be max. 12 characters long.',
  });

  // Age validation
  min(path.age, 18, { message: 'You must be >=18 years old.' });

  // Terms and conditions
  required(path.agreeToTermsAndConditions, {
    message: 'You must agree to the terms and conditions.',
  });
});
```

### Form-Level Validation State

Each part of the form field tree provides a `valid()` signal with validation state of all field validations below this field tree branch.
Practically, this means that we can check the overall form validity by calling `registrationForm().valid()`.

```html
<!-- ... -->
@if (!registrationForm().valid()) {
  <p>The form is invalid. Please correct the errors.</p>
}

<button type="submit" [aria-busy]="registrationForm().submitting()">
  @if (registrationForm().submitting()) {
    Registering ...
  } @else {
    Register
  }
</button>
<!-- ... -->
```

## Displaying Validation Errors

To display validation errors, we can access the `errors()` signal on each field.
It returns an array of `ValidationError` objects, each with a `kind` property that describes the type of error, e.g., `required` or `minLength`.
The object can also contain a `message` property with the error message defined in the schema.
These messages can be displayed directly in the template.

To make the error display reusable, we can create a dedicated component for it:
The component can receive any `FieldTree` and checks for its errors when the field is already marked as touched.
This is the case, when either the user has entered the field and left it or when the form is submitted which marks all form fields as `touched`.
It displays all errors related to the field by iterating over the `errors()` signal.

To get access to the `FieldState`, we have to call the `fieldRef` property twice: Once to get the `FieldTree` from the input signal, and a second time to get the `FieldState` with its reactive properties.

```typescript
import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Component({
  selector: 'app-form-error',
  template: `
    @let state = fieldRef()();
    @if (state.touched() && state.errors().length) {
      <ul>
        @for (error of state.errors(); track $index) {
          <li>{{ error.message }}</li>
        }
      </ul>
    }
  `,
})
export class FormError<T> {
  readonly fieldRef = input.required<FieldTree<T>>();
}
```

Now we can use this component in our form and pass any field to it.

```html
<label>
  Username
  <input type="text" [formField]="registrationForm.username" />
  <app-form-error [fieldRef]="registrationForm.username" />
</label>
```

We intentionally named the input `fieldRef` to avoid confusion with the `FormField` directive.
Whenever we use the `[formField]` binding, it applies the directive to a form element.
Since `<app-form-error>` is just a helper component, we cannot use the same name for the input property.

## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)

## What's Next?

Signal Forms provide a modern and powerful way to handle forms in Angular applications.
Getting started is straightforward and simple: Create a signal, derive the form structure and connect it to the template using the `FormField` directive.
With schema-based validation, we can define all validation rules in a clear and reusable way.

In this first part, we've covered the fundamentals of Signal Forms:

- Setting up data models and field structures
- Connecting forms to templates
- Basic form submission
- Schema-based validation with built-in validators
- Displaying validation errors

In **Part 2**, we'll dive deeper into advanced validation scenarios, including custom validation functions, cross-field validation, asynchronous validation, and handling server-side errors.

In **Part 3**, we'll dig into modularization and customization by using child forms and building custom UI controls that integrate seamlessly with Signal Forms. Also we'll have a look at how to provide a custom `SignalFormsConfig`.

In **Part 4**, we'll explore field metadata and we'll create a directive which adds accessibility features that help create more inclusive and user-friendly forms.

Ready to continue? Check out [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)!

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
