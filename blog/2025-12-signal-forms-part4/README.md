---
title: 'Angular Signal Forms Part 4: Metadata and Accessibility Handling'
author: Danny Koppenhagen
mail: mail@d-koppenhagen.de
author2: Ferdinand Malcher
mail2: mail@fmalcher.de
published: 2025-12-10
lastModified: 2025-12-10
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
language: en
header: header-signalforms-part4.jpg
sticky: false
---


In the previous parts of this series, we've covered the fundamentals of Signal Forms, advanced validation patterns, and modular form architecture. In this final part, we'll explore the power of assigning field metadata and we'll have a look on how we can automatically add helpful ARIA attributes based on a field state that makes our forms even more inclusive and accessible.

> ⚠️ **Experimental Feature:** Signal Forms are currently an experimental feature in Angular. The API and functionality may change in future releases.

## Related blog posts

**This blog post is part of our series about Signal Forms:**

- [Part 1: Getting Started with Signal Forms](/blog/2025-10-signal-forms-part1)
- [Part 2: Advanced Validation and Schema Patterns](/blog/2025-10-signal-forms-part2)
- [Part 3: Child Forms, Custom UI Controls and SignalFormsConfig](/blog/2025-10-signal-forms-part3)
- *Part 4: Metadata and Accessibility Handling* (this post)

## Assign Field Metadata

Signal Forms provide a powerful metadata system that allows you to attach additional information to form fields beyond validation rules.
This metadata can be used to provide helpful descriptions, tooltips, or contextual information that enhances the user experience.

In our example, we want to add information for some fields which can be used to represent it for the users as a hint to fill out the form.
In comparison to an error message this inforInformation should be displayed always and not only when the field value is invalid.

### Creating Metadata Keys

First, we need to create a metadata key using the `createMetadataKey()` function.
This key acts as a type-safe identifier for different types of metadata.
To re-use it in several places, we will put this in a separate file.

```typescript
// form-props.ts
import { createMetadataKey } from '@angular/forms/signals';

export const FIELD_INFO = createMetadataKey<string>();
```

### Adding Metadata to Fields

Next, we want to assign the metadata to a form field.
This happens within the passed schema for the form.
Here we use the `metadata()` function which takes three parameters:
the field path, the metadata key (we just created before), and a function that returns the metadata value.
The return value of the function is the string represented to the user as info text for the field in our case.

```typescript
import { metadata } from '@angular/forms/signals';
import { FIELD_INFO } from './form-props';

// ...
export const formSchema = schema<RegisterFormData>((schemaPath) => {
  // Username validation and metadata
  required(schemaPath.username, { message: 'Username is required' });
  minLength(schemaPath.username, 3, { message: 'A username must be at least 3 characters long' });
  metadata(schemaPath.username, FIELD_INFO, () => 'A username must consist of 3-12 characters.');
  // ...
  // Email metadata
  metadata(schemaPath.email, FIELD_INFO, () => 'Please enter at least one valid E-Mail address');
  // ...
  // Password metadata
  metadata(schemaPath.password, FIELD_INFO, () => 'Please enter a password with min 8 characters and a special character.');
  // ...
});
// ...
```

### Accessing Metadata in Components

Once the metadata has been assigned, we can access it in your components.
We can use the `hasMetadata()` method, to check if a field has metadata for the passed metadata key.
And we use the `metadata()` method to retrieve the concrete value for this metadata key.

```typescript
// Check if field has metadata
if (field.hasMetadata(FIELD_INFO)) {
  const info = field.metadata(FIELD_INFO);
  console.log(info); // "A username must consist of 3-12 characters."
}
```

## Create a Component to Display Field Information and Errors

To create a better user experience, we'll build a unified component that displays field information, validation errors, and loading states.
This component replaces the basic `FormError` component from previous parts with a more comprehensive solution.

### The `FormFieldInfo` Component

Our new component handles multiple types of field states and displays appropriate messages and assigned CSS classes for styling.
The list of displayed messages shows:

The component uses a computed signal to determine what messages to display based on the field's current state:

1. **Pending state**: Shows loading messages during async validation
2. **Error state**: Displays validation error messages when the field is touched and has errors
3. **Info state**: Shows helpful metadata information when the field is valid or untouched

```typescript
// form-field-info.ts
import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FIELD_INFO } from '../form-props';

@Component({
  selector: 'app-form-field-info',
  template: `
    @if(messages()) {
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
      messages = [{ info: 'Checking availability ...', cssClass: 'pending' }];
    } else if (field.touched() && field.errors().length > 0) {
      // Show validation errors
      messages = field.errors().map((e) => ({
        info: e.message || 'Invalid',
        cssClass: 'invalid'
      }));
    } else if (field.hasMetadata(FIELD_INFO)) {
      // Show helpful information when field is valid or untouched
      messages = [{
        info: field.metadata(FIELD_INFO)!,
        cssClass: field.valid() ? 'valid' : 'info'
      }];
    }
    return messages;
  });
}
```

### Using the Component

Replace the old `FormError` component with the new `FormFieldInfo` component in your templates (and of course import it in the component and in the `imports` section of the component):

```html
<label>
  Username
  <input
    type="text"
    [field]="registrationForm.username"
  />
  <app-form-field-info
    id="username-info"
    [fieldRef]="registrationForm.username"
  />
