export const mockAudits = [
  {
    id: 15,
    date: "2026-05-10",
    language: "python",
    globalSeverity: "critical",
    title: "SQL Injection detectado",
    summary: "Se detectó concatenación directa de datos de usuario en una consulta SQL.",
    originalCode: "user_id = input()\nquery = 'SELECT * FROM users WHERE id = ' + user_id",
    refactoredCode: "user_id = input()\ncursor.execute('SELECT * FROM users WHERE id = ?', [user_id])",
    pedagogicalExplanation:
      "SQL Injection ocurre cuando datos externos se insertan directamente en una consulta SQL. Esto permite que un atacante altere la consulta original.",
    issues: [
      {
        severity: "critical",
        type: "security",
        title: "SQL Injection",
        line: 2,
        description:
          "El código concatena directamente un valor ingresado por el usuario dentro de una consulta SQL.",
        recommendation:
          "Utilizar consultas parametrizadas para separar la estructura SQL de los datos del usuario.",
      },
    ],
  },
  {
    id: 16,
    date: "2026-05-09",
    language: "java",
    globalSeverity: "warning",
    title: "Manejo débil de excepciones",
    summary: "Se detectó un bloque catch demasiado genérico.",
    originalCode: "try {\n  service.process();\n} catch (Exception e) {\n  e.printStackTrace();\n}",
    refactoredCode: "try {\n  service.process();\n} catch (BusinessException e) {\n  logger.error('Error procesando servicio', e);\n}",
    pedagogicalExplanation:
      "Capturar Exception de forma genérica dificulta el diagnóstico y puede ocultar errores importantes.",
    issues: [
      {
        severity: "warning",
        type: "clean_code",
        title: "Catch genérico",
        line: 3,
        description: "Se captura Exception en lugar de una excepción específica.",
        recommendation: "Capturar excepciones concretas y registrar el error con logger.",
      },
    ],
  },
  {
    id: 17,
    date: "2026-05-08",
    language: "javascript",
    globalSeverity: "suggestion",
    title: "Mejora de legibilidad",
    summary: "Se recomienda mejorar nombres de variables.",
    originalCode: "const x = users.filter(u => u.active)",
    refactoredCode: "const activeUsers = users.filter(user => user.active)",
    pedagogicalExplanation:
      "Los nombres claros ayudan a que el código sea más fácil de leer, mantener y revisar.",
    issues: [
      {
        severity: "suggestion",
        type: "refactor",
        title: "Nombre poco descriptivo",
        line: 1,
        description: "La variable x no comunica intención.",
        recommendation: "Usar nombres descriptivos como activeUsers.",
      },
    ],
  },
];
