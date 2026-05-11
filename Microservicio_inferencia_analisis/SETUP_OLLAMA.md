# Configuración de Ollama - Análisis de Código con IA Local

## ¿Qué es Ollama?

Ollama es una herramienta que permite ejecutar modelos de lenguaje grandes (LLMs) de forma local en tu máquina, sin necesidad de estar conectado a internet ni usar APIs externas.

## Requisitos

- **RAM mínima**: 8 GB (recomendado 16 GB)
- **Espacio en disco**: ~10 GB para el modelo Mistral
- **Conexión a internet** (solo para la descarga inicial)

## Instalación

### 1. Descarga Ollama
- Ve a [ollama.ai](https://ollama.ai)
- Descarga la versión para tu SO (Windows, macOS, Linux)
- Instala normalmente

### 2. Abre una terminal y descarga el modelo

```bash
ollama pull mistral
```

Este comando:
- Descarga el modelo Mistral (~5 GB)
- Lo almacena localmente
- Puede tardar varios minutos según tu conexión

### 3. Inicia Ollama

```bash
ollama serve
```

Verás algo como:
```
2026-05-10 23:00:00 Listening on [::]:11434
```

Mantén esta terminal abierta mientras uses el sistema.

## Activar el entorno Python

En otra terminal, desde la carpeta del proyecto:

```bash
cd Microservicio_inferencia_analisis
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# o ./venv/bin/activate   # Linux/Mac

pip install -r requirements.txt
```

## Ejecutar el microservicio Python

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 5000
```

Verás en los logs:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:5000
```

## Verificar que todo funciona

### Test 1: Verifica que Ollama está conectado

```bash
GET http://localhost:5000/test
```

Respuesta esperada:
```json
{
  "status": "ok",
  "ollama_available": true,
  "model": "mistral"
}
```

Si `ollama_available` es `false`, asegúrate que `ollama serve` está corriendo en otra terminal.

### Test 2: Envía un análisis a Ollama

```bash
POST http://localhost:5000/analyze
Body (JSON):
{
  "code": "print('hello') + print('goodbye')",
  "language": "python",
  "mode": "Senior Dev"
}
```

Ollama tardará algunos segundos en responder (primera vez puede ser más lenta). Verás un análisis profundo con:
- Errores de sintaxis identificados
- Issues de calidad
- Explicación pedagógica
- Código refactorizado

## Modelos alternativos

Si Mistral es muy pesado o quieres probar otro modelo:

```bash
ollama pull neural-chat      # Más ligero (~4 GB)
ollama pull llama2           # Alternativa buena
ollama pull dolphin-mixtral  # Muy potente pero pesado
```

Luego cambia en `app.py`:
```python
OLLAMA_MODEL = "neural-chat"  # Cambia este nombre
```

## Solución de problemas

### Error: "Connection refused" 
- ¿Ejecutaste `ollama serve` en otra terminal? Asegúrate de que esté en ejecución

### Error: "Model not found"
- Ejecuta `ollama pull mistral` para descargar el modelo

### La respuesta tarda mucho
- Es normal la primera vez
- Ollama cachea después, futuras respuestas son más rápidas

### Se agota la RAM
- Reduce tamaño de entrada
- O usa un modelo más pequeño (neural-chat)
- O aumenta RAM disponible

## Integración con el sistema

### Flujo completo

1. **Frontend** → POST a Java en puerto 8080
2. **Java** → Redirige a Python en puerto 5000  
3. **Python** → Conecta a Ollama en puerto 11434
4. **Ollama** → Analiza con IA local
5. **Respuesta** → Vuelve al usuario

### Puertos necesarios

- **8080**: Microservicio Java
- **5000**: Microservicio Python  
- **11434**: Ollama (no expuesto al usuario)

## Próximos pasos

Una vez configurado Ollama:
- Prueba con diferentes lenguajes (Java, Kotlin, JavaScript)
- Ajusta el prompt en `analyze_with_ollama()` para mejorar la calidad
- Experimenta con diferentes modos (Senior Dev, Junior Dev)

## Documentación

- Ollama: https://github.com/ollama/ollama
- Modelos disponibles: https://ollama.ai/library
- API Ollama: https://github.com/ollama/ollama/blob/main/docs/api.md
