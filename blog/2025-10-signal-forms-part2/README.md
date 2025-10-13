---
title: 'Angular Signal Forms Part 2: Advanced Validation and Schema Patterns'
author: Danny Koppenhagen and Ferdinand Malcher
mail: dannyferdigravatar@fmalcher.de # Gravatar
published: 2025-10-06
lastModified: 2025-10-06
keywords:
  - Angular
  - Signals
  - Forms
  - Angular 21
  - Signal Forms
  - Validation
  - Schema Validation
language: en
header: header-signalforms-part2.jpg
sticky: false
hidden: true
---

Beyond basic field validation (as we learned it in [Part 1](/blog/2025-10-signal-forms-part1/)), Signal Forms support several advanced validation patterns that are common in real-world applications.
In this part of our blog series about Signal Forms in Angular, we will explore this advanced validation scenarios and schema patterns that make Signal Forms truly powerful for complex form requirements.
We will learn about custom schema validation, cross-field validation, conditional validation, asynchronous validation, and how to handle server-side errors gracefully.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Array validation

Our first use case is to validate each email address in the `email` array.
We want to use the built-in `email` validator, but it must be applied to each and every field in the array.
This is where `applyEach()` comes into play:
It sets the validation rules for each item of the `email` array.

This function takes a field array as first argument and as a second again a schema which is applied to all children.
The schema is a simple function with the field path passed to it as an argument.
We can directly use this path and pass it into our `email()` validation function.
We can also pass a `message` like we did for the build-in error functions before.

```ts
import { /* ... */, applyEach, email } from '@angular/forms/signals';

// ...
applyEach(fieldPath.email, (emailPath) => {
  email(emailPath, { message: 'E-Mail format is invalid' });
});
```

> `applyEach()` applies a validation schema to each item in an array field.

The passed `message` is already be handled by our generic `FormError` component once we passing the field to it.
Therefore we use this component within the `@for` loop to show the message related to the input where the validation fails.

```html
<!-- ... -->
<fieldset>
  <legend>
    E-Mail Addresses
    <button type="button" (click)="addEmail()">+</button>
  </legend>
  <div>
    @for (emailField of registrationForm.email; track $index) {
    <div>
      <div role="group">
        <input
          type="email"
          [control]="emailField"
          [ariaLabel]="'E-Mail ' + $index"
          [ariaInvalid]="ariaInvalidState(emailField())"
        />
        <button type="button" (click)="removeEmail($index)">-</button>
      </div>
      <app-form-error [field]="emailField" />
    </div>
    }
  </div>
</fieldset>
<!-- ... -->
```

## Custom Validation Functions

Our second use case is to ensure that at least one email address is provided in the `email` array.
For this, we don't have to look at each individual email field, but rather at the array as a whole.
Using the `validate()` function, we can provide custom validation for a branch in the field tree, similar to how we used built-in validators before.
The callback function provides access to the field state, e.g. we can use the `value` signal to read the current value of the email array.

Since the value is a `string[]`, we can use `Array.some()` to check if at least one non-empty email address exists.
To produce an error, we use the `customError()` function to create a validation error object with a `kind` and a `message`.
If no error occurs, we return `undefined`.

```typescript
import { /* ... */ validate, customError } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // E-Mail validation
  validate(fieldPath.email, (ctx) =>
    !ctx.value().some((e) => e)
      ? customError({
          kind: 'atLeastOneEmail',
          message: 'At least one E-Mail address must be added',
        })
      : undefined
  );
});
```

> `validate()` defines custom validation logic for a specific field or branch in the form tree. It returns a validation error or `undefined` if the value is valid.

Again: We pass the optional message, to show an error message in the UI, once the validation fails.

```html
<!-- ... -->
<fieldset>
  <legend>
    E-Mail Addresses
    <button type="button" (click)="addEmail()">+</button>
  </legend>
  <div>
    @for (emailField of registrationForm.email; track $index) {
    <!-- ... -->
    }
  </div>
  <app-form-error [field]="registrationForm.email" />
</fieldset>
<!-- ... -->
```

## Cross-Field Validation

For the two password fields, we want to ensure that both values match.
For validations that depend on multiple fields (like password confirmation), use `validateTree()`:

Let's have a look at it and first extend our data model and the initial state, so it includes a nested object holding password information.

```typescript
export interface RegisterFormData {
  username: string;
  password: { pw1: string; pw2: string };
  // ...
}

const initialState: RegisterFormData = {
  username: '',
  password: { pw1: '', pw2: '' },
  // ...
};
```

Of course we should also update our template and add two input fields of type `password`.
The first field is the password a user chose and the second one is the confirmation.
We also include the `FormError` component directly to show the error messages once e implemented our rules.
We can have an error displayed for each individual field as well as for the whole group.

```html
<label>Password
  <input
    type="password"
    autocomplete
    [control]="registrationForm.password.pw1"
  />
  <app-form-error [field]="registrationForm.password.pw1" />
</label>
<label
  >Password Confirmation
  <input
    type="password"
    autocomplete
    [control]="registrationForm.password.pw2"
  />
  <app-form-error [field]="registrationForm.password.pw2" />
</label>
<app-form-error [field]="registrationForm.password" />
```

Now we implement the validation for it.
For validations that depend on multiple fields, we use `validateTree()`.
We pass a `FieldTree` to it.

<!-- HIER WEITER -->

