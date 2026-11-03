import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes so iframe and client requests never fail with network errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure upload directory exists for uploaded vehicle photos
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Secure Admin Authentication Store (Persistent in a local secure file)
const ADMIN_CONFIG_FILE = path.join(__dirname, '.admin-security.json');

// Helper to hash 6-digit PIN with scrypt
function hashPin(pin: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(pin, actualSalt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt: actualSalt
  };
}

function verifyPin(pin: string, storedHash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(pin, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(storedHash, 'hex');
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch {
    return false;
  }
}

// Initialize admin config if not present
interface AdminSecurityData {
  pinHash: string;
  pinSalt: string;
  jwtSecret: string;
  failedAttempts: { [ip: string]: { count: number; lockedUntil: number; lastAttempt: number } };
}

function getAdminConfig(): AdminSecurityData {
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, 'utf-8'));
      if (data.pinHash && data.pinSalt) {
        if (!data.failedAttempts) data.failedAttempts = {};
        if (!data.jwtSecret) data.jwtSecret = crypto.randomBytes(32).toString('hex');
        return data;
      }
    } catch (e) {
      console.error('Error reading admin security file:', e);
    }
  }

  // Initial default PIN: "123456" as specified in project brief
  const initial = hashPin('123456');
  const config: AdminSecurityData = {
    pinHash: initial.hash,
    pinSalt: initial.salt,
    jwtSecret: crypto.randomBytes(32).toString('hex'),
    failedAttempts: {}
  };
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
}

function saveAdminConfig(config: AdminSecurityData) {
  fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Generate simple HMAC token for authenticated admin session
function generateAdminToken(secret: string): string {
  const payload = {
    role: 'admin',
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
    nonce: crypto.randomBytes(16).toString('hex')
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

function verifyAdminToken(token: string, secret: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadBase64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  if (signature !== expectedSig) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (payload.role !== 'admin') return false;
    if (Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

// Middleware to authenticate admin requests
function requireAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso não autorizado. Faça login no painel.' });
    return;
  }
  const token = authHeader.substring(7);
  const config = getAdminConfig();
  if (!verifyAdminToken(token, config.jwtSecret)) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Faça login novamente.' });
    return;
  }
  next();
}

// Rate limiting & Brute-force protection helper
function checkBruteForce(ip: string): { allowed: boolean; waitSeconds?: number; attemptsLeft?: number } {
  const config = getAdminConfig();
  const now = Date.now();
  const record = config.failedAttempts[ip];

  if (record) {
    // If currently locked out
    if (record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, waitSeconds: remainingSeconds };
    }
    // Reset failed counter if more than 30 minutes have passed since last attempt
    if (now - record.lastAttempt > 30 * 60 * 1000) {
      delete config.failedAttempts[ip];
      saveAdminConfig(config);
    }
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string): { locked: boolean; waitSeconds: number; attemptsLeft: number } {
  const config = getAdminConfig();
  const now = Date.now();
  if (!config.failedAttempts[ip]) {
    config.failedAttempts[ip] = { count: 0, lockedUntil: 0, lastAttempt: now };
  }

  config.failedAttempts[ip].count += 1;
  config.failedAttempts[ip].lastAttempt = now;
  const count = config.failedAttempts[ip].count;

  let waitSeconds = 0;
  let locked = false;

  // Progressive lockout rules:
  // 3-4 attempts: 30s delay
  // 5-7 attempts: 2 minutes lockout
  // 8+ attempts: 15 minutes lockout
  if (count >= 8) {
    waitSeconds = 15 * 60;
    config.failedAttempts[ip].lockedUntil = now + waitSeconds * 1000;
    locked = true;
  } else if (count >= 5) {
    waitSeconds = 120;
    config.failedAttempts[ip].lockedUntil = now + waitSeconds * 1000;
    locked = true;
  } else if (count >= 3) {
    waitSeconds = 30;
    config.failedAttempts[ip].lockedUntil = now + waitSeconds * 1000;
    locked = true;
  }

  saveAdminConfig(config);
  const attemptsLeft = Math.max(0, 5 - count);
  return { locked, waitSeconds, attemptsLeft };
}

function resetFailedAttempts(ip: string) {
  const config = getAdminConfig();
  if (config.failedAttempts[ip]) {
    delete config.failedAttempts[ip];
    saveAdminConfig(config);
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Admin Login with 6-digit PIN & Brute-force protection
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();

  // Validate format: exactly 6 digits
  if (!pin || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
    res.status(400).json({ error: 'A senha deve conter exatamente 6 dígitos numéricos.' });
    return;
  }

  // Check rate limit / brute force lock
  const bruteCheck = checkBruteForce(clientIp);
  if (!bruteCheck.allowed) {
    res.status(429).json({
      error: `Muitas tentativas incorretas. Sistema bloqueado temporariamente. Aguarde ${bruteCheck.waitSeconds} segundos.`
    });
    return;
  }

  const config = getAdminConfig();
  const isValid = verifyPin(pin, config.pinHash, config.pinSalt);

  if (!isValid) {
    const penalty = recordFailedAttempt(clientIp);
    if (penalty.locked) {
      res.status(429).json({
        error: `Senha incorreta. Por segurança, o sistema foi bloqueado por ${penalty.waitSeconds} segundos.`
      });
    } else {
      res.status(401).json({
        error: `Senha incorreta. Restam ${penalty.attemptsLeft} tentativas antes do bloqueio temporário.`
      });
    }
    return;
  }

  // Success
  resetFailedAttempts(clientIp);
  const token = generateAdminToken(config.jwtSecret);
  res.json({
    success: true,
    token,
    message: 'Autenticado com sucesso no Painel Veneza Veículos.'
  });
});

// 2. Verify Session Token
app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ authenticated: false });
    return;
  }
  const token = authHeader.substring(7);
  const config = getAdminConfig();
  const isValid = verifyAdminToken(token, config.jwtSecret);
  res.json({ authenticated: isValid });
});

