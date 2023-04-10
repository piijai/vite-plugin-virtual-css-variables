/**
 * Recursive map of CSS variable names to values. Nested keys are joined using
 * a string separator to generate variable names.
 */
export interface CssVariablesMap {
	[key: string]: string | CssVariablesMap;
}

/**
 * Plugin options for `vite-plugin-virtual-css-variables` vite plugin.
 */
export interface Options {
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
