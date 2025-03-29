import '@testing-library/jest-dom';
import { server } from './mocks/server';
import { vi } from 'vitest';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Mock react-router-dom navigation
vi.mock('react-router-dom', async () => {
  const originalModule = await vi.importActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => vi.fn(), // Mock useNavigate
    Navigate: (props: { to: string }) => `MockNavigate to ${props.to}`, // Mock Navigate component if needed directly
  };
});

// Mock window.location.href for login redirect checks (optional but useful)
// Keep the original implementation
const originalWindowLocation = window.location;

beforeEach(() => {
  // Restore the original implementation before each test
  // @ts-ignore
  delete window.location;
  window.location = { ...originalWindowLocation, assign: vi.fn(), href: '' };
});

afterEach(() => {
  // Restore original window.location after each test
  window.location = originalWindowLocation;
  vi.restoreAllMocks(); // Restore any other mocks
});
