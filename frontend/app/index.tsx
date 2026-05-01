import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import ParticipantList from '../src/components/ParticipantList';
import DrawButton from '../src/components/DrawButton';
import ResultDisplay from '../src/components/ResultDisplay';
import { logout } from '../src/services/auth';
import { performDraw, Participant, DrawResult } from '../src/utils/drawLogic';
import { saveDraw, getDrawHistory, SavedDraw } from '../src/services/db';

export default function HomeScreen() {
  const { loadId } = useLocalSearchParams<{ loadId: string }>();

  const [drawId, setDrawId] = useState<string | undefined>(undefined);
  const [drawName, setDrawName] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [isNameConfirmed, setIsNameConfirmed] = useState<boolean>(false);
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
      setIsNameConfirmed(true);
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
      setError('');
      // Guardar localmente con resultados
      const result = await saveDraw(drawName.trim(), participants, drawResults, drawId);
      setDrawId(result.draw.id);
      setResults(drawResults);
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
    setIsNameConfirmed(false);
    router.setParams({ loadId: undefined });
    alert('Sorteo clonado. Nombres mantenidos, pero se borraron las reglas. Ingresa un nuevo nombre para el sorteo.');
  };

  const resetAll = () => {
    setParticipants([]);
    setResults(null);
    setDrawName('');
    setDrawId(undefined);
    setIsNameConfirmed(false);
    router.setParams({ loadId: undefined });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎅 Amigo Invisible 🎁</Text>
        <View style={styles.headerLinks}>
          <TouchableOpacity onPress={resetAll}>
            <Text style={styles.resetLink}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutLink}>Salir</Text>
          </TouchableOpacity>
          <Link href="/history" style={styles.historyLink}>Historial</Link>
        </View>
      </View>
      
      {!results ? (
        !isNameConfirmed ? (
          <View style={styles.card}>
            <Text style={styles.setupTitle}>¿Qué sorteo vamos a hacer?</Text>
            <Text style={styles.setupSubtitle}>Ingresa un nombre para identificarlo más adelante.</Text>
            <TextInput
              style={styles.setupInput}
              placeholder='Ej. "Navidad 2026"'
              placeholderTextColor="#a4b0be"
              value={drawName}
              onChangeText={setDrawName}
              autoFocus
              onSubmitEditing={() => {
                if (drawName.trim()) {
                  setError('');
                  setIsNameConfirmed(true);
                } else {
                  setError('Dale un nombre al sorteo para continuar.');
                }
              }}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity 
              style={styles.setupBtn} 
              onPress={() => {
                if (drawName.trim()) {
                  setError('');
                  setIsNameConfirmed(true);
                } else {
                  setError('Dale un nombre al sorteo para continuar.');
                }
              }}
            >
              <Text style={styles.setupBtnText}>Comenzar Sorteo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.activeDrawHeader}>
                <Text style={styles.activeDrawName}>{drawName}</Text>
                <TouchableOpacity onPress={() => setIsNameConfirmed(false)}>
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
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
        )
      ) : (
        <>
          <ResultDisplay 
            results={results} 
            drawId={drawId}
            drawName={drawName}
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
  logoutLink: {
    color: '#747d8c',
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
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
    textAlign: 'center',
    marginBottom: 5,
  },
  setupSubtitle: {
    fontSize: 14,
    color: '#747d8c',
    textAlign: 'center',
    marginBottom: 20,
  },
  setupInput: {
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 18,
    color: '#2f3542',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  setupBtn: {
    backgroundColor: '#2ed573',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  setupBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeDrawHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  activeDrawName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2f3542',
    flex: 1,
  },
  editIcon: {
    fontSize: 18,
    padding: 5,
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
