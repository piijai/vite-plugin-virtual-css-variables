import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/simple");

describe("formatting output", () => {
	it("will use :root selector by default", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						"box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
					},
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to be wrapped in :root selector.
		const css = results["index.css"];
		expect(css.startsWith(":root {")).toBe(true);
	});

	it("can use custom selector", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						"box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
					},
					selector: "body",
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to be wrapped in custom selector.
		const css = results["index.css"];
		expect(css.startsWith("body {")).toBe(true);
	});

	it("will pretty print with spaces by default", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						"box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
					},
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to use pretty printing with spaces by default.
		const css = results["index.css"];
		expect(css).toBe(`:root {
  --box-shadow: 0 4px 4px 0 rgb(0 0 0 / 0.2);
}`);
	});

	it("can use tabs for pretty printing", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						"box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
					},
					useTabs: true,
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to use tabs for indentation.
		const css = results["index.css"];
		expect(css).toBe(`:root {
\t--box-shadow: 0 4px 4px 0 rgb(0 0 0 / 0.2);
}`);
	});

	it("can use custom spacing for pretty printing", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						"box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
					},
					tabSize: 8,
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to use 8 spaces for indentation.
		const css = results["index.css"];
		expect(css).toBe(`:root {
        --box-shadow: 0 4px 4px 0 rgb(0 0 0 / 0.2);
}`);
	});

	it("can disable pretty printing", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						"box-shadow": "0 4px 4px 0 rgb(0 0 0 / 0.2)",
					},
					pretty: false,
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to use minified spacing.
		const css = results["index.css"];
		expect(css).toBe(`:root {--box-shadow: 0 4px 4px 0 rgb(0 0 0 / 0.2);}`);
	});
});
