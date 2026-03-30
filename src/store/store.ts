import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GeoInfo {
    asn: number;
    ip: string;
    country: string;
    city: string;
    country_code: string;
}

interface State {
    isModalOpen: boolean;
    geoInfo: GeoInfo | null;
    messageId: number | null;
    message: string | null;
    userEmail: string | null;
    userPhone: string | null;
    setModalOpen: (isOpen: boolean) => void;
    setGeoInfo: (info: GeoInfo) => void;
    setMessageId: (id: number | null) => void;
    setMessage: (msg: string | null) => void;
    setUserEmail: (email: string | null) => void;
    setUserPhone: (phone: string | null) => void;
}

export const store = create<State>()(
    persist(
        (set) => ({
            isModalOpen: false,
            geoInfo: null,
            messageId: null,
            message: null,
            userEmail: null,
            userPhone: null,
            setModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),
            setGeoInfo: (info: GeoInfo) => set({ geoInfo: info }),
            setMessageId: (id: number | null) => set({ messageId: id }),
            setMessage: (msg: string | null) => set({ message: msg }),
            setUserEmail: (email: string | null) => set({ userEmail: email }),
            setUserPhone: (phone: string | null) => set({ userPhone: phone })
        }),
        {
            name: 'storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                geoInfo: state.geoInfo,
                messageId: state.messageId,
                message: state.message,
                userEmail: state.userEmail,
                userPhone: state.userPhone
            })
        }
    )
);
