import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeInput } from '@/components/ui/code-input';

describe('CodeInput', () => {
  it('calls onComplete with "123456" after typing 6 digits', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<CodeInput length={6} onComplete={onComplete} autoFocus={false} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);

    inputs[0].focus();
    await user.keyboard('123456');

    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});
