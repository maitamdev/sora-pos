import { env } from './env';

// Groq AI client - lazy initialization
// Cần GROQ_API_KEY trong biến môi trường
let _groqClient: unknown = null;

export const getGroqClient = async () => {
  if (!_groqClient) {
    if (!env.groqApiKey) {
      throw new Error('GROQ_API_KEY chưa được cấu hình. Kiểm tra file .env');
    }
    const Groq = (await import('groq-sdk')).default;
    _groqClient = new Groq({ apiKey: env.groqApiKey });
  }
  return _groqClient as import('groq-sdk').default;
};

// Model mặc định cho AI insights
export const GROQ_MODEL = 'llama-3.1-70b-versatile';
