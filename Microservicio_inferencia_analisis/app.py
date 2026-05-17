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
    # Etiqueta corta (2-5 palabras, ej. "INYECCION SQL"). Opcional: si el modelo
    # no la entrega, el frontend deriva un titulo del mensaje como fallback.
    title: Optional[str] = None


class AnalyzeResponse(BaseModel):
    issues: List[Issue]
    explanation: str
    refactored_code: str


# Configuración de Ollama (override-able por variables de entorno)
# En Docker hay que apuntar al host: OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_URL = f"{OLLAMA_BASE_URL}/api/generate"
OLLAMA_TAGS_URL = f"{OLLAMA_BASE_URL}/api/tags"
<<<<<<< Updated upstream
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2")
=======
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")
>>>>>>> Stashed changes


def check_ollama_availability() -> bool:
    """Chequea si Ollama responde. Se llama por request para soportar arranques en cualquier orden."""
    if requests is None:
        return False
    try:
        response = requests.get(OLLAMA_TAGS_URL, timeout=2)
        return response.status_code == 200
    except Exception:
        return False


import ast
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes


def _detect_python_syntax_error(code: str) -> Optional[dict]:
    """Pre-analisis con AST nativo solo para Python: linea y mensaje del parser."""
    try:
        ast.parse(code)
        return None
    except SyntaxError as e:
        return {
            "line": e.lineno or 1,
            "col": e.offset or 1,
            "message": f"SyntaxError: {e.msg or 'syntax error'}",
        }
    except Exception as e:
        return {
            "line": 1,
            "col": 1,
            "message": f"Error parsing code: {str(e)}",
        }


def _number_lines(code: str) -> str:
    """Devuelve el codigo con numeracion de linea al principio, util para que el LLM
    se ubique con precision al hablar de lineas."""
    lines = code.splitlines() or [""]
    width = max(2, len(str(len(lines))))
    return "\n".join(f"{idx:>{width}} | {line}" for idx, line in enumerate(lines, start=1))


def _strip_code_fences(code: str) -> str:
    """Si el LLM rodeo el codigo con ```python ... ```, lo quitamos.
    Soporta variaciones (```, ```py, ```python, mayusculas, espacios extra)."""
    if not code:
        return code
    s = code.strip()
    if s.startswith("```"):
        first_newline = s.find("\n")
        if first_newline != -1:
            s = s[first_newline + 1:]
        else:
            s = s[3:]
    if s.endswith("```"):
        s = s[: -3].rstrip()
    return s


def _normalize_title(raw_title: Optional[str], fallback_message: str) -> Optional[str]:
    """Normaliza la etiqueta corta del issue. Si el modelo manda algo razonable lo
    respeta (en mayusculas, ASCII); si no, deriva un titulo desde el mensaje.
    Si todo falla, devuelve None y dejamos que el frontend use su heuristico."""
    if raw_title:
        title = str(raw_title).strip()
        # Limitar largo: si nos mandan una frase larga, recortamos a 5 palabras.
        words = title.split()
        if len(words) > 6:
            title = " ".join(words[:6])
        return title.upper() if title else None

    # Fallback: usar las primeras palabras del mensaje.
    if fallback_message:
        words = fallback_message.strip().split()
        if words:
            return " ".join(words[:5]).upper().rstrip(",.;:")
    return None


