# @mojojoejo/vite-plugin-virtual-css-variables

[![npm version](https://img.shields.io/npm/v/@mojojoejo/vite-plugin-virtual-css-variables)](https://www.npmjs.com/package/@mojojoejo/virtual-css-variables)&nbsp;
[![GitHub release](https://img.shields.io/github/v/release/mojojoejo/vite-plugin-virtual-css-variables)](https://github.com/mojojoejo/vite-plugin-virtual-css-variables/releases)&nbsp;
[![Codacy coverage](https://img.shields.io/codacy/coverage/61b64bfb93d74f6da8b892001e865e9e)](https://app.codacy.com/gh/mojojoejo/vite-plugin-virtual-css-variables/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)&nbsp;
[![Codacy grade](https://img.shields.io/codacy/grade/61b64bfb93d74f6da8b892001e865e9e)](https://app.codacy.com/gh/mojojoejo/vite-plugin-virtual-css-variables/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)&nbsp;
[![Snyk vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/mojojoejo/vite-plugin-virtual-css-variables)](https://snyk.io/test/github/mojojoejo/vite-plugin-virtual-css-variables)

[Vite](https://vitejs.dev/) plugin for importing [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
from a JavaScript object.

## 📦 Install

**Using npm**:

```sh
npm install --save-dev @mojojoejo/vite-plugin-virtual-css-variables
```

**Using yarn**:

```sh
yarn add --dev @mojojoejo/vite-plugin-virtual-css-variables
```

**Using pnpm**:

```sh
pnpm add --save-dev @mojojoejo/vite-plugin-virtual-css-variables
```

## 🚀 Usage

### Using `<link>` element

```html
<html>
  <head>
    <link rel="stylesheet" href="virtual:variables.css" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

```ts
// vite.config.ts
import pluginCssVariables from "@mojojoejo/vite-plugin-virtual-css-variables";

export default {
  plugins: [
    pluginCssVariables({
      moduleId: "virtual:variables.css",
      variables: {
        "color-primary": "#0668E1",
      },
    }),
  ],
};

// => index.css
// :root {
//   --color-primary: #0668E1;
// }
```

### Using imported module

```html
<!-- index.html -->
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="src/variables.ts"></script>
  </body>
</html>
```

```ts
// src/variables.ts
import "virtual:variables-module.css";
```

```ts
// vite.config.ts
import pluginCssVariables from "@mojojoejo/vite-plugin-virtual-css-variables";

export default {
  plugins: [
    pluginCssVariables({
      moduleId: "virtual:variables-module.css",
      variables: {
        "color-primary": "#0668E1",
      },
    }),
  ],
};

// => index.css
// :root {
//   --color-primary: #0668E1;
// }
```

### Multiple CSS variable objects

```html
<!-- index.html -->
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="src/variables.ts"></script>
  </body>
</html>
```

```ts
// src/variables.ts
import "virtual:variables-module.css";
```

```ts
// config/external.ts
export default {
  color: {
    primary: "#0000FF",
  },
};
```

```ts
// vite.config.ts
import pluginCssVariables from "@mojojoejo/vite-plugin-virtual-css-variables";
import externalVariables from "./config/external.ts";

export default {
  plugins: [
    pluginCssVariables({
      moduleId: "virtual:variables-module.css",
      variables: [
        {
          "color-primary": "#0668E1",
        },
        externalVariables,
      ],
    }),
  ],
};

// => index.css
// :root {
//   --color-primary: #0000FF;
// }
```

### Multiple virtual modules

```html
<!-- index.html -->
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="src/variables.ts"></script>
  </body>
</html>
```

```ts
// src/variables.ts
import "virtual:primary.css";
import "virtual:secondary.css";
```

```ts
// vite.config.ts
import pluginCssVariables from "@mojojoejo/vite-plugin-virtual-css-variables";

export default {
  plugins: [
    pluginCssVariables([
      {
        moduleId: "virtual:primary.css",
        variables: {
          "color-primary": "#0000FF",
        },
      },
      {
        moduleId: "virtual:secondary.css",
        variables: {
          "color-primary": "#FF0000",
        },
      },
    ]),
  ],
};

// => index.css
// :root {
//   --color-primary: #0000FF;
// }
// :root {
//   --color-secondary: #FF0000;
// }
```

### Custom formatting

See [Options](#%EF%B8%8F-options) for advanced formatting options of virtual
module output.

```html
<!-- index.html -->
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="src/variables.ts"></script>
  </body>
</html>
```

```ts
// src/variables.ts
import "virtual:variables-module.css";
```

```ts
// vite.config.ts
import pluginCssVariables from "@mojojoejo/vite-plugin-virtual-css-variables";

export default {
  plugins: [
    pluginCssVariables({
      moduleId: "virtual:variables-module.css",
      variables: {
        "color-primary": "#0668E1",
      },
      pretty: false,
    }),
  ],
};

// => index.css
// :root {--color-primary: #0668E1;}
```

## ⚙️ Options

Requires `moduleId` and `variables` options to be set. Can supply options as
array to include multiple virtual modules.

```ts
interface Options {
  /**
   * Virtual module ID of CSS variables file.
   */
  moduleId: string;
  /**
   * Recursive map of CSS variable names and values.
   */
  variables: CssVariablesMap | CssVariablesMap[];
  /**
   * String that separates nested keys to form variable names.
   *
   * default: "-"
   */
  separator?: string;
  /**
   * CSS selector that will contain all CSS variables.
   *
   * default: ":root"
   */
  selector?: string;
  /**
   * Pretty print CSS variables and selectors. Configurable through `useTabs`
   * and `tabSize` options.
   *
   * default: true
   */
  pretty?: boolean;
  /**
   * Use tabs instead of spaces to indent lines in output. Requires `pretty`
   * option to be enabled.
   *
   * default: false
   */
  useTabs?: boolean;
  /**
   * Number of spaces to indent lines in output. Requires `pretty` option to be
   * enabled and `useTabs` option to be disabled.
   *
   * default: 2
   */
  tabSize?: number;
}
```

## 📄 License

MIT License © 2023 [Joe Stanley](https://github.com/mojojoejo)
