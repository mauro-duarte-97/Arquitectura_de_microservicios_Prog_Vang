================================================================
FLUJOS DE PRUEBA - Code Audit AI
================================================================

Dos formas de probar el sistema:

  A) Desde el frontend (la forma "de usuario final"; demo y TP).
  B) Desde Postman / curl (la forma "de evaluador técnico"; útil
     para mostrar manejo de errores HTTP en el informe).

================================================================
A) FLUJO DESDE EL FRONTEND
================================================================

PRE-REQUISITO: Docker Desktop corriendo.

ARRANQUE
1. Doble-click a Iniciar.bat en la raíz del repo.
2. Esperar el "Sistema listo." en la ventana negra (primera
   vez 5-15 min; siguientes 30-60 s). Se abre el navegador
   en http://localhost:5173 automáticamente.

REGISTRO Y LOGIN
3. /register -> elegir email, username y password de >=8 chars.
   Tras el submit, queda logueado y redirige a /dashboard.
4. Logout (sidebar o Settings) -> vuelve a /login.
5. /login con las mismas credenciales -> vuelve al dashboard.

CASOS PEDAGÓGICOS RECOMENDADOS
Cargar cada caso en /audit/new, elegir el lenguaje correspondiente,
hacer click en "Analizar" y verificar las salidas indicadas.

----------------------------------------------------------------
Caso 1 - PYTHON, error de sintaxis (falta `:` en def)
----------------------------------------------------------------
Código:
    def saludar(nombre)
        print("Hola, " + nombre)
    saludar("Mauro")

Hallazgos esperados:
  - Issue crítico, línea 1.
  - Título corto: "ERROR DE SINTAXIS" o "FALTA DE DOS PUNTOS".
  - Descripción: menciona ':' (NUNCA ';') y la línea exacta.
  - Explicación pedagógica: indica que `def`, `if`, `for`,
    `while`, `class`, `try`, `with` abren bloques y por eso
    llevan ':'. Aclara que Python no usa ';' al final de las
    sentencias.
  - Código refactorizado: igual al original pero con
    `def saludar(nombre):`, SIN fences ```python```.

----------------------------------------------------------------
Caso 2 - PYTHON, SQL Injection con sqlite3
----------------------------------------------------------------
Código:
    import sqlite3

    def buscar_usuario(nombre):
        conn = sqlite3.connect("usuarios.db")
        cursor = conn.cursor()
        query = "SELECT * FROM users WHERE username = '" + nombre + "'"
        cursor.execute(query)
        return cursor.fetchall()

    buscar_usuario(input("Ingresá tu usuario: "))

Hallazgos esperados:
  - Issue crítico, título "INYECCION SQL", en la línea del
    `query = ...`.
  - Issue secundario (warning), título "FALTA MANEJO DE ERRORES"
    o similar.
  - Explicación pedagógica: cita prepared statements, da el
    ejemplo del payload `' OR '1'='1` y por qué la concatenación
    es peligrosa.
  - Refactor con `cursor.execute(sql, (nombre,))` usando
    placeholder `?`.

----------------------------------------------------------------
Caso 3 - JAVA, SQL Injection + System.out.println
----------------------------------------------------------------
Código:
    public class UsuarioDAO {
        public Usuario buscar(Connection conn, String nombre) throws SQLException {
            String sql = "SELECT * FROM usuarios WHERE nombre = '" + nombre + "'";
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery(sql);
            System.out.println("Ejecutando: " + sql);
            return mapear(rs);
        }
    }

Hallazgos esperados:
  - Issue crítico "INYECCION SQL" (línea 3).
  - Issue advertencia o sugerencia "LOG EN PRODUCCION" (línea 6).
  - Refactor con PreparedStatement + setString(1, nombre) y un
    logger en lugar de System.out.println.

----------------------------------------------------------------
Caso 4 - KOTLIN, SQL Injection + contraseña hardcodeada
----------------------------------------------------------------
Código:
    import java.sql.Connection
    import java.sql.DriverManager

    fun buscarUsuario(nombre: String): String? {
        val url = "jdbc:postgresql://localhost:5432/miapp"
        val conn: Connection = DriverManager.getConnection(url, "admin", "admin123")

        val query = "SELECT email FROM usuarios WHERE nombre = '$nombre'"
        println("Ejecutando consulta: $query")

        val stmt = conn.createStatement()
        val rs = stmt.executeQuery(query)

        return if (rs.next()) rs.getString("email") else null
    }

    fun main() {
        print("Ingresá tu nombre: ")
        val nombre = readLine() ?: ""
        val email = buscarUsuario(nombre)
        println("Email encontrado: $email")
    }

