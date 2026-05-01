import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import ParticipantList from '../src/components/ParticipantList';
import DrawButton from '../src/components/DrawButton';
import ResultDisplay from '../src/components/ResultDisplay';
import { performDraw, Participant, DrawResult } from '../src/utils/drawLogic';
import { saveDraw, getDrawHistory, SavedDraw } from '../src/services/db';

export default function HomeScreen() {
  const { loadId } = useLocalSearchParams<{ loadId: string }>();

  const [drawId, setDrawId] = useState<string | undefined>(undefined);
  const [drawName, setDrawName] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (loadId) {
      loadSavedDraw(loadId);
    }
  }, [loadId]);

  const loadSavedDraw = async (id: string) => {
    const history = await getDrawHistory();
    const found = history.find(d => d.id === id);
    if (found) {
      setDrawId(found.id);
      setDrawName(found.name);
      setParticipants(found.participants || []);
      setResults(found.results);
    }
  };

  const handleAddParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: name.trim(),
    };
    setParticipants([...participants, newParticipant]);
    setError('');
    setResults(null);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
    setResults(null);
  };

  const handleUpdateExclusions = (id: string, exclusions: string[]) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, exclusions } : p
    ));
    setResults(null);
  };

  const handleSaveDraft = async () => {
    if (!drawName.trim()) {
      setError('Por favor, dale un nombre al sorteo para poder guardarlo.');
      return;
    }
    try {
      const result = await saveDraw(drawName.trim(), participants, null, drawId);
      setDrawId(result.draw.id);
      setError('');
      alert('Borrador guardado exitosamente.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDraw = async () => {
    if (!drawName.trim()) {
      setError('Por favor, dale un nombre al sorteo (ej. "Familia 2026").');
      return;
    }
    try {
      const drawResults = performDraw(participants);
      setResults(drawResults);
      setError('');
      // Guardar localmente con resultados
      const result = await saveDraw(drawName.trim(), participants, drawResults, drawId);
      setDrawId(result.draw.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRedraw = async () => {
    setParticipants(participants.map(p => ({ ...p, exclusions: [] })));
    setResults(null);
  };

  const handleClone = () => {
    setDrawId(undefined);
    setDrawName('');
    setResults(null);
    setParticipants(participants.map(p => ({ ...p, exclusions: [] })));
    router.setParams({ loadId: undefined });
    alert('Sorteo clonado. Nombres mantenidos, pero se borraron las reglas. Ingresa un nuevo nombre para el sorteo.');
  };

  const resetAll = () => {
    setParticipants([]);
    setResults(null);
    setDrawName('');
    setDrawId(undefined);
    router.setParams({ loadId: undefined });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎅 Amigo Invisible 🎁</Text>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={resetAll}>
            <Text style={styles.resetLink}>Limpiar</Text>
          </TouchableOpacity>
          <Link href="/history" style={styles.historyLink}>Historial</Link>
        </View>
      </View>
      
      {!results ? (
        <>
          <View style={styles.card}>
            <TextInput
              style={styles.drawNameInput}
              placeholder='Nombre del sorteo (ej. "Navidad 2026")'
              placeholderTextColor="#a4b0be"
              value={drawName}
              onChangeText={setDrawName}
            />
            <ParticipantList 
              participants={participants} 
              onAdd={handleAddParticipant} 
              onRemove={handleRemoveParticipant}
              onUpdateExclusions={handleUpdateExclusions}
            />
          </View>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.draftBtn} onPress={handleSaveDraft}>
              <Text style={styles.draftBtnText}>💾 Guardar Borrador</Text>
            </TouchableOpacity>
            <DrawButton onPress={handleDraw} disabled={participants.length < 3} />
          </View>
        </>
      ) : (
        <>
          <ResultDisplay 
            results={results} 
            onReset={resetAll} 
          />
          <View style={styles.redrawContainer}>
            <TouchableOpacity style={styles.redrawBtn} onPress={handleRedraw}>
              <Text style={styles.redrawBtnText}>🔄 Rehacer Sorteo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cloneBtn} onPress={handleClone}>
              <Text style={styles.cloneBtnText}>📄 Clonar para otro año</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1f2f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2f3542',
    letterSpacing: 0.5,
  },
  resetLink: {
    color: '#ff4757',
    fontWeight: 'bold',
    fontSize: 15,
  },
  historyLink: {
    color: '#2ed573',
    fontWeight: 'bold',
    fontSize: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  drawNameInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#f1f2f6',
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  error: {
    color: '#ff4757',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
    backgroundColor: '#ffeaa7',
    padding: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtons: {
    marginTop: 20,
    paddingBottom: 20,
  },
  draftBtn: {
    backgroundColor: '#f1f2f6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 5,
  },
  draftBtnText: {
    color: '#57606f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  redrawContainer: {
    marginTop: 20,
    paddingBottom: 20,
    gap: 10,
  },
  redrawBtn: {
    backgroundColor: '#ffa502',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  redrawBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cloneBtn: {
    backgroundColor: '#9c88ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cloneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
