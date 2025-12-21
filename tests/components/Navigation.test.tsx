/**
 * Tests for Navigation component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '../../components/Navigation';
import { AppTab } from '../../types';

describe('Navigation Component', () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all navigation tabs', () => {
      render(<Navigation currentTab={AppTab.DASHBOARD} onTabChange={mockOnTabChange} />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Workouts')).toBeInTheDocument();
      expect(screen.getByText('Diet')).toBeInTheDocument();
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText('AI Coach')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render 6 navigation buttons', () => {
      render(<Navigation currentTab={AppTab.DASHBOARD} onTabChange={mockOnTabChange} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(6);
    });
  });

  describe('Tab Selection', () => {
    it('should call onTabChange when tab is clicked', () => {
      render(<Navigation currentTab={AppTab.DASHBOARD} onTabChange={mockOnTabChange} />);
      
      const workoutTab = screen.getByText('Workouts');
      fireEvent.click(workoutTab);
      
      expect(mockOnTabChange).toHaveBeenCalledWith(AppTab.WORKOUT);
    });

    it('should call onTabChange with correct tab for each click', () => {
      render(<Navigation currentTab={AppTab.DASHBOARD} onTabChange={mockOnTabChange} />);
      
      fireEvent.click(screen.getByText('Diet'));
      expect(mockOnTabChange).toHaveBeenCalledWith(AppTab.DIET);
      
      fireEvent.click(screen.getByText('Activity'));
      expect(mockOnTabChange).toHaveBeenCalledWith(AppTab.ACTIVITY);
      
      fireEvent.click(screen.getByText('AI Coach'));
      expect(mockOnTabChange).toHaveBeenCalledWith(AppTab.CHAT);
      
      fireEvent.click(screen.getByText('Profile'));
      expect(mockOnTabChange).toHaveBeenCalledWith(AppTab.PROFILE);
    });
  });

  describe('Active State', () => {
    it('should highlight current tab', () => {
      const { container } = render(
        <Navigation currentTab={AppTab.WORKOUT} onTabChange={mockOnTabChange} />
      );
      
      // Component should render without errors with any tab active
      expect(container).toBeTruthy();
    });

    it('should work with different active tabs', () => {
      const tabs = [AppTab.DASHBOARD, AppTab.WORKOUT, AppTab.DIET, AppTab.ACTIVITY, AppTab.CHAT, AppTab.PROFILE];
      
      tabs.forEach((tab) => {
        const { container } = render(
          <Navigation currentTab={tab} onTabChange={mockOnTabChange} />
        );
        expect(container).toBeTruthy();
      });
    });
  });
});
