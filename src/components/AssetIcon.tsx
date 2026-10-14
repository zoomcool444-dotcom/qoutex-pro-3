import React from 'react';

interface AssetIconProps {
  symbol: string;
  category?: string;
  size?: number;
  className?: string;
}

export const AssetIcon: React.FC<AssetIconProps> = ({
  symbol,
  size = 22,
  className = '',
}) => {
  const s = symbol.toLowerCase();

  // 1. Gold (Commodity - US flag + Gold roundel as in Screenshot)
  if (s.includes('gold')) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 shadow-sm border border-[#3b475f] flex items-center justify-center bg-[#182030] ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" className="w-full h-full">
          {/* Left half: US Flag stripes & blue canton */}
          <clipPath id="leftHalf">
            <rect x="0" y="0" width="16" height="32" />
          </clipPath>
          <g clipPath="url(#leftHalf)">
            <rect width="32" height="32" fill="#b91c1c" />
            <rect y="4.5" width="32" height="4.5" fill="#ffffff" />
            <rect y="13.5" width="32" height="4.5" fill="#ffffff" />
            <rect y="22.5" width="32" height="4.5" fill="#ffffff" />
            <rect width="16" height="17" fill="#1e3a8a" />
            <circle cx="5" cy="5" r="1.2" fill="#ffffff" />
            <circle cx="11" cy="5" r="1.2" fill="#ffffff" />
            <circle cx="8" cy="9" r="1.2" fill="#ffffff" />
            <circle cx="5" cy="13" r="1.2" fill="#ffffff" />
            <circle cx="11" cy="13" r="1.2" fill="#ffffff" />
          </g>
          {/* Right half: Shiny Gold Bullion / Coin shimmer */}
          <rect x="16" y="0" width="16" height="32" fill="#f59e0b" />
          <path d="M16 0L32 32H16V0Z" fill="#fbbf24" opacity="0.6" />
          <circle cx="24" cy="16" r="5" fill="#d97706" />
          <text x="24" y="19" fontSize="7" fontWeight="bold" fill="#ffffff" textAnchor="middle">G</text>
        </svg>
      </div>
    );
  }

  // 2. Silver
  if (s.includes('silver')) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-500 flex items-center justify-center bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900 font-black text-[9px] ${className}`}
        style={{ width: size, height: size }}
      >
        Ag
      </div>
    );
  }

  // 3. Oil (UKBrent / USCrude)
  if (s.includes('brent') || s.includes('crude')) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 shadow-sm border border-[#2b3548] flex items-center justify-center bg-[#10141e] text-amber-400 text-[10px] ${className}`}
        style={{ width: size, height: size }}
      >
        🛢️
      </div>
    );
  }

  // 4. Crypto (Bitcoin, Ethereum, etc.)
  if (s.includes('bitcoin') || s.includes('btc')) {
    return (
      <div
        className={`rounded-full overflow-hidden shrink-0 shadow-sm bg-[#f7931a] text-white flex items-center justify-center font-bold text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        ₿
      </div>
    );
  }

  // 5. Forex Currency pairs (Dual flag roundel)
  const isEur = s.includes('eur');
  const isUsd = s.includes('usd');
  const isGbp = s.includes('gbp');
  const isJpy = s.includes('jpy');
  const isNzd = s.includes('nzd');

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 shadow-sm border border-[#3b475f] flex items-center justify-center bg-[#1e2738] ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full flex">
        <div className="w-1/2 h-full bg-[#1e3a8a] flex items-center justify-center text-[8px] font-black text-amber-300">
          {isEur ? '★' : isGbp ? '🇬🇧' : symbol.slice(0, 2)}
        </div>
        <div className="w-1/2 h-full bg-[#b91c1c] flex items-center justify-center text-[8px] font-black text-white">
          {isUsd ? '$' : isJpy ? '¥' : isNzd ? '🇳🇿' : symbol.slice(4, 6)}
        </div>
      </div>
    </div>
  );
};
