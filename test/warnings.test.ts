import path from "path";
import { fileURLToPath } from "url";
import { beforeEach, describe, expect, it } from "vitest";
import { viteBuildCss } from "./util/vite-build";
import pluginVirtualCssVariables from "../src";

import type { Logger } from "vite";

/**
 * Vite logger that tracks the state of warning messages and the existence of
 * error messages.
 */
interface MockWarnLogger extends Logger {
	/** Queue of warn log messages. */
	queue: string[];
	/** Last warn log message received, if it exists. */
	last: string | undefined;
	/** Number of warn logs that have been received. */
	length: number;
	/** Whether or not the logger has received an error log. */
	hasErrored: boolean;
}

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = path.resolve(__dirname, "./fixtures/simple");

describe("warning messages", () => {
	let customLogger: MockWarnLogger;

	beforeEach(() => {
		// Create a new warn logger for each test.
		customLogger = createMockWarnLogger();
	});

	it("warns about empty module ids", async () => {
		try {
			await viteBuildCss(root, {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				plugins: [pluginVirtualCssVariables({ moduleId: null, variables: {} })],
				customLogger,
			});
		} catch (_) {
			// Expect a error to occur.
			expect(customLogger.hasErrored).toBe(true);

			// Expect a warning to occur.
			expect(customLogger.hasWarned).toBe(true);

			// Expect the warning to be related to an empty module ID.
			const warnings = customLogger.queue;
			expect(warnings).toHaveLength(1);
			expect(warnings[0]).toContain("plugin:vite-plugin-virtual-css-variables");
			expect(warnings[0]).toContain(
				"empty module id found in plugin options at index 0"
			);
		}
	});

	it("warns about duplicate module ids", async () => {
		const opts = {
			moduleId: "virtual:simple.css",
			variables: { "primary-color": "blue" },
		};

		await viteBuildCss(root, {
			plugins: [pluginVirtualCssVariables([opts, opts])],
			customLogger,
		});

		// Expect no errors to occur.
		expect(customLogger.hasErrored).toBe(false);

		// Expect a warning to occur.
		expect(customLogger.hasWarned).toBe(true);

		// Expect the warning to be related to a duplicate module ID.
		const warnings = customLogger.queue;
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toContain("plugin:vite-plugin-virtual-css-variables");
		expect(warnings[0]).toContain(
			`duplicate module id, "${opts.moduleId}", found in plugin options at index 1`
		);
	});

	it("warns about invalid variable value", async () => {
		const opts = {
			moduleId: "virtual:simple.css",
			variables: { "primary-color": 0x0000ff },
		};

		await viteBuildCss(root, {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			plugins: [pluginVirtualCssVariables(opts)],
			customLogger,
		});

		// Expect no errors to occur.
		expect(customLogger.hasErrored).toBe(false);

		// Expect a warning to occur.
		expect(customLogger.hasWarned).toBe(true);

		// Expect the warning to be related to a malformed variables map.
		const warnings = customLogger.queue;
		expect(warnings).toHaveLength(1);
		expect(warnings[0]).toContain("plugin:vite-plugin-virtual-css-variables");
		expect(warnings[0]).toContain(
			`css variables object for module "${opts.moduleId}" is malformed`
		);
	});
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

/**
 * Create a Vite logger that tracks warn logs and existence of errors.
 *
 * @returns logger instance that tracks warnings
 */
function createMockWarnLogger(): MockWarnLogger {
	const queue: string[] = [];
	let hasErrored = false;

	return {
		info: noop,
		warnOnce: noop,
		clearScreen: noop,
		hasErrorLogged: () => false,
		error() {
			if (hasErrored) return;
			hasErrored = true;
		},
		get hasErrored() {
			return hasErrored;
		},
		warn(msg) {
			queue.push(msg);
		},
		get hasWarned() {
			return queue.length > 0;
		},
		get queue() {
			return queue;
		},
		get last() {
			return queue.length > 0 ? queue[queue.length - 1] : undefined;
		},
		get length() {
			return queue.length;
		},
	};
}
