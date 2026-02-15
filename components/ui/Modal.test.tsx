import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal, ModalBody, ModalFooter } from './Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()}>Content</Modal>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="My Modal">Content</Modal>);
    expect(screen.getByText('My Modal')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Hello World</Modal>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on overlay click when closeOnOverlayClick is true', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose}>Content</Modal>);
    // Click the overlay (the outermost fixed div)
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose on overlay click when closeOnOverlayClick is false', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>Content</Modal>);
    const overlay = screen.getByRole('dialog').parentElement!;
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} showCloseButton={false} title="Test">Content</Modal>);
    expect(screen.queryByLabelText('Cerrar')).not.toBeInTheDocument();
  });

  it('sets aria-modal and aria-label', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Confirm">Content</Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Confirm');
  });

  it('sets body overflow hidden when open', () => {
    render(<Modal isOpen={true} onClose={vi.fn()}>Content</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
  });
});

describe('ModalBody', () => {
  it('renders children with padding', () => {
    render(<ModalBody>Body content</ModalBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});

describe('ModalFooter', () => {
  it('renders children', () => {
    render(<ModalFooter>Footer content</ModalFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
