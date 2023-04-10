import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/multi");

describe("multiple virtual modules", () => {
	it("can handle an array of modules", async () => {
		const results = await viteBuildCss(root, {
			logLevel: "silent",
			plugins: [
				pluginVirtualCssVariables([
					{
						moduleId: "virtual:multi-1.css",
						variables: { transform: { flip: "rotate(180deg)" } },
					},
					{
						moduleId: "virtual:multi-2.css",
						variables: { transform: { origin: { center: "50% 50%" } } },
					},
					{
						moduleId: "virtual:unused.css",
						variables: {
							transform: { translate: { center: "translate(-50%, -50%)" } },
						},
					},
				]),
			],
		});

		// Expect virtual module to be loaded.
		expect(results).toHaveProperty("index.css");

		// Expect virtual modules to be concatenated into a single file.
		const css = results["index.css"];
		expect(css.match(/:root/g) || []).toHaveLength(2);
		expect(css).toContain(`:root {
  --transform-flip: rotate(180deg);
}`);
		expect(css).toContain(`:root {
  --transform-origin-center: 50% 50%;
}`);

		// Expect unused module to not be present.
		expect(css).not.toContain(`:root {
  --transform-translate-center: translate(-50%, -50%);
}`);
	});
});
