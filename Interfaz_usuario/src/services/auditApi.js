import { mockAudits } from "../data/mockAudits";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginUser({ email, password }) {
  await wait(500);

  if (!email || !password) {
    throw new Error("Email y contraseña son obligatorios.");
  }

  return {
    token: "mock-jwt-token",
    user: {
      name: "Pablo Gonzalez",
      email,
    },
  };
}

export async function registerUser({ name, email, password, confirmPassword }) {
  await wait(500);

  if (!name || !email || !password || !confirmPassword) {
    throw new Error("Todos los campos son obligatorios.");
  }

  if (password !== confirmPassword) {
    throw new Error("Las contraseñas no coinciden.");
  }

  return {
    token: "mock-jwt-token",
    user: {
      name,
      email,
    },
  };
}

export async function getAuditHistory() {
  await wait(350);
  return mockAudits;
}

export async function getAuditById(id) {
  await wait(350);
  return mockAudits.find((audit) => String(audit.id) === String(id)) ?? mockAudits[0];
}

export async function analyzeCode({ language, code }) {
  await wait(1600);

  const newAudit = {
    ...mockAudits[0],
    id: Date.now(),
    language,
    originalCode: code,
    date: new Date().toISOString().slice(0, 10),
  };

  return newAudit;
}
