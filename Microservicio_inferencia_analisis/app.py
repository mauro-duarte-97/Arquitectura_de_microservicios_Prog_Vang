import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
try:
    import requests # pyright: ignore[reportMissingModuleSource]
except ImportError:
    requests = None
import json

app = FastAPI()


class AnalyzeRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    mode: Optional[str] = "Senior Dev"


class Issue(BaseModel):
    line: int
    message: str
    severity: str


class AnalyzeResponse(BaseModel):
    issues: List[Issue]
    explanation: str
    refactored_code: str


<<<<<<< Updated upstream
def check_ollama_availability():
    """Verifica si Ollama está disponible"""
=======
# Configuración de Ollama (override-able por variables de entorno)
# En Docker hay que apuntar al host: OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2")


def check_ollama_availability() -> bool:
    """Chequea si Ollama responde. Se llama por request para soportar arranques en cualquier orden."""
    if requests is None:
        return False
>>>>>>> Stashed changes
    try:
        response = requests.get(OLLAMA_TAGS_URL, timeout=2)
        return response.status_code == 200
    except Exception:
        return False

# Configuración de Ollama
OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2"
OLLAMA_AVAILABLE = check_ollama_availability()


import ast

import ast

def analyze_with_ollama(code: str, language: str, mode: str) -> dict:
    """Usa Ollama para analizar el código con IA"""
    
    # First, check for syntax errors
    if language == "python":
        try:
            ast.parse(code)
        except SyntaxError as e:
            return {
                "issues": [{"line": e.lineno or 1, "message": f"SyntaxError: {e.msg}", "severity": "critical"}],
                "explanation": f"Hay un error de sintaxis en la línea {e.lineno or 1}: {e.msg}. Corrige este error antes de continuar.",
                "refactored_code": code  # No refactorizar si hay error
            }
        except Exception as e:
            return {
                "issues": [{"line": 1, "message": f"Error parsing code: {str(e)}", "severity": "critical"}],
                "explanation": f"Error al analizar el código: {str(e)}",
                "refactored_code": code
            }
    
    prompt = f"""You are an expert code reviewer analyzing code for a student learning platform.
The code has been checked for syntax errors and is valid. Now provide:
1. Identify logical issues and code quality problems (performance, security, best practices)
2. Provide an explanation suitable for a student
3. Suggest refactored code

Code to analyze:
```{language}
{code}
```

Mode: {mode}

Respond in JSON format:
{{
  "issues": [
    {{"line": 1, "message": "error description", "severity": "warning|info"}}
  ],
  "explanation": "Clear explanation for the student",
  "refactored_code": "Improved version of the code"
}}"""

    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        response_text = result.get("response", "")
        
        # Parse JSON response
        analysis = json.loads(response_text)
        return analysis
    except Exception as ex:
        print(f"Ollama error: {ex}")
        # Return error info instead of None
        return {"error": f"Error conectando con Ollama: {str(ex)}"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    code = request.code

    # Intenta usar Ollama si está disponible (se re-chequea por request)
    if check_ollama_availability():
        try:
            result = analyze_with_ollama(code, request.language, request.mode)
            if result:
                if "error" in result:
                    return AnalyzeResponse(
                        issues=[Issue(line=0, message="Error en análisis IA", severity="critical")],
                        explanation=result["error"],
                        refactored_code=code
                    )
                # Valida que los issues sean válidos
                issues = [Issue(**issue) for issue in result.get("issues", [])]
                return AnalyzeResponse(
                    issues=issues if issues else [Issue(line=0, message="No issues found", severity="info")],
                    explanation=result.get("explanation", "Analysis completed"),
                    refactored_code=result.get("refactored_code", code)
                )
        except Exception as ex:
            print(f"Error processing Ollama response: {ex}")
    
    # Fallback: análisis básico si Ollama no está disponible
    issues = []
    
    if "TODO" in code:
        issues.append(Issue(line=1, message="Contiene comentario TODO sin resolver", severity="warning"))

    if "print(" in code and request.language == "python":
        issues.append(Issue(line=1, message="Uso de print en código de producción", severity="info"))

    if "println(" in code and request.language == "kotlin":
        issues.append(Issue(line=1, message="Uso de println en código de producción", severity="info"))

    if "System.out.println(" in code and request.language == "java":
        issues.append(Issue(line=1, message="Uso de System.out.println en código de producción", severity="info"))

    if not issues:
        issues.append(Issue(line=0, message="No se detectaron problemas graves", severity="info"))

    if request.language == "python":
        refactored_code = code.replace("print(", "logger.info(")
    elif request.language == "kotlin":
        refactored_code = code.replace("println(", "logger.info(")
    else:
        refactored_code = code

    return AnalyzeResponse(
        issues=issues,
        explanation=f"Análisis simulado en modo {request.mode} para lenguaje {request.language}. Nota: Ollama no disponible",
        refactored_code=refactored_code
    )


@app.get("/test")
def test():
    available = check_ollama_availability()
    return {
        "status": "ok",
        "ollama_available": available,
        "ollama_base_url": OLLAMA_BASE_URL,
        "model": OLLAMA_MODEL if available else "none"
    }
