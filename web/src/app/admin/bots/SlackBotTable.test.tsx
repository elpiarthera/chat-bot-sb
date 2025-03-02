import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SlackBotTable } from './SlackBotTable';
import { mockSlackBots } from './test/mockData';
import { useRouter } from 'next/navigation';
import * as lib from './new/lib';
import { updateSlackBotField } from './new/lib';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./new/lib', () => ({
  cloneSlackBot: jest.fn(),
  deleteSlackBot: jest.fn(),
  updateSlackBotField: jest.fn(),
}));

jest.mock('@/components/admin/connectors/Popup', () => ({
  usePopup: () => ({
    popup: null,
    setPopup: jest.fn(),
  }),
}));

describe('SlackBotTable', () => {
  const mockRouter = {
    push: jest.fn(),
    prefetch: jest.fn(),
  };
  const mockRefreshCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (lib.cloneSlackBot as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: 999, name: 'Cloned Bot' }),
    });
    (lib.deleteSlackBot as jest.Mock).mockResolvedValue({
      ok: true,
    });
    (updateSlackBotField as jest.Mock).mockResolvedValue({
      ok: true,
    });
  });

  it('renders the table with correct columns', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Default Config')).toBeInTheDocument();
    expect(screen.getByText('Channel Count')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays correct number of rows based on data', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // There should be as many rows as bots
    const rows = screen.getAllByRole('row');
    // +1 for header row
    expect(rows.length).toBe(mockSlackBots.length + 1);
  });

  it('shows empty state message when no bots are available', () => {
    render(<SlackBotTable slackBots={[]} />);
    
    expect(screen.getByText('Please add a New Slack Bot to begin chatting with Onyx!')).toBeInTheDocument();
  });

  it('allows searching by bot name', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('Search bots by name...');
    
    // Type a search query that should match some bots
    fireEvent.change(searchInput, { target: { value: 'Support' } });
    
    // Check if the filtered results are displayed
    expect(screen.getByText('Support Bot')).toBeInTheDocument();
    expect(screen.queryByText('Marketing Bot')).not.toBeInTheDocument();
  });

  it('allows filtering by bot status', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // Open the dropdown
    fireEvent.click(screen.getByRole('combobox'));
    
    // Select 'Enabled' option
    fireEvent.click(screen.getByText('Enabled'));
    
    // Check if only enabled bots are shown
    const enabledBadges = screen.getAllByText('Enabled');
    const disabledBadges = screen.queryAllByText('Disabled');
    
    expect(enabledBadges.length).toBeGreaterThan(0);
    expect(disabledBadges.length).toBe(0);
  });

  it('navigates to bot details page when row is clicked', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // Click on the first bot row
    fireEvent.click(screen.getByText('Support Bot'));
    
    // Check if router.push was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/bots/1');
  });

  it('enables a disabled bot when the power button is clicked', async () => {
    // Find a disabled bot in the mock data
    const disabledBot = mockSlackBots.find(bot => !bot.enabled);
    
    render(<SlackBotTable slackBots={mockSlackBots} refreshCallback={mockRefreshCallback} />);
    
    // Find the power button for the disabled bot
    const powerButtons = screen.getAllByRole('button');
    const powerButton = powerButtons.find(button => 
      button.parentElement?.textContent?.includes(disabledBot?.name || '')
    );
    
    // Click the power button
    if (powerButton) {
      fireEvent.click(powerButton);
    }
    
    // Check if updateSlackBotField was called correctly
    await waitFor(() => {
      expect(updateSlackBotField).toHaveBeenCalledWith(
        disabledBot?.id,
        'enabled',
        true
      );
      expect(mockRefreshCallback).toHaveBeenCalled();
    });
  });

  it('shows clone confirmation modal when clone button is clicked', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // Find all the buttons with the "Clone" tooltip
    const buttons = screen.getAllByRole('button');
    const cloneButton = buttons[1]; // Second action button should be clone
    
    // Click the clone button
    fireEvent.click(cloneButton);
    
    // Check if the modal appears
    expect(screen.getByText(/Are you sure you want to clone/)).toBeInTheDocument();
  });

  it('shows delete confirmation modal when delete button is clicked', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // Find all the buttons with the "Delete" tooltip
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[2]; // Third action button should be delete
    
    // Click the delete button
    fireEvent.click(deleteButton);
    
    // Check if the modal appears
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
  });
  
  it('allows sorting bots by name', () => {
    render(<SlackBotTable slackBots={mockSlackBots} />);
    
    // Click the Name column header
    fireEvent.click(screen.getByText('Name'));
    
    // Check if the sorting indicator appears
    expect(screen.getByText('Name ↑')).toBeInTheDocument();
    
    // Click again to reverse sort order
    fireEvent.click(screen.getByText('Name ↑'));
    
    // Check if the sorting indicator changes
    expect(screen.getByText('Name ↓')).toBeInTheDocument();
  });

  it('allows bulk actions on selected bots', () => {
    render(<SlackBotTable slackBots={mockSlackBots} refreshCallback={mockRefreshCallback} />);
    
    // Find the checkboxes for selecting bots
    const checkboxes = screen.getAllByRole('checkbox');
    
    // Check the first bot checkbox
    fireEvent.click(checkboxes[1]); // Skip header checkbox
    
    // Check if bulk actions appear
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    
    // Click "Enable All" button
    fireEvent.click(screen.getByText('Enable All'));
    
    // Verify that updateSlackBotField was called
    waitFor(() => {
      expect(updateSlackBotField).toHaveBeenCalled();
      expect(mockRefreshCallback).toHaveBeenCalled();
    });
  });
}); 