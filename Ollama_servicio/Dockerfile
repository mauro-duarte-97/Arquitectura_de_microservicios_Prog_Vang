# Extiende la imagen oficial de Ollama agregando un entrypoint que se
# asegura de tener el modelo `qwen2.5-coder:7b` descargado antes de aceptar
# requests. El modelo se persiste en el volumen `ollama_data` (ver
# docker-compose.yml), as\u00ed que la descarga solo ocurre en el primer
# arranque.
FROM ollama/ollama:latest

COPY entrypoint.sh /entrypoint.sh
# Si el script se commiteo desde Windows con line endings CRLF, el kernel
# Linux falla al interpretar el shebang (#!/bin/sh\r). Normalizamos a LF
# y le damos permiso de ejecucion.
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

# El binario de ollama escucha en 11434 por default.
EXPOSE 11434

ENTRYPOINT ["/entrypoint.sh"]
