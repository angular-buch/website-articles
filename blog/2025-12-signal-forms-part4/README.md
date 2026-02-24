---
title: 'Angular Signal Forms Part 4: Metadata and Accessibility Handling'
author: Danny Koppenhagen
mail: mail@d-koppenhagen.de
author2: Ferdinand Malcher
mail2: mail@fmalcher.de
published: 2025-12-08
lastModified: 2026-02-23
keywords:
  - Angular
  - Signals
  - Forms
  - Angular 21
  - Signal Forms
  - Metadata
  - ARIA
  - a11y
  - accessibility
  - Focus Handling
language: en
header: header-signalforms-part4.jpg
sticky: false
---


In the previous parts of this series, we've covered the fundamentals of Signal Forms, advanced validation patterns, and modular form architecture. In this final part, we'll explore the power of assigning field metadata. We'll also have a look at how we can automatically add helpful ARIA attributes based on a field state to make our forms even more inclusive and accessible.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- [Part 3: Child Forms, Custom UI Controls and SignalFormsConfig](/blog/2025-10-signal-forms-part3)
- *Part 4: Metadata and Accessibility Handling* (this post)

## Assigning Field Metadata

Signal Forms provide a powerful metadata system that allows you to attach additional information to form fields beyond validation rules.
This metadata can be used to provide helpful descriptions, tooltips, or contextual information that enhances the user experience.

In our example, we want to display hints for users about how to fill the form.
In comparison to an error message, this information should be displayed always and not only when the field value is invalid.

### Creating Metadata Keys

Form metadata is stored in keys that we have to define before using them.
We create a metadata key by using the `createMetadataKey()` function.
This key acts as a type-safe identifier for different types of metadata.
To re-use it in several places, we will put this in a separate file.

```typescript
// form-props.ts
import { createMetadataKey } from '@angular/forms/signals';

export const FIELD_INFO = createMetadataKey<string>();
```

### Adding Metadata to Fields

Next, we assign the metadata to a form field.
This happens within the form schema which we pass into the `form()` function at initialization.
Here we use the `metadata()` function which takes three parameters:
the schema path, the metadata key (which we just created before), and a function that returns the metadata value.
In our case, the metadata value is the string that should be presented to the user as info text for the field.

```typescript
import { metadata } from '@angular/forms/signals';
import { FIELD_INFO } from './form-props';

// ...
export const formSchema = schema<RegisterFormData>((path) => {
  // Username validation and metadata
  required(path.username, { message: 'Username is required.' });
  minLength(path.username, 3, { message: 'A username must be at least 3 characters long.' });
  metadata(path.username, FIELD_INFO, () => 'A username must consist of 3-12 characters.');
  // ...
  // Email metadata
  metadata(path.email, FIELD_INFO, () => 'Please enter at least one valid e-mail address');
  // ...
  // Password metadata
  metadata(path.password, FIELD_INFO, () => 'Please enter a password with min 8 characters and a special character.');
  // ...
});
// ...
```

### Accessing Metadata in Components

Once the metadata has been assigned, we can access it in our components.
We can check if a field has metadata for the passed metadata key.
To retrieve the actual value, we use the `metadata()` method.

```typescript
// Check if field has metadata
if (field.metadata(FIELD_INFO)) {
  const info = field.metadata(FIELD_INFO)?.();
  console.log(info); // "A username must consist of 3-12 characters."
}
```

## Creating a generic Info Display Component

To create a better user experience, we want to build a unified component that displays field information, validation errors, and loading states.
This component replaces the basic `FormError` component from previous parts with a more comprehensive solution.

### The `FormFieldInfo` Component

Our new component handles multiple types of field states and displays appropriate messages and CSS classes for styling.
The component uses a computed signal to determine what messages to display based on the field's current state:

1. **Pending state**: Shows loading messages during async validation.
2. **Error state**: Displays validation error messages when the field is touched and has errors.
3. **Info state**: Shows helpful metadata information when the field is valid or untouched.

To get access to the field, we use an input property `fieldRef` of type `FieldTree<T>` – just like in the previous `FormError` component.

