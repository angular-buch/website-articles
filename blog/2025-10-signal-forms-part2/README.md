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

This function takes a field array as first argument. The second argument is a validation schema which is applied to all children.
The schema callback provides access to the current item path. We can directly use this path and pass it into our `email()` validation function to validate each and every field in the array.

```ts
import { /* ... */, applyEach, email } from '@angular/forms/signals';

// ...
applyEach(fieldPath.email, (emailPath) => {
  email(emailPath, { message: 'E-Mail format is invalid' });
});
```

> `applyEach()` applies a validation schema to each item in an array field.

The validation messages will be displayed in the UI since we included our generic `FormError` component below each email input field.

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
The callback function provides access to the field state, represented as a `ChildFieldContext`. E.g. we can use the `value` signal to read the current value of the email array.

Since the value is a `string[]`, we can use `Array.some()` to check if at least one non-empty email address exists.
To produce an error, we use the `customError()` function to create a validation error object with a `kind` and a `message`.
If no error occurs, we return `undefined`.
The `message` is optional, but it is recommended to provide a user-friendly message that can be displayed in the UI later.

```typescript
import { /* ... */, validate, customError } from '@angular/forms/signals';

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


To display the error message, we add our `FormError` component below the `@for` loop that renders the email fields.

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

Our registration form should also include password fields: One for the password and one for confirmation.
For these two fields, we want to ensure that both values match.
First, we extend our data model and the initial state, so it includes a nested object holding password information.

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

We should also update our template and add two input fields of type `password`.
To display errors, we include the `FormError` component for each field as well as for the whole password group:
Errors can be assigned to individual fields (`pw1`) as well as to the whole group (`password`) as we will see later.

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

For validations that depend on multiple fields, Signal Forms provide a `validateTree()` function.
The `ChildFieldContext` passed to the callback gives access to the entire subtree, allowing us to compare values of different fields.
An interesting aspect of this function is that we can assign errors to any field within the subtree using the `fieldOf()` method.
We can also use the `valueOf()` method to access values of other fields in the tree.

```typescript
import { /* ... */, validateTree } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ...
  // Password confirmation validation
  validateTree(fieldPath.password, (ctx) => {
    return ctx.value().pw2 === ctx.value().pw1
      ? undefined
      : customError({
          field: ctx.fieldOf(fieldPath.password.pw2), // assign the error to the second password field
          kind: 'confirmationPassword',
          message: 'The entered password must match with the one specified in "Password" field',
        });
  });
});
```

> `validateTree()` defines custom validation logic for a group of related fields. It returns a validation error or `undefined` if the values are valid.


## Conditional Validation

Validations can also be applied conditionally based on the value of other fields.
In our registration form, we want to ensure that at least one newsletter topic is selected from the list.
However, this rule only applies if the user has opted in to receive the newsletter.
This is where `applyWhen()` comes into play!

This function takes a field path as the first argument. Since we want to take the whole form into account, we pass the root path.
The callback function in the second argument takes the field context and returns a boolean indicating whether the condition is met.
In this example, we take a look at the value of the `newsletter` checkbox and only apply the validation if it is `true`.
The third argument provides the actual validation schema that should be applied when the condition is met:
We use the `validate()` function to check if at least one topic is selected in the `newsletterTopics` array.

```typescript
import { /* ... */, applyWhen } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...
  // Only validate newsletter topics if user subscribed to newsletter
  applyWhen(
    fieldPath,
    (ctx) => ctx.value().newsletter,
    (fieldPathWhenTrue) => {
      validate(fieldPathWhenTrue.newsletterTopics, (ctx) =>
        !ctx.value().length
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

> `applyWhen()` conditionally applies a validation schema based on the value of a specified field.


## Asynchronous Validation

All previously shown validation functions were synchronous.
However, we can also perform asynchronous validation, like checking username availability on the server.
To simulate an asynchronous server call, we extend our `RegistrationService` with a `checkUserExists()` method that returns a `Promise`.
If the username is `johndoe`, we consider it taken, and the operation resolves to `true`

```typescript
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  checkUserExists(username: string) {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(username === 'johndoe');
      }, 500);
    });
  }
  // ...
}
```

To perform async validation, we can use the `validateAsync()` function in our schema.
The `params` property allows us to pick the required data from the field state, represented as a `ChildFieldContext` object.
The `factory` property is a function that creates a resource that actually performs the async operation
Finally, the `errors` property maps the value of the resource to a validation error, just as we did before with custom synchronous validations.

```typescript
import { /* ... */, resource } from '@angular/core';
import { /* ... */, validateAsync } from '@angular/forms/signals';

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
```

Whenever the value of the username field changes, the async validation is triggered. If we enter `johndoe`, the validation will fail, and the corresponding error message will be displayed.

> ℹ️ *Resource* is a new building block in Angular for managing asynchronous data with signals. Learn about the Resource API in our blog post: [Reactive Angular: Loading Data with the Resource API](https://angular.schule/blog/2025-05-resource-api)


For HTTP endpoints, you can also use the simpler `validateHttp()` function:

```typescript
validateHttp(fieldPath.username, {
  request: (ctx) => `/api/check?username=${ctx.value()}`,
  errors: (taken: boolean) =>
    taken ? customError({ kind: 'userExists', message: 'Username already taken' }) : undefined,
});
```

When an asynchronous validation is in progress, the field's `pending` state is set to `true`.
We can use this state to provide user feedback in the UI:

<!-- TODO: include this in the demo? -->
```html
@if (registrationForm.username().pending()) {
  <small>Checking availability ...</small>
}
```

## Field State Control

<!-- TODO FM -->

Signal Forms also provide functions to control field behavior beyond validation:

```typescript
import { /* ... */ disabled, readonly, hidden } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...

  // Disable newsletter topics when newsletter is unchecked
  disabled(fieldPath.newsletterTopics, (ctx) => !ctx.valueOf(fieldPath.newsletter));

  // Hide certain fields based on conditions
  hidden(fieldPath.someField, (ctx) => !ctx.valueOf(fieldPath.otherField));
});
```

## ARIA Support for Error Display

To properly mark fields as invalid in the UI, we should set the `aria-invalid` attribute on input elements.
This attribute should be set to `true` if the field has been touched and contains errors.

A helper method in our component can determine the appropriate value for this invalid state:

```typescript
export class RegistrationForm {
  // ...
  protected ariaInvalidState(field: FieldTree<unknown>): boolean | undefined {
    return field().touched() ? field().errors().length > 0 : undefined;
  }
  // ...
}
```

In our template, we can now use a `[ariaInvalid]` binding on the input elements to reflect the invalid state:

```html
<label
  >Username
  <input
    type="text"
    [control]="registrationForm.username"
    [ariaInvalid]="ariaInvalidState(registrationForm.username)"
  />
  <app-form-error [field]="registrationForm.username" />
</label>
```

This code snippet only shows the username field, but you should apply the same logic to all input fields in your form.


## Handling Server-Side Errors

While client-side validation catches most errors before submission, server-side validation errors can still occur during form processing.
Signal Forms provide an elegant way to handle these errors and display them to users with proper field-level feedback.
When using the `submit()` function, we can return an array of validation errors from the submission callback to assign them to specific fields or to the form itself.

The helper type `WithField` ensures that each error contains a reference to the field it belongs to.

```typescript
import { /* ... */, WithField, CustomValidationError, ValidationError } from '@angular/forms/signals';

export class RegistrationForm {
  // ...

  protected async submit(e: Event) {
    e.preventDefault();

    await submit(this.registrationForm, async (form) => {
      const errors: WithField<CustomValidationError | ValidationError>[] = [];

      try {
        await this.#registrationService.registerUser(form().value);
        console.log('Registration successful!');
        this.reset();
      } catch (e) {
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

In this second part, we've explored advanced validation techniques and schema patterns in Signal Forms, including:

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
