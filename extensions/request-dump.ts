import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}`;

function stringify(value: unknown): string {
	return JSON.stringify(
		value,
		(_key, v: unknown) => {
			if (typeof v === "bigint") {
				return v.toString();
			}
			return v;
		},
		2,
	);
}

function getDumpDir(cwd: string): string {
	const configured = process.env.PI_REQUEST_DUMP_DIR;
	if (configured && configured.trim().length > 0) {
		return resolve(cwd, configured);
	}
	return join(cwd, ".pi", "request-dumps");
}

function writeDump(cwd: string, fileName: string, value: unknown): string {
	const dir = getDumpDir(cwd);
	mkdirSync(dir, { recursive: true });
	const file = join(dir, fileName);
	writeFileSync(file, stringify(value));
	return file;
}

export default function (pi: ExtensionAPI) {
	let promptNumber = 0;
	let requestNumber = 0;

	pi.on("before_agent_start", (event, ctx) => {
		promptNumber += 1;
		requestNumber = 0;

		const file = writeDump(ctx.cwd, `${runId}-p${String(promptNumber).padStart(3, "0")}-user-prompt-raw.json`, {
			prompt: event.prompt,
			images: event.images,
			systemPrompt: event.systemPrompt,
			systemPromptOptions: event.systemPromptOptions,
			leafId: ctx.sessionManager.getLeafId(),
			activeBranchEntries: ctx.sessionManager.getBranch(),
		});
		console.error(`Wrote raw user prompt context: ${file}`);
	});

	pi.on("context", (event, ctx) => {
		const nextRequestNumber = requestNumber + 1;
		const file = writeDump(
			ctx.cwd,
			`${runId}-p${String(promptNumber).padStart(3, "0")}-r${String(nextRequestNumber).padStart(3, "0")}-raw-llm-context.json`,
			{
				model: ctx.model,
				systemPrompt: ctx.getSystemPrompt(),
				messages: event.messages,
				contextUsage: ctx.getContextUsage(),
			},
		);
		console.error(`Wrote raw LLM context: ${file}`);

		return { messages: event.messages };
	});

	pi.on("before_provider_request", (event, ctx) => {
		requestNumber += 1;
		const file = writeDump(
			ctx.cwd,
			`${runId}-p${String(promptNumber).padStart(3, "0")}-r${String(requestNumber).padStart(3, "0")}-provider-payload.json`,
			event.payload,
		);
		console.error(`Wrote provider request payload: ${file}`);

		return undefined;
	});
}