```typescript
// form-field-info.ts
import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FIELD_INFO } from '../form-props';

@Component({
  selector: 'app-form-field-info',
  template: `
    @if (messages().length) {
    <ul>
      @for (message of messages(); track $index) {
      <li [class]="message.cssClass">
        <small>{{ message.info }}</small>
      </li>
      }
    </ul>
    }
  `,
  styleUrl: './form-field-info.scss',
})
export class FormFieldInfo<T> {
  readonly fieldRef = input.required<FieldTree<T>>();

  protected readonly messages = computed(() => {
    const field = this.fieldRef()();
    let messages: { info: string; cssClass: 'info' | 'pending' | 'valid' | 'invalid' }[] = [];

    if (field.pending()) {
      // Show loading state for async validation
      messages = [{ info: 'Checking validity ...', cssClass: 'pending' }];
    } else if (field.touched() && field.errors().length > 0) {
      // Show validation errors
      messages = field.errors().map((e) => ({
        info: e.message || 'Invalid',
        cssClass: 'invalid'
      }));
    } else if (field.metadata(FIELD_INFO)) {
      // Show helpful information when field is valid or untouched
      messages = [{
        info: field.metadata(FIELD_INFO)?.()!,
        cssClass: field.valid() ? 'valid' : 'info'
      }];
    }
    return messages;
  });
}
```

### Using the Component

As the final step, we replace the old `FormError` component with the new `FormFieldInfo` component in your templates.
To make things work, we have to adjust the `imports` section of the component accordingly.
Also we can now remove the `pending()` check here since it will be handled by our `FormFieldInfo` component.

```html
<label>
  Username
  <input
    type="text"
    [formField]="registrationForm.username"
  />
  <app-form-field-info
    id="username-info"
    [fieldRef]="registrationForm.username"
  />
  <!-- Remove the following -->
  @if (registrationForm.username().pending()) {
     <small>Checking availability ...</small>
  }
</label>
```

This unified approach provides users with contextual information at all times, improving the overall form experience by offering guidance before errors occur.
With additional metadata, we can display more than errors. All necessary information about the form is defined within the schema.

## Creating a Directive for Adding ARIA Attributes to Form Fields

Accessibility is crucial for creating inclusive web applications.
Currently we show field-related information close to the field itself by using the `FormFieldInfo` component we just created.
This is great but with the current solution it is not accessible for screen readers: The form field itself and the message aren't linked semantically.
To solve this, we want to create a directive that automatically adds appropriate ARIA attributes to form fields based on their state, making our forms more accessible to users with assistive technologies.

### The `FieldAriaAttributes` Directive

This directive automatically manages ARIA attributes based on the field's current state.
With this approach, it replaces also our current solution where we called `[aria-invalid]="ariaInvalidState(...)"`.
We use a dedicated selector `[formFieldAria]` for the directive.
This way, the directive has its own input binding and can be applied independently alongside the `FormField` directive.

The directive receives the field via the `formFieldAria` input.
It also accepts another input with the ID of the HTML element that contains the related messages (info, errors, loading).
We will need this ID for the attributes `aria-describedby` or `aria-errormessage`, to connect the field with the related messages.
We link the id with `aria-errormessage` when the field is currently invalid and touched.
Otherwise we link it with `aria-describedby`.

To write to the ARIA attributes, we use Host Bindings in the directive's metadata.

```typescript
// field-aria-attributes.ts
import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[formFieldAria]',
  host: {
    '[aria-invalid]': 'ariaInvalid()',
    '[aria-busy]': 'ariaBusy()',
    '[aria-describedby]': 'ariaDescribedBy()',
    '[aria-errormessage]': 'ariaErrorMessage()',
  },
})
export class FieldAriaAttributes<T> {
  readonly formFieldAria = input.required<FieldTree<T>>();
  readonly fieldDescriptionId = input<string>();

  readonly ariaInvalid = computed(() => {
    const state = this.formFieldAria()();
    return state.touched() && !state.pending() ? state.errors().length > 0 : undefined;
  });

  readonly ariaBusy = computed(() => {
    const state = this.formFieldAria()();
    return state.pending();
  });

  readonly ariaDescribedBy = computed(() => {
    const id = this.fieldDescriptionId();
    return !id || this.ariaInvalid() ? null : id;
  });

  readonly ariaErrorMessage = computed(() => {
    const id = this.fieldDescriptionId();
    return !id || !this.ariaInvalid() ? null : id;
  });
}
```

We can now remove our method `ariaInvalidState()` from the `RegistrationForm` component.
We can now remove our method `ariaInvalidState()` from the `RegistrationForm` component.
Also we remove the manual bindings for `aria-invalid` from the template of the `RegistrationForm` since this and other attributes will now be applied by our directive which manages four key ARIA attributes:

- **`aria-invalid`**: set to `true` when the field has been touched and contains validation errors.
- **`aria-busy`**: set to `true` during async validation to indicate loading state.
- **`aria-describedby`**: references the ID of the element containing helpful information (when field is valid).
- **`aria-errormessage`**: references the ID of the element containing error messages (when field is invalid).

### Using the Directive

