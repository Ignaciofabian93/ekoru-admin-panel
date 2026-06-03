"use client";

import { ToastContainer } from "react-toastify";

/**
 * Single global mount point for react-toastify. Render this once near the root
 * of the app; every `useToast` call routes through this container. Colors are
 * remapped to the brand palette via the `--toastify-color-*` overrides in
 * `globals.css`.
 */
export function ToastProvider() {
  return (
    <ToastContainer
      position="top-center"
      theme="colored"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      aria-label="Notifications"
    />
  );
}
