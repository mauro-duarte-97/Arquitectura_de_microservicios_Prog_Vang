-- =====================================================================
-- V2: Lock optimista en analysis_history.
--
-- Agrega la columna 'version' (BIGINT) requerida por @Version de JPA.
-- DEFAULT 0 para que las filas existentes (si las hubiera) queden v\u00e1lidas
-- sin necesidad de un UPDATE separado.
--
-- Hibernate incrementar\u00e1 esta columna autom\u00e1ticamente en cada UPDATE,
-- y abortar\u00e1 con OptimisticLockException si dos transacciones intentan
-- modificar la misma fila en paralelo (escenario: re-deliveries futuros,
-- consumers concurrentes, mismo user pegando dos POST /analyze al mismo
-- tiempo desde dos pesta\u00f1as).
-- =====================================================================

ALTER TABLE analysis_history
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
