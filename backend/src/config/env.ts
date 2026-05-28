import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Groq AI
  groqApiKey: process.env.GROQ_API_KEY || '',

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
} as const;
