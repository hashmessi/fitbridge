/**
 * Tests for AuthScreen component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthScreen } from '../../components/AuthScreen';

// Mock Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
  isSupabaseConfigured: vi.fn(() => true),
}));

describe('AuthScreen Component', () => {
  const mockOnAuthSuccess = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      expect(container).toBeTruthy();
    });

    it('should render email input', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    });

    it('should render password input', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    });

    it('should render app branding', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      expect(screen.getByText(/fitbridge/i)).toBeInTheDocument();
    });
  });

  describe('Form Inputs', () => {
    it('should allow typing in email field', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      
      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      
      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      
      expect(passwordInput.value).toBe('testpassword');
    });
  });

  describe('Form Interactions', () => {
    it('should have submit button', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render with onSkip prop', () => {
      const { container } = render(
        <AuthScreen onAuthSuccess={mockOnAuthSuccess} onSkip={mockOnSkip} />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('Password Input', () => {
    it('should have password type by default', () => {
      render(<AuthScreen onAuthSuccess={mockOnAuthSuccess} />);
      
      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
    });
  });
});