</label>
```

This unified approach provides users with contextual information at all times, improving the overall form experience by offering guidance before errors occur.

## Create a Directive for Adding ARIA Attributes to Form Fields

Accessibility is crucial for creating inclusive web applications.
Currently we show field-related information close to the field itself by using the `FormFieldInfo` component we just created.
This is great but with the current solution it is not accessible for screen readers since the form field itself and the message aren't linked semantically.
That's the reason why we create a directive that automatically adds appropriate ARIA attributes to form fields based on their state, making our forms more accessible to users with assistive technologies.

### The FieldAriaAttributes Directive

This directive automatically manages ARIA attributes based on the field's current state.
Also it is important that we allow to pass an HTML element id, which is used by the attribute `aria-describedby` or `aria-errormessage`, to connect the field with the related messages, so assistive technologies can connect this information and announce them to the users.
We link the id with `aria-errormessage` when the field is currently invalid and touched.
Otherwise we link it with `aria-describedby`.

```typescript
// field-aria-attributes.ts
import { computed, Directive, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

@Directive({
  selector: '[field]',
  host: {
    '[attr.aria-invalid]': 'ariaInvalid()',
    '[attr.aria-busy]': 'ariaBusy()',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[attr.aria-errormessage]': 'ariaErrorMessage()',
  },
})
export class FieldAriaAttributes<T> {
  readonly field = input.required<FieldTree<T>>();
  readonly fieldDescriptionId = input<string>();

  readonly ariaInvalid = computed(() => {
    const state = this.field()();
    return state.touched() && !state.pending() ? state.errors().length > 0 : undefined;
  });

  readonly ariaBusy = computed(() => {
    const state = this.field()();
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

The directive now manages four key ARIA attributes:

- **`aria-invalid`**: Set to `true` when the field has been touched and contains validation errors
- **`aria-busy`**: Set to `true` during async validation to indicate loading state
- **`aria-describedby`**: References the ID of the element containing helpful information (when field is valid)
- **`aria-errormessage`**: References the ID of the element containing error messages (when field is invalid)

### Using the Directive

The directive works seamlessly with the existing `Field` directive since we defined the selector to be `[field]`.
To use it, we need to import it in our component holding the form in the components decorator.

```typescript
@Component({
  selector: 'app-registration-form',
  imports: [Field, FormFieldInfo, FieldAriaAttributes, /* other imports */],
  // ...
})
export class RegistrationForm {
  // ...
}
```

Basically that's it: With this the attributes `aria-invalid` and `aria-busy` are automatically set since our directive binds to the existing `[field]` directive.
But to make it really accessible we need to pass the id of the targeting message element as the `fieldDescriptionId` input to connect the field with its description element:

```html
<label>
  Username
  <input
    type="text"
    [field]="registrationForm.username"
    fieldDescriptionId="username-info"
  />
  <app-form-field-info
    id="username-info"
    [fieldRef]="registrationForm.username"
  />
</label>
```

The directive ensures that your Signal Forms automatically provide excellent accessibility support without requiring manual ARIA attribute management.ement.

## Demo

You can find a complete demo application for this blog series on GitHub and Stackblitz:

- **⚡️ Stackblitz:** [https://stackblitz.com/github/angular-buch/signal-forms-registration](https://stackblitz.com/github/angular-buch/signal-forms-registration)
- **⚙️ Code on GitHub:** [https://github.com/angular-buch/signal-forms-registration](https://github.com/angular-buch/signal-forms-registration)
- **💻 Live Demo:** [https://angular-buch.github.io/signal-forms-registration/](https://angular-buch.github.io/signal-forms-registration/)



## Conclusion

In this four-part series, we've explored the full spectrum of Angular Signal Forms:

**[Part 1](/blog/2025-10-signal-forms-part1/)** covered the fundamentals:

- Data models and field structures
- Template connections with the `Field` directive
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

Signal Forms are the third major approach of form handling in Angular.
After Template-Driven Forms and Reactive Forms, Signal Forms aim to make form handling more type-safe, reactive, and declarative.
As the new approach continues to evolve from its experimental status, Signal Forms promise to become a cornerstone of modern Angular application development!

<small>**Cover image:** Picture from [Pixabay](https://pixabay.com/photos/journal-write-blank-pages-notes-2850091/), edited</small>
