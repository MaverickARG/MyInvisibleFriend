import { auth } from './firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  sendPasswordResetEmail
} from 'firebase/auth';

// Intentamos cargar Google Sign-In. Si estamos en Expo Go, fallará silenciosamente sin romper la app.
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  GoogleSignin.configure({
    webClientId: '749339297785-afem6hcvs1uib7bk3os37p49kvbgdlti.apps.googleusercontent.com',
  });
} catch (e) {
  console.log('Google Sign-In nativo no está disponible (esto es normal usando Expo Go).');
}

export const loginWithEmail = async (email: string, pass: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const registerWithEmail = async (email: string, pass: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
};

export const resetPasswordWithEmail = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const logout = async () => {
  await signOut(auth);
};

export const loginWithGoogle = async () => {
  try {
    if (!GoogleSignin) {
      throw new Error('Google Sign-In no funciona dentro de Expo Go. Inicia sesión con correo por ahora.');
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    
    // Obtener el token de la respuesta (dependiendo de la versión de la librería está en data.idToken o idToken directo)
    const idToken = response.data?.idToken || (response as any).idToken;
    if (!idToken) throw new Error('No se recibió el token de Google');
    
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);
    return userCredential.user;
  } catch (error) {
    console.error('Error en Google Sign-In:', error);
    throw error;
  }
};