def _build_prompt(code: str, language: str, mode: str, syntax_error: Optional[dict]) -> str:
    """Construye el prompt para el LLM.

    - Si hay syntax error detectado por AST (solo Python por ahora), se lo
      pasamos como contexto para que el modelo lo explique y corrija.
    - Si no, le pedimos analisis general (calidad, seguridad, vulnerabilidades).

    El prompt esta en ingles para que el modelo lo entienda mejor, pero pide
    explicitamente que la salida sea en espanol (es-AR) y didactica.
    """
    common_rules = (
        "ROLE: You are an expert code reviewer for a Spanish-speaking student learning "
        "platform (Argentina, es-AR). You are a patient teacher: clear, didactic, focused "
        "on the student's LEARNING, not on padding the response.\n"
        "\n"
        "OUTPUT RULES (read carefully, this is the most important part):\n"
        "1. Return STRICT JSON only. No markdown fences around the JSON, no commentary "
        "outside the JSON.\n"
        f"2. The language being analyzed is {language.upper()}. NEVER mix syntax rules from other "
        "languages. Do NOT mention semicolons, braces, types, etc. unless they belong to "
        f"{language}.\n"
        "3. Write ALL string values in Spanish (es-AR), with accents and tildes. Use the term "
        "'sentencia' or 'instruccion' (NOT 'afirmacion', which is a bad translation of 'statement').\n"
        "4. Be PRECISE. Quote the exact token or construct at fault only when you can point to it "
        "in the student's code. Do NOT invent grammar rules that do not exist.\n"
        "5. Be CONCISE. One focused paragraph in 'explanation' is better than three vague ones.\n"
        "6. For each issue, provide a SHORT 'title' (etiqueta de 2-5 palabras en MAYUSCULAS, "
        "sin acentos, ASCII OK) that names the KIND of issue, NOT a full description. The "
        "full description goes in 'message'. Examples of good titles: \"INYECCION SQL\", "
        "\"FALTA DE MANEJO DE ERRORES\", \"VARIABLE NO DEFINIDA\", "
        "\"STRING SIN COMILLAS\", \"USO DE PRINT EN PRODUCCION\", \"CONTRASENA HARDCODEADA\".\n"
        "7. 'refactored_code' must be RAW source code only. Do NOT wrap it with triple "
        "backticks or any markdown fences. Do NOT prepend a language tag. Just the code "
        "itself, with real newlines (\\n in JSON)."
    )

    schema = (
        "Schema (Spanish strings, English keys, no trailing commas):\n"
        "{\n"
        '  "issues": [\n'
        '    {\n'
        '      "line": <int>,\n'
        '      "title": "<2-5 palabras MAYUSCULAS, ASCII, ej. \\"INYECCION SQL\\">",\n'
        '      "message": "<descripcion completa en espanol, una frase clara que cita el '
        'caracter/token o el problema concreto>",\n'
        '      "severity": "critical" | "warning" | "info"\n'
        '    }\n'
        "  ],\n"
        '  "explanation": "<un parrafo en espanol: que esta mal, POR QUE esta mal en este '
        'lenguaje, y como pensarlo para no repetirlo. Nada de relleno generico>",\n'
        '  "refactored_code": "<solo codigo fuente, sin ``` ni etiqueta de lenguaje>"\n'
        "}"
    )

    numbered_code = _number_lines(code)

    if syntax_error:
        return f"""{common_rules}

CONTEXT: the student wrote {language.upper()} code. The official parser detected a SYNTAX ERROR.

Parser output (trust this verbatim; do not reinterpret it as another error type):
- Line: {syntax_error['line']}
- Column: {syntax_error.get('col', 1)}
- Message: {syntax_error['message']}

INSTRUCTIONS:
1. Read the student's code carefully. The parser message can be misleading (e.g. it may say
   "expected ':'" when the real mistake is an unquoted string, a typo, or invalid expression).
   Explain the ACTUAL problem visible in the code. Do NOT default to "falta dos puntos" unless
   the code clearly shows a block header (def/if/for/class/while/try/with) missing ':'.
2. In "issues": at least one critical issue on line {syntax_error['line']} in Spanish, with a
   title that matches the real mistake (not a generic colon rule).
3. In "explanation": one focused paragraph in Spanish about the real cause and how to fix it.
4. In "refactored_code": corrected code only, no line numbers, same intent as the student.

Student's code (with line numbers for reference; omit numbers in refactored_code):
{numbered_code}

Mode: {mode}

<<<<<<< Updated upstream
Respond in JSON format:
{{
  "issues": [
    {{"line": 1, "message": "error description", "severity": "warning|info"}}
  ],
  "explanation": "Clear explanation for the student",
  "refactored_code": "Improved version of the code"
}}"""
=======
{schema}"""

    return f"""{common_rules}

