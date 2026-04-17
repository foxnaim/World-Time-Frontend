import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeInput } from '../code-input';

describe('CodeInput', () => {
  it('auto-advances focus to the next box when a digit is typed', async () => {
    const user = userEvent.setup();
    render(<CodeInput autoFocus={false} />);

    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    boxes[0].focus();
    expect(document.activeElement).toBe(boxes[0]);

    await user.keyboard('1');
    expect(boxes[0].value).toBe('1');
    expect(document.activeElement).toBe(boxes[1]);

    await user.keyboard('2');
    expect(boxes[1].value).toBe('2');
    expect(document.activeElement).toBe(boxes[2]);
  });

  it('moves focus to the previous box on Backspace when the current box is empty', async () => {
    const user = userEvent.setup();
    render(<CodeInput autoFocus={false} />);

    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    boxes[0].focus();
    await user.keyboard('12');
    // After typing "12", focus is on box index 2 (empty).
    expect(document.activeElement).toBe(boxes[2]);

    // First backspace clears nothing in index 2 (already empty) and moves to index 1.
    await user.keyboard('{Backspace}');
    expect(document.activeElement).toBe(boxes[1]);
    expect(boxes[1].value).toBe('');

    // Second backspace: box 1 is now empty, focus moves back to box 0.
    await user.keyboard('{Backspace}');
    expect(document.activeElement).toBe(boxes[0]);
  });

  it('distributes a pasted 6-digit string across all boxes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CodeInput autoFocus={false} onChange={onChange} />);

    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    boxes[0].focus();
    await user.paste('987654');

    expect(boxes.map((b) => b.value)).toEqual([
      '9',
      '8',
      '7',
      '6',
      '5',
      '4',
    ]);
    expect(onChange).toHaveBeenLastCalledWith('987654');
  });

  it('fires onComplete exactly once when all 6 digits are entered', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<CodeInput autoFocus={false} onComplete={onComplete} />);

    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    boxes[0].focus();
    await user.keyboard('123456');

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});
