import merge from "lodash.merge";

import type { Plugin } from "vite";
import type { CssVariablesMap, Options } from "./types";

/**
 * Vite plugin for generating and loading virtual CSS files from a recursive
 * map of CSS variables. An array of plugin options can be used to output
 * multiple virtual CSS files using a single plugin instance.
 *
 * @param opts plugin options
 * @returns virtual css variables vite plugin
 */
function virtualCssVariablesPlugin(opts: Options | Options[] = []): Plugin {
	// Require options to be an array for easier processing.
	const optsList = Array.isArray(opts) ? opts : [opts];
	const optsMap = new Map<string, Options>();

	return {
		name: "vite-plugin-virtual-css-variables",
		enforce: "pre",
		buildStart() {
			for (let i = 0; i < optsList.length; i++) {
				const o = optsList[i];
				if (o.moduleId == null || o.moduleId.trim().length === 0) {
					// Ignore empty module ID.
					this.warn({
						message: `empty module id found in plugin options at index ${i}`,
					});
					continue;
				}
				if (optsMap.has(o.moduleId)) {
					// Ignore duplicate module ID.
					this.warn({
						message: `duplicate module id, "${o.moduleId}", found in plugin options at index ${i}`,
					});
					continue;
				}

				// Store options object by module ID.
				optsMap.set(o.moduleId, o);
			}
		},
		resolveId(id) {
			let o: Options | undefined;
			if ((o = optsMap.get(id)) == null) return;

			// Prefix virtual module ID with `\0` to prevent other plugins from
			// processing the module.
			return "\0" + o.moduleId;
		},
		async load(id) {
			let o: Options | undefined;
			if (!id.startsWith("\0") || (o = optsMap.get(id.slice(1))) == null)
				return;

			const {
				separator = "-",
				selector = ":root",
				pretty = true,
				useTabs = false,
				tabSize = 2,
			} = o;

			let { variables } = o;
			if (Array.isArray(variables)) {
				// Ignore empty css variables array.
				if (variables.length === 0) return "";
				if (variables.length === 1) {
					variables = variables[0];
				} else {
					// Merge css variables if more than one object is present.
					variables = merge(variables[0], ...variables.slice(1));
				}
			}

			// Ignore empty css variables map.
			if (Object.keys(variables).length === 0) return "";

			if (!isCssVariablesMap(variables)) {
				// Ignore malformed css variables array.
				this.warn({
					message: `css variables object for module "${o.moduleId}" is malformed`,
				});
				return "";
			}

			const results = generateCssVariables(variables, separator);

			// Configure pretty printing strings, empty if disabled.
			const indent = pretty ? (useTabs ? "\t" : " ".repeat(tabSize)) : "";
			const prefix = pretty ? "\n" : "";

			// Wrap all css variables in a single selector.
			let css = `${selector} {`;
			for (const property in results) {
				css += `${prefix}${indent}${property}: ${results[property]};`;
			}
			css += prefix + "}";

			return css;
		},
	};
}

/**
 * Type predicate indicating whether or not the argument is a valid object.
 *
 * @param obj potential object
 * @returns true if `obj` is an object, otherwise false
 */
function isObject(obj: unknown): obj is Record<string, unknown> {
	return obj != null && typeof obj === "object";
}

/**
 * Type predicate indicating whether or not the argument is a valid
 * CssVariablesMap object.
 *
 * @param obj potential CssVariablesMap object
 * @returns true if `obj` is a CssVariablesMap, otherwise false
 */
function isCssVariablesMap(obj: unknown): obj is CssVariablesMap {
	if (!isObject(obj)) return false;
	for (const key in obj) {
		// Only allow string values for css variable values.
		if (typeof obj[key] === "string") continue;
		// Recursively check nested css variables.
		if (!isCssVariablesMap(obj[key])) return false;
	}
	return true;
}

/**
 * Generates a map of CSS variable names to string values. Nested keys will be
 * joined using the given separator string. All variable names will be prefixed
 * by the string "--".
 *
 * @param variables recursive map of css variable names to values
 * @param separator string separator between nested keys
 * @param prefix prefix for css variable names
 * @returns map of css variable names to values
 *
 * @example
 * generateCssVariables({
 *   color: {
 *     green: {
 *       light: "#90EE90",
 *       dark: "#006400",
 *     },
 *     blue: "#0000FF",
 *   },
 *   "box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
 * });
 *
 * // => {
 * //      "--color-green-light": "#90EE90",
 * //      "--color-green-dark": "#006400",
 * //      "--color-blue": "#0000FF",
 * //      "--box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
 * //    }
 */
function generateCssVariables(
	variables: CssVariablesMap,
	separator = "-",
	prefix = "--"
): Record<string, string> {
	const results: Record<string, string> = {};

	for (const key in variables) {
		let property = prefix + key;
		let value = variables[key];

		if (typeof value === "string") {
			if (value.trim().length === 0) {
				// Replace whitespace-only strings with empty quotes.
				value = '""';
			}
			if (key === "default" && prefix !== "--") {
				// Remove last separator for default nested properties.
				property = prefix.slice(0, -separator.length);
			}

			// Create new css variable for every string value.
			results[property] = value;
		} else {
			// Merge recursively generated css variables for nested keys.
			Object.assign(
				results,
				// Prefix nested keys using current property path and separator.
				generateCssVariables(value, separator, property + separator)
			);
		}
	}

	return results;
}

export default virtualCssVariablesPlugin;
export type { CssVariablesMap, Options };
