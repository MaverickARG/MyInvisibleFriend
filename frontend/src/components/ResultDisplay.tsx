import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking as RNLinking, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { DrawResult } from '../utils/drawLogic';

interface Props {
  results: DrawResult[];
  drawId?: string;
  drawName?: string;
  onReset: () => void;
  resetButtonTitle?: string;
}

export default function ResultDisplay({ results, drawId, drawName, onReset, resetButtonTitle }: Props) {
  const [selectedGiverId, setSelectedGiverId] = useState<string | null>(null);

  const shareViaWhatsApp = (giverName: string, giverId: string) => {
    if (!drawId) {
      Alert.alert('Error', 'No se ha podido obtener el ID del sorteo. Intenta guardarlo primero.');
      return;
    }
    
    // Generamos un enlace único (Deep Link) para esta persona
    const url = Linking.createURL('reveal', { queryParams: { drawId, giverId } });
    const drawText = drawName ? `\nSorteo *${drawName}*.` : '';
    const message = `🎄 ¡Hola *${giverName}*! 🎅\n\nEres parte del Amigo Invisible!!${drawText}\n\nEntra al siguiente enlace secreto para ver a quién te toca regalar:\n\n👇 *DESCUBRE TU AMIGO INVISIBLE* 👇\n${url}\n\n_¡Shh! Es un secreto_ 🤫`;
    
    RNLinking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  // Muestra el amigo invisible solo del participante seleccionado para no hacer spoilers al resto.
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Selecciona tu nombre para ver a quién te toca regalar:</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {results.map((result) => {
          const isSelected = selectedGiverId === result.giver.id;
          return (
            <View key={result.giver.id} style={[styles.resultCard, isSelected && styles.resultCardActive]}>
              <TouchableOpacity 
                style={styles.giverBtn}
                activeOpacity={0.7}
                onPress={() => setSelectedGiverId(isSelected ? null : result.giver.id)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{result.giver.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.giverText}>{result.giver.name}</Text>
                
                <TouchableOpacity 
                  style={styles.whatsappBtn} 
                  onPress={(e) => { e.stopPropagation(); shareViaWhatsApp(result.giver.name, result.giver.id); }}
                >
                  <Text style={styles.whatsappIcon}>💬</Text>
                </TouchableOpacity>
                
                <Text style={styles.toggleIcon}>{isSelected ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {isSelected && (
                <View style={styles.receiverContainer}>
                  <Text style={styles.receiverText}>Te toca regalar a:</Text>
                  <View style={styles.receiverHighlight}>
                    <Text style={styles.bold}>🎁 {result.receiver.name} 🎁</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
          <Text style={styles.resetBtnText}>{resetButtonTitle || "Nuevo Sorteo"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#747d8c',
    textAlign: 'center',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f2f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCardActive: {
    borderColor: '#ff4757',
    shadowColor: '#ff4757',
    shadowOpacity: 0.15,
  },
  giverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffeaa7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d63031',
  },
  giverText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#2f3542',
  },
  toggleIcon: {
    fontSize: 16,
    color: '#a4b0be',
  },
  whatsappBtn: {
    backgroundColor: '#2ed573',
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  whatsappIcon: {
    fontSize: 16,
    color: '#fff',
  },
  receiverContainer: {
    padding: 20,
    backgroundColor: '#fffaf0',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    alignItems: 'center',
  },
  receiverText: {
    fontSize: 16,
    color: '#747d8c',
    marginBottom: 10,
  },
  receiverHighlight: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#fff',
  },
  footer: {
    marginTop: 20,
  },
  resetBtn: {
    backgroundColor: '#f1f2f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#57606f',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
