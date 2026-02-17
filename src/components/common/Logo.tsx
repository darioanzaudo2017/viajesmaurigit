import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
    variant?: 'light' | 'dark' | 'neon';
    onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ className = "size-10", showText = true, variant = 'neon', onClick }) => {
    const isNeon = variant === 'neon';
    const color = isNeon ? "#13ec6d" : "currentColor";

    return (
        <div className={`flex items-center gap-3 cursor-pointer select-none ${className}`} onClick={onClick}>
            <div className="relative h-full w-auto aspect-square flex-shrink-0">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Mountain Base Connection */}
                    <path
                        d="M15 70 L 30 45 L 40 55"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M60 55 L 70 45 L 85 70"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Main Pulse/Peak Combo */}
                    <path
                        d="M 5 70 H 30 L 38 70 L 45 35 L 50 80 L 55 20 L 62 70 L 95 70"
                        stroke={color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={isNeon ? "drop-shadow-[0_0_8px_rgba(19,236,109,0.8)]" : ""}
                    />

                    {/* Background Peak Outline (Subtle) */}
                    <path
                        d="M 25 70 L 50 10 L 75 70"
                        stroke={color}
                        strokeWidth="1.5"
                        opacity="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {showText && (
                <div className="flex flex-col leading-none">
                    <span className={`text-xl font-black tracking-tight uppercase italic ${variant === 'dark' ? 'text-background-dark' : 'text-white'}`}>
                        TREK<span className="text-primary">LOGIX</span>
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#92c9a9]">
                        Precision Wilderness Navigation
                    </span>
                </div>
            )}
        </div>
    );
};

export default Logo;
