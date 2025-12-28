import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '../../components/Toast';
import * as NotificationContext from '../../context/NotificationContext';

// Mock the context hook
jest.mock('../../context/NotificationContext', () => ({
    useNotification: jest.fn(),
}));

describe('Toast Component', () => {
    it('should result null if no notification', () => {
        NotificationContext.useNotification.mockReturnValue({
            notification: null,
            removeNotification: jest.fn(),
        });

        const { container } = render(<Toast />);
        expect(container.firstChild).toBeNull();
    });

    it('should render success message', () => {
        NotificationContext.useNotification.mockReturnValue({
            notification: { type: 'success', message: 'Operation successful' },
            removeNotification: jest.fn(),
        });

        render(<Toast />);
        expect(screen.getByText('Operation successful')).toBeInTheDocument();
        // Check for success semantics (e.g. green styling or icon) if possible, 
        // but text presence is a good enough white-box test for now.
    });

    it('should call removeNotification on click', () => {
        const removeMock = jest.fn();
        NotificationContext.useNotification.mockReturnValue({
            notification: { type: 'error', message: 'Error occurred' },
            removeNotification: removeMock,
        });

        render(<Toast />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(removeMock).toHaveBeenCalled();
    });
});
