---
title: 'Building a Registration Form with Angular Signal Forms: From Data Model to Validation'
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
In this tutorial, we'll build a complete registration form step by step, exploring the key concepts and features of Signal Forms along the way.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [What Makes Signal Forms Different](#what-makes-signal-forms-different)
- [Setting up the Data Model](#setting-up-the-data-model)
- [Creating the Field Structure](#creating-the-field-structure)
  - [Accessing Field Properties](#accessing-field-properties)
  - [Navigating Nested Structures](#navigating-nested-structures)
- [Connecting Fields to the Template](#connecting-fields-to-the-template)
  - [Working with Arrays](#working-with-arrays)
- [Basic Form Submission](#basic-form-submission)
  - [Simple Synchronous Submission](#simple-synchronous-submission)
  - [Using the Signal Forms `submit()` Function](#using-the-signal-forms-submit-function)
  - [Handling Submission States](#handling-submission-states)
- [Schema-Based Validation](#schema-based-validation)
  - [Creating a Basic Schema](#creating-a-basic-schema)
  - [Applying the Schema to our Form](#applying-the-schema-to-our-form)
  - [Built-in Validator Functions](#built-in-validator-functions)
  - [Form-Level Validation State](#form-level-validation-state)
  - [Validating Array Fields](#validating-array-fields)
- [Advanced Validation Scenarios](#advanced-validation-scenarios)
  - [Custom Validation Functions](#custom-validation-functions)
  - [Cross-Field Validation](#cross-field-validation)
  - [Conditional Validation](#conditional-validation)
  - [Asynchronous Validation](#asynchronous-validation)
  - [Field State Control](#field-state-control)
  - [Displaying Validation Errors in Templates](#displaying-validation-errors-in-templates)
- [Handling Server-Side Errors](#handling-server-side-errors)
- [Integrate a child form](#integrate-a-child-form)
  - [Creating a Child Form Component](#creating-a-child-form-component)
  - [Integrating the Child Form](#integrating-the-child-form)
- [Create your own FormUiControl](#create-your-own-formuicontrol)
  - [Understanding FormUiControl](#understanding-formuicontrol)
  - [Creating a Custom Multiselect Component](#creating-a-custom-multiselect-component)
  - [Using the Custom Component](#using-the-custom-component)

---

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
  identity: GenderIdentity;
  age: number;
  birthday: Date;
  password: { pw1: string; pw2: string };
  email: string[];
  newsletter: boolean;
  newsletterTopics: string[];
  agreeToTermsAndConditions: boolean;
}
```

Next, we create a Signal containing our initial form state.
We keep the `initialState` as a separate constant before, so we can re-use it later for resetting the form data after submission.

```typescript
const initialState: RegisterFormData = {
  username: '',
  identity: {
    gender: '',
    salutation: '',
    pronoun: '',
  },
  age: 18,
  birthday: new Date(),
  password: { pw1: '', pw2: '' },
  email: [''],
  newsletter: false,
  newsletterTopics: ['Angular'],
  agreeToTermsAndConditions: false,
};

@Component({ /* .. */ })
export class RegistrationForm {
  protected readonly registrationModel = signal<RegisterFormData>(initialState);
}
```

This Signal serves as our single source of truth for form data.
It remains reactive and synchronizes automatically with any changes made through the form fields.

---

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

### Navigating Nested Structures

Our registration form includes nested objects (like the `password` group) and arrays (like the `email` array).
The key here is, that our form structure maintains the same shape as our data model.
Objects and arrays in the structure are of type `Field`, while only the leaf properties become function calls that return `FieldState` objects.

```typescript
// Access nested object fields
this.registrationForm.password.pw1().value(); // first password field
this.registrationForm.password.pw2().value(); // confirmation password field

// Access array fields
this.registrationForm.email[0]().value(); // first email address
this.registrationForm.email[1]().value(); // second email address (if exists)
```

---

## Connecting Fields to the Template

Now that we have our form structure in place, we need to connect it to our HTML template to create functional input fields with reactive data binding.
Signal Forms use the `Control` directive to bind form fields to HTML input elements or [custom components implementing `FormUiControl`](#creating-a-custom-multiselect-component).
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

Give it a try!
Once you change a value of the `<input>` fields, you can see, the output of the value of our data model below the form immediately changes.

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
    // OR: this.registrationModel.email.update((items) => [...items, '']);
    e.preventDefault();
    return false;
  }

  protected removeEmail(removeIndex: number): void {
    this.registrationForm.email.value.update((items) => items.filter((_, index) => index !== removeIndex));
    // OR: this.registrationModel.email.update((items) => items.filter((_, index) => index !== removeIndex));
  }
}
```

> You may noticed the comments in the code snippet before:
> Since the data models values are always in sync with the form models structure, we could also directly manipulate our data model.

---

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

Again:
Since our data model Signal is always kept in sync with the form fields, we can access the current form state at any time using `this.registrationModel()`.

### Using the Signal Forms `submit()` Function

For more complex scenarios involving asynchronous operations, loading states, and error handling, Signal Forms provide a dedicated `submit()` function.
First, let's create a simple service to simulate handling the registration process.

This service simulates a POST call to an external API and resolves after a few seconds to demonstrate the submission state handling:
Also, the service intentionally fails the first two attempts to demonstrate error handling, then succeeds on the third attempt.
The 2-second delay simulates network latency (which is veeeeery pessimistic 😉) and allows us to see the submission state in action.

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private submitErrorCnt = 0;

  registerUser(registrationData: Record<string, any>) {
    this.submitErrorCnt++;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.submitErrorCnt < 3) {
          reject();
        } else {
          resolve(registrationData);
        }
      }, 2000);
    });
  }
}
```

Now let's enhance our `registerUser` function in the `RegistrationForm` to use this service.
We use the imported `submit()` function from angular and we are passing the form model as well as a callback which is executed immediately.
The `submit()` function will set the `submitting()` signal for the form to `true` during submission.

Now, we inject the service we created before and we call `registerUser()` on it alongside with the form data within the `submit()` callback.
We surround the async call with a `try`/`catch`, to catch the intentional implement failures.
When the call fails, we dont want to reset the form data and states, so we can retry submitting the data.
Otherwise, we call our method `reset()` which resets the data model to the initial state and calls `reset()` on the form model to reset also the form state.
Once teh callback is processed, the `submitting()` signal of the form is set to `false` automatically by the `submit()` function.

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
      try {
        await this.registrationService.registerUser(form().value);
        console.log('Registration successful!');
        this.reset();
      } catch (error) {
        console.error('Registration failed:', error);
        // Error handling will be covered in later sections
      }
    });
  }

  protected reset() {
    this.registrationModel.set(initialState);
    this.registrationForm().reset();
  }
}
```

### Handling Submission States

We can use the submission state in our template to provide better user feedback.
We use it to disable the submit button during processing and setting an appropriate ARIA attributes for accessibility.

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

---

## Schema-Based Validation

One of the most powerful features of Signal Forms is schema-based validation.
Instead of defining validation rules directly on form controls, we create a declarative schema that describes all validation rules for our form.
This approach separates validation logic from the form structure and makes it easier to maintain and test.

### Creating a Basic Schema

Signal Forms use the `schema()` function to define validation rules.
The schema function receives a callback that gets called for every field path in our form structure:

```typescript
import {
  // ...
  schema,
  required,
  minLength,
  maxLength
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

> Note, that we passe an object with `message` always as the last parameter.
> This is optional but it allows us to define an error message right here in the schema which can be used later to display a proper error message in place.

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

The form itself also provides validation state that aggregates all field validations.
With this, we can extend our disable condition for the submit button, so it is disabled when the form is invalid or currently submitting.

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

### Validating Array Fields

For array fields like our email list, we can use `applyEach()` to apply validation rules to each item:
This function applies the email validation to each item in the email array, while the `validate()` function ensures at least one email is provided.

```typescript
import { applyEach, email } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Validate each email in the array
  applyEach(fieldPath.email, (emailPath) => {
    email(emailPath, { message: 'E-Mail format is invalid' });
  });

  // Also validate that at least one email is provided
  validate(fieldPath.email, ({ value }) =>
    !value().some((e) => e)
      ? customError({
          kind: 'atLeastOneEmail',
          message: 'At least one E-Mail address must be added',
        })
      : undefined
  );
});
```

---

## Advanced Validation Scenarios

Beyond basic field validation, Signal Forms support several advanced validation patterns that are common in real-world applications.

### Custom Validation Functions

Sometimes the built-in validators aren't sufficient for your needs.

Signal Forms allow you to create custom validation logic using the `validate()` function.
In our example, we want to ensure, that at least one email is entered.

The `validate()` function receives the field state and should return either `undefined` (validation passed) or an error.
For creating the error properly, we use the `customError()` function.
We have to define a `kind`, which is essentially the key, for the error and it helps us to identify the error kind, when checking for it (e. g. when we ant to display the error in the template).
The message is optional and like for all validation functions we can define it for showing it later in the UI.

In our example we are passing the `email` field path and with this, `value` is of type `string[]` since we iterate over an array of emails.
We check if at least one of the items has a value.

```typescript
import { /* ... */ validate, customError } from '@angular/forms/signals';
// ...

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Custom validation for password strength
  validate(fieldPath.email, ({ value }) =>
    !value().some((e) => e)
      ? customError({
          kind: 'atLeastOneEmail',
          message: 'At least one E-Mail address must be added',
        })
      : undefined
  );
});
```

### Cross-Field Validation

For validations that depends on multiple fields (like password confirmation), use `validateTree()`.
We pass a subpath of our form model tree into it and in the callback we receive two functions:

- `valueOf()` - to access values of fields within the tree
- `fieldOf()` - to get the field path for error assignment

With this, we can implement a validation based on multiple fields.
In our example we want to check if the password and the password confirmation values for equality.
To get the values, we use the `valueOf()` function of the callback parameter.
If the values are not equal, we return an error created again by using the `customError()` function.
We set the property `field` within the error to the field we want to assign the error.
To get the field based on the path, we use the `fieldOf()` function within the callback.

```typescript
import { /* ... */ validateTree } from '@angular/forms/signals';
// ...
export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Password confirmation validation
  validateTree(fieldPath.password, ({ valueOf, fieldOf }) => {
    const password = valueOf(fieldPath.password.pw1);
    const confirmation = valueOf(fieldPath.password.pw2);

    if (confirmation && password !== confirmation) {
      return customError({
        field: fieldOf(fieldPath.password.pw2), // assign error to confirmation field
        kind: 'passwordMismatch',
        message: 'The entered password must match the one specified in "Password" field',
      });
    }

    return undefined;
  });
});
// ...
```

### Conditional Validation

The last conditional validation function is `applyWhen()`.
We can apply validation rules only when certain conditions are met.

In our example, we want the validation for the selection of an newsletter topic to apply only when the newsletter checkbox is checked.
Within we validate, that at least one topic has been selected.

> We will implement the topic selection later by creating a custom UI control.

```typescript
import { /* ... */ applyWhen } from '@angular/forms/signals';
// ...
export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Only validate newsletter topics if user subscribed to newsletter
  applyWhen(
    fieldPath,
    ({ value }) => value().newsletter,
    (fieldPathWhenTrue) => {
      validate(fieldPathWhenTrue.newsletterTopics, ({ value }) =>
        !value().length
          ? customError({
              kind: 'noTopicSelected',
              message: 'Select at least one newsletter topic',
            })
          : undefined
      );
    }
  );
});
```

### Asynchronous Validation

For validation that requires asynchronous calls (like checking username availability), use `validateAsync()` or `validateHttp()`.
The async validation only runs after synchronous validation passes.
Also, when the async validation runs, the field's `pending()` signal is set to `true` during execution.

To show this, let use create a new method `checkUserExists()` in our `RegistrationService` first.
The method should simulate an asynchronous call which returns if a user exists or not.
In our case we simulate that the username `johndoe` already exists.
We resolve the promise after 500ms to simulate the async behavior.

```typescript
checkUserExists(username: string) {
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      resolve(username === 'johndoe');
    }, 500);
  });
}
```

Now we can use the service alongside with the `validateAsync()` function in our schema.
As the first parameter, we pass the field path, the second is an object with three properties:

- `params`: a function that receives the field value and returns all parameters used by the `factory` function
- `factory`: a function that receives the parameters from `params` and which returns a `ResourceRef`
- `errors`: a function that receives the result from the `factory` function and returns `undefined`, if validation passer or one or multiple errors if not.

The factory function must return a `resource()` ([Resource was introduced with Angular 19.0.0](https://angular.dev/guide/signals/resource)). Within this Resource, we call our previously injected service and call `checkUserExists()` with the parameter that holds the value of the username field.
We process the result in the function assigned to the `errors` property.
Here we return a `customError()`, if the user already exists.

```typescript
import { /* ... */ resource } from '@angular/core';
import { /* ... */ validateAsync } from '@angular/forms/signals';
// ...
export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Check username availability on the server
  validateAsync(fieldPath.username, {
    // Reactive parameters for the async operation
    params: ({ value }) => value(),

    // Factory creating a resource for the async call
    factory: (params) => {
      const registrationService = inject(RegistrationService);
      return resource({
        params,
        loader: async ({ params }) => {
          return await registrationService.checkUserExists(params);
        },
      });
    },

    // Map the result to validation errors
    errors: (result) => {
      return result
        ? customError({
            kind: 'userExists',
            message: 'The username you entered was already taken',
          })
        : undefined;
    },
  });
});
// ...
```

If we directly want to call an HTTP endpoint, we could also use the `validateHttp()` function which simplifies the async check a lot.
This is basically a wrapper of the [`httpResource()` which was introduced with Angular 19.2.0](https://angular.dev/guide/http/http-resource).

```typescript
validateHttp(fieldPath.username, {
  request: ({ value }) => `/api/check?username=${value()}`, // Assumption: 200 OK with "true", if username already exists
  errors: (taken: boolean) =>
    taken ? customError({ kind: 'userExists', message: 'The username you entered was already taken' }) : undefined,
});
```

### Field State Control

Signal Forms also provide a few function to control field behavior beyond validation.
We will see some of them in later examples.

```typescript
// Mark a field as disabled
disabled(fieldPath.myField, ({ valueOf }) => !valueOf(fieldPath.otherField()));

// Make a field read-only based on conditions
readonly(fieldPath.myField, ({ valueOf }) => valueOf(fieldPath.otherField()));

// Hide fields conditionally (sets hidden signal, doesn't remove from DOM)
hidden(fieldPath.myField, ({ valueOf }) => valueOf(fieldPath.otherField()));
```

### Displaying Validation Errors in Templates

Once we have validation rules in place, we can display error messages in our templates.
For better reusability and consistency, let's create a dedicated component to handle error display:
The component should simply show all error messages related to a control.

```typescript
import { Component, input } from '@angular/core';
import { ValidationError, WithOptionalField } from '@angular/forms/signals';

@Component({
  // ...
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

Now we can use this component throughout our forms, along with proper accessibility attributes.
First, let's add a helper method for accessibility:

```typescript
import { FormError } from '../form-error/form-error';
//
export class RegistrationForm {
  // ...

  protected ariaInvalidState(field: FieldState<string | boolean | number>): boolean | undefined {
    const errors = field.errors();
    if (!field.touched()) {
      return undefined;
    } else {
      return errors.length > 0 && field.touched();
    }
  }
}
```

The `ariaInvalidState()` method helps with accessibility by setting the `aria-invalid` attribute appropriately.
We return `undefined` if the field wasn't touched, so that we have initially no invalid state presented to the user, only when they've interacted with the field.

Now we can use both the error component and accessibility helper:

```html
<label>
  Username
  <input
    type="text"
    [control]="registrationForm.username"
    [attr.aria-invalid]="ariaInvalidState(registrationForm.username())"
  />
  @if (registrationForm.username().touched() && registrationForm.username().errors().length) {
    <app-form-error [errors]="registrationForm.username().errors()" />
  }
</label>
```

For more complex field structures like nested password fields, we can display errors at both field and group levels:

```html
<div>
  <label>
    Password
    <input
      type="password"
      [control]="registrationForm.password.pw1"
      [attr.aria-invalid]="ariaInvalidState(registrationForm.password.pw1())"
    />
    @if (registrationForm.password.pw1().touched() && registrationForm.password.pw1().errors().length) {
      <app-form-error [errors]="registrationForm.password.pw1().errors()" />
    }
  </label>

  <label>
    Password Confirmation
    <input
      type="password"
      [control]="registrationForm.password.pw2"
      [attr.aria-invalid]="ariaInvalidState(registrationForm.password.pw2())"
    />
    @if (registrationForm.password.pw2().touched() && registrationForm.password.pw2().errors().length) {
      <app-form-error [errors]="registrationForm.password.pw2().errors()" />
    }
  </label>

  <!-- Group-level errors (like password mismatch) -->
  @if (registrationForm.password().touched() && registrationForm.password().errors().length) {
    <app-form-error [errors]="registrationForm.password().errors()" />
  }
</div>
```

For array fields with dynamic elements, we can handle errors for individual items and the array as a whole:

```html
<fieldset>
  <legend>E-Mail Addresses</legend>
  <div>
    @for (emailField of registrationForm.email; track $index) {
      <div>
        <div role="group">
          <input
            type="email"
            [control]="emailField"
            [attr.aria-label]="'E-Mail ' + $index"
            [attr.aria-invalid]="ariaInvalidState(emailField())"
          />
          <button type="button" (click)="removeEmail($index)">-</button>
        </div>
        @if (emailField().touched() && emailField().errors().length) {
          <app-form-error [errors]="emailField().errors()" />
        }
      </div>
    }
  </div>

  <!-- Array-level errors (like "at least one email required") -->
  @if (!registrationForm.email[0] || (registrationForm.email[0]().touched() && registrationForm.email().errors().length)) {
    <app-form-error [errors]="registrationForm.email().errors()" />
  }

  <button type="button" (click)="addEmail($event)">+</button>
</fieldset>
```

Finally, we can display form-level errors (like server errors) that aren't tied to specific fields:

```html
<!-- Form-level errors -->
<app-form-error [errors]="registrationForm().errors()" />
```

---

## Handling Server-Side Errors

While client-side validation catches most errors before submission, server-side validation errors can still occur during form processing.
Signal Forms provide an elegant way to handle these errors and display them to users with proper field-level feedback.

When using the `submit()` function, you can return validation errors from the submission callback to assign them to specific fields or to the form itself.

```typescript
import { /* ... */ WithField, CustomValidationError, ValidationError } from '@angular/forms/signals';
// ...
export class RegistrationForm {
  // ...

  protected async submit(e: Event) {
    e?.preventDefault();

    await submit(this.registrationForm, async (form) => {
      const errors: WithField<CustomValidationError | ValidationError>[] = [];

      try {
        await this.registrationService.registerUser(form().value);
      } catch (e) {
        errors.push(
          customError({
            field: form,
            // OR: form.username
            error: {
              kind: 'serverError',
              message: 'There was an server error, please try again (should work after 3rd try)',
            },
          })
        );
      }

      setTimeout(() => this.reset(), 3000);
      return errors;
    });
  }
}
```

---

## Integrate a child form

As forms grow in complexity, it becomes essential to break them down into smaller, reusable components.
Signal Forms support child forms through the `apply()` function, which allows you to integrate separate form components with their own schemas.

This approach promotes modularity, reusability, and better maintainability of complex forms.

### Creating a Child Form Component

Let's create an identity form component that handles gender identity information based on your actual implementation.
Note, that we create a separate `identitySchema`.
This will mark the `salution` and the `pronoun` fields if the `gender` is set to diverse.

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

In the template we can check for the `hidden()` signal value to hide the `salution` and the `pronoun` if not `Diverse` has been selected for the gender.

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
We simply import the component and use it in the template first.

After this, we use the `apply()` function within our main schema.
This functions allows us to assign a schema to a field path of the form model tree.
We apply the `identitySchema` here.

```typescript
import { apply } from '@angular/forms/signals';
import { IdentityForm, identitySchema } from './identity-form/identity-form';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Apply the identity schema to the identity field
  apply(fieldPath.identity, identitySchema);
});

@Component({
  selector: 'app-registration-form',
  imports: [Control, JsonPipe, IdentityForm],
  template: `
    <form (submit)="submit($event)">
      <!-- ... -->
      <app-identity-form [identity]="registrationForm.identity"></app-identity-form>
      <!-- ... -->
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

---

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

Let's create a custom multiselect component for selecting newsletter topics based on your actual implementation:

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

And the corresponding template:

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

Key features of this implementation:

1. **FormValueControl Interface**: Implements the `FormValueControl<string[]>` interface which is specifically designed for value-based form controls
2. **Model Signal**: Uses `model()` for two-way binding with the form field
3. **Built-in Topics**: Has predefined topics (Angular, Vue, React) instead of configurable options
4. **Accessibility**: Uses `<details>` and `<summary>` elements for native accessibility support
5. **Disabled State Effect**: Automatically clears selections when the control becomes disabled
6. **Validation Support**: Accepts validation errors for display

### Using the Custom Component

Now you can use your custom multiselect component in forms:

```typescript
@Component({
  selector: 'app-registration-form',
  imports: [Control, JsonPipe, Multiselect],
  template: `
    <form (submit)="submit($event)">
      <!-- ...other form fields... -->

      <div>
        <app-multiselect
          [control]="registrationForm.newsletterTopics"
          label="Newsletter Topics"
        ></app-multiselect>
      </div>

      <button type="submit">Register</button>
    </form>
  `,
})
export class RegistrationForm {
  // ...
}
```
