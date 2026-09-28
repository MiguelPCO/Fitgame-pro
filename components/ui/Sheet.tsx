import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  /** Ancho maximo en escritorio. En movil siempre ocupa el ancho completo. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const sizeStyles: Record<NonNullable<SheetProps['size']>, string> = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-lg',
  lg: 'md:max-w-2xl',
  xl: 'md:max-w-4xl',
};

/** Arrastre vertical necesario para que soltar cierre la hoja. */
const CLOSE_THRESHOLD_PX = 80;

/**
 * Hoja inferior en movil, dialogo centrado en escritorio (>= md).
 * La presentacion es solo CSS: un unico DOM, sin media query en JS.
 */
export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dragStartRef = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  // Escape + trampa de foco + bloqueo del scroll de fondo
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = '';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setDragY(0);
  }, [isOpen]);

  if (!isOpen) return null;

  // Deslizar hacia abajo cierra (05-arquitectura-ux.md §6). Solo sobre la
  // agarradera y la cabecera: el contenido tiene su propio scroll.
  const onDragStart = (e: React.TouchEvent) => {
    dragStartRef.current = e.touches[0].clientY;
  };
  const onDragMove = (e: React.TouchEvent) => {
    if (dragStartRef.current === null) return;
    const delta = e.touches[0].clientY - dragStartRef.current;
    if (delta > 0) setDragY(delta);
  };
  const onDragEnd = () => {
    if (dragY > CLOSE_THRESHOLD_PX) onClose();
    dragStartRef.current = null;
    setDragY(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in md:items-center md:p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panel'}
        tabIndex={-1}
        className={cn(
          'bg-background-card w-full flex flex-col overflow-hidden outline-none max-h-[90vh]',
          'rounded-t-3xl border-t border-divider shadow-sheet animate-slide-up',
          'md:rounded-2xl md:border md:animate-scale-in',
          sizeStyles[size]
        )}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Agarradera de 36x4 dentro de un area tactil de 44px (04-design-system.md §12) */}
        <div
          className="md:hidden flex items-center justify-center h-6 pt-3 shrink-0 touch-none"
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          aria-hidden="true"
        >
          <span className="w-9 h-1 rounded-full bg-border-input" />
        </div>

        {(title || showCloseButton) && (
          <div
            className="flex items-center justify-between p-4 border-b border-divider shrink-0"
            onTouchStart={onDragStart}
            onTouchMove={onDragMove}
            onTouchEnd={onDragEnd}
          >
            {title && <h3 className="font-bold text-text-main text-lg">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="min-w-11 min-h-11 flex items-center justify-center hover:bg-surface-raised rounded-lg text-text-muted hover:text-text-main transition-colors duration-fast ml-auto"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)] md:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sheet;
