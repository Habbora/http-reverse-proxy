type Env = {
  PROXY_DOMAIN: string;
  PROXY_PORT: number;
  API_DOMAIN: string;
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
    PROXY_DOMAIN: requireString("PROXY_DOMAIN", ""),
    PROXY_PORT: requireNumber("PROXY_PORT", 4000),
    API_DOMAIN: requireString("API_DOMAIN", ""),
    API_PORT: requireNumber("API_PORT", 4001),
    DB_FILE_NAME: requireString("DB_FILE_NAME", "db.sqlite"),
  };
}

export const ENV = loadEnv();

console.log('Envs:', ENV);
