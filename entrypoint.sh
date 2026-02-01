#!/bin/sh

# 1. 定义路径
CONFIG_DIR="/data/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"
mkdir -p "$CONFIG_DIR"

# 2. 设置默认值 (如果环境变量没传，用这些保底)
# 注意：PORT 优先使用 Railway 注入的变量，如果没给则用你跑通的 18789
APP_PORT=${PORT:-18789}
LLM_PROVIDER=${LLM_PROVIDER:-xai}
LLM_MODEL_ID=${LLM_MODEL_ID:-grok-4-1-fast-reasoning}
LLM_MODEL_NAME=${LLM_MODEL_NAME:-"Grok 4.1 Fast Reasoning"}
LLM_BASE_URL=${LLM_BASE_URL:-"https://api.x.ai/v1"}
# 自动生成随机 Gateway Token，如果环境变量没给的话
GEN_GATEWAY_TOKEN=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
FINAL_GATEWAY_TOKEN=${GATEWAY_TOKEN:-$GEN_GATEWAY_TOKEN}

echo "🛠️ Configuring OpenClaw for SaaS instance..."

# 3. 动态生成 JSON (根据你提供的 2026.1.30 格式)
cat <<EOF > "$CONFIG_FILE"
{
  "meta": {
    "lastTouchedVersion": "2026.1.30",
    "lastTouchedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  "wizard": {
    "lastRunAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "lastRunVersion": "2026.1.30",
    "lastRunCommand": "onboard",
    "lastRunMode": "local"
  },
  "models": {
    "providers": {
      "$LLM_PROVIDER": {
        "api": "openai-completions",
        "baseUrl": "$LLM_BASE_URL",
        "apiKey": "$LLM_API_KEY",
        "models": [
          {
            "id": "$LLM_MODEL_ID",
            "name": "$LLM_MODEL_NAME"
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "$LLM_PROVIDER/$LLM_MODEL_ID"
      }
    }
  },
  "messages": {
    "ackReactionScope": "group-mentions"
  },
  "commands": {
    "native": "auto",
    "nativeSkills": "auto"
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing",
      "botToken": "$TELEGRAM_TOKEN",
      "groupPolicy": "allowlist",
      "streamMode": "partial"
    }
  },
  "gateway": {
    "port": $APP_PORT,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "$FINAL_GATEWAY_TOKEN"
    },
    "tailscale": {
      "mode": "off",
      "resetOnExit": false
    }
  },
  "skills": {
    "install": {
      "nodeManager": "npm"
    }
  },
  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  }
}
EOF

# 关键：由于我们在 Dockerfile 里把核心放在了 /openclaw
# 我们需要告诉 server.js 核心入口在哪里
export OPENCLAW_ENTRY="/openclaw/dist/index.js"

echo "✅ Configuration generated at $CONFIG_FILE"
echo "🔑 Gateway Auth Token: $FINAL_GATEWAY_TOKEN"

# 4. 启动服务
echo "🚀 Starting OpenClaw Service..."
exec npm start