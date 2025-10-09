---
title: "Angular Signal Forms Part 1: Getting Started with the Basics"
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
   Form data is managed as a Signal that we create, control, and can update directly at any time.
2. **Declarative logic**:
   Validation logic is described through code in a reusable schema.
3. **Structural mapping**:
   The field structure mirrors the data structure 1:1. It is not necessary to create the form model manually but it is derived from the data model.

## Setting up the Data Model

The first step in creating a Signal Form is defining our data model.
For this blig post, we will create a user registration form.
A TypeScript interface defines all the fields we need:

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
In this example, we keep the `initialState` as a separate constant before, so we can re-use it later for resetting the form data after submission.
Of course, it is also possible to define the initial state directly when creating the Signal.

```typescript
const initialState: RegisterFormData = {
  username: '',
  age: 18,
  email: [''],
  newsletter: false,
  agreeToTermsAndConditions: false,
};

@Component({
  /* ... */
})
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
}
```

This Signal serves as our single source of truth for form data.
It remains reactive and synchronizes automatically with any changes made through the form fields.

## Creating the Field Structure

Now that we have our data model defined, the next step is to create the field structure that connects our data model to the form.
Angular supplies a `form()` function to create a field tree that derives its structure from the data.
The result is a `Field` object that mirrors our data structure and maintains metadata for each field node.

```typescript
import { form } from '@angular/forms/signals';
// ...
@Component({
  /* ... */
})
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(this.registrationModel);
}
```

This form model structure allows us to navigate through our form field paths exactly like we would navigate through our data structure.

### Accessing Field Properties

Once we have our form structure, we can access individual fields and their reactive properties:

```typescript
// Access field value
console.log(this.registrationForm.username().value()); // current username value

// Access field states
console.log(this.registrationForm.username().valid()); // validation status
console.log(this.registrationForm.username().touched()); // interaction status
console.log(this.registrationForm.username().errors()); // validation errors
```

We can call each property as a function to receive a `FieldState` object.
It provides several reactive properties that we can use in our templates and component logic:

| State             | Type                        | Description                                      |
| ----------------- | --------------------------- | ------------------------------------------------ |
| `value`           | `Signal<T>`                 | current value of this part of the field tree     |
| `valid`           | `Signal<boolean>`           | `true` if the field passes all validations       |
| `touched`         | `Signal<boolean>`           | `true` if the user has interacted with the field |
| `errors`          | `Signal<ValidationError[]>` | array of validation errors                       |
| `pending`         | `Signal<boolean>`           | `true` if async validations are running          |
| `disabled`        | `Signal<boolean>`           | `true` if the field is disabled                  |
| `disabledReasons` | `Signal<string[]>`          | array of reasons about the disabled state        |
| `hidden`          | `Signal<boolean>`           | `true` if the field is semantically hidden       |

It is important to stay aware of the diifference between `Field` and `FieldState`.
While `Field` represents the structure and metadata of the form, `FieldState` provides the current state and value of a specific field.


## Connecting Fields to the Template

Now that we have our form structure in place, we need to connect it to our HTML template to create functional input fields with reactive data binding.
Signal Forms use the `Control` directive to bind form fields to HTML input elements.
To use the directive, we need to import it first.
In our example, we also import `JsonPipe` so we can use it in our template to display the current form value.

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
  // ...
}
```

The `Control` directive works directly with all standard HTML form elements like `<input>`, `<textarea>`, and `<select>`.
Let's start with a basic template that connects some of our form fields: We apply the directive to the HTML element by using the `[control]` property binding. On the right side of the binding, we pass the corresponding field from our form structure.

Notice, that we also use the native form attribute `novalidate`: It disables the native browser field validation.
We will handle validation later by using a form schema.

```html
<form (submit)="submitForm($event)" novalidate>
  <div>
    <label for="username">Username</label>
    <input id="username" type="text" [control]="registrationForm.username" />
  </div>

  <div>
    <label for="age">Age</label>
    <input id="age" type="number" [control]="registrationForm.age" />
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
<pre>{{ registrationForm().value() | json }}</pre>
```

We have now connected each input to its corresponding field in our form structure.
The `Control` directive handles the two-way data binding automatically, keeping our data model synchronized with user input.
The form model automatically synchronizes with the data signal: To read the value, we can use the signal as well as the `FieldState` with its `value` property.

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
In the corresponding methods, we access the `value` signal within the form model.
The signal's `update()` method allows us to to add or remove items on `email` array
We call `e.preventDefault()`, to not actually execute the default form submition event and prevent bubbling the event.

please keep in mind that changes to signal values must be done immutably.
Instead of directly manipulating the array, we always create a new array with the updated values.
This is why we use the spread operator (`...`) to create a new array when adding an email and the `filter()` method to create a new array when removing an email.

```typescript
// ...
export class RegistrationForm {
  // ...
  protected addEmail(): void {
    this.registrationForm.email.value.update((items) => [...items, '']);
  }

