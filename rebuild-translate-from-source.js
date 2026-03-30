const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'src');
const OUT = path.join(process.cwd(), 'src', 'utils', 'translate.ts');
const langs = ['en', 'vi', 'es', 'fr', 'de', 'it', 'zh', 'ar', 'hi', 'pt', 'ru', 'ja', 'nl', 'pl', 'el'];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

function extractKeys(content) {
  const keys = [];
  const reSingle = /\bt\s*\(\s*'((?:\\'|[^'])*)'\s*\)/g;
  const reDouble = /\bt\s*\(\s*"((?:\\"|[^"])*)"\s*\)/g;
  let m;
  while ((m = reSingle.exec(content)) !== null) keys.push(m[1].replace(/\\'/g, "'"));
  while ((m = reDouble.exec(content)) !== null) keys.push(m[1].replace(/\\"/g, '"'));
  return keys;
}

async function translate(lang, text) {
  if (lang === 'en') return text;
  const params = new URLSearchParams({ client: 'gtx', sl: 'en', tl: lang, dt: 't', q: text });
  const url = `https://translate.googleapis.com/translate_a/single?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return text;
  const data = await res.json();
  const translated = (data?.[0] || []).map((item) => item?.[0]).filter(Boolean).join('');
  return translated || text;
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function main() {
  const files = walk(ROOT);
  const set = new Set();

  for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    for (const k of extractKeys(c)) {
      if (k !== '') set.add(k);
    }
  }

  const extras = [
    'Message',
    'Describe',
    'Organizations can leverage the requirements to upgrade your page to a Sub-business status with a branded, relationship that reflects your brand values to drive more meaningful engagement and future.',
    'Our verification process is designed to maintain the integrity of the verified badge. Let\'s start by confirming your identity.'
  ];
  for (const e of extras) set.add(e);

  const keys = Array.from(set).sort((a, b) => a.localeCompare(b));
  const dict = {};

  for (const lang of langs) {
    dict[lang] = {};
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      try {
        dict[lang][k] = await translate(lang, k);
      } catch {
        dict[lang][k] = k;
      }
      if ((i + 1) % 15 === 0) process.stdout.write(`\r${lang}: ${i + 1}/${keys.length}`);
    }
    process.stdout.write(`\r${lang}: done ${keys.length}/${keys.length}\n`);
  }

  const lines = [];
  lines.push("import axios from 'axios';");
  lines.push('');
  lines.push("type LangKey = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'hi' | 'pt' | 'ru' | 'ja' | 'nl' | 'pl' | 'el';");
  lines.push('');
  lines.push('const translations: Record<LangKey, Record<string, string>> = {');

  for (const lang of langs) {
    lines.push(`    '${lang}': {`);
    for (const key of keys) {
      lines.push(`        '${esc(key)}': '${esc(dict[lang][key])}',`);
    }
    lines.push('    },');
  }

  lines.push('};');
  lines.push('');
  lines.push("export function getTranslations(lang: string = 'en'): Record<string, string> {");
  lines.push("    const key = (lang in translations ? lang : 'en') as LangKey;");
  lines.push('    return translations[key];');
  lines.push('}');
  lines.push('');
  lines.push("const CACHE_KEY = 'translation_cache';");
  lines.push('');
  lines.push('const countryToLanguage: Record<string, string> = {');
  lines.push("    AE: 'ar', AT: 'de', BE: 'nl', BG: 'bg', BR: 'pt', CA: 'en', CY: 'el', CZ: 'cs', DE: 'de', DK: 'da',");
  lines.push("    EE: 'et', EG: 'ar', ES: 'es', FI: 'fi', FR: 'fr', GB: 'en', GR: 'el', HR: 'hr', HU: 'hu', IE: 'ga',");
  lines.push("    IN: 'hi', IT: 'it', LT: 'lt', LU: 'de', LV: 'lv', MT: 'mt', NL: 'nl', NO: 'no', PL: 'pl', PT: 'pt',");
  lines.push("    RO: 'ro', SE: 'sv', SI: 'sl', SK: 'sk', TR: 'tr', TW: 'zh', US: 'en', VN: 'vi', JO: 'ar', LB: 'ar',");
  lines.push("    QA: 'ar', IQ: 'ar', SA: 'ar', IL: 'he', KR: 'ko', CN: 'zh', JP: 'ja', PH: 'fil', NG: 'en', ZA: 'en',");
  lines.push("    KE: 'en', MX: 'es', AR: 'es', AU: 'en', NZ: 'en', SG: 'en', HK: 'zh', MO: 'zh', MY: 'ms', ID: 'id', TH: 'th',");
  lines.push('};');
  lines.push('');
  lines.push('export default async function translateText(text: string, countryCode: string): Promise<string> {');
  lines.push('    try {');
  lines.push("        const targetLang = countryToLanguage[countryCode] || 'en';");
  lines.push('        const langTranslations = getTranslations(targetLang);');
  lines.push('        if (langTranslations[text]) return langTranslations[text];');
  lines.push('');
  lines.push("        if (typeof window !== 'undefined') {");
  lines.push('            const cacheKey = `${targetLang}:${text}`;');
  lines.push('            const cache = localStorage.getItem(CACHE_KEY);');
  lines.push('            const cacheData = cache ? JSON.parse(cache) : {};');
  lines.push('            if (cacheData[cacheKey]) return cacheData[cacheKey];');
  lines.push('');
  lines.push('            try {');
  lines.push("                const response = await axios.get('https://translate.googleapis.com/translate_a/single', {");
  lines.push("                    params: { client: 'gtx', sl: 'en', tl: targetLang, dt: 't', q: text },");
  lines.push('                    timeout: 5000,');
  lines.push('                });');
  lines.push("                const translated = response.data[0]?.map((item: unknown[]) => item[0]).filter(Boolean).join('') || text;");
  lines.push('                cacheData[cacheKey] = translated;');
  lines.push('                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));');
  lines.push('                return translated;');
  lines.push('            } catch {');
  lines.push('                return text;');
  lines.push('            }');
  lines.push('        }');
  lines.push('');
  lines.push('        return text;');
  lines.push('    } catch {');
  lines.push('        return text;');
  lines.push('    }');
  lines.push('}');

  fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`Generated ${OUT} with ${keys.length} content keys x ${langs.length} languages.`);
}

main();
