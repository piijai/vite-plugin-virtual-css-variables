import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/simple");

describe("nested css variables", () => {
	it("can handle nested variable names", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						color: {
							blue: {
								"500": "#0000FF",
							},
						},
					},
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect nested css variable to be formatted correctly.
		const css = results["index.css"];
		expect(css).toContain("--color-blue-500: #0000FF;");
	});

	it("can handle default nested variable names", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						color: {
							blue: {
								default: "blue",
								500: "#0000FF",
							},
						},
					},
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect default nested css variable to be formatted correctly.
		const css = results["index.css"];
		expect(css).toContain("--color-blue: blue;");
		expect(css).toContain("--color-blue-500: #0000FF;");
	});

	it("can use custom key separator", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						color: {
							blue: {
								"500": "#0000FF",
							},
						},
					},
					separator: "_",
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect nested css variable to use custom separator.
		const css = results["index.css"];
		expect(css).toContain("--color_blue_500: #0000FF;");
	});
});
