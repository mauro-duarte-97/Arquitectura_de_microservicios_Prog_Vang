#!/bin/sh
set -e

MODEL="${OLLAMA_MODEL:-qwen2.5-coder:7b}"

echo "[ollama-init] Arrancando servidor Ollama en background..."
ollama serve &
SERVER_PID=$!

# Espera a que el servidor responda antes de intentar pull.
echo "[ollama-init] Esperando a que el servidor este listo..."
i=0
until ollama list >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "[ollama-init] El servidor Ollama no respondio en 30s. Abortando."
    exit 1
  fi
  sleep 1
done

# Si el modelo ya esta descargado (volumen persistente), no lo vuelve a bajar.
if ollama show "${MODEL}" >/dev/null 2>&1; then
  echo "[ollama-init] Modelo ${MODEL} ya disponible localmente. Saltando descarga."
else
  echo "[ollama-init] Descargando modelo ${MODEL}... (esto puede tardar varios minutos la primera vez)"
  ollama pull "${MODEL}"
  echo "[ollama-init] Modelo ${MODEL} descargado."
fi

echo "[ollama-init] Listo. Servidor Ollama corriendo en 0.0.0.0:11434."

# Cede el control al proceso de ollama para que docker reciba sus se\u00f1ales.
wait "$SERVER_PID"
