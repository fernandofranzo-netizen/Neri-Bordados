interface NeriLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  subtitle?: string;
}

export function NeriLogo({
  className = '',
  size = 'md',
  showText = false,
  textColor = 'text-slate-900',
  subtitle,
}: NeriLogoProps) {
  // Proportional sizing calibrated to the authentic embroidery patch aspect ratio (~1.13:1)
  const sizeMap = {
    xs: { img: 'h-7 w-auto max-w-[36px]', text: 'text-sm', sub: 'text-[10px]' },
    sm: { img: 'h-10 sm:h-11 w-auto max-w-[54px]', text: 'text-base', sub: 'text-[11px]' },
    md: { img: 'h-12 w-auto max-w-[62px]', text: 'text-lg', sub: 'text-xs' },
    lg: { img: 'h-16 w-auto max-w-[84px]', text: 'text-xl', sub: 'text-xs sm:text-sm' },
    xl: { img: 'h-24 w-auto max-w-[124px]', text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      {/* 100% Authentic Embroidery Patch Emblem from User's Original Brand */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-102"
        title="Neri Bordados Computadorizados"
      >
        <img
          src="/logo.svg"
          alt="Neri Bordados"
          className={`${currentSize.img} object-contain filter drop-shadow-xs select-none`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Robust fallback chain: svg -> png -> jpg
            const target = e.currentTarget as HTMLImageElement;
            if (target.src.endsWith('.svg')) {
              target.src = '/logo.png';
            } else if (target.src.endsWith('.png')) {
              target.src = '/logo.jpg';
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={`font-black tracking-tight ${textColor} ${currentSize.text} font-display whitespace-nowrap leading-tight`}
              style={{ letterSpacing: '-0.02em' }}
            >
              Neri <span className="text-cyan-600">Bordados</span>
            </span>
            <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-600 border border-pink-200/80 leading-none whitespace-nowrap shadow-2xs">
              Ateliê
            </span>
          </div>
          <p className={`text-slate-500 font-medium ${currentSize.sub} whitespace-nowrap leading-tight mt-1`}>
            {subtitle || 'Bordados Computadorizados'}
          </p>
        </div>
      )}
    </div>
  );
}

