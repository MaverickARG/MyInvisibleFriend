import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getDrawHistory, deleteDraw, SavedDraw } from '../src/services/db';

export default function HistoryScreen() {
  const [history, setHistory] = useState<SavedDraw[]>([]);

  const loadHistory = async () => {
    const draws = await getDrawHistory();
    // Ordenar del más reciente al más antiguo
    setHistory(draws.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  // Recarga los datos cuando entramos a esta pantalla
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteDraw(id);
      await loadHistory(); // recargar lista
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoad = (id: string) => {
    router.push(`/?loadId=${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Sorteos</Text>
      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No hay sorteos guardados.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.cardIcon}>{item.results ? '🎁' : '📝'}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardDate}>
                    {new Date(item.date).toLocaleDateString()}
                    <Text style={item.results ? styles.statusDone : styles.statusDraft}>
                      {item.results ? ' • Finalizado' : ' • Borrador'}
                    </Text>
                  </Text>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={[styles.btn, styles.viewBtn]} 
                  onPress={() => handleLoad(item.id)}
                >
                  <Text style={styles.viewBtnText}>Abrir</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btn, styles.deleteBtn]} 
                  onPress={() => handleDelete(item.id)}
                >
                  <Text style={styles.deleteBtnText}>Borrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2f3542',
    marginBottom: 20,
    marginTop: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#747d8c',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  statusDone: {
    color: '#2ed573',
    fontWeight: 'bold',
  },
  statusDraft: {
    color: '#ffa502',
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtn: {
    backgroundColor: '#f1f2f6',
  },
  viewBtnText: {
    color: '#2f3542',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteBtn: {
    backgroundColor: '#ffeaa7',
  },
  deleteBtnText: {
    color: '#d63031',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
