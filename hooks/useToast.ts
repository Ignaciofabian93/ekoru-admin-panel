"use client";

import { useMemo } from "react";
import { toast, type Id, type ToastOptions } from "react-toastify";

/**
 * App-wide notification helper backed by react-toastify. All toasts render
 * through the single `<ToastProvider />` mounted in the root layout, so this
 * hook can be called from any client component without extra setup.
 *
 * @example
 * const notify = useToast();
 * notify.success("Saved");
 * notify.error("Something went wrong");
 */
export function useToast() {
  return useMemo(
    () => ({
      success: (message: React.ReactNode, options?: ToastOptions): Id =>
        toast.success(message, options),
      error: (message: React.ReactNode, options?: ToastOptions): Id =>
        toast.error(message, options),
      info: (message: React.ReactNode, options?: ToastOptions): Id =>
        toast.info(message, options),
      warning: (message: React.ReactNode, options?: ToastOptions): Id =>
        toast.warning(message, options),
      /** Dismiss a specific toast by id, or all toasts when no id is passed. */
      dismiss: (id?: Id): void => toast.dismiss(id),
    }),
    [],
  );
}
