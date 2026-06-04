#!/usr/bin/env node
/**
 * Generic Wavespeed render script.
 *
 * Submits a task to any Wavespeed model, polls for completion,
 * and downloads the result.
 *
 * Usage:
 *   node render_wavespeed.mjs [options]
 *
 * Options:
 *   --api-key <key>       Wavespeed API key (or WAVESPEED_API_KEY env)
 *   --prompt <text>       Text prompt (required for most models)
 *   --model <id>          Model ID e.g. "wavespeed-ai/flux-dev" (required)
 *   --image <url>         Optional input image URL
 *   --extra <json>        Extra JSON parameters for the model body
 *   --duration <sec>      Video duration (video models only)
 *   --resolution <str>    Resolution e.g. "720p" (video models)
 *   --negative-prompt <t> Negative prompt
 *   --seed <num>          Random seed
 *   --output <path>       Output file path (default: ./output)
 *   --poll-interval <ms>  Poll interval (default: 2000)
 *   --timeout <sec>       Max wait time (default: 300)
 */

const WAVESPEED_BASE = "https://api.wavespeed.ai/api/v3";
const WAVESPEED_PREDICTION_BASE = `${WAVESPEED_BASE}/predictions`;

function printUsageAndExit() {
  console.error(`
Usage: node render_wavespeed.mjs [options]

Options:
  --api-key <key>       Wavespeed API key (or WAVESPEED_API_KEY env)
  --prompt <text>       Text prompt (required for most models)
  --model <id>          Model ID e.g. "wavespeed-ai/flux-dev" (required)
  --image <url>         Optional input image URL
  --extra <json>        Extra JSON parameters for the model body
  --duration <sec>      Video duration (video models only, 1-20)
  --resolution <str>    Resolution e.g. "720p" (video models)
  --negative-prompt <t> Negative prompt
  --seed <num>          Random seed
  --output <path>       Output file path (default: ./output)
  --poll-interval <ms>  Poll interval (default: 2000)
  --timeout <sec>       Max wait time (default: 300)
`);
  process.exit(1);
}

function parseArgs(args) {
  const parsed = {
    apiKey: process.env.WAVESPEED_API_KEY || null,
    prompt: null,
    model: null,
    image: null,
    extra: null,
    duration: null,
    resolution: "720p",
    negativePrompt: null,
    seed: null,
    output: "./output",
    pollInterval: 2000,
    timeout: 300,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") printUsageAndExit();
    else if (arg === "--api-key") parsed.apiKey = args[++i];
    else if (arg === "--prompt") parsed.prompt = args[++i];
    else if (arg === "--model") parsed.model = args[++i];
    else if (arg === "--image") parsed.image = args[++i];
    else if (arg === "--extra") parsed.extra = JSON.parse(args[++i]);
    else if (arg === "--duration") parsed.duration = parseInt(args[++i], 10);
    else if (arg === "--resolution") parsed.resolution = args[++i];
    else if (arg === "--negative-prompt") parsed.negativePrompt = args[++i];
    else if (arg === "--seed") parsed.seed = parseInt(args[++i], 10);
    else if (arg === "--output") parsed.output = args[++i];
    else if (arg === "--poll-interval") parsed.pollInterval = parseInt(args[++i], 10);
    else if (arg === "--timeout") parsed.timeout = parseInt(args[++i], 10);
  }

  if (!parsed.model) {
    console.error("Error: --model is required");
    printUsageAndExit();
  }

  return parsed;
}

function buildEndpoint(model) {
  return `${WAVESPEED_BASE}/${model}`;
}

async function submitTask(apiKey, endpoint, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} from ${endpoint}: ${text}`);
  }

  return res.json();
}

async function pollTask(apiKey, taskId, pollIntervalMs, timeoutSec) {
  const startTime = Date.now();
  const maxWaitMs = timeoutSec * 1000;
  const statusUrl = `${WAVESPEED_PREDICTION_BASE}/${taskId}`;

  while (true) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= maxWaitMs) {
      throw new Error(`Polling timeout after ${timeoutSec}s for task ${taskId}`);
    }

    const res = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Poll HTTP ${res.status}: ${text}`);
    }

    const json = await res.json();
    const data = json.data || json;
    const status = data.status;

    if (status === "completed") {
      return data;
    }
    if (status === "failed") {
      throw new Error(`Task failed: ${data.error || "Unknown error"}`);
    }

    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
}

async function downloadFile(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  require("fs").writeFileSync(outputPath, Buffer.from(buffer));
}

function inferExtension(url) {
  const clean = url.split("?")[0].split("#")[0];
  const match = clean.match(/\.(\w+)$/);
  return match ? match[1] : null;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.apiKey) {
    console.error("Error: WAVESPEED_API_KEY required. Provide via --api-key or environment variable.");
    process.exit(1);
  }

  const endpoint = buildEndpoint(parsed.model);

  // Build payload
  const payload = {};
  if (parsed.prompt) payload.prompt = parsed.prompt;
  if (parsed.image) payload.image = parsed.image;
  if (parsed.duration !== null) payload.duration = Math.min(Math.max(parsed.duration, 1), 20);
  if (parsed.resolution) payload.resolution = parsed.resolution;
  if (parsed.negativePrompt) payload.negative_prompt = parsed.negativePrompt;
  if (parsed.seed !== null) payload.seed = parsed.seed;
  if (parsed.extra) Object.assign(payload, parsed.extra);

  console.log(`Model: ${parsed.model}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

  const submitResult = await submitTask(parsed.apiKey, endpoint, payload);
  const taskId = submitResult.data?.id || submitResult.id;
  if (!taskId) {
    throw new Error(`No task ID in response: ${JSON.stringify(submitResult)}`);
  }

  console.log(`Task submitted: ${taskId}`);
  console.log("Polling for results...");

  const resultData = await pollTask(parsed.apiKey, taskId, parsed.pollInterval, parsed.timeout);

  const outputs = resultData.outputs || [];
  if (outputs.length === 0) {
    throw new Error(`No outputs in completed result: ${JSON.stringify(resultData)}`);
  }

  const resultUrl = outputs[0];
  console.log(`Result URL: ${resultUrl}`);

  // Determine output path with extension
  let outputPath = parsed.output;
  const ext = inferExtension(resultUrl);
  if (ext && !outputPath.includes(".")) {
    outputPath = `${outputPath}.${ext}`;
  }

  console.log(`Downloading to: ${outputPath}`);
  await downloadFile(resultUrl, outputPath);

  console.log(`Done! Saved to: ${outputPath}`);

  // Output machine-readable metadata JSON
  const metadata = {
    status: "completed",
    task_id: taskId,
    result_url: resultUrl,
    local_path: require("path").resolve(outputPath),
    model: parsed.model,
    timings: resultData.timings || null,
  };
  console.log("\n---METADATA---");
  console.log(JSON.stringify(metadata));
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