  protected removeEmail(removeIndex: number): void {
    this.registrationForm.email.value.update((items) =>
      items.filter((_, index) => index !== removeIndex)
    );
  }
}
```


## Basic Form Submission

Now that we have connected our form to the template, we want to submit the form data.
Signal Forms provide two approaches for handling form submission:
Basic synchronous submission and the more powerful `submit()` function for asynchronous operations.

All approaches start with a form submission event handler: In the template, we already used the `(submit)` event binding on the `<form>` element.
It is always necessary to prevent the default form submission behavior by calling `e.preventDefault()` in our `submitForm()` method.

### Simple Synchronous Submission

For basic cases where you want to process form data synchronously, you can directly access the current form values:

```typescript
// ...
export class RegistrationForm {
  // ...
  protected submitForm(e: Event) {
    e.preventDefault();

    // Access current form data
    const formData = this.registrationModel();
    console.log('Form submitted:', formData);
  }
}
```

Since our data model signal is always kept in sync with the form fields, we can access the current form state at any time using `this.registrationModel()`.
It is also possible to access the form data via `this.registrationForm().value()`, which provides the same result.


### Using the Signal Forms `submit()` Function

For more complex scenarios involving asynchronous operations, loading states, and error handling, Signal Forms provide a dedicated `submit()` function.
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

Back in the form component, we extend our `submitForm()` method to use the service.
Angular's `submit()` function takes care of managing the submission state, including setting the `submitting` state to `true` during the operation and resetting it afterward.
To handle the actual submission, it accepts a callback function where we can perform our asynchronous logic.
Once finished, we call our own `resetForm()` method: It resets the data signal to the initial state and also clears form states like `touched` by calling `reset()`.

```typescript
// ...
import { /* ... */, submit } from '@angular/forms/signals';

export class RegistrationForm {
  // ...
  readonly #registrationService = inject(RegistrationService);
  // ...
  protected async submitForm(e: Event) {
    e.preventDefault();

    await submit(this.registrationForm, async (form) => {
      await this.#registrationService.registerUser(form().value());
      console.log('Registration successful!');
      this.resetForm();
    });
  }

  protected resetForm() {
    this.registrationModel.set(initialState);
    this.registrationForm().reset();
  }
}
```

### Handling Submission State

To see how the submission state actually changes, we can use it in our template to provide better user feedback.
When submitting the form we can now see that the value of the `submitting()` signal switches to `true` as long as the form data is being submitted via our fake service.
After the asynchronous operation is complete, it switches back to `false`.

```html
<form (submit)="submitForm($event)">
  <!-- ... -->

  <button
    type="submit"
    [disabled]="registrationForm().submitting()"
    [attr.aria-busy]="registrationForm().submitting()"
  >
    @if (registrationForm().submitting()) { Registering ... } @else { Register }
  </button>
</form>
```

## Basic Schema-Based Validation

One of the most powerful features of Signal Forms is schema-based validation.
Instead of defining validation rules directly on form controls (as it was usual with Reactive Forms), we now create a declarative schema that describes all validation rules for our form.
The interesting part is that this schema is written as code. It is not just a static configuration but can involve additional logic if needed.

In this first part of our article series, we will give you a very short introduction to it.
The next part will cover more advanced and complex scenarios – so stay tuned!

### Creating a Basic Schema

Signal Forms use the `schema()` function to define validation rules.
Angular comes with some very common rules by default, such as `required` and `minLength`.

```typescript
import {
  // ...
  schema,
  required,
  minLength,
  maxLength,
  min,
} from '@angular/forms/signals';
// ...
export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  required(fieldPath.username, { message: 'Username is required' });
  minLength(fieldPath.username, 3, {
    message: 'A username must be at least 3 characters long',
  });
  // ...
});
// ...
```

### Applying the Schema to our Form

To use the schema, we pass it as the second parameter to the `form()` function:

```typescript
// ...
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
  protected readonly registrationForm = form(
    this.registrationModel,
    registrationSchema
  );
  // ...
}
```

Now our form will automatically validate fields according to the rules defined in our schema.

It is not strictly necessary to define the schema in a separate variable.
However, this approach makes the schema independent and reusable.

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

Each part of the form field tree provides a `valid()` signal with validation state of all field validations below this branch.
Practically, this means that we can check the overall form validity by calling `registrationForm().valid()`.

```html
<!-- ... -->
@if (!registrationForm().valid()) {
  <p>The form is invalid. Please correct the errors.</p>
}

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

To display validation errors, we can access the `errors()` signal on each field.
It returns an array of `ValidationError` objects, each with a `kind` property that describes the type of error, e.g., `required` or `minLength`.
The object can also contain a `message` property with the error message defined in the schema.
These messages can be displayed directly in the template.

To make the error display reusable, we can create a dedicated component for it:
The component can receive any field and checks for its errors when the field is already marked as touched.
It displays all errors related to the field by iterating over the `errors()` signal.

```typescript
import { Component, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({
  selector: 'app-form-error',
  template: `
    @if (field().touched() && field().errors().length) {
    <small>
      @for (error of field().errors(); track $index) {
      {{ error.message }}
      @if (!$last) {
      <br />
      } }
    </small>
    }
  `,
})
export class FormError<T> {
  readonly field = input.required<FieldState<T>>();
}
```

Now we can use this component in our form and pass any field to it.

```html
<label>
  Username
  <input type="text" [control]="registrationForm.username" />
  <app-form-error [field]="registrationForm.username" />
</label>
```



## What's Next?

Signal Forms provide a modern and powerful way to handle forms in Angular applications.
Getting started is straightforward and simple: Create a signal, derive the form structure and connect it to the template using the `Control` directive.
With schema-based validation, we can define all validation rules in a clear and reusable way.

In this first part, we've covered the fundamentals of Signal Forms:

- Setting up data models and field structures
- Connecting forms to templates
- Basic form submission
- Schema-based validation with built-in validators
- Displaying validation errors

In **Part 2**, we'll dive deeper into advanced validation scenarios, including custom validation functions, cross-field validation, asynchronous validation, and handling server-side errors.

In **Part 3**, we'll dig into modularization and customization by using child forms and building custom UI controls that integrate seamlessly with Signal Forms.

Once we published the new parts of this series they will be linked here.

<!--
Ready to continue? Check out [Part 2: Advanced Validation and Schema Patterns](../2025-10-signal-forms-part2)!
-->
