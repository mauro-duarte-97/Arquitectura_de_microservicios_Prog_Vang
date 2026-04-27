from fastapi import FastAPI

app = FastAPI()

@app.post("/analyze")
def analyze():
    return {
        "issues": [
            {
                "line": 10,
                "message": "Variable no utilizada",
                "severity": "warning"
            }
        ],
        "explanation": "Este es un mock inicial",
        "refactored_code": "print('Hola mundo')"
    }

@app.get("/test")
def test():
    return {"status": "ok"}