import { db, getProfileByEmail, saveProfile, handleGoogleProfileAuth } from './databaseService';
import { GoogleProfile, initiateGoogleOAuthPopup } from './googleAuth';
import { UserAccount } from '../types';

export { db };

/**
 * Executes Google OAuth Sign In via Google Identity Services and retrieves or provisions Profile in database
 */
export async function signInWithGoogleOAuth(): Promise<{ profile: UserAccount; isNewUser: boolean } | null> {
  return new Promise((resolve, reject) => {
    initiateGoogleOAuthPopup(
      async (googleProfile: GoogleProfile) => {
        try {
          const email = (googleProfile.email || '').trim().toLowerCase();
          const existingProfile = await getProfileByEmail(email);
          const user = await handleGoogleProfileAuth(googleProfile);
          resolve({ profile: user, isNewUser: !existingProfile });
        } catch (err) {
          reject(err);
        }
      },
      (errorMessage: string) => {
        if (!errorMessage) {
          resolve(null);
        } else {
          reject(new Error(errorMessage));
        }
      }
    );
  });
}

