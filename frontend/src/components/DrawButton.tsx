import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface Props {
  onPress: () => void;
  disabled: boolean;
}

export default function DrawButton({ onPress, disabled }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, disabled && styles.disabled]} 
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.text}>✨ Realizar Sorteo ✨</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  button: {
    backgroundColor: '#ff4757',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#a4b0be',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
