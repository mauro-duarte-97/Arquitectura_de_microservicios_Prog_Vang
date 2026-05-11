Flujo principal (caso de uso)

Usuario pega código en UI
UI → Java (POST /analyze)

Java:
valida usuario (JWT)
guarda request
llama a Python

Python:
arma prompt (modo "Senior Dev")
consulta LLM
devuelve JSON estructurado

Java:
guarda resultado
responde a UI

UI:
renderiza resultados por severidad

######## FASES ##########

Plan de trabajo por etapas

🔹 Fase 1 – Diseño (2–3 días)
Definir:
endpoints (OpenAPI)
modelo de datos (DER)
estructura JSON de IA
Setup repositorio + branching

🔹 Fase 2 – MVP funcional (1–2 semanas)
Java:
auth + endpoint /analyze
Python:
endpoint /analyze
integración con LLM
UI:
editor simple + submit
Comunicación funcionando

🔹 Fase 3 – Features clave
clasificación por severidad
refactor automático
historial de consultas
soporte multi-lenguaje

🔹 Fase 4 – Hardening
manejo de errores
timeouts IA
logs
mejoras UI

🔹 Fase 5 – Entrega
documentación
docker-compose
demo