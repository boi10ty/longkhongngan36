#!/usr/bin/env node
const fs = require('fs');

// All 15 languages with the password key translation
const TRANSLATIONS = {
  'en': 'The password you\'ve entered is incorrect',
  'vi': 'Mật khẩu bạn đã nhập không đúng',
  'es': 'La contraseña que ingresaste es incorrecta',
  'fr': 'Le mot de passe que vous avez saisi est incorrect',
  'de': 'Das eingegebene Passwort ist falsch',
  'it': 'La password che hai inserito non è corretta',
  'zh': '您输入的密码不正确',
  'ar': 'كلمة المرور التي أدخلتها غير صحيحة',
  'hi': 'आपने जो पासवर्ड दर्ज किया है वह गलत है',
  'pt': 'A senha que você digitou está incorreta',
  'ru': 'Введенный вами пароль неверен',
  'ja': '入力したパスワードが正しくありません',
  'nl': 'Het wachtwoord dat je hebt ingevoerd is onjuist',
  'pl': 'Hasło, które wpisałeś, jest niepoprawne',
  'el': 'Ο κωδικός πρόσβασης που εισαγάγατε είναι εσφαλμένος'
};

// Helper function to escape single quotes in string values
function escapeQuotes(str) {
  return str.replace(/'/g, "\\'");
}

// Generate all language sections
let output = `// 15 Popular Languages - Instantly Loaded, No API Calls
// EN, VI, ES, FR, DE, IT, ZH, AR, HI, PT, RU, JA, NL, PL, EL
type LangKey = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'hi' | 'pt' | 'ru' | 'ja' | 'nl' | 'pl' | 'el';

const translations: Record<LangKey, Record<string, string>> = {\n`;

// For each language, generate a section
const langList = Object.keys(TRANSLATIONS);
for (const lang of langList) {
  const escapedTranslation = escapeQuotes(TRANSLATIONS[lang]);
  output += `    '${lang}': {\n`;
  output += `        'The password you\\'ve entered is incorrect': '${escapedTranslation}',\n`;
  output += `    },\n`;
}

output += `};\n\n`;
output += `export function getTranslations(lang: string = 'en'): Record<string, string> {
    const key = (lang in translations ? lang : 'en') as LangKey;
    return translations[key];
}

import axios from 'axios';`;

// Write the file
fs.writeFileSync('src/utils/translate.ts', output, 'utf-8');
console.log('✓ Generated translate.ts with password key for all 15 languages');
console.log('   EN, VI, ES, FR, DE, IT, ZH, AR, HI, PT, RU, JA, NL, PL, EL');
