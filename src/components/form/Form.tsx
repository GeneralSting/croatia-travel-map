"use client";

// Thin wrapper around react-hook-form + zod. A form is defined by its schema (which is also the
// single source of truth for the field types) and an async onSubmit; fields inside auto-bind by
// `name` through FormContext, so callers just drop <TextField name="email" /> as children. If
// onSubmit throws, the message surfaces as a form-level error via <FormError /> — callers only
// have to throw.

import { FormProvider, useForm } from "react-hook-form";
import type {
  DefaultValues,
  FieldValues,
  Resolver,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

interface FormProps<S extends z.ZodType<FieldValues>> {
  schema: S;
  onSubmit: SubmitHandler<z.infer<S>>;
  defaultValues?: DefaultValues<z.infer<S>>;
  className?: string;
  children: React.ReactNode;
}

export function Form<S extends z.ZodType<FieldValues>>({
  schema,
  onSubmit,
  defaultValues,
  className,
  children,
}: FormProps<S>) {
  // zod v4's input/output split doesn't line up with zodResolver's overloads for a *generic*
  // schema, so we assert the factory to the shape we actually want. The schema stays the source
  // of truth for z.infer<S>.
  const resolver = (
    zodResolver as unknown as (s: S) => Resolver<z.infer<S>>
  )(schema);

  const methods = useForm<z.infer<S>>({
    resolver,
    defaultValues,
    mode: "onTouched",
  });

  const submit: SubmitHandler<z.infer<S>> = async (values, event) => {
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
