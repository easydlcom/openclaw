---
name: wavespeed
description: Use any of 1,000+ AI models on WaveSpeedAI (image, video, audio, 3D generation). Triggers when the user wants to generate images, videos, audio/speech, or 3D assets using any AI model hosted on WaveSpeedAI. Also use when the user needs to browse models, upload media, or get API results from the platform.
---

# Wavespeed — Unified AI Media Generation

Lets you use any of 1,000+ models on [WaveSpeedAI](https://wavespeed.ai) via a single REST API. Covers text-to-image, image-to-video, text-to-video, audio/speech, 3D, upscalers, and more.

## API Basics

- **Submit task:** `POST https://api.wavespeed.ai/api/v3/{model-id}`
- **Poll result:** `GET https://api.wavespeed.ai/api/v3/predictions/{task-id}`
- **Upload media:** `POST https://api.wavespeed.ai/api/v3/media/upload/binary`
- **Auth:** `Authorization: Bearer ${WAVESPEED_API_KEY}`
- **API key:** Get one at [https://wavespeed.ai/accesskey](https://wavespeed.ai/accesskey)
- **Save key:** If the user provides a key, save it. Prefer saved keys. Only ask when none is available.

### Common Task Flow

1. Determine the right model ID for the task (see category references below)
2. Build the request payload with model-specific parameters
3. POST to `https://api.wavespeed.ai/api/v3/{model-id}`
4. Extract `data.id` (task ID) from response
5. Poll `GET https://api.wavespeed.ai/api/v3/predictions/{task-id}` until `status` is `completed` or `failed`
6. Read output URLs from `data.outputs` array
7. Download or present results to the user

**Polling:** Poll every 1-2 seconds. Stop on `completed` or `failed`. Default timeout: 5 minutes.

**Uploading media:** For image-to-video, image-to-image, or any model needing an input image/audio, first upload the file:

```bash
curl -X POST https://api.wavespeed.ai/api/v3/media/upload/binary \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -F 'file=@/path/to/file.png'
```

Response gives a `download_url` to pass to the model as the `image` (or equivalent) field.

## Category Selection

When the user's request is ambiguous about which category of model to use, ask one quick clarification question. Otherwise, pick the category yourself and proceed.

### Image Generation (text-to-image, image-to-image, image editing)

See [references/image.md](references/image.md) for model IDs, parameters, and examples.

Triggers: "generate an image", "create a picture of", "draw", "make a photo", image editing/upscaling.

### Video Generation (text-to-video, image-to-video)

See [references/video.md](references/video.md) for model IDs, parameters, and examples.

Triggers: "generate a video", "make a video of", "animate this", "turn this image into a video".

### Audio / Speech (text-to-speech, voice cloning, music)

See [references/audio.md](references/audio.md) for model IDs, parameters, and examples.

Triggers: "generate speech", "text to speech", "make music", "voice clone", "generate audio".

### 3D Asset Generation

See [references/3d.md](references/3d.md) for model IDs, parameters, and examples.

Triggers: "generate a 3D model", "create a 3D asset", "make a 3D object".

## Scripts

### `render_wavespeed.mjs`

A general-purpose script for submitting a task, polling, and downloading results. Use for any model type (image, video, audio, 3D — not just video).

```bash
node skills/wavespeed/scripts/render_wavespeed.mjs \
  --api-key "$WAVESPEED_API_KEY" \
  --model "wavespeed-ai/flux-dev" \
  --prompt "A cat in space" \
  --output ./output.png
```

See `--help` for all options: `--model`, `--prompt`, `--image`, `--negative-prompt`, `--duration`, `--resolution`, `--seed`, `--output`, `--poll-interval`, `--timeout`.

## Defaults & Behavior

- **No clarifying questions** when the goal is usable — infer cinematic, visual, or audio details and proceed.
- **Save API key** if user provides one; prefer saved key next time.
- **If user asks how to get an API key:** tell them to register/login at https://wavespeed.ai/accesskey.
- **Model IDs:** use the category reference files below to pick the right model ID and parameters.
- **Cost:** Wavespeed pricing is per-output and shown in the playground. The skill estimates cost only when the user asks.
