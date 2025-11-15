---
title: 'Angular Signal Forms Part 2: Advanced Validation and Schema Patterns'
author: Danny Koppenhagen and Ferdinand Malcher
mail: dannyferdigravatar@fmalcher.de # Gravatar
published: 2025-10-15
lastModified: 2025-11-15
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
---

Angular Signal Forms offer techniques for advanced validation scenarios and schema patterns, which makes them truly powerful for complex form requirements.
In this article, we will go beyond basic field validation as we covered it in [Part 1](/blog/2025-10-signal-forms-part1/)):
We will learn about custom schema validation, cross-field validation, conditional validation, asynchronous validation, and how to handle server-side errors gracefully.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- *Part 2: Advanced Validation and Schema Patterns* (this post)
- [Part 3: Child Forms and Custom UI Controls](/blog/2025-10-signal-forms-part3)


## ARIA Support for Error Display

First things first: When displaying validation errors in the UI, it's important to consider accessibility.
To properly mark fields as invalid in the UI, we should set the `aria-invalid` attribute on input elements.
This attribute should be set to `true` if the field has been touched and contains errors.
However, if the field hasn't been touched yet or if an asynchronous validation is still in progress, we should avoid setting this attribute to prevent unnecessary error announcements by screen readers.
This is why we return `undefined` in this case, which means the attribute won't be added to the element at all.

A helper method in our component can determine the appropriate value for this invalid state:

```typescript
export class RegistrationForm {
  // ...
  protected ariaInvalidState(field: FieldTree<unknown>): boolean | undefined {
    return field().touched() && !field().pending()
      ? field().errors().length > 0
      : undefined;
  }
  // ...
}
```

In our template, we can now use an `[aria-invalid]` binding on the input elements to reflect the invalid state:

```html
<label
  >Username
  <input
    type="text"
    [field]="registrationForm.username"
    [aria-invalid]="ariaInvalidState(registrationForm.username)"
  />
  <app-form-error [fieldRef]="registrationForm.username" />
</label>
```

This code snippet only shows the username field, but you should apply the same logic to all input fields in your form.


## Array validation

Our first use case is to validate each email address in the `email` array.
We want to use the built-in `email` validator, but it must be applied to each and every field in the array.
This is where `applyEach()` comes into play:
It sets the validation rules for each item of the `email` array.

This function takes a field array as first argument.
The second argument is a validation schema which is then applied to all children.
The schema callback provides access to the current item path.
We can directly use this path and pass it into our `email()` validation function to validate all fields individually.

```ts
import { /* ... */, applyEach, email } from '@angular/forms/signals';

// ...
applyEach(schemaPath.email, (emailPath) => {
  email(emailPath, { message: 'E-Mail format is invalid' });
});
```

> `applyEach()` applies a validation schema to each item in an array field.

The validation messages will be displayed in the UI since we included our generic `FormError` component below each email input field. We developed this component in Part 1 of this blog series.

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
          [field]="emailField"
          [aria-label]="'E-Mail ' + $index"
          [aria-invalid]="ariaInvalidState(emailField)"
        />
        <button type="button" (click)="removeEmail($index)">-</button>
      </div>
      <app-form-error [fieldRef]="emailField" />
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
The callback function provides access to the field state, represented as a `ChildFieldContext`.
This object can be used to access the `value` signal and read the current value of the email array.

Since the value is a `string[]`, we can use `Array.some()` to check if at least one non-empty email address exists.
To produce an error, we return a validation error object with a `kind` and a `message`.
If no error occurs, we return `undefined`.
The `message` is optional, but it is recommended to provide a user-friendly message that can be displayed in the UI later.

```typescript
import { /* ... */, validate } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((schemaPath) => {
  // ...
  // E-Mail validation
  validate(schemaPath.email, (ctx) =>
    !ctx.value().some((e) => e)
      ? {
          kind: 'atLeastOneEmail',
          message: 'At least one E-Mail address must be added',
        }
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
  <app-form-error [fieldRef]="registrationForm.email" />
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
To display errors, we include our `FormError` component for each field as well as for the whole password group:
Errors can be assigned to individual fields (`pw1`) or to the grouping node (`password`), as we will see later.

```html
<label>Password
  <input
    type="password"
    autocomplete
    [field]="registrationForm.password.pw1"
    [aria-invalid]="ariaInvalidState(registrationForm.password.pw1)"
  />
  <app-form-error [fieldRef]="registrationForm.password.pw1" />
