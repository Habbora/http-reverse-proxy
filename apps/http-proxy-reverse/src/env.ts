type Env = {
  PROXY_PORT: number;
  PROXY_DOMAIN: string;
  API_PORT: number;
  DB_FILE_NAME: string;
};

function requireNumber(name: string, fallback?: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`${name} ausente`);
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${name} inválido`);
  return n;
}

function requireString(name: string, fallback?: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`${name} ausente`);
  }
  return raw;
}

function loadEnv(): Env {
  return {
    PROXY_PORT: requireNumber("PROXY_PORT", 3000),
    PROXY_DOMAIN: requireString("PROXY_DOMAIN", ""),
    API_PORT: requireNumber("API_PORT", 4000),
    DB_FILE_NAME: requireString("DB_FILE_NAME"),
  };
}

export const ENV = loadEnv();

console.log('Envs:', ENV);