Hallazgos esperados:
  - Issue crítico "INYECCION SQL" (línea del `val query = ...`).
  - Issue crítico o advertencia "CONTRASENA HARDCODEADA"
    (línea del DriverManager.getConnection).
  - Issue sugerencia "LOG EN PRODUCCION" (println).
  - Refactor con PreparedStatement, `setString(1, nombre)`, y
    credenciales sacadas a `System.getenv("DB_PASSWORD")` o
    placeholder equivalente.
  - Bonus si el modelo lo detecta: "FALTA MANEJO DE RECURSOS"
    (Connection/Statement/ResultSet sin cerrar; usar `use {}`).

----------------------------------------------------------------
Validación visual general (para los 4 casos)
----------------------------------------------------------------
  [x] Cada card de issue muestra un título CORTO en MAYÚSCULAS,
      no el mensaje completo truncado.
  [x] La descripción del card es distinta del título y aporta
      detalle pedagógico (no repite el título).
  [x] La sección "Código refactorizado" arriba a la derecha
      empieza directo con código real, sin ```python o ```kotlin
      al principio.
  [x] La "Explicación pedagógica" aparece como un párrafo en
      español argentino, sin mezclar terminología de otros
      lenguajes (ej. no debería decir "punto y coma" para un
      bug de Python).
  [x] Al volver a /history, la auditoría recién creada está
      visible y se puede entrar al detalle.
  [x] Refrescar (F5) la página de detalle NO pierde la
      información: el `historyId` permite recargar desde Java.

HISTORIAL
6. Sidebar -> "Historial" -> ver todas las auditorías del usuario.
7. Click en una entrada -> abre /audit/result/<id> con el
   detalle completo.

LOGOUT
8. Sidebar -> "Cerrar sesión" -> redirige a /login y borra el
   token de localStorage.

DETENER
9. Doble-click a Detener.bat. Los datos (usuarios, historial,
   modelo qwen2) persisten en los volúmenes Docker.


================================================================
B) FLUJO DESDE POSTMAN
================================================================

Usar la colección de Postman exportada (o crear las requests a
mano) contra http://localhost:8080.

HAPPY PATH
1. POST /api/v1/auth/register
   Body JSON: { "email": "x@x.com", "username": "x", "password": "12345678" }
   -> 201 Created. Devuelve { accessToken, tokenType, expiresInMinutes, user }.

2. Configurar la colección para usar Bearer Token = {{token}}.
   En la pestaña "Scripts" de /register agregar:
      const json = pm.response.json();
      pm.collectionVariables.set("token", json.accessToken);

3. POST /api/v1/analyze (con Bearer Token).
   Body: { "code": "...", "language": "python", "mode": "Senior Dev" }
   -> 200 OK con { issues:[{ line, title, message, severity }],
                   explanation, refactoredCode, historyId }.

4. GET /api/v1/history (con Bearer Token).
   -> 200 OK con Page<...> de Spring (content, totalElements, etc.).

5. GET /api/v1/history/{id} (con Bearer Token).
   -> 200 OK con el detalle de esa auditoría.

CASOS DE ERROR PARA EL INFORME
- Registrar el mismo email dos veces -> 409 Conflict.
- Login con password incorrecta       -> 401 Unauthorized.
- POST /analyze sin Authorization     -> 403 Forbidden
   (Spring Security exige el header presente).
- POST /analyze con token mal firmado -> 401 Unauthorized
   (cambiar JWT_SECRET en el server reproduce el caso).
- POST /analyze con código > 2000 chars desde el frontend -> el
   botón Analizar queda deshabilitado y aparece mensaje en UI.
- POST /analyze con language no soportado -> el frontend solo
   permite python/java/kotlin en el select; si se mandara otro
   desde Postman, el backend Java acepta cualquier string y se
   lo manda al Python (el LLM responde igual, pero no es lo
   recomendable para el TP).

NOTAS
- Duración del token JWT: 60 minutos (JWT_EXPIRATION_MINUTES).
- 403 vs 401:
    403 -> no se envió Authorization header.
    401 -> token vencido, mal formado o usuario inexistente.
- Ping barato del token: GET /api/v1/auth/me con Bearer Token
  devuelve 200 si el token sigue vivo.
