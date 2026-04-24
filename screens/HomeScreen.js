import { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { products } from '../data/products'; 
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [numColumns, setNumColumns] = useState(2);
  
  // STATE NAVIGASI: 'list', 'detail', atau 'cart'
  const [currentView, setCurrentView] = useState('list'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]); // Daftar barang di keranjang

  const categories = ['Semua', 'Pakaian', 'Boneka', 'Random', 'Make Up', 'Tas dan Dompet', 'Sepatu', 'Aksesoris'];

  const filteredData = useMemo(() => {
    return products.filter(item =>
      (category === 'Semua' || item.category === category) &&
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, category]);

  // FUNGSI KERANJANG
  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    Alert.alert("🛒 Berhasil!", `${product.name} dimasukkan ke keranjang.`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  // --- 1. TAMPILAN HALAMAN DETAIL ---
  if (currentView === 'detail' && selectedProduct) {
    return (
      <View style={styles.pageContainer}>
        <ScrollView>
          <Image source={selectedProduct.image} style={styles.detailImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentView('list')}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
          <View style={styles.detailContent}>
            <Text style={styles.detailCategory}>{selectedProduct.category}</Text>
            <Text style={styles.detailName}>{selectedProduct.name}</Text>
            <Text style={styles.detailPrice}>Rp {selectedProduct.price.toLocaleString('id-ID')}</Text>
            <Text style={styles.descTitle}>Deskripsi Produk</Text>
            <Text style={styles.descText}>Produk premium kualitas terbaik dari ChinguShop. Cocok untuk koleksi pribadi atau kado spesial. ✨</Text>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.mainBtn} onPress={() => addToCart(selectedProduct)}>
            <Text style={styles.mainBtnText}>Tambah ke Keranjang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- 2. TAMPILAN HALAMAN KERANJANG (LIKE SHOPEE) ---
  if (currentView === 'cart') {
    return (
      <View style={styles.pageContainer}>
        <View style={styles.headerDetail}>
          <TouchableOpacity onPress={() => setCurrentView('list')}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Keranjang Saya</Text>
          <View style={{width: 50}} />
        </View>

        <FlatList
          data={cartItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.cartItem}>
              <Image source={item.image} style={styles.cartImage} />
              <View style={styles.cartInfo}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(index)} style={styles.deleteBtn}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>Hapus</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCart}>
              <Text style={{fontSize: 50}}>🛒</Text>
              <Text style={styles.emptyText}>Keranjangmu masih kosong nih.</Text>
            </View>
          }
        />

        {cartItems.length > 0 && (
          <View style={styles.footerCart}>
            <View>
              <Text style={{color: '#888'}}>Total Pembayaran:</Text>
              <Text style={styles.totalPrice}>Rp {totalPrice.toLocaleString('id-ID')}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => Alert.alert("Checkout", "Fungsi checkout segera hadir!")}>
              <Text style={styles.mainBtnText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // --- 3. TAMPILAN UTAMA (LIST PRODUK) ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>CHINGU<Text style={{color: '#FF80AB'}}>SHOP</Text></Text>
        <TouchableOpacity style={styles.cartIcon} onPress={() => setCurrentView('cart')}>
          <Text style={{fontSize: 20}}>🛒</Text>
          {cartItems.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{cartItems.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChange={setSearch} />

      <View style={styles.filterArea}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.chip, category === cat && styles.activeChip]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      <FlatList
        key={numColumns}
        data={filteredData}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <ProductCard item={item} numColumns={numColumns} onPress={(product) => {
            setSelectedProduct(product);
            setCurrentView('detail');
          }} />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF', paddingTop: 50 },
  pageContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
  headerDetail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#BA68C8' },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#BA68C8' },
  cartIcon: { position: 'relative', padding: 5 },
  badge: { position: 'absolute', right: -2, top: -2, backgroundColor: '#FF80AB', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  filterArea: { marginVertical: 10, height: 45 },
  chip: { paddingHorizontal: 15, marginHorizontal: 5, height: 35, justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E1BEE7' },
  activeChip: { backgroundColor: '#BA68C8', borderColor: '#BA68C8' },
  chipText: { color: '#BA68C8', fontWeight: 'bold' },
  activeChipText: { color: '#FFF' },

  // Cart Style
  cartItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' },
  cartImage: { width: 70, height: 70, borderRadius: 10 },
  cartInfo: { flex: 1, marginLeft: 15 },
  cartName: { fontWeight: 'bold', color: '#333' },
  cartPrice: { color: '#FF80AB', fontWeight: 'bold', marginTop: 5 },
  deleteBtn: { padding: 10 },
  emptyCart: { alignItems: 'center', marginTop: 100 },
  footerCart: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE', alignItems: 'center' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#BA68C8' },
  checkoutBtn: { backgroundColor: '#BA68C8', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 },

  // Detail Style
  detailImage: { width: '100%', height: 350 },
  backButton: { position: 'absolute', top: 20, left: 20, backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 5 },
  backText: { color: '#BA68C8', fontWeight: 'bold' },
  detailContent: { padding: 20 },
  detailCategory: { color: '#BA68C8', fontWeight: 'bold', fontSize: 12 },
  detailName: { fontSize: 24, fontWeight: 'bold', color: '#333', marginVertical: 5 },
  detailPrice: { fontSize: 20, color: '#FF80AB', fontWeight: 'bold' },
  descTitle: { fontWeight: 'bold', marginTop: 20 },
  descText: { color: '#666', lineHeight: 20, marginTop: 5 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  mainBtn: { backgroundColor: '#BA68C8', padding: 15, borderRadius: 12, alignItems: 'center' },
  mainBtnText: { color: '#FFF', fontWeight: 'bold' }
});