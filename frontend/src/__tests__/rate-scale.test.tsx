import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { RateScale } from '@/components/dashboard/freelance/rate-scale';

describe('RateScale', () => {
  it('matches snapshot at rate=1800', () => {
    const { container } = render(<RateScale rate={1800} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
