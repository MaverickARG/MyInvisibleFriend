import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawResult, Participant } from '../utils/drawLogic';

const STORAGE_KEY = '@invisible_friend_draws';

export interface SavedDraw {
  id: string;
  name: string;
  date: string;
  participants: Participant[];
  results: DrawResult[] | null;
}

export const saveDraw = async (name: string, participants: Participant[], results: DrawResult[] | null, existingId?: string) => {
  try {
    const existingDrawsStr = await AsyncStorage.getItem(STORAGE_KEY);
    let existingDraws: SavedDraw[] = existingDrawsStr ? JSON.parse(existingDrawsStr) : [];
    
    let updatedDraws;
    const newDraw: SavedDraw = {
      id: existingId || Date.now().toString(),
      name,
      date: new Date().toISOString(),
      participants,
      results,
    };

    if (existingId) {
      updatedDraws = existingDraws.map(draw => draw.id === existingId ? newDraw : draw);
    } else {
      updatedDraws = [...existingDraws, newDraw];
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDraws));
    console.log('Sorteo guardado localmente:', name);
    return { success: true, draw: newDraw };
  } catch (e) {
    console.error('Error al guardar el sorteo:', e);
    throw new Error('No se pudo guardar el sorteo localmente.');
  }
};

export const getDrawHistory = async (): Promise<SavedDraw[]> => {
  try {
    const existingDrawsStr = await AsyncStorage.getItem(STORAGE_KEY);
    return existingDrawsStr ? JSON.parse(existingDrawsStr) : [];
  } catch (e) {
    console.error('Error al obtener el historial:', e);
    return [];
  }
};

export const deleteDraw = async (id: string) => {
  try {
    const existingDrawsStr = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existingDrawsStr) return;
    
    const existingDraws: SavedDraw[] = JSON.parse(existingDrawsStr);
    const updatedDraws = existingDraws.filter(draw => draw.id !== id);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDraws));
  } catch (e) {
    console.error('Error al eliminar el sorteo:', e);
    throw new Error('No se pudo eliminar el sorteo.');
  }
};
