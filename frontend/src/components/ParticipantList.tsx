import { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Switch,
  Animated
} from 'react-native';
import { Participant } from '../utils/drawLogic';

interface Props {
  participants: Participant[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  onUpdateExclusions: (id: string, exclusions: string[]) => void;
}

export default function ParticipantList({ participants, onAdd, onRemove, onUpdateExclusions }: Props) {
  const [name, setName] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const handleAdd = () => {
    if (name.trim().length > 0) {
      onAdd(name);
      setName('');
    }
  };

  const toggleExclusion = (excludedId: string) => {
    if (!selectedParticipant) return;
    
    const currentExclusions = selectedParticipant.exclusions || [];
    let newExclusions;
    
    if (currentExclusions.includes(excludedId)) {
      newExclusions = currentExclusions.filter(id => id !== excludedId);
    } else {
      newExclusions = [...currentExclusions, excludedId];
    }
    
    onUpdateExclusions(selectedParticipant.id, newExclusions);
    setSelectedParticipant({ ...selectedParticipant, exclusions: newExclusions });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del participante (ej. María)"
          placeholderTextColor="#a4b0be"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                {(item.exclusions?.length || 0) > 0 && (
                  <Text style={styles.exceptionCount}>
                    {item.exclusions?.length} excepciones
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity 
                style={styles.exceptionBtn} 
                onPress={() => setSelectedParticipant(item)}
              >
                <Text style={styles.exceptionBtnText}>Reglas</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtnWrapper} onPress={() => onRemove(item.id)}>
                <Text style={styles.removeBtn}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={!!selectedParticipant}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedParticipant(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Reglas para {selectedParticipant?.name}
            </Text>
            <Text style={styles.modalSubtitle}>
              Selecciona a quién NO puede regalar:
            </Text>
            
            <FlatList
              data={participants.filter(p => p.id !== selectedParticipant?.id)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowName}>{item.name}</Text>
                  <Switch
                    trackColor={{ false: '#dcdde1', true: '#ff4757' }}
                    thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
                    value={(selectedParticipant?.exclusions || []).includes(item.id)}
                    onValueChange={() => toggleExclusion(item.id)}
                  />
                </View>
              )}
            />

            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setSelectedParticipant(null)}
            >
              <Text style={styles.closeModalBtnText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dcdde1',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#2f3542',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addButton: {
    backgroundColor: '#2ed573',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#2ed573',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dfe4ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  exceptionCount: {
    fontSize: 12,
    color: '#ff4757',
    marginTop: 2,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exceptionBtn: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exceptionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57606f',
  },
  removeBtnWrapper: {
    padding: 8,
    backgroundColor: '#ffeaa7',
    borderRadius: 8,
  },
  removeBtn: {
    color: '#d63031',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(47, 53, 66, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#2f3542',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#747d8c',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  modalRowName: {
    fontSize: 16,
    color: '#2f3542',
    fontWeight: '500',
  },
  closeModalBtn: {
    backgroundColor: '#2ed573',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
