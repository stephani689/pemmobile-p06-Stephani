import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function SearchBar({ value, onChange }) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Cari produk..."
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
      {value !== '' && (
        <TouchableOpacity onPress={() => onChange('')}>
          <Text style={styles.clear}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  input: {
    flex: 1
  },
  clear: {
    fontSize: 18
  }
});