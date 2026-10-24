"use client";

import { FormProvider, useForm } from "react-hook-form";
import type {
  DefaultValues,
  FieldValues,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

interface FormProps<Schema extends z.ZodType<FieldValues>> {
  schema: Schema;
  onSubmit: SubmitHandler<z.infer<Schema>>;
  defaultValues?: DefaultValues<z.infer<Schema>>;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wrapper around react-hook-form + zod
 * Form is defined by its schema which is also the single source of truth for the field types
 * and an async onSubmit; fields inside auto-bind by 'name' through FormContext so callers just
 * drop <TextField name = "email" /> as children
 * If onSubmit throws - message surfaces as a form-level error via 'FormError' - callers only have to throw
 */
export function FormBuilder<Schema extends z.ZodType<FieldValues>>({
  schema,
  onSubmit,
  defaultValues,
  className,
  children,
}: FormProps<Schema>) {
  /**
   * zod v4's input/output split does not line up with zodResolver's overloads for a generic schema,
   * so we assert the factory to the shape we actually want
   * Schema stays the source of truth for z.infer<Schema>
   */
  const resolver = (
    zodResolver as unknown as (schema: Schema) => Resolver<z.infer<Schema>>
  )(schema);

  const methods = useForm<z.infer<Schema>>({
    resolver,
    defaultValues,
    mode: "onTouched",
  });

  const submit: SubmitHandler<z.infer<Schema>> = async (values, event) => {
    try {
      await onSubmit(values, event);
    } catch (err) {
      methods.setError("root", {
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(submit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
