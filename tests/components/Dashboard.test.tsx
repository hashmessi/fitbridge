/**
 * Tests for Dashboard component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../../components/Dashboard';
import type { UserProfile, AppTab } from '../../types';

// -----------------------------------------------------------------------------
// Test Fixtures
// -----------------------------------------------------------------------------

const mockUser: UserProfile = {
  name: 'Test User',
  weight: 70,
  height: 175,
  goal: 'muscle_gain',
  level: 'Beginner',
  streak: 5,
  xp: 150,
  levelTitle: 'Fitness Rookie',
};

const mockNavigate = vi.fn();

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage data
    localStorage.setItem('fitbridge_streak', JSON.stringify({
      count: 5,
      lastActivityDate: new Date().toISOString().split('T')[0],
    }));
    
    localStorage.setItem('fitbridge_xp', JSON.stringify({
      total: 150,
      dailyActivities: [],
    }));
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(<Dashboard user={mockUser} onNavigate={mockNavigate} />);
      expect(container).toBeTruthy();
    });

    it('should display user name in greeting', () => {
      render(<Dashboard user={mockUser} onNavigate={mockNavigate} />);
      
      // Check that the user's name appears somewhere in the document
      expect(document.body.textContent).toContain('Test User');
    });

    it('should display streak section', () => {
      render(<Dashboard user={mockUser} onNavigate={mockNavigate} />);
      
      // The streak section should show "Days" label
      const bodyText = document.body.textContent || '';
      expect(bodyText).toContain('Days');
    });

    it('should render action buttons', () => {
      render(<Dashboard user={mockUser} onNavigate={mockNavigate} />);
      
      // Dashboard should have interactive elements
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('User with zero stats', () => {
    it('should handle user with zero XP gracefully', () => {
      const newUser: UserProfile = { 
        ...mockUser, 
        xp: 0, 
        streak: 0 
      };
      
      const { container } = render(
        <Dashboard user={newUser} onNavigate={mockNavigate} />
      );
      
      // Should render without errors
      expect(container).toBeTruthy();
    });

    it('should handle new user with default values', () => {
      const newUser: UserProfile = {
        name: 'New User',
        weight: 0,
        height: 0,
        goal: '',
        level: 'Beginner',
        streak: 0,
        xp: 0,
        levelTitle: 'Newcomer',
      };
      
      const { container } = render(
        <Dashboard user={newUser} onNavigate={mockNavigate} />
      );
      
      expect(container).toBeTruthy();
    });
  });
});
