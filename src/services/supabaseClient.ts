import { auth, db, googleProvider, getProfileByEmail, saveProfile } from './databaseService';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { UserAccount } from '../types';

export { auth, db, googleProvider };

/**
 * Executes Google OAuth Sign In and retrieves or provisions Profile in database
 */
export async function signInWithGoogleOAuth(): Promise<{ profile: UserAccount; isNewUser: boolean } | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user || !user.email) {
      throw new Error('Nenhum e-mail retornado na autenticação do Google.');
    }

    const email = user.email.trim().toLowerCase();
    const existingProfile = await getProfileByEmail(email);

    if (existingProfile) {
      // Existing user: update picture if available
      const updated: UserAccount = {
        ...existingProfile,
        avatarUrl: user.photoURL || existingProfile.avatarUrl,
        name: existingProfile.name || user.displayName || 'Profissional de Saúde'
      };
      await saveProfile(updated);
      return { profile: updated, isNewUser: false };
    } else {
      // First access: automatically register in database
      const newProfile: UserAccount = {
        id: `usr-${user.uid || Date.now()}`,
        name: user.displayName || 'Profissional de Saúde',
        email: email,
        crn: 'CRN/CRM em Verificação',
        specialty: 'Nutrição Clínica & Funcional',
        plan: 'free',
        isSubscribed: false,
        dailyMessageCount: 0,
        dailyMessageLimit: 30,
        monthlyMessageCount: 0,
        monthlyMessageLimit: 50,
        avatarUrl: user.photoURL || undefined,
        activeSince: new Date().getFullYear().toString()
      };
      await saveProfile(newProfile);
      return { profile: newProfile, isNewUser: true };
    }
  } catch (error: any) {
    console.error('Erro no fluxo de autenticação do Google:', error);
    throw error;
  }
}
