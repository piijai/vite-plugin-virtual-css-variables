import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/stylesheet");

describe("external stylesheet", () => {
	it("can be used with external stylesheets", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:variables.css",
					variables: { color: { blue: { 500: "#0000FF" } } },
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect all css to be concatenated into a single file.
		const css = results["index.css"];
		expect(css).toContain(`:root {
  --color-blue-500: #0000FF;
}`);
		expect(css).toContain("var(--color-blue-500)");
	});
});
