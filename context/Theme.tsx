import {
  ThemeProviderProps,
  ThemeProvider as NextThemeProvider,
} from "next-themes";

import React from "react";

const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
};

export default ThemeProvider;