</label>
<label
  >Password Confirmation
  <input
    type="password"
    autocomplete
    [field]="registrationForm.password.pw2"
    [aria-invalid]="ariaInvalidState(registrationForm.password.pw2)"
  />
  <app-form-error [fieldRef]="registrationForm.password.pw2" />
</label>
<app-form-error [fieldRef]="registrationForm.password" />
```

For validations that depend on multiple fields, Signal Forms provide a `validateTree()` function.
The `ChildFieldContext` passed to the callback gives access to the entire subtree, allowing us to compare values of different fields.
An interesting aspect of this function is that we can assign errors to any field within the subtree.

```typescript
import { /* ... */, validateTree } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((schemaPath) => {
  // ...
  // Password confirmation validation
  validateTree(schemaPath.password, (ctx) => {
    return ctx.value().pw2 === ctx.value().pw1
      ? undefined
      : {
          field: ctx.field.pw2, // assign the error to the second password field
          kind: 'confirmationPassword',
          message: 'The entered password must match with the one specified in "Password" field',
        };
  });
});
```

Apart from this example, access to other fields is possible through the `fieldTreeOf()` method.
We can also use `valueOf()` to access values of other fields in the tree.


> `validateTree()` defines custom validation logic for a group of related fields. It returns a validation error or `undefined` if the values are valid.


## Conditional Validation

Validations can also be applied conditionally based on the value of other fields.
In our registration form, we want to allow users to choose from newsletter topics once they decided to receive a newsletter.
Therefore, we extend our data model and the initial state first.

```typescript
export interface RegisterFormData {
  // ...
  newsletter: boolean;
  newsletterTopics: string;
  agreeToTermsAndConditions: boolean;
}

