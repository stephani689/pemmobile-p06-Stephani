import { useState, useMemo } from 'react';
import { View, Text, FlatList, SectionList, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { products } from '../data/products'; 
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [numColumns, setNumColumns] = useState(2); // E2
  const [isSectionMode, setIsSectionMode] = useState(false); // E3
  const [sortOrder, setSortOrder] = useState('none'); // E4
  const [cartItems, setCartItems] = useState([]);
  const [currentView, setCurrentView] = useState('list'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['Semua', 'Pakaian', 'Boneka', 'Random', 'Make Up', 'Tas dan Dompet', 'Sepatu', 'Aksesoris'];

  // --- LOGIC FILTER & SORT (R5 & E4) ---
  const filteredData = useMemo(() => {
    let result = products.filter(item =>
      (category === 'Semua' || item.category === category) &&
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sortOrder === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortOrder === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [search, category, sortOrder]);

  // --- LOGIC SECTION LIST (E3) ---
  const sections = useMemo(() => {
    return categories.filter(c => c !== 'Semua').map(cat => ({
      title: cat,
      data: filteredData.filter(item => item.category === cat)
    })).filter(section => section.data.length > 0);
  }, [filteredData]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    Alert.alert("🛒 Berhasil!", `${product.name} masuk keranjang.`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  // --- RENDER EMPTY STATE (R4) ---
  const renderEmpty = (
    <View style={styles.empty}>
      <Text style={{ fontSize: 50 }}>🌸</Text>
      <Text style={styles.emptyText}>Mianhae... Barang tidak ditemukan</Text>
      <Text style={styles.hintText}>Coba gunakan kata kunci lain atau pilih kategori berbeda!</Text>
    </View>
  );

  // --- VIEW: DETAIL PRODUK ---
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
            <Text style={styles.descText}>Kualitas premium dengan desain aesthetic khas ChinguShop. ✨</Text>
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

  // --- VIEW: KERANJANG ---
  if (currentView === 'cart') {
    return (
      <View style={styles.pageContainer}>
        <View style={styles.headerDetail}>
          <TouchableOpacity onPress={() => setCurrentView('list')}><Text style={styles.backText}>← Kembali</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Keranjang Saya</Text>
          <View style={{width: 50}} />
        </View>
        <FlatList
          data={cartItems}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.cartItem}>
              <Image source={item.image} style={styles.cartImage} />
              <View style={styles.cartInfo}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartPrice}>Rp {item.price.toLocaleString('id-ID')}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(index)}><Text style={{color: 'red'}}>Hapus</Text></TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Text>Keranjang Kosong 🛒</Text></View>}
        />
      </View>
    );
  }

  // --- VIEW: LIST UTAMA ---
  return (
    <View style={styles.container}>
      {/* HEADER (Req UI: Nama App + Jumlah Produk) */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>CHINGU<Text style={{color: '#FF80AB'}}>SHOP</Text></Text>
          <Text style={styles.productCount}>{filteredData.length} Produk ditampilkan</Text>
        </View>
        <TouchableOpacity style={styles.cartIcon} onPress={() => setCurrentView('cart')}>
          <Text style={{fontSize: 22}}>🛒</Text>
          {cartItems.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartItems.length}</Text></View>}
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChange={setSearch} />

      {/* FILTER CHIPS (E1) */}
      <View style={styles.filterArea}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={({ item: cat }) => (
            <TouchableOpacity style={[styles.chip, category === cat && styles.activeChip]} onPress={() => {setCategory(cat); setIsSectionMode(false);}}>
              <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
        />
      </View>

      {/* TOOLBAR (E2, E3, E4) */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setIsSectionMode(!isSectionMode)}>
          <Text style={styles.toolText}>{isSectionMode ? '📄 List' : '🗂️ Section'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setNumColumns(numColumns === 2 ? 1 : 2)}>
          <Text style={styles.toolText}>{numColumns === 2 ? '📱 1 Kolom' : '🖼️ 2 Kolom'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => {
          const orders = ['none', 'price-asc', 'price-desc', 'rating'];
          setSortOrder(orders[(orders.indexOf(sortOrder) + 1) % orders.length]);
        }}>
          <Text style={styles.toolText}>{sortOrder === 'none' ? '🔃 Sort' : '✅ Sorted'}</Text>
        </TouchableOpacity>
      </View>

      {isSectionMode ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} numColumns={1} onPress={(p)=>{setSelectedProduct(p); setCurrentView('detail');}} />}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FlatList
          key={numColumns}
          data={filteredData}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} numColumns={numColumns} onPress={(p)=>{setSelectedProduct(p); setCurrentView('detail');}} />}
          ListEmptyComponent={renderEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {}} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF', paddingTop: 50 },
  pageContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#BA68C8' },
  productCount: { fontSize: 10, color: '#CE93D8', fontWeight: 'bold' },
  cartIcon: { position: 'relative' },
  badge: { position: 'absolute', right: -5, top: -5, backgroundColor: '#FF80AB', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  filterArea: { marginVertical: 10, height: 40 },
  chip: { paddingHorizontal: 15, marginHorizontal: 5, height: 30, justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#E1BEE7' },
  activeChip: { backgroundColor: '#BA68C8', borderColor: '#BA68C8' },
  chipText: { color: '#BA68C8', fontSize: 12, fontWeight: 'bold' },
  activeChipText: { color: '#FFF' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 10 },
  toolBtn: { backgroundColor: '#F3E5F5', padding: 8, borderRadius: 8, width: '31%', alignItems: 'center' },
  toolText: { fontSize: 10, color: '#BA68C8', fontWeight: 'bold' },
  sectionHeader: { backgroundColor: '#F3E5F5', padding: 10, color: '#BA68C8', fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyText: { color: '#BA68C8', fontWeight: 'bold' },
  hintText: { color: '#CE93D8', fontSize: 11 },
  // Detail & Cart Styles
  detailImage: { width: '100%', height: 350 },
  backButton: { position: 'absolute', top: 20, left: 20, backgroundColor: 'white', padding: 8, borderRadius: 20, elevation: 5 },
  backText: { color: '#BA68C8', fontWeight: 'bold' },
  detailContent: { padding: 20 },
  detailCategory: { color: '#BA68C8', fontSize: 12, fontWeight: 'bold' },
  detailName: { fontSize: 24, fontWeight: 'bold', marginVertical: 5 },
  detailPrice: { fontSize: 20, color: '#FF80AB', fontWeight: 'bold' },
  descTitle: { fontWeight: 'bold', marginTop: 15 },
  descText: { color: '#666', marginTop: 5 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  mainBtn: { backgroundColor: '#BA68C8', padding: 15, borderRadius: 12, alignItems: 'center' },
  mainBtnText: { color: '#FFF', fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' },
  cartImage: { width: 60, height: 60, borderRadius: 10 },
  cartInfo: { flex: 1, marginLeft: 10 },
  cartName: { fontWeight: 'bold' },
  cartPrice: { color: '#FF80AB' },
  headerDetail: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#BA68C8' }
});