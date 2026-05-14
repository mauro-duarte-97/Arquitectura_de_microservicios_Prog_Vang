-- =====================================================================
-- V1: esquema inicial para la plataforma de auditor\u00eda de c\u00f3digo.
-- Tablas:
--   * users             -> usuarios registrados que pueden autenticarse.
--   * analysis_history  -> historial de an\u00e1lisis realizados por cada user.
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
    id              UUID         PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(100) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS analysis_history (
    id              UUID         PRIMARY KEY,
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language        VARCHAR(50)  NOT NULL,
    mode            VARCHAR(50)  NOT NULL,
    code            TEXT         NOT NULL,
    response_json   TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user_created
    ON analysis_history(user_id, created_at DESC);