const initialState: RegisterFormData = {
  // ...
  newsletter: false,
  newsletterTopics: '',
  agreeToTermsAndConditions: false,
};
```

Now, we want to ensure that a newsletter topic is selected from the list (we already named it in plural since we will add a multi-selection later, but for now just start with selecting one topic).
However, this rule only applies if the user has opted in to receive the newsletter.

This is where `applyWhen()` comes into play!
The function takes a field path as the first argument.
Since we want to take the whole form into account, we pass the root path.
The callback function in the second argument takes the field context and returns a boolean indicating whether the condition is met.
In this example, we take a look at the value of the `newsletter` checkbox and only apply the validation if it is `true`.
The third argument provides the actual validation schema that should be applied when the condition is met:
We use the `validate()` function to check if a topic is selected.

```typescript
import { /* ... */, applyWhen } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((schemaPath) => {
  // ...
  // Only validate newsletter topics if user subscribed to newsletter
  applyWhen(
    schemaPath,
    (ctx) => ctx.value().newsletter,
    (schemaPathWhenTrue) => {
      validate(schemaPathWhenTrue.newsletterTopics, (ctx) =>
        !ctx.value().length
          ? {
              kind: 'noTopicSelected',
              message: 'Select at least one newsletter topic',
            }
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
If the username is `johndoe`, we consider it taken, and the operation resolves to `true`.

```typescript
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  checkUserExists(username: string) {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(username === 'johndoe');
      }, 2000);
    });
  }
  // ...
}
```

To perform async validation, we can use the `validateAsync()` function in our schema.
The `params` property allows us to pick the required data from the field state, again represented as a `ChildFieldContext` object.
The `factory` property is a function that creates a resource that actually performs the async operation.
Finally, the `onSuccess` function maps the value of the resource to a validation error, just as we did before with custom synchronous validations.
We also have to handle errors in the asynchronous operation, which can be done using the `onError` property. If the validation fails due to a server error, we ignore it by returning `undefined`.

```typescript
import { /* ... */, resource } from '@angular/core';
import { /* ... */, validateAsync } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((schemaPath) => {
  // ...
  // Check username availability on the server
  validateAsync(schemaPath.username, {
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
    onSuccess: (result) => {
      return result
        ? {
            kind: 'userExists',
            message: 'The username you entered was already taken',
          }
        : undefined;
    },
    onError: () => undefined
  });
});
```

Whenever the value of the username field changes, the async validation is triggered.
If we enter `johndoe`, the validation will fail, and the corresponding error message will be displayed.

> ℹ️ *Resource* is a new building block in Angular for managing asynchronous data with signals. Learn about the Resource API in our blog post from *Angular.Schule*: [Reactive Angular: Loading Data with the Resource API](https://angular.schule/blog/2025-05-resource-api)


For HTTP endpoints, you can also use the simpler `validateHttp()` function:

```typescript
validateHttp(schemaPath.username, {
  request: (ctx) => `/api/check?username=${ctx.value()}`,
  errors: (taken: boolean) =>
    taken ? ({ kind: 'userExists', message: 'Username already taken' }) : undefined,
});
```

When an asynchronous validation is in progress, the field's `pending` state is set to `true`.
We can use this state to provide user feedback in the UI:

```html
<!-- ... -->
<input
  type="text"
  [field]="registrationForm.username"
  [aria-invalid]="ariaInvalidState(registrationForm.username)"
/>
@if (registrationForm.username().pending()) {
  <small>Checking availability ...</small>
}
<!-- ... -->
```

## Debounce: Delay updates from the UI

Async validation can be expensive: by default, an async call is made with every character entered in an input field.

The `debounce()` function delays updates from the UI to the form model.
When applied, updates are only emitted to the form after typing has stopped for the given time (here 500 ms), or when the field loses focus.
This means that not each and every character changes the form value and triggers validation, but only when the user has paused typing for 500 ms.

```typescript
import { /* ... */, validateAsync, debounce } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((schemaPath) => {
  // Delay username updates by 500ms
  debounce(schemaPath.username, 500);

  // Async validation will only trigger after debounce delay
  validateAsync(schemaPath.username, {
    // ...
  });
});
```

This prevents excessive API calls during typing and improves performance by batching rapid user input changes.

## Controlling Field State

Signal Forms also provide functions to control field behavior beyond validation.
All three schema functions `disabled`, `readonly` and `hidden` receive a callback that takes the field context and checks a condition.
The corresponding field will change its state when the condition is met.

```typescript
import { /* ... */, disabled, readonly, hidden } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((schemaPath) => {
  // ...
  // Disable newsletter topics when newsletter is unchecked
  disabled(schemaPath.newsletterTopics, (ctx) => !ctx.valueOf(schemaPath.newsletter));
});
```

Here are some more examples of how to use `readonly` and `hidden`:

```typescript
// make `someField` read-only if `otherField` has the value 'someValue'
readonly(schemaPath.someField, (ctx) => ctx.valueOf(schemaPath.otherField) === 'someValue');

// make `someField` read-only if `otherField` is invalid
readonly(schemaPath.someField, (ctx) => !ctx.fieldTreeOf(schemaPath.otherField)().valid());

// hide `someField` if the value of `otherField` is falsy
hidden(schemaPath.someField, (ctx) => !ctx.valueOf(schemaPath.otherField));
```

Disabled and read-only states are automatically reflected in the template when using the `[field]` directive.
However, Angular cannot automatically hide fields in the template.
Instead, it marks the fields as *hidden*, which we can use in our template to conditionally render the fields using `@if`.

```html
@if (!registrationForm.someField().hidden()) {
  <label>Some Field
    <input ... />
  </label>
}
```


## Handling Server-Side Errors

While client-side validation catches most errors before submission, server-side validation errors can still occur during form processing.
Signal Forms provide an elegant way to handle these errors and display them to users with proper field-level feedback.
When using the `submit()` function, we can return an array of validation errors from the submission callback to assign them to specific fields or to the form itself.

The type `ValidationErrorWithField` ensures that each error contains a reference to the field it belongs to.

```typescript
import { /* ... */, ValidationErrorWithField } from '@angular/forms/signals';

export class RegistrationForm {
  // ...
  protected submitForm() {
    submit(this.registrationForm, async (form) => {
      const errors: ValidationErrorWithField[] = [];

      try {
        await this.#registrationService.registerUser(form().value);
        console.log('Registration successful!');
        this.reset();
      } catch (e) {
        // Add server-side errors
        errors.push(
          {
            field: form, // form-level error
            kind: 'serverError',
            message: 'Registration failed. Please try again.',
          }
        );

        // Or assign to specific field
        errors.push(
          {
            field: form.username,
            kind: 'serverValidation',
            message: 'Username is not available.',
          }
        );
      }

      return errors;
    });

    return false;
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
- Server-side error handling

In **Part 3**, we'll cover specialized topics that help you build complex, modular forms:

- Creating reusable child form components
- Building custom UI controls that integrate seamlessly with Signal Forms

Ready for the final part? Check out [Part 3: Child Forms and Custom UI Controls](/blog/2025-10-signal-forms-part3)!

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
