import React from 'react';
import { cn } from '../../lib/utils';
import { Sheet } from './Sheet';
import type { SheetProps } from './Sheet';

export type ModalProps = SheetProps;

/**
 * Se conserva la API de Modal, pero la presentacion la pone Sheet: en movil
 * sale como hoja inferior y en escritorio (>= md) sigue siendo el dialogo
 * centrado de siempre (07-plan-implementacion.md, Fase 2).
 */
export const Modal: React.FC<ModalProps> = (props) => <Sheet {...props} />;

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={cn('flex-1 overflow-y-auto p-4', className)}>{children}</div>
);

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div
    className={cn(
      'p-4 border-t border-divider bg-background-card/95 backdrop-blur flex justify-end gap-3 shrink-0',
      className
    )}
  >
    {children}
  </div>
);

export default Modal;
