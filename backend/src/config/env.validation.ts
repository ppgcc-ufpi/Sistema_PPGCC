const required = (env: Record<string, unknown>, name: string) => {
  const value = typeof env[name] === 'string' ? env[name].trim() : '';
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}`);
  return value;
};

export function validateEnvironment(env: Record<string, unknown>) {
  required(env, 'DATABASE_URL');
  required(env, 'DIRECT_URL');
  required(env, 'FRONTEND_URL');
  const jwt = required(env, 'JWT_SECRET');
  if (jwt.length < 32) throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres.');
  return env;
}