// 3. Change 6-Digit PIN
app.post('/api/auth/change-pin', requireAdmin, (req: Request, res: Response) => {
  const { currentPin, newPin } = req.body;

  if (!currentPin || !newPin || typeof currentPin !== 'string' || typeof newPin !== 'string') {
    res.status(400).json({ error: 'Preencha a senha atual e a nova senha.' });
    return;
  }

  if (!/^\d{6}$/.test(newPin)) {
    res.status(400).json({ error: 'A nova senha deve possuir exatamente 6 dígitos numéricos.' });
    return;
  }

  const config = getAdminConfig();
  const isCurrentValid = verifyPin(currentPin, config.pinHash, config.pinSalt);
  if (!isCurrentValid) {
    res.status(400).json({ error: 'A senha atual informada está incorreta.' });
    return;
  }

  // Update hash
  const newHashData = hashPin(newPin);
  config.pinHash = newHashData.hash;
  config.pinSalt = newHashData.salt;
  // Rotate jwt secret to invalidate older sessions
  config.jwtSecret = crypto.randomBytes(32).toString('hex');
  saveAdminConfig(config);

  // Issue fresh token for current session
  const newToken = generateAdminToken(config.jwtSecret);

  res.json({
    success: true,
    message: 'Senha administrativa de 6 dígitos alterada com sucesso.',
    token: newToken
  });
});

// 4. Secure Image Upload (Supports high-res car photos)
app.post('/api/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { imageBase64, filename, mimeType } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ error: 'Nenhum dado de imagem recebido.' });
      return;
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const detectedMime = mimeType || 'image/jpeg';
    if (!validMimes.includes(detectedMime.toLowerCase())) {
      res.status(400).json({ error: 'Formato de imagem inválido. Aceitos: JPG, PNG, WEBP.' });
      return;
    }

    // Strip prefix if present (data:image/jpeg;base64,...)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Max 15MB size check
    if (buffer.length > 15 * 1024 * 1024) {
      res.status(400).json({ error: 'A imagem excede o tamanho máximo permitido de 15MB.' });
      return;
    }

    // Determine extension
    let ext = '.jpg';
    if (detectedMime.includes('png')) ext = '.png';
    else if (detectedMime.includes('webp')) ext = '.webp';

    const safeName = `car_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/${safeName}`;
    res.json({ success: true, url: imageUrl });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erro ao processar e salvar a fotografia do veículo.' });
  }
});

// 5. Official Default Store Settings (seed / fallback)
const DEFAULT_SITE_SETTINGS = {
  name: 'Veneza Veículos',
  phone: '(87) 99988-1995',
  whatsapp: '5587999881995',
  address: 'R. Paulo VI, 1406 - Heliópolis, Garanhuns - PE, 55297-350',
  hours: 'Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00 | Domingo: Fechado',
  instagram: 'https://www.instagram.com/veiculosveneza?psln=MTgyZ2txbWkzYm9hNA==',
  logoUrl: 'https://i.postimg.cc/d3tnzzpJ/logo-veneza-veiculos.png',
  facadeUrl: 'https://i.postimg.cc/5tDV9mb2/veneza-veiculos.jpg',
  aboutText: 'Na Veneza Veículos, tradição e excelência se encontram para oferecer os melhores seminovos e veículos selecionados de Garanhuns e região. Nosso compromisso é proporcionar uma experiência de compra transparente, ágil e refinada, com atendimento personalizado e garantia de procedência.',
  mapsUrl: 'https://maps.app.goo.gl/1s5mX34cU3tSov1CA'
};

const OFFICIAL_REVIEWS = [
  {
    id: 'rev-1',
    authorName: 'Kevin Duarte',
    rating: 5,
    comment: 'O atendimento está muito bom!!! Foram super atenciosos comigo.',
    originalUrl: 'https://maps.app.goo.gl/1s5mX34cU3tSov1CA',
    isApproved: true,
    createdAt: '2025-01-15T10:00:00.000Z'
  },
  {
    id: 'rev-2',
    authorName: 'Manuhenriquedemeloh',
    rating: 5,
    comment: 'Atendimento 10 parabéns toda equipe',
    originalUrl: 'https://maps.app.goo.gl/LnP8hdqjNLP14unq5',
    isApproved: true,
    createdAt: '2025-02-01T14:30:00.000Z'
  },
  {
    id: 'rev-3',
    authorName: 'Matheus Henrique',
    rating: 5,
    comment: 'Bom atendimento',
    originalUrl: 'https://maps.app.goo.gl/Av7EAynsWXUSjxKM7',
    isApproved: true,
    createdAt: '2025-02-10T11:00:00.000Z'
  }
];

app.get('/api/site-defaults', (_req: Request, res: Response) => {
  res.json({
    settings: DEFAULT_SITE_SETTINGS,
    reviews: OFFICIAL_REVIEWS
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', dealership: 'Veneza Veículos', timestamp: new Date().toISOString() });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Veneza Veículos server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
