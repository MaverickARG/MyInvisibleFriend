import { DrawResult, Participant } from '../utils/drawLogic';
import { firestore, auth } from './firebaseConfig';
import { collection, doc, setDoc, getDocs, deleteDoc, query, where, getDoc } from 'firebase/firestore';

export interface SavedDraw {
  id: string;
  name: string;
  date: string;
  participants: Participant[];
  results: DrawResult[] | null;
  userId?: string;
}

export const saveDraw = async (name: string, participants: Participant[], results: DrawResult[] | null, existingId?: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Debes iniciar sesión para guardar.');
    }

    const drawId = existingId || Date.now().toString();
    const newDraw: SavedDraw = {
      id: drawId,
      name,
      date: new Date().toISOString(),
      participants,
      results,
      userId: user.uid, // Guardamos a quién le pertenece este sorteo
    };

    // Guardar en la colección 'draws' usando el ID como nombre de documento
    const drawRef = doc(firestore, 'draws', drawId);
    await setDoc(drawRef, newDraw);
    
    console.log('Sorteo guardado en Firestore:', name);
    return { success: true, draw: newDraw };
  } catch (e) {
    console.error('Error al guardar el sorteo:', e);
    throw new Error('No se pudo guardar el sorteo en la nube.');
  }
};

export const getDrawHistory = async (): Promise<SavedDraw[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    // Filtrar solo los sorteos que pertenecen a este usuario
    const q = query(collection(firestore, 'draws'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as SavedDraw);
  } catch (e) {
    console.error('Error al obtener el historial:', e);
    return [];
  }
};

export const getPublicDraw = async (id: string): Promise<SavedDraw | null> => {
  try {
    const docRef = doc(firestore, 'draws', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SavedDraw;
    }
    return null;
  } catch (e) {
    console.error('Error al obtener el sorteo público:', e);
    return null;
  }
};

export const deleteDraw = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'draws', id));
  } catch (e) {
    console.error('Error al eliminar el sorteo:', e);
    throw new Error('No se pudo eliminar el sorteo.');
  }
};
