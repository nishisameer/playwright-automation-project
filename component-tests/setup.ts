// Adds matchers like toBeInTheDocument(), toHaveTextContent() and toBeVisible()
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Remove what each test rendered, so tests stay isolated
afterEach(() => cleanup());
