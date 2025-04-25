import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from './page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home', () => {
  it('redirects to /auth on render', () => {
    const mockedRouter = { push: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockedRouter);

    render(<Home />);

    expect(mockedRouter.push).toHaveBeenCalledWith('/auth');
  });
});