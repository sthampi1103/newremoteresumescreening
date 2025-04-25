import { signUp, signIn } from './page';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

jest.mock('firebase/auth');

const mockedCreateUserWithEmailAndPassword = jest.mocked(
  createUserWithEmailAndPassword
);
const mockedSignInWithEmailAndPassword = jest.mocked(
  signInWithEmailAndPassword
);

describe('Authentication Functions', () => {
  beforeEach(() => {
    mockedCreateUserWithEmailAndPassword.mockReset();
    mockedSignInWithEmailAndPassword.mockReset();
  });

  it('should successfully sign up a user', async () => {
    mockedCreateUserWithEmailAndPassword.mockResolvedValue({ user: {} } as any);

    await signUp('test@example.com', 'password');

    expect(mockedCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });

  it('should successfully sign in a user', async () => {
    mockedSignInWithEmailAndPassword.mockResolvedValue({ user: {} } as any);

    await signIn('test@example.com', 'password');

    expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });

  it('should throw an error when trying to sign up with an email that is already in use', async () => {
    mockedCreateUserWithEmailAndPassword.mockRejectedValue({
      code: 'auth/email-already-in-use',
    });

    await expect(signUp('test@example.com', 'password')).rejects.toEqual({
      code: 'auth/email-already-in-use',
    });
    expect(mockedCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'password'
    );
  });

  it('should throw an error when trying to sign in with invalid credentials', async () => {
    mockedSignInWithEmailAndPassword.mockRejectedValue({
      code: 'auth/wrong-password',
    });

    await expect(signIn('test@example.com', 'wrongpassword')).rejects.toEqual({
      code: 'auth/wrong-password',
    });
    expect(mockedSignInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@example.com',
      'wrongpassword'
    );
  });
});
