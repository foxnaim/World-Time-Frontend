import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';

afterEach(() => {
  cleanup();
});
