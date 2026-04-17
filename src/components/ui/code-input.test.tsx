import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeInput } from './code-input';

describe('CodeInput', () => {
  it('renders 6 boxes by default', () => {
    render(<CodeInput autoFocus={false} />);
    const boxes = screen.getAllByRole('textbox');
    expect(boxes).toHaveLength(6);
  });

  it('invokes onChange per digit and onComplete once all 6 are filled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(
      <CodeInput autoFocus={false} onChange={onChange} onComplete={onComplete} />,
    );

    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    // Focus the first box, then type 6 digits; focus auto-advances on change.
    boxes[0].focus();
    await user.keyboard('123456');

    // onChange is called once per digit (6 times).
    expect(onChange).toHaveBeenCalledTimes(6);
    // Final onChange call receives the full concatenated string.
    expect(onChange).toHaveBeenLastCalledWith('123456');
    // onComplete fires exactly once, with the concatenated 6 digits.
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('ignores non-digit input', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<CodeInput autoFocus={false} onComplete={onComplete} />);

    const boxes = screen.getAllByRole('textbox') as HTMLInputElement[];
    boxes[0].focus();
    await user.keyboard('abcdef');

    expect(onComplete).not.toHaveBeenCalled();
  });
});
