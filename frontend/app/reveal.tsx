import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPublicDraw, SavedDraw } from '../src/services/db';
import { DrawResult } from '../src/utils/drawLogic';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Audio } from 'expo-av';

export default function RevealScreen() {
  const { drawId, giverId } = useLocalSearchParams<{ drawId: string; giverId: string }>();
  const [draw, setDraw] = useState<SavedDraw | null>(null);
  const [myResult, setMyResult] = useState<DrawResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrambleText, setScrambleText] = useState('');
  const [error, setError] = useState('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const fetchDraw = async () => {
      if (!drawId || !giverId) {
        setError('Enlace inválido. Faltan datos.');
        setIsLoading(false);
        return;
      }

      const fetchedDraw = await getPublicDraw(drawId);
      if (!fetchedDraw || !fetchedDraw.results) {
        setError('El sorteo no existe o aún no se han generado los resultados.');
      } else {
        setDraw(fetchedDraw);
        const result = fetchedDraw.results.find(r => r.giver.id === giverId);
        if (result) {
          setMyResult(result);
        } else {
          setError('No estás en la lista de este sorteo.');
        }
      }
      setIsLoading(false);
    };

    fetchDraw();
  }, [drawId, giverId]);

  // Limpiamos el sonido de la memoria si el usuario sale de la pantalla
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Disparamos el sonido exactamente cuando la animación termina y se revela el nombre
  useEffect(() => {
    if (isRevealed && !isAnimating) {
      const playApplause = async () => {
        try {
          // Forzamos el modo de audio para que suene incluso si el teléfono está en silencio (muy común en iOS)
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
          });
          // Usamos un sonido de internet temporal. Para usar tu propio archivo guárdalo en la carpeta assets y usa:
          // const { sound: newSound } = await Audio.Sound.createAsync(require('../assets/aplausos.mp3'));
          const { sound: newSound } = await Audio.Sound.createAsync({ uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_247ddbb454.mp3' }); // Aplausos en formato MP3 universal
          setSound(newSound);
          await newSound.playAsync();
        } catch (e) {
          console.log('Error al reproducir el sonido de aplausos', e);
        }
      };
      playApplause();
    }
  }, [isRevealed, isAnimating]);

  const handleReveal = () => {
    setIsRevealed(true);
    setIsAnimating(true);

    // Obtenemos todos los nombres de los participantes (excepto el propio) para hacer la ruleta
    const participantNames = draw?.participants
      .filter(p => p.id !== myResult?.giver.id)
      .map(p => p.name) || ['...'];
    
    const duration = 4000; // Duración total de la animación en ms
    const startTime = Date.now();
    
    const startSpeed = 60; // ms (muy rápido al inicio)
    const endSpeed = 700; // ms (muy lento al final)

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = elapsedTime / duration;

      if (progress >= 1) {
        // La animación ha terminado
        setIsAnimating(false);
        return;
      }

      // Elegir un nombre al azar
      const randomName = participantNames[Math.floor(Math.random() * participantNames.length)];
      setScrambleText(randomName);

      // Calcular el siguiente retraso usando una función de "ease-out"
      // A medida que 'progress' se acerca a 1, el retraso aumenta, haciendo la ruleta más lenta.
      const currentDelay = startSpeed + (endSpeed - startSpeed) * (progress * progress);
      
      setTimeout(animate, currentDelay);
    };

    animate(); // Iniciar la animación
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff4757" />
        <Text style={styles.loadingText}>Buscando tu regalo mágico...</Text>
      </View>
    );
  }

  if (error || !myResult) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>😢</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Hola, {myResult.giver.name}!</Text>
      <Text style={styles.subtitle}>Bienvenido al sorteo: {draw?.name}</Text>

      {!isRevealed ? (
        <TouchableOpacity style={styles.revealBtn} onPress={handleReveal}>
          <Text style={styles.giftIcon}>🎁</Text>
          <Text style={styles.revealBtnText}>Toca para descubrir tu amigo invisible</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Te ha tocado regalar a:</Text>
          <Text style={styles.receiverName}>{isAnimating ? scrambleText : myResult.receiver.name}</Text>

          <Text style={styles.cheerText}>
            {isAnimating ? 'Descifrando el misterio... 🔮' : '¡Shh! Es un secreto 🤫'}
          </Text>
        </View>
      )}

      {isRevealed && !isAnimating && (
        <ConfettiCannon 
          count={200} 
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }} 
          fadeOut={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f2f6', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 20, fontSize: 16, color: '#747d8c', fontWeight: 'bold' },
  title: { fontSize: 28, fontWeight: '900', color: '#2f3542', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#747d8c', marginBottom: 40, textAlign: 'center' },
  revealBtn: { backgroundColor: '#ff4757', padding: 30, borderRadius: 20, alignItems: 'center', shadowColor: '#ff4757', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  giftIcon: { fontSize: 80, marginBottom: 15 },
  revealBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  resultCard: { backgroundColor: '#fff', padding: 40, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, width: '100%' },
  resultLabel: { fontSize: 16, color: '#747d8c', marginBottom: 10 },
  receiverName: { fontSize: 36, fontWeight: '900', color: '#2ed573', textAlign: 'center', marginBottom: 20 },
  cheerText: { fontSize: 16, color: '#ffa502', fontWeight: 'bold' },
  errorIcon: { fontSize: 60, marginBottom: 15 },
  errorText: { fontSize: 18, color: '#ff4757', textAlign: 'center', fontWeight: 'bold' },
});