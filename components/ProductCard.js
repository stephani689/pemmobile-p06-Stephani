import { Text, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProductCard({ item, numColumns, onPress }) {
  return (
    // onPress akan memicu fungsi yang kita kirim dari HomeScreen
    <TouchableOpacity 
      style={[styles.card, numColumns === 1 && styles.cardList]} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Image source={item.image} style={[styles.image, numColumns === 1 && styles.imageList]} />
      <View style={styles.info}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>Rp {item.price.toLocaleString('id-ID')}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    margin: 8, 
    borderRadius: 15, 
    elevation: 4, // Efek bayangan agar terlihat timbul
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden' 
  },
  cardList: { flexDirection: 'row', alignItems: 'center' },
  image: { width: '100%', height: 150, backgroundColor: '#F8F0FF' },
  imageList: { width: 100, height: 100 },
  info: { padding: 10, flex: 1 },
  category: { fontSize: 10, color: '#BA68C8', fontWeight: 'bold' },
  name: { fontSize: 14, fontWeight: '700', color: '#444' },
  price: { fontSize: 13, color: '#FF80AB', fontWeight: 'bold' },
  rating: { fontSize: 11, color: '#888' }
});