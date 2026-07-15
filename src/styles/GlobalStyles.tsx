import { Global, css } from "@emotion/react";
import { theme } from "./theme";

export function GlobalStyles() {
  return (
    <Global
      styles={css`
        :root {
          color: ${theme.colors.text};
          background: ${theme.colors.bg};
          font-family:
            Pretendard, Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-width: 320px;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(239, 68, 68, 0.12), transparent 28rem),
            #050506;
        }

        #root {
          min-height: 100vh;
        }
      `}
    />
  );
}
