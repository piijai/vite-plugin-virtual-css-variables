import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/simple");

describe("empty values", () => {
	it("will ignore empty variable map", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {},
				}),
			],
		});

		// Expect virtual module to be ignored.
		expect(results).not.toHaveProperty("index.css");
	});

	it("will ignore empty variable map array", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: [],
				}),
			],
		});

		// Expect virtual module to be ignored.
		expect(results).not.toHaveProperty("index.css");
	});

	it("can handle empty variable values", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: {
						empty: { content: "" },
					},
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css variable to use quoted empty string.
		const css = results["index.css"];
		expect(css).toContain('--empty-content: "";');
	});
});
