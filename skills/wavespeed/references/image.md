# Image Generation Models on WaveSpeedAI

## Popular Models

| Model ID | Type | Notes |
|----------|------|-------|
| `wavespeed-ai/flux-dev` | text-to-image | Fast, high quality. Default 1024x1024 |
| `wavespeed-ai/flux-pro` | text-to-image | Premium quality, higher cost |
| `wavespeed-ai/flux-dev-lora` | text-to-image | Supports LoRA adapters |
| `bytedance/seedream-5.0` | text-to-image | ByteDance model, strong at photorealism |
| `openai/gpt-image-2` | text-to-image | OpenAI's latest image model |
| `stability-ai/stable-diffusion-3.5` | text-to-image | Stable Diffusion |
| `wan-2.1/image-to-image` | image-to-image | WAN 2.1 image editing |
| `wavespeed-ai/real-esrgan` | upscaler | 2x/4x upscaling |

## Common Parameters

```json
{
  "prompt": "A cat wearing a space suit",
  "width": 1024,
  "height": 1024,
  "seed": 42,
  "webhook_url": "https://..."
}
```

**For image-to-image models**, add `"image": "<uploaded-image-url>"`.

**For upscalers**, add `"image": "<uploaded-image-url>"` and optionally `"scale": 2`.

**For LoRA models**, add:

```json
{
  "loras": [{
    "path": "nerijs/pixel-art-xl",
    "scale": 0.8
  }]
}
```

## Example: Text-to-Image

```bash
curl -X POST https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A majestic dragon flying over a medieval castle at sunset, cinematic lighting"}'
```

Poll `GET https://api.wavespeed.ai/api/v3/predictions/{task-id}` until completed. Outputs are at `data.outputs[0]`.

## Example: Upscale

1. Upload image: `POST /api/v3/media/upload/binary` → get `download_url`
2. Submit task:
```bash
curl -X POST https://api.wavespeed.ai/api/v3/wavespeed-ai/real-esrgan \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"image": "<download_url>", "scale": 4}'
```