Since the directive uses its own selector `[formFieldAria]`, we apply it explicitly alongside `[formField]` in the template.
To use it, we need to import it in our component holding the form in the component's decorator.

```typescript
@Component({
  selector: 'app-registration-form',
  imports: [FormField, FormFieldInfo, FieldAriaAttributes, /* other imports */],
  // ...
})
export class RegistrationForm {
  // ...
}
```

In the template, we add the `[formFieldAria]` binding to each form field alongside the existing `[formField]` directive.
We also pass the ID of the targeting message element as the `fieldDescriptionId` input to connect the field with its description element:

```html
<label>
  Username
  <input
    type="text"
    [formField]="registrationForm.username"
    [formFieldAria]="registrationForm.username"
    fieldDescriptionId="username-info"
  />
  <app-form-field-info
    id="username-info"
    [fieldRef]="registrationForm.username"
  />
</label>
```

The directive ensures that your Signal Forms automatically provide excellent accessibility support without requiring manual ARIA attribute management.

You may have noticed, we now used our new Directive and Component only in the main `RegistrationForm`.
Of course we should also update our child component `IdentityForm`.

> **Outlook:** Instead of using a separate `[formFieldAria]` selector, we could also combine both directives using Angular's [Directive Composition API](https://angular.dev/guide/directives/directive-composition-api).
> With `hostDirectives` in the decorator, the `FieldAriaAttributes` directive could automatically include the `FormField` directive, so only a single binding would be needed in the template.
> We chose the explicit approach here for clarity, but the Directive Composition API is a great alternative for reducing template verbosity.

> 💡 **Tip:** Besides Signal-Forms-specific accessibility features, don't forget about native HTML attributes like `autocomplete`. Setting appropriate `autocomplete` values (e.g. `autocomplete="username"`, `autocomplete="new-password"`) helps browsers and password managers fill in fields automatically. This improves usability for all users and is especially helpful for people with motor impairments or cognitive disabilities.

## Handling Invalid Form Submission

When a user tries to submit an invalid form, we want to provide a good user experience by guiding them to the first field that needs attention.
We can leverage the `onInvalid` callback in the submission configuration for this purpose.

### Focusing the First Invalid Field

The `onInvalid` callback is triggered when the user attempts to submit the form while it still contains validation errors.
We use the `errorSummary()` method to get a list of all current errors across the whole form.
Each error entry provides access to the associated `fieldTree`.
Invoking it as a signal with `fieldTree()` returns the corresponding `FieldState`, which exposes the `focusBoundControl()` method.
By calling `focusBoundControl()` on the first error's `FieldState`, the browser focus is moved directly to the first invalid input element in DOM order.

At the same time, all invalid fields are automatically marked as touched, so their error messages become visible immediately.

```typescript
protected readonly registrationForm = form(
  this.registrationModel,
  formSchema,
  {
    submission: {
      action: async (form) => {
        // ... submission logic
      },
      onInvalid: (form) => {
        const errors = form().errorSummary();
        errors.at(0)?.fieldTree().focusBoundControl();
      }
    },
  }
);
```

With this addition, the form becomes much more user-friendly:
When the user clicks "Register" with invalid data, the focus jumps to the first problematic field and all validation errors are displayed at once.
Since our `FieldAriaAttributes` directive links each field to its description element via `aria-errormessage`, a screen reader will also read out the associated error message as soon as the field receives focus.

## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)



## Conclusion

In this four-part series, we've explored the full spectrum of Angular Signal Forms:

**[Part 1](/blog/2025-10-signal-forms-part1/)** covered the fundamentals:

- Data models and field structures
- Template connections with the `FormField` directive
- Basic form submission and validation
- Built-in validators and error display

**[Part 2](/blog/2025-10-signal-forms-part2/)** dove into schema validation patterns:

- Custom validation functions
- Cross-field and conditional validation
- Asynchronous validation
- Server-side error handling

**[Part 3](/blog/2025-10-signal-forms-part3/)** explored specialized topics:

- Creating modular child forms and combining schemas with `apply()`
- Building custom UI controls with `FormValueControl`
- Providing custom `SignalFormsConfig` for CSS class management

**Part 4** covers metadata and accessibility:

- Assigning and accessing field metadata for enhanced user guidance
- Creating a unified component for displaying field information, errors, and loading states
- Building a directive that automatically adds ARIA attributes for better accessibility
- Handling invalid form submissions by focusing the first invalid field

Signal Forms are the third major approach of form handling in Angular.
After Template-Driven Forms and Reactive Forms, Signal Forms aim to make form handling more type-safe, reactive, and declarative.
As the new approach continues to evolve from its experimental status, Signal Forms promise to become a cornerstone of modern Angular application development!

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
