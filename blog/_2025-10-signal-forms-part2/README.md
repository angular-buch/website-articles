---
title: 'Angular Signal Forms Part 2: Advanced Validation and Schema Patterns'
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
  - Validation
language: en
header: signal-forms.jpg
sticky: false
hidden: true
---

In [Part 1](../2025-10-signal-forms-part1/README.md), we covered the fundamentals of Signal Forms. Now let's dive deeper into advanced validation scenarios and schema patterns that make Signal Forms truly powerful for complex form requirements.

## Advanced Validation Scenarios

Beyond basic field validation, Signal Forms support several advanced validation patterns that are common in real-world applications.

### Custom Validation Functions

Sometimes the built-in validators aren't sufficient for your needs.
Signal Forms allow you to create custom validation logic using the `validate()` function.

Let's extend our registration form with a more complex data model that includes nested objects and arrays:

```typescript
export interface RegisterFormData {
  username: string;
  password: { pw1: string; pw2: string };
  age: number;
  email: string[];
  newsletter: boolean;
  newsletterTopics: string[];
  agreeToTermsAndConditions: boolean;
}

const initialState: RegisterFormData = {
  username: '',
  password: { pw1: '', pw2: '' },
  age: 18,
  email: [''],
  newsletter: false,
  newsletterTopics: ['Angular'],
  agreeToTermsAndConditions: false,
};
```

Now let's create custom validation for ensuring at least one email is provided:

```typescript
import { /* ... */ validate, customError, applyEach, email } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...

  // Validate each email in the array
  applyEach(fieldPath.email, (emailPath) => {
    email(emailPath, { message: 'E-Mail format is invalid' });
  });

  // Custom validation for at least one email
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

The `validate()` function receives the field state and should return either `undefined` (validation passed) or an error created with `customError()`.

### Cross-Field Validation

For validations that depend on multiple fields (like password confirmation), use `validateTree()`:

```typescript
import { /* ... */ validateTree } from '@angular/forms/signals';

export const registrationSchema = schema<RegisterFormData>((fieldPath) => {
  // ... existing validations ...

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
```

With `validateTree()`, you get access to:
- `valueOf()` - to access values of fields within the tree
- `fieldOf()` - to get the field path for error assignment

### Conditional Validation

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

### Asynchronous Validation

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

### Field State Control

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

Ready for the final part? Check out [Part 3: Child Forms and Custom UI Controls](../2025-10-signal-forms-part3/README.md)!
