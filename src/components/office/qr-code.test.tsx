import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QrCode } from './qr-code';

/**
 * QrCode wraps the `qrcode` library asynchronously — the SVG lands on a
 * microtask after the effect fires. Each assertion that cares about the
 * rendered QR must wait for the <svg> to appear inside the role="img"
 * wrapper; the loading state renders a placeholder <svg aria-hidden>, so
 * we scope the query to the wrapper's *label* to tell them apart.
 */
describe('QrCode', () => {
  it('renders an <svg> for the given value', async () => {
    const { container } = render(<QrCode value="hello" size={120} />);

    await waitFor(() => {
      const wrapper = container.querySelector('[aria-label="QR: hello"]');
      expect(wrapper).not.toBeNull();
      expect(wrapper?.querySelector('svg')).not.toBeNull();
    });
  });

  it('re-renders when the value prop changes', async () => {
    const { container, rerender } = render(
      <QrCode value="first" size={120} />,
    );

    await waitFor(() => {
      expect(
        container.querySelector('[aria-label="QR: first"] svg'),
      ).not.toBeNull();
    });

    rerender(<QrCode value="second" size={120} />);

    await waitFor(() => {
      expect(
        container.querySelector('[aria-label="QR: second"] svg'),
      ).not.toBeNull();
      // Previous wrapper must be gone — there is only one root at a time.
      expect(container.querySelector('[aria-label="QR: first"]')).toBeNull();
    });
  });
});