```typescript
import { /* ... */ validateTree } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...

  // Password confirmation validation
  validateTree(fieldPath.password, (ctx) => {
    const password = ctx.valueOf(fieldPath.password.pw1);
    const confirmation = ctx.valueOf(fieldPath.password.pw2);

    if (confirmation && password !== confirmation) {
      return customError({
        field: ctx.fieldOf(fieldPath.password.pw2), // assign error to confirmation field
        kind: 'passwordMismatch',
        message: 'The entered password must match the one specified in "Password" field',
      });
    }

    return undefined;
  });
});
```

With `validateTree()`, you get access to:
- `valueOf()` - to access values of fields within the tree
- `fieldOf()` - to get the field path for error assignment

## Conditional Validation

Use `applyWhen()` to apply validation rules only when certain conditions are met:

```typescript
import { /* ... */ applyWhen } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...

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

## Asynchronous Validation

For validation that requires asynchronous calls (like checking username availability), use `validateAsync()`.

First, let's create a service method to simulate checking username availability:

```typescript
@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  checkUserExists(username: string) {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(username === 'johndoe');
      }, 500);
    });
  }

  registerUser(registrationData: Record<string, any>) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(registrationData);
      }, 2000);
    });
  }
}
```

Now we can use async validation in our schema:

```typescript
import { /* ... */ resource } from '@angular/core';
import { /* ... */ validateAsync } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...

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
```

For HTTP endpoints, you can also use the simpler `validateHttp()` function:

```typescript
validateHttp(fieldPath.username, {
  request: ({ value }) => `/api/check?username=${value()}`,
  errors: (taken: boolean) =>
    taken ? customError({ kind: 'userExists', message: 'Username already taken' }) : undefined,
});
```

## Field State Control

Signal Forms also provide functions to control field behavior beyond validation:

```typescript
import { /* ... */ disabled, readonly, hidden } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...

  // Disable newsletter topics when newsletter is unchecked
  disabled(fieldPath.newsletterTopics, ({ valueOf }) => !valueOf(fieldPath.newsletter));

  // Hide certain fields based on conditions
  hidden(fieldPath.someField, ({ valueOf }) => !valueOf(fieldPath.otherField));
});
```

## Enhanced Error Display

Let's improve our error display component to handle different error states:

```typescript
import { Component, input } from '@angular/core';
import { FieldState, ValidationError, WithOptionalField } from '@angular/forms/signals';

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

And create a helper method for accessibility:

```typescript
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

Now we can use both in our template with proper accessibility:

```html
<form (submit)="submit($event)">
  <div>
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
      @if (registrationForm.username().pending()) {
        <small>Checking availability...</small>
      }
    </label>
  </div>

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
  </div>

  <div>
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
  </div>

  <!-- Group-level errors (like password mismatch) -->
  @if (registrationForm.password().touched() && registrationForm.password().errors().length) {
    <app-form-error [errors]="registrationForm.password().errors()" />
  }

  <!-- Array field with validation -->
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

    <!-- Array-level errors -->
    @if (!registrationForm.email[0] || (registrationForm.email[0]().touched() && registrationForm.email().errors().length)) {
      <app-form-error [errors]="registrationForm.email().errors()" />
    }

    <button type="button" (click)="addEmail($event)">+</button>
  </fieldset>

  <button
    type="submit"
    [disabled]="!registrationForm().valid() || registrationForm().submitting()"
    [attr.aria-busy]="registrationForm().submitting()"
  >
    @if (registrationForm().submitting()) { Registering... } @else { Register }
  </button>
</form>
```

## Handling Server-Side Errors

While client-side validation catches most errors before submission, server-side validation errors can still occur during form processing.
Signal Forms provide an elegant way to handle these errors and display them to users with proper field-level feedback.

When using the `submit()` function, you can return validation errors from the submission callback to assign them to specific fields or to the form itself:

```typescript
import { /* ... */ WithField, CustomValidationError, ValidationError } from '@angular/forms/signals';

export class RegistrationForm {
  // ...

  protected async submit(e: Event) {
    e?.preventDefault();

    await submit(this.registrationForm, async (form) => {
      const errors: WithField<CustomValidationError | ValidationError>[] = [];

      try {
        await this.registrationService.registerUser(form().value);
        console.log('Registration successful!');
        this.reset();
      } catch (error) {
        // Add server-side errors
        errors.push(
          customError({
            field: form, // form-level error
            error: {
              kind: 'serverError',
              message: 'Registration failed. Please try again.',
            },
          })
        );

        // Or assign to specific field
        errors.push(
          customError({
            field: form.username,
            error: {
              kind: 'serverValidation',
              message: 'Username is not available.',
            },
          })
        );
      }

      return errors;
    });
  }
}
```

## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)




## What's Next?

In this second part, we've explored advanced validation patterns:

- Custom validation functions with `validate()`
- Cross-field validation with `validateTree()`
- Conditional validation with `applyWhen()`
- Asynchronous validation with `validateAsync()` and `validateHttp()`
- Field state control with `disabled()`, `readonly()`, and `hidden()`
- Enhanced error display with accessibility support
- Server-side error handling

In **Part 3**, we'll cover specialized topics that help you build complex, modular forms:

- Creating reusable child form components
- Building custom UI controls that integrate seamlessly with Signal Forms

<!--
Ready for the final part? Check out [Part 3: Child Forms and Custom UI Controls](../2025-10-signal-forms-part3/README.md)!
-->

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
