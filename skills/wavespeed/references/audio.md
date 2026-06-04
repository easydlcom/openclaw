# Audio / Speech Models on WaveSpeedAI

## Popular Models

| Model ID | Type | Notes |
|----------|------|-------|
| `elevenlabs/eleven-multilingual-v2` | text-to-speech | High-quality multilingual TTS |
| `elevenlabs/eleven-turbo-v2` | text-to-speech | Fast TTS |
| `openai/tts` | text-to-speech | OpenAI TTS |
| `openai/tts-hd` | text-to-speech | OpenAI HD TTS |

## Common Parameters

```json
{
  "prompt": "The text to speak aloud",
  "voice": "alloy",
  "speed": 1.0
}
```

For ElevenLabs models, additional parameters:

```json
{
  "voice_id": "EXAVITQu4vr...",
  "model_id": "eleven_multilingual_v2",
  "stability": 0.5,
  "similarity_boost": 0.75
}
```

## Example: Text-to-Speech

```bash
curl -X POST https://api.wavespeed.ai/api/v3/elevenlabs/eleven-multilingual-v2 \
  -H "Authorization: Bearer $WAVESPEED_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello, this is a test of the WaveSpeedAI text to speech system.",
    "voice": "alloy"
  }'
```

Result URL at `data.outputs[0]`. Download audio file for the user.
