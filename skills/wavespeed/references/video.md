# Video Generation Models on WaveSpeedAI

## Popular Models

| Model ID | Type | Notes |
|----------|------|-------|
| `bytedance/seedance-2.0/text-to-video` | text-to-video | ByteDance, fast. Default 5s |
| `bytedance/seedance-2.0/image-to-video` | image-to-video | ByteDance, animate from image |
| `kling/kling-1.6/text-to-video` | text-to-video | Kuaishou Kling 1.6 |
| `kling/kling-1.6/image-to-video` | image-to-video | Kling from image |
| `wan-2.1/text-to-video` | text-to-video | WAN 2.1 |
| `wan-2.1/image-to-video` | image-to-video | WAN 2.1 from image |
| `minimax/minimax-video/text-to-video` | text-to-video | MiniMax |
| `google/veo-3.1/text-to-video` | text-to-video | Google Veo 3.1 |
| `luma/luma-ray-2/text-to-video` | text-to-video | Luma Ray 2 |

## Common Parameters

```json
{
  "prompt": "A cat walking on a beach at sunset, cinematic",
  "duration": 5,
  "resolution": "720p",
  "seed": 42,
  "negative_prompt": "blurry, low quality",
  "webhook_url": "https://..."
}
```

**For image-to-video**, add `"image": "<uploaded-image-url>"`.

### Resolution Options
- `480p` (fastest, cheapest)
- `720p` (default, good balance)
- `1080p` (highest quality, most expensive)

### Duration
- 1-20 seconds, default 5. Not all models support the full range.

## Example: Text-to-Video

```bash
curl -X POST https://api.wavespeed.ai/api/v3/bytedance/seedance-2.0/text-to-video \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene lake at golden hour with mountains in the background, cinematic quality",
    "duration": 5,
    "resolution": "720p"
  }'
```

## Example: Image-to-Video

1. Upload image: `POST /api/v3/media/upload/binary` → get `download_url`
2. Submit task:
```bash
curl -X POST https://api.wavespeed.ai/api/v3/bytedance/seedance-2.0/image-to-video \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "The person waves their hand gently",
    "image": "<download_url>",
    "duration": 5
  }'
```

## Multiple Shot Pipeline

For complex multi-shot sequences (story-like videos):

1. **Shot 1 (text-to-video):** Generate from prompt
2. **Download + extract last frame** using ffmpeg
3. **Upload last frame** via media upload endpoint
4. **Shot 2+ (image-to-video):** Use uploaded frame as `image`
5. **Concatenate** all shots with ffmpeg

The existing `skills/video-generate/` skill handles this pipeline. For a single video or simple request, use this skill directly.
