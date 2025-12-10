"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {props.children}
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
