# Conclusiones del Proyecto: Microservicios e Integración de Modelos de Lenguaje (LLM)

Este documento expone las conclusiones técnicas y arquitectónicas obtenidas durante el diseño, desarrollo e integración de la **Plataforma de Auditoría de Código (Code Audit AI)**. Se analizan de forma crítica los beneficios, desafíos y lecciones aprendidas al implementar una arquitectura de microservicios y al embeber inteligencia artificial generativa local.

---

## 1. Sobre la Arquitectura de Microservicios

### A. Beneficios de la Arquitectura Políglota (JVM + Python)
La decisión de estructurar el sistema dividiendo la lógica de negocio y la de inferencia en dos entornos de ejecución diferentes fue altamente acertada por las siguientes razones:
*   **Spring Boot (Java 21):** Proporcionó un entorno empresarial robusto, maduro y seguro. La integración de *Spring Security* con tokens JWT para la autenticación, la abstracción de persistencia con *Spring Data JPA* y el control de base de datos relacional (PostgreSQL) garantizan consistencia transaccional y robustez multitarea.
*   **FastAPI (Python 3.10):** Permitió crear una interfaz web de servicios extremadamente ligera y de alto rendimiento para interactuar con el motor de IA. El soporte asíncrono nativo de FastAPI (`async`/`await`) y su integración con **Pydantic** resultaron ideales para la validación y tipado estricto del JSON de entrada y salida, reduciendo el código boilerplate a su mínima expresión.

### B. Aislamiento de Entornos e Infraestructura en Contenedores (Docker)
El uso de **Docker Compose** para orquestar los 5 componentes (`interfaz_usuario`, `microservicio_gestion_persistencia`, `postgres`, `microservicio_inferencia_analisis` y `ollama`) aportó ventajas críticas:
*   **Portabilidad absoluta:** Se eliminó por completo el problema del *"en mi máquina funciona"*. No es necesario instalar compiladores, runtimes de Python o motores de base de datos en el sistema host local; todo corre embebido de forma aislada.
*   **Seguridad de red (Aislamiento de topología):** Al definir una red interna (Bridge), se restringe la exposición de puertos hacia el host. El usuario exterior solo puede interactuar con el Frontend (puerto 5173) y el Backend Java (puerto 8080). El motor de Ollama y la base de datos Postgres están completamente ocultos del host físico, eliminando vectores de ataque externos directos.

### C. Desafíos y Costos de la Distribución
No obstante, la descentralización añade sobrecargas de diseño:
*   **Latencia de Red Adicional:** Cada llamada entre la UI, el backend Java, el microservicio Python y el motor de Ollama requiere un viaje de ida y vuelta a través de HTTP/JSON. Esto incrementa la latencia total comparado con una aplicación monolítica.
*   **Depuración Compleja:** Rastrear una falla que abarca múltiples contenedores requiere una centralización de logs muy clara o instrumentación robusta para no perder el contexto de la transacción distribuida.

---

## 2. Sobre la Integración de Modelos de Lenguaje (LLMs)

### A. Inferencia Local (Ollama) vs. Cloud APIs (ej. OpenAI)
La plataforma utiliza un motor local de **Ollama** con el modelo `qwen2.5-coder:7b`. Esta elección plantea un claro trade-off técnico:

| Dimensión | Enfoque Local (Ollama / qwen2.5-coder) | Enfoque Cloud (OpenAI / Claude API) |
| :--- | :--- | :--- |
| **Costo Operativo** | **$0** (Consumo puramente de hardware propio). | Variable por volumen de tokens (Pago por uso). |
| **Privacidad de Datos** | **Total**. El código del usuario nunca sale del servidor o red privada. | Baja. El código se envía a servidores de terceros. |
| **Dependencia de Red** | **Ninguna**. Funciona sin conexión a Internet. | Total. Caídas de internet anulan el sistema. |
| **Requerimientos** | **Altos**. Requiere CPU multinúcleo o GPU dedicada y RAM sustancial (~16GB). | Bajos. Corre en servidores remotos de gran escala. |
| **Velocidad de Inferencia** | Depende del hardware del host (VRAM/GPU). | Alta y predecible (Servidores dedicados). |

Para entornos académicos o corporativos donde la privacidad del código fuente y los costos recurrentes son factores críticos, **la inferencia local resulta la opción técnica superior**, a pesar de la exigencia de hardware en el servidor de despliegue.

### B. El Reto del No-Determinismo y Estructuración de Respuestas
Uno de los mayores desafíos al integrar LLMs en sistemas tradicionales de software es que **las IA devuelven texto conversacional no estructurado**, mientras que los backend estructurados requieren objetos fijos (JSON rígido) para procesar reglas y guardarlos en bases de datos relacionales.

Lo resolvimos mediante un enfoque de doble capa:
1.  **Prompt Engineering Estricto:** En el microservicio Python, se formatea el prompt inyectando instrucciones de salida en formato JSON exclusivo, forzando al modelo a omitir explicaciones coloquiales introductorias.
2.  **Validación con Pydantic:** Si el modelo genera un JSON corrupto, FastAPI intercepta la respuesta, evitando que el Jackson ObjectMapper de Java intente parsear texto plano y explote con un error de deserialización.

### C. Latencia y Control de Bloqueos en HTTP
La generación de reportes por IA es una tarea pesada que puede tomar varios segundos. Bloquear un hilo HTTP del backend esperando la respuesta es una mala práctica que consume recursos del pool de conexiones. 
Para resolverlo, la arquitectura:
*   Maneja de forma asíncrona la petición en Python.
*   Utiliza timeouts controlados en Java (`RestTemplate` config) para evitar esperas infinitas.
*   Persiste el estado de auditoría como `PENDING` en PostgreSQL, permitiendo que la transacción de base de datos se cierre de inmediato mientras el microservicio espera la respuesta de la IA.

---

## 3. Conclusión Final

La combinación de una **arquitectura de microservicios con IA local** demuestra que es posible construir plataformas modernas de análisis de código sin depender de presupuestos elevados en infraestructura cloud ni comprometer la confidencialidad de la información. 

La separación de responsabilidades y la modularización en contenedores no solo otorgan escalabilidad y flexibilidad políglota al sistema, sino que además facilitan la migración futura de cualquiera de sus partes (por ejemplo, reemplazar el motor de Ollama por una API en la nube, o migrar Postgres a otra base de datos) con un impacto prácticamente nulo en el resto de la aplicación.
