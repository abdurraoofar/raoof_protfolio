/**
 * Centralized Frontend Configuration
 * Enforces that only safe, public variables are exposed to the browser and
 * performs a runtime security check against accidental secret leakage.
 */

export interface FrontendConfig {
  appEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  appTitle: string;
  apiBaseUrl: string;
  enableDebug: boolean;
}

const rawEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : ({} as Record<string, string>);

// Security assertion: Ensure no sensitive keys were accidentally prefixed with VITE_
const FORBIDDEN_PATTERNS = ['SECRET', 'PASSWORD', 'DATABASE_URL', 'PRIVATE_KEY'];
Object.keys(rawEnv).forEach((key) => {
  if (FORBIDDEN_PATTERNS.some((pattern) => key.toUpperCase().includes(pattern))) {
    throw new Error(`Security Violation: Forbidden secret key "${key}" detected in frontend environment!`);
  }
});

const appEnv = (rawEnv.VITE_APP_ENV as FrontendConfig['appEnv']) || 'development';

export const frontendConfig: FrontendConfig = {
  appEnv,
  isDevelopment: appEnv === 'development',
  isProduction: appEnv === 'production',
  appTitle: rawEnv.VITE_APP_TITLE || 'IT Graduate Portfolio | Chennai, India',
  apiBaseUrl: rawEnv.VITE_API_BASE_URL || 'https://raoof-protfolio.onrender.com/api/v1',
  enableDebug: String(rawEnv.VITE_ENABLE_DEBUG) === 'true'
};

export default frontendConfig;
