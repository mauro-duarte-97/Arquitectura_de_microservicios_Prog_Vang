# SETUP LOCAL - Microservicio Python

## Paso 1: Crear Virtual Environment

```bash
cd Microservicio_inferencia_analisis
python -m venv venv
```

## Paso 2: Activar Virtual Environment

**En Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**En Windows (CMD):**
```cmd
venv\Scripts\activate
```

**En Linux/Mac:**
```bash
source venv/bin/activate
```

Deberías ver `(venv)` al inicio de la línea en la terminal.

## Paso 3: Instalar dependencias

```bash
pip install -r requirements.txt
```

## Paso 4: Verificar que funciona

```bash
python -c "import fastapi; import uvicorn; print('OK')"
```

## Paso 5: Ejecutar la app

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Deberías ver:
```
Uvicorn running on http://0.0.0.0:8000
```

## Paso 6: Probar el endpoint

Abre otra terminal (sin desactivar el venv) y prueba:

```bash
curl -X POST http://localhost:8000/analyze ^
  -H "Content-Type: application/json" ^
  -d "{\"code\": \"print('hola')\", \"language\": \"python\"}"
```

Deberías recibir un JSON con `issues`, `explanation` y `refactored_code`.

---

## Desactivar Virtual Environment (al terminar)

```bash
deactivate
```

---

## Si algo falla

- `python -m venv` no funciona: asegúrate de tener Python instalado globalmente (`python --version`)
- `pip install` falla: intenta `python -m pip install -r requirements.txt`
- `uvicorn` no se reconoce: asegúrate de que el venv está activado (debe decir `(venv)` en la terminal)
