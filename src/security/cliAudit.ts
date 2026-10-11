/**
 * CLI Security Audit & Leak Detector
 * Run via: npx tsx src/security/cliAudit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SENSITIVE_PATTERNS = [
  { name: 'Google / Gemini API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'RSA / EC Private Key', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g },
  { name: 'Raw Bearer / JWT Token', regex: /Bearer\s+eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}/g },
  { name: 'Hardcoded Secret Assignment', regex: /(?:secret|apikey|password)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/gi },
];

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'coverage') {
      continue;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (/\.(ts|tsx|js|jsx|json|html|env)$/.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function runAudit() {
  console.log('🔒 ==========================================');
  console.log('🔒 MELIN SECURITY AUDIT: SCANNING CODEBASE');
  console.log('🔒 ==========================================\n');

  const files = scanDirectory(process.cwd());
  let violations = 0;
  let scannedCount = 0;

  for (const file of files) {
    if (file.endsWith('.env.example')) continue;
    scannedCount++;
    const content = fs.readFileSync(file, 'utf8');

    for (const pat of SENSITIVE_PATTERNS) {
      const match = content.match(pat.regex);
      if (match) {
        // Exclude the regex definition itself in analyzer files
        if (file.includes('leakAnalyzer.ts') || file.includes('cliAudit.ts')) {
          continue;
        }
        violations++;
        console.error(`❌ [ALERTA DE VAZAMENTO] Arquivo: ${file}`);
        console.error(`   Padrão detectado: ${pat.name}`);
        console.error(`   Ocorrências: ${match.length}\n`);
      }
    }
  }

  console.log(`✅ Arquivos inspecionados: ${scannedCount}`);
  if (violations === 0) {
    console.log('🎉 SUCESSO: 0 chaves de API, credenciais ou segredos vazados no código fonte.');
    console.log('🛡️ Status: APROVADO PARA PRODUÇÃO EM LARGA ESCALA.\n');
  } else {
    console.error(`⚠️ FALHA: ${violations} violações de segurança detectadas. Corrija imediatamente!\n`);
    process.exit(1);
  }
}

runAudit();
