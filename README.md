# Arquitectura\_de\_microservicios\_Prog\_Vang

Proyecto Final de Programación de Vanguardia en el que trabajamos con el objetivo de  proporcionar una herramienta capaz de realizar análisis estáticos y lógicos de fragmentos de código en tiempo real, identificando vulnerabilidades de seguridad, errores de sintaxis y oportunidades de refactorización.

Requisitos:
- Docker
- Docker Compose

Instrucciones:

- docker compose up --build

A diferencia de un compilador tradicional, la plataforma podrá utilizar algún modelo de entre los modelos de lenguaje de gran escala (LLM) para ofrecer una explicación pedagógica sobre por qué el código es erróneo o ineficiente, fomentando el aprendizaje autónomo del alumno.



##### **1. Requerimientos Técnicos (Arquitectura)**

El sistema deberá estar compuesto por tres componentes principales que interactúan de forma asíncrona o síncrona mediante protocolos de red:



A. Interfaz de Usuario (Frontend)

● Debe permitir el ingreso de código fuente mediante un editor con resaltado de sintaxis.

● Debe mostrar los resultados del análisis categorizados por severidad (Crítico, Advertencia, Sugerencia).

● Debe permitir la visualización de un historial de consultas previas por usuario.



B. Microservicio de Gestión y Persistencia (Backend Java)

● Tecnología: Java (Spring Boot / Jakarta EE).

● Responsabilidad: Actuar como el orquestador del sistema. Debe gestionar el registro y autenticación de usuarios, la persistencia de los fragmentos de código analizados y la comunicación con el servicio de IA.

● Base de Datos: Implementación de una base de datos relacional para el manejo de usuarios y auditorías.



C. Microservicio de Inferencia y Análisis (Backend Python)

● Tecnología: Python (FastAPI / Flask).

● Responsabilidad: Procesar las peticiones enviadas por el servicio de Java. Debe integrar una solución de Inteligencia Artificial (vía API o modelo local) para la interpretación del código.

● IA: El servicio debe estar configurado para actuar como un "Senior Developer" que audita código y devuelve una respuesta estructurada en formato JSON.



##### **2. Funcionalidades Clave**

1\. Auditoría de Seguridad: Identificación de posibles ataques (ej. SQL Injection, XSS) en el código ingresado.

2\. Refactorización Sugerida: Propuesta de una versión optimizada del código bajo principios de Clean Code.

3\. Explicación Pedagógica: Un apartado donde la IA explica el concepto teórico fallido (ej. polimorfismo mal aplicado, manejo de excepciones pobre).

4\. Soporte Multilenguaje: Capacidad de procesar al menos tres lenguajes distintos (ej. Python, Java, Kotlin).



##### **3. Criterios de Innovación**

● Arquitectura Políglota: Uso de dos ecosistemas distintos (JVM para robustez empresarial y Python para IA) trabajando en conjunto.

● Integración de IA Generativa: Uso de modelos de lenguaje para ir más allá de las reglas estáticas de análisis de código tradicionales.

● Escalabilidad: Separación de la lógica de negocio (Java) de la lógica de procesamiento intensivo de datos (Python).



##### **4. Entregables del Proyecto**

Para la aprobación del Proyecto con AI, el equipo deberá presentar formalmente los siguientes elementos:

A. Documentación Técnica (Documento PDF/Word)

● Un informe detallado que contenga la arquitectura y lógica del sistema:

● Introducción y Justificación: Planteamiento del problema y por qué la solución propuesta es innovadora.

● Diagramas de Arquitectura: Esquema de la interacción entre los microservicios (Java, Python y Frontend).

● Diseño de Base de Datos: Diagrama Entidad-Relación (DER) del microservicio de Java.

● Especificación de la API: Documentación de los endpoints (puedes incluir capturas de Swagger o Postman).

● Guía de Despliegue: Instrucciones paso a paso para ejecutar el entorno localmente (ej. docker-compose o configuración de variables de entorno para las API Keys de IA).

B. Repositorio de Código Fuente (GitHub/GitLab)

● El código debe estar centralizado en un repositorio organizado.

● Historial de Commits: Se evaluará la participación equitativa. Cada integrante debe realizar sus propios commits con mensajes descriptivos (ej: feat: implement logic for JWT auth in Java).

● Uso de Ramas (Branching): Implementación de una estrategia básica (ej. ramas feature/ para nuevas funciones y main para código estable).

● Archivo README.md: Una portada profesional en el repositorio que explique qué es el proyecto, el stack tecnológico y cómo instalarlo rápidamente.

● Código Limpio: Aplicación de estándares de programación (nombres de variables claros, comentarios en funciones complejas).

C. Presentación y Defensa (Slides)

● Una presentación para la exposición final que resuma los puntos clave:

● Demo en Vivo o Grabada: Demostración funcional del sistema: cargar un código con un error de seguridad (ej: SQL Injection) y mostrar cómo la IA lo detecta y explica.

● Desafíos Técnicos: Explicación de cómo resolvieron la comunicación entre Java y Python (ej: manejo de JSON, tiempos de espera de la IA).

● Lecciones Aprendidas: Conclusiones sobre el uso de microservicios y la integración de modelos de lenguaje en aplicaciones reales.







