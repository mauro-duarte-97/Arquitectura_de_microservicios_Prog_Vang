# La Comunicación entre Java y Python 

En este documento se explica cómo abordamos, planificamos y terminamos resolviendo la comunicación de estos dos microservicios para el TP.

---

## 1. El Abordaje: ¿Por qué HTTP/REST?

Cuando planteamos la arquitectura, sabíamos que teníamos dos mundos distintos:
1. **Java/Spring Boot**: El orquestador del sistema. Se encarga del trabajo pesado a nivel empresarial: seguridad (JWT), persistencia en la base de datos (Postgres), auditoría de usuarios e historial.
2. **Python/FastAPI**: El especialista en IA. Está ahí porque el ecosistema de Python para inteligencia artificial y procesamiento de datos es insuperable. Se encarga de formatear los prompts y hablarle al motor local de Ollama.

### ¿Cómo los conectamos?
Teniamos varias opciones (colas de mensajería como RabbitMQ, gRPC, etc.), pero fuimos por la vía más directa y robusta para este caso de uso: **HTTP/REST síncrono**.
*   El usuario está esperando el reporte en tiempo real. Pega su código en la web, hace clic y quiere el veredicto de la IA. Es un flujo puramente de **Solicitud-Respuesta (Request-Response)**.
*   ¿El formato? JSON. Universal, liviano y súper fácil de parsear en ambos lenguajes.

---

## 2. La Planificación: El "Contrato" de Datos

Antes de empezar, tuvimos que definir el contrato. Java y Python tenian que hablar el mismo lenguaje. 

Definimos los DTOs (Data Transfer Objects) que viajarían de un lado al otro:

### El envío (Java ➔ Python)
Java recopila el código del usuario, el lenguaje y el "modo" del auditor (por ejemplo, *Senior Dev*), arma un JSON y lo manda en un `POST /analyze`:

```json
{
  "code": "def mi_funcion():\nprint('hola')",
  "language": "python",
  "mode": "Senior Dev"
}
```

*   **En Java**: Lo mapeamos con una clase record o DTO estándar (`AnalyzeRequest`).
*   **En Python**: FastAPI lo recibe con el validador **Pydantic**, que comprueba de forma automática que los tipos coincidan y no falte nada:
    ```python
    class AnalyzeRequest(BaseModel):
        code: str
        language: str
        mode: str
    ```

### La respuesta (Python ➔ Java)
Una vez que Python procesa y consulta a Ollama, devuelve las vulnerabilidades encontradas estructuradas y listas para persistir en Postgres:

```json
{
  "issues": [
    {
      "line": 2,
      "title": "INDENTACIÓN FALTANTE",
      "message": "Falta indentación en el bloque de la función.",
      "severity": "critical"
    }
  ],
  "explanation": "En Python, los bloques de código se definen por...",
  "refactoredCode": "def mi_funcion():\n    print('hola')"
}
```

---

## 3. La Resolución: Cómo lo implementamos

### El cliente en Java (Spring Boot)
Para hacer la petición HTTP desde Java usamos `RestTemplate`. La configuración clave es cómo definimos la URL destino. 

En desarrollo local corriendo los servicios por separado, la URL es `http://localhost:5000`. Pero en producción dentro de Docker, la cosa cambia. Gracias a la resolución de nombres interna de Docker Compose, pudimos parametrizar la URL en el `application.properties`:

# properties
# URL por defecto (dentro de la red Docker)
python.service.base-url=http://microservicio_inferencia_analisis:5000

El servicio en Spring Boot hace esto:

# java
@Service
public class AnalyzeService {
    @Value("${python.service.base-url}")
    private String pythonServiceUrl;
    
    private final RestTemplate restTemplate;

    public AnalyzeResponse callPythonAnalyzer(AnalyzeRequest request) {
        String endpoint = pythonServiceUrl + "/analyze";
        // Mandamos el JSON y esperamos la respuesta tipada
        return restTemplate.postForObject(endpoint, request, AnalyzeResponse.class);
    }
}
```

### El servidor en Python (FastAPI)
FastAPI recibe la petición con gran velocidad gracias a Uvicorn. Expone el endpoint `/analyze` de forma asíncrona para no bloquear el hilo principal mientras le consulta a Ollama en el puerto `11434`:

# python
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_code(request: AnalyzeRequest):
    # 1. Armamos el prompt personalizado
    prompt = generar_prompt(request.code, request.language, request.mode)
    
    # 2. Invocamos a Ollama (http://ollama:11434)
    raw_ai_response = await llamar_a_ollama(prompt)
    
    # 3. Estructuramos y limpiamos el output para que coincida con la respuesta esperada
    return procesar_respuesta(raw_ai_response)

---

## 4. Docker Compose Networking

Uno de los mayores desafios en el TP de microservicios fue configurar los puertos y las IPs de comunicación. 
Lo resolvimos usando una red bridge de Docker Compose. Al agrupar los contenedores en el mismo archivo `docker-compose.yml`, Docker les asigna una red DNS interna de forma automática.

Gracias a esto:
*   Java no necesita saber la IP de Python, solo lo busca en la red como `http://microservicio_inferencia_analisis:5000`.
*   Python no necesita saber la IP de Ollama, le habla directamente a `http://ollama:11434`.
*   La base de datos de Postgres solo es accesible desde el backend de Java con el host `postgres:5432` (quedando aislada y protegida de accesos externos directos).

---

## 5. Resiliencia: ¿Qué pasa si se detiene el contenedor de Ollama o el microservicio de Python? 

En la planificación sabíamos que Ollama o el microservicio de Python podían tardar en responder (los LLMs consumen mucha CPU/GPU). Para evitar que el backend de Java se quede colgado indefinidamente o tire un error horrible en pantalla:

1.  **Timeouts**: Configuramos tiempos límite en el cliente HTTP de Spring Boot (30 segundos). Si Python tarda más de eso, se corta la petición.
2.  **Manejo de Excepciones**: Si `RestTemplate` lanza una excepción porque Python está caído, un `@RestControllerAdvice` en Java intercepta el error (`ResourceAccessException`) y le devuelve al frontend un HTTP `504 Gateway Timeout` con un mensaje amigable en vez de un "stack trace" de código.
3.  **Registro de Estado**: En la base de datos marcamos la auditoría con estado `FAILED` si la inferencia falla, manteniendo la base de datos siempre consistente.

---

¡Y listo! Así es como logramos que una aplicación Spring Boot de Java y un script FastAPI de Python cooperen limpiamente para auditar código en tiempo real.