CONTEXT: the following {language.upper()} code passed basic syntax validation. Analyze it for:
- Logical bugs (off-by-one, wrong conditions, unreachable code, missing edge cases).
- Security vulnerabilities (SQL injection, command injection, path traversal, hardcoded secrets, unsafe deserialization, weak crypto).
- Performance issues (unnecessary loops, repeated work, N+1 patterns).
- Best practices and clean code (naming, structure, readability, error handling).

SEVERITY (be strict, do not inflate):
- "critical": breaks the program, security hole, or causes incorrect results.
- "warning": bad practice that should be fixed soon (no immediate damage).
- "info": minor suggestion or style note.

INSTRUCTIONS:
1. Only report issues actually present in the code. Do NOT invent generic issues to pad the response.
2. In "issues", reference exact lines from the numbered code below.
3. In "explanation", write ONE focused paragraph in Spanish that teaches the underlying concept(s). Do NOT just restate the issues.
4. In "refactored_code", return improved code in the SAME language ({language.upper()}), with no line numbers and keeping the student's original intent.

Code (with line numbers for reference; do NOT include the numbers in refactored_code):
{numbered_code}

Mode: {mode}

{schema}"""


def analyze_with_ollama(code: str, language: str, mode: str) -> dict:
    """Usa Ollama para analizar el codigo con IA.

    Flujo:
      1) Para Python, detectamos syntax errors con `ast` (nos da linea exacta).
      2) SIEMPRE llamamos al LLM (incluso con syntax error) para obtener
         explicacion pedagogica y codigo corregido.
      3) Si el LLM responde, normalizamos su salida y nos aseguramos de que
         el issue critico de sintaxis (cuando aplica) este presente.
      4) Si el LLM falla, hacemos fallback: devolvemos al menos el syntax error
         detectado por AST en lugar de no decir nada.
    """
    syntax_error = _detect_python_syntax_error(code) if language == "python" else None
    prompt = _build_prompt(code, language, mode, syntax_error)
>>>>>>> Stashed changes

    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
        }
<<<<<<< Updated upstream
        
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
=======

        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
>>>>>>> Stashed changes
        response.raise_for_status()

        result = response.json()
        response_text = result.get("response", "")

        analysis = json.loads(response_text)

        # Si habia syntax error, garantizamos que aparezca como issue critico.
        # El modelo a veces lo omite o le baja la severidad; preferimos ser
        # conservadores y mantener la senial del parser.
        if syntax_error:
            issues = analysis.get("issues") or []
            already_present = any(
                isinstance(i, dict)
                and i.get("line") == syntax_error["line"]
                and (i.get("severity") == "critical")
                for i in issues
            )
            if not already_present:
                issues.insert(0, {
                    "line": syntax_error["line"],
                    "title": "ERROR DE SINTAXIS",
                    "message": syntax_error["message"],
                    "severity": "critical",
                })
                analysis["issues"] = issues

        # Defensa contra fences de markdown en refactored_code: aunque el prompt
        # se lo pide, modelos chicos a veces igual lo envuelven en ```python ... ```.
        if analysis.get("refactored_code"):
            analysis["refactored_code"] = _strip_code_fences(analysis["refactored_code"])

        return analysis
    except Exception as ex:
        print(f"Ollama error: {ex}")
<<<<<<< Updated upstream
        # Return error info instead of None
        return {"error": f"Error conectando con Ollama: {str(ex)}"}
=======
        # Fallback amable: si hay syntax error detectado, al menos lo reportamos.
        if syntax_error:
            return {
                "issues": [{
                    "line": syntax_error["line"],
                    "message": syntax_error["message"],
                    "severity": "critical",
                }],
                "explanation": (
                    f"Se detecto un error de sintaxis en la linea {syntax_error['line']}: "
                    f"{syntax_error['message']}. No fue posible generar la explicacion "
                    "didactica detallada porque el agente de IA no respondio a tiempo. "
                    "Corregi el error de sintaxis y volve a analizar."
                ),
                "refactored_code": code,
            }
        return {"error": f"Error conectando con Ollama: {str(ex)}"}


def _safe_issue(raw: dict) -> Optional[Issue]:
    """Construye un Issue tolerando claves faltantes o mal tipadas del LLM."""
    try:
        line = raw.get("line", 0)
        if not isinstance(line, int):
            try:
                line = int(line)
            except Exception:
                line = 0
        message = str(raw.get("message", "")).strip() or "Sin descripcion."
        severity = str(raw.get("severity", "info")).lower()
        if severity not in {"critical", "warning", "info"}:
            severity = "info"
        title = _normalize_title(raw.get("title"), message)
        return Issue(line=line, message=message, severity=severity, title=title)
    except Exception:
        return None
>>>>>>> Stashed changes


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    code = request.code

<<<<<<< Updated upstream
    # Intenta usar Ollama si está disponible (se re-chequea por request)
=======
    # Intenta usar Ollama si esta disponible (se re-chequea por request).
>>>>>>> Stashed changes
    if check_ollama_availability():
        try:
            result = analyze_with_ollama(code, request.language, request.mode)
            if result:
                if "error" in result:
                    return AnalyzeResponse(
<<<<<<< Updated upstream
                        issues=[Issue(line=0, message="Error en análisis IA", severity="critical")],
                        explanation=result["error"],
                        refactored_code=code
                    )
                # Valida que los issues sean válidos
                issues = [Issue(**issue) for issue in result.get("issues", [])]
=======
                        issues=[Issue(
                            line=0,
                            message="No fue posible contactar al agente de IA.",
                            severity="critical",
                        )],
                        explanation=result["error"],
                        refactored_code=code,
                    )

                parsed_issues = [
                    issue for issue in (_safe_issue(i) for i in result.get("issues", []) or [])
                    if issue is not None
                ]
                if not parsed_issues:
                    parsed_issues = [Issue(
                        line=0,
                        message="No se detectaron problemas relevantes en el codigo.",
                        severity="info",
                    )]

>>>>>>> Stashed changes
                return AnalyzeResponse(
                    issues=parsed_issues,
                    explanation=result.get("explanation") or "Analisis completado.",
                    refactored_code=result.get("refactored_code") or code,
                )
        except Exception as ex:
            print(f"Error processing Ollama response: {ex}")

    # Fallback: analisis muy basico si Ollama no esta disponible. No reemplaza al LLM,
    # solo evita devolver vacio cuando el sistema no puede llegar al modelo.
    issues: List[Issue] = []

    if "TODO" in code:
        issues.append(Issue(line=1, message="Contiene comentario TODO sin resolver.", severity="warning"))

    if request.language == "python" and "print(" in code:
        issues.append(Issue(line=1, message="Uso de print en codigo de produccion.", severity="info"))

    if request.language == "kotlin" and "println(" in code:
        issues.append(Issue(line=1, message="Uso de println en codigo de produccion.", severity="info"))

    if request.language == "java" and "System.out.println(" in code:
        issues.append(Issue(line=1, message="Uso de System.out.println en codigo de produccion.", severity="info"))

    if not issues:
        issues.append(Issue(line=0, message="No se detectaron problemas graves.", severity="info"))

    if request.language == "python":
        refactored_code = code.replace("print(", "logger.info(")
    elif request.language == "kotlin":
        refactored_code = code.replace("println(", "logger.info(")
    else:
        refactored_code = code

    return AnalyzeResponse(
        issues=issues,
        explanation=(
            f"Analisis simplificado en modo {request.mode} para lenguaje {request.language}. "
            "El agente de IA (Ollama) no estaba disponible en este momento, asi que se mostro "
            "un analisis basico. Volve a intentar en unos segundos."
        ),
        refactored_code=refactored_code,
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
