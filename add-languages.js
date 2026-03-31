// Script to add new languages to translate.ts
const https = require('https');
const fs = require('fs');

const NEW_LANGS = [
    { key: 'tr', name: 'Turkish' },
    { key: 'th', name: 'Thai' },
    { key: 'ko', name: 'Korean' },
    { key: 'sv', name: 'Swedish' },
    { key: 'id', name: 'Indonesian' },
    { key: 'ms', name: 'Malay' },
    { key: 'ro', name: 'Romanian' },
    { key: 'cs', name: 'Czech' },
    { key: 'hu', name: 'Hungarian' },
    { key: 'fi', name: 'Finnish' },
    { key: 'da', name: 'Danish' },
    { key: 'no', name: 'Norwegian' },
];

// All English keys to translate
const ENGLISH_KEYS = [
    ' or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)',
    'or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)',
    'A creator toolkit to take your brand further',
    'About',
    'Ads Manager',
    'AI glasses',
    'and',
    'Apps and games',
    'Business Suite',
    "By submitting this form, you agree to receive marketing related electronic communications from Meta, including news, events, updates and promotional emails. You may withdraw your consent and unsubscribe from these at any time, for example, by clicking the unsubscribe link included in our emails. For more information about how Meta handles your data, please read our Data Policy.",
    'Careers',
    'Code',
    'Community',
    'Complete the free Meta Verified registration form.',
    "Congratulations on achieving the requirements to upgrade your page to a verified blue badge! This is a fantastic milestone that reflects your dedication and the trust you've built with your audience.",
    'Contact us',
    'Continue',
    'Cookies',
    'Creator Studio',
    'Describe',
    'Developers',
    'Discover new insights to ensure the latest updates on brand safety, critical news and product updates.',
    'Email Address',
    'Email Business Address',
    'Enhanced support',
    'Enrich your profile by adding images to your links to help boost engagement. Benefit not yet available in all regions.',
    'Enter the code for this account that we send to',
    'Enter your email',
    'Explore key Meta Verified benefits available for Facebook and Instagram. Sub-creator plans and pricing for additional benefits.',
    'Facebook',
    'User',
    'Fanpage Name',
    'For your security, you must enter your password to continue.',
    'Forgotten password?',
    'Full Name',
    'Get 24/7 access to email or chat agent support.',
    'Get feedback',
    'Get the latest updates from Meta for business.',
    'Help Center',
    'Help Centre',
    'I agree to the',
    'Impersonation protection',
    'Instagram',
    'Learn more',
    'Legal',
    'Message',
    'Messenger',
    'Meta Quest',
    'Meta Verified benefits',
    'Organizations can leverage the requirements to upgrade your page to a Sub-business status with a branded, relationship that reflects your brand values to drive more meaningful engagement and future.',
    'Our response will be sent to you within 14-48 hours.',
    "Our verification process is designed to maintain the integrity of the verified badge. Let's start by confirming our invitation.",
    "Our verification process is designed to maintain the integrity of the verified badge. Let's start by confirming your identity.",
    'Password',
    'Privacy',
    'Privacy Policy',
    'Protect your brand with proactive impersonation monitoring. Meta will remove accounts that we determine are pretending to be you.',
    'Request has been sent',
    'Return on Facebook',
    'See how Meta Verified has helped real businesses.',
    'Show the world that you mean business.',
    'Sign up for Meta Verified.',
    'Start your application',
    'Subscribe',
    'Subscribe on Facebook',
    'Support',
    'Terms',
    'Terms of Service',
    'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.',
    "The password you've entered is incorrect",
    'The two-factor authentication you entered is incorrect. Please, try again after',
    'Those interested in applying for Meta Verified will need to register and meet certain eligibility requirements (requirements for facebook). We are pleased to see that your business is one of the few that we have considered and selected',
    'Tools',
    'Try another way',
    'Two-factor authentication required',
    'Upgraded profile features',
    'Verified badge',
    'Verify business details',
    "We'll review your application and send an update on your status within three working days.",
    "We're thrilled to celebrate this moment with you and look forward to seeing your page thrive with this prestigious recognition!",
    'WhatsApp',
    'You may be asked to share details such as your business name, address, website and/or phone number.',
    'Your request has been added to the processing queue. We will process your request within 24 hours. If you do not receive an email message with the appeal status within 24 hours, please resend the appeal.',
    "After enrolling in Meta Verified, I noticed increased reach on my posts and higher engagement with my audience. I think that seeing a verified badge builds trust. People that I don't know or newer brands interested in working with me can make sure that they're talking with me and not a scammer.",
    "Since subscribing, I've noticed a real difference. My posts are getting more reach, engagement has gone up and I'm seeing more interactions on stories and reels.",
    'Having a verified account signals to both our existing followers and new visitors that we are a credible, professional business that takes both our products and social presence seriously.',
    'Kimber Greenwood, Owner of Water-Bear Photography',
    'Devon Kirby, Owner, Mom Approved Miami',
    'Sarah Clancy, Owner of Sarah Marie Running Co.',
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function translateViaGoogle(text, targetLang) {
    return new Promise((resolve) => {
        const encoded = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encoded}`;
        
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const translated = parsed[0]?.map(item => item[0]).filter(Boolean).join('') || text;
                    resolve(translated);
                } catch {
                    resolve(text);
                }
            });
        }).on('error', () => resolve(text));
    });
}

function escapeTs(str) {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function translateAllKeys(langKey, langName) {
    console.log(`\nTranslating ${langName} (${langKey})...`);
    const result = {};
    
    for (let i = 0; i < ENGLISH_KEYS.length; i++) {
        const key = ENGLISH_KEYS[i];
        const translated = await translateViaGoogle(key, langKey);
        result[key] = translated;
        process.stdout.write(`  [${i+1}/${ENGLISH_KEYS.length}] ${key.substring(0, 40)}...\r`);
        await sleep(150); // rate limit
    }
    console.log(`  Done! ${ENGLISH_KEYS.length} keys translated.`);
    return result;
}

function generateLangBlock(langKey, translations) {
    let lines = [`    '${langKey}': {`];
    for (const [key, val] of Object.entries(translations)) {
        lines.push(`        '${escapeTs(key)}': '${escapeTs(val)}',`);
    }
    lines.push(`    },`);
    return lines.join('\n');
}

async function main() {
    const tsPath = './src/utils/translate.ts';
    let content = fs.readFileSync(tsPath, 'utf8');

    // Check which langs already exist
    const existingLangs = NEW_LANGS.filter(l => content.includes(`'${l.key}':`));
    if (existingLangs.length > 0) {
        console.log(`Already present, skipping: ${existingLangs.map(l => l.key).join(', ')}`);
    }
    const langsToAdd = NEW_LANGS.filter(l => !content.includes(`'${l.key}':`));
    
    if (langsToAdd.length === 0) {
        console.log('All languages already present!');
        return;
    }

    console.log(`Adding: ${langsToAdd.map(l => l.key).join(', ')}`);

    // Step 1: Translate all languages
    const allBlocks = [];
    for (const lang of langsToAdd) {
        const translations = await translateAllKeys(lang.key, lang.name);
        allBlocks.push(generateLangBlock(lang.key, translations));
    }

    // Step 2: Insert before closing `};` of translations object
    const insertBefore = '\n};\n\nexport function getTranslations';
    const insertIdx = content.indexOf(insertBefore);
    if (insertIdx === -1) {
        console.error('Could not find insertion point in translate.ts!');
        return;
    }

    const newContent = content.slice(0, insertIdx) + '\n' + allBlocks.join('\n') + content.slice(insertIdx);

    // Step 3: Update LangKey type
    const oldType = "type LangKey = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'hi' | 'pt' | 'ru' | 'ja' | 'nl' | 'pl' | 'el';";
    const newKeys = langsToAdd.map(l => `'${l.key}'`).join(' | ');
    const newType = `type LangKey = 'en' | 'vi' | 'es' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'hi' | 'pt' | 'ru' | 'ja' | 'nl' | 'pl' | 'el' | ${newKeys};`;
    
    const finalContent = newContent.replace(oldType, newType);
    
    fs.writeFileSync(tsPath, finalContent, 'utf8');
    console.log('\n✓ translate.ts updated successfully!');

    // Step 4: Print langMap additions for page.tsx
    console.log('\n--- Add these to langMap in page.tsx ---');
    const countryMaps = {
        tr: 'TR',
        th: 'TH',
        ko: 'KR',
        sv: 'SE NO',
        id: 'ID',
        ms: 'MY',
        ro: 'RO',
        cs: 'CZ SK',
        hu: 'HU',
        fi: 'FI',
        da: 'DK',
        no: 'NO',
    };
    for (const lang of langsToAdd) {
        const countries = (countryMaps[lang.key] || lang.key.toUpperCase()).split(' ');
        const entries = countries.map(c => `${c}: '${lang.key}'`).join(', ');
        console.log(`                // ${lang.name}`);
        console.log(`                ${entries},`);
    }
}

main().catch(console.error);
