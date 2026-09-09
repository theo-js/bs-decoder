import type { FC } from "react";

export const DecoderIndicator: FC = () => (
    <div
        aria-hidden="true"
        className="relative h-16 w-16 rounded-full bg-black flex items-center justify-center opacity-80 overflow-hidden"
    >
        <div className="rounded-full w-8 h-8 bg-[#8b5cf6]" />
        <div
            className="absolute rounded-full w-full h-full bg-[#8b5cf688] z-[-1]"
            style={{ animation: 'decoder-indicator-breathe infinite 1.5s ease-out' }}
        />
    </div>
);