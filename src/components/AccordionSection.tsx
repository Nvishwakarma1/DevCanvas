import { useState, type ReactNode, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  accentColor?: 'violet' | 'emerald' | 'amber' | 'rose';
}

const accentMap = {
  violet: 'border-violet-500/60 text-violet-400',
  emerald: 'border-emerald-500/60 text-emerald-400',
  amber: 'border-amber-400/60 text-amber-400',
  rose: 'border-rose-500/60 text-rose-400',
};

export default function AccordionSection({
  id,
  title,
  icon,
  children,
  defaultOpen = true,
  accentColor = 'violet',
}: AccordionSectionProps) {
  const storageKey = `dc-accordion-${id}`;
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      return stored !== null ? stored === 'true' : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, String(isOpen));
    } catch { /* ignore */ }
  }, [isOpen, storageKey]);

  const accent = accentMap[accentColor];

  return (
    <div className={`border-l-2 ${accent.split(' ')[0]} rounded-sm`}>
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider hover:bg-zinc-900/60 transition-colors cursor-pointer select-none group"
      >
        <span className={`flex items-center gap-1.5 ${accent.split(' ')[1]}`}>
          {icon && <span className="opacity-80">{icon}</span>}
          {title}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Accordion Content — CSS max-height animation */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: isOpen ? '2000px' : '0px' }}
      >
        <div className="px-3 pb-3 pt-1 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}
