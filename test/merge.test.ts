import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/simple");

describe("merge variables", () => {
	it("will use single variables object in array as-is", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: [{ size: { sm: "1rem" } }],
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to match single variables object.
		const css = results["index.css"];
		expect(css).toBe(`:root {
  --size-sm: 1rem;
}`);
	});

	it("can merge css variables without duplicates", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: [{ size: { sm: "1rem" } }, { size: { md: "2rem" } }],
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to merge css variables.
		const css = results["index.css"];
		expect(css).toBe(`:root {
  --size-sm: 1rem;
  --size-md: 2rem;
}`);
	});

	it("can merge css variables with duplicates", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables({
					moduleId: "virtual:simple.css",
					variables: [
						{ size: { sm: "1rem", md: "2rem" } },
						{ size: { md: "1.5rem" } },
					],
				}),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect css to merge css variables with overwritten properties.
		const css = results["index.css"];
		expect(css).toBe(`:root {
  --size-sm: 1rem;
  --size-md: 1.5rem;
}`);
	});
});
