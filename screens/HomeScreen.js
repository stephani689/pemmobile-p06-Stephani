import { useState, useMemo } from 'react';
import { View, Text, FlatList, SectionList, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { products } from '../data/products'; 
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function HomeScreen() {
  // --- STATES ---
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [numColumns, setNumColumns] = useState(2); // Requirement E2
  const [isSectionMode, setIsSectionMode] = useState(false); // Requirement E3
  const [sortOrder, setSortOrder] = useState('none'); // Requirement E4
  const [cartItems, setCartItems] = useState([]); // Fitur Keranjang
  const [currentView, setCurrentView] = useState('list'); // Navigasi (list/detail/cart)
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['Semua', 'Pakaian', 'Boneka', 'Random', 'Make Up', 'Tas dan Dompet', 'Sepatu', 'Aksesoris'];

  // --- R6: Pull-to-Refresh Simulation ---
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // --- R5 & E4: Filter & Sort Logic ---
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

  // --- E3: SectionList Data Grouping ---
  const sections = useMemo(() => {
    return categories.filter(c => c !== 'Semua').map(cat => ({
      title: cat,
      data: filteredData.filter(item => item.category === cat)
    })).filter(section => section.data.length > 0);
  }, [filteredData]);

  // --- R4: ListEmptyComponent ---
  const renderEmpty = (
    <View style={styles.empty}>
      <Text style={{ fontSize: 50 }}>🌸</Text>
      <Text style={styles.emptyText}>Mianhae... Barang tidak ditemukan</Text>
      <Text style={styles.hintText}>Coba gunakan kata kunci lain atau pilih kategori berbeda ya!</Text>
    </View>
  );

  // --- HANDLERS ---
  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
  };

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    Alert.alert("🛒 Berhasil!", `${product.name} masuk ke keranjang.`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

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
            <Text style={styles.detailRating}>⭐ {selectedProduct.rating} / 5.0</Text>
            <View style={styles.divider} />
            <Text style={styles.descTitle}>Deskripsi Produk</Text>
            <Text style={styles.descText}>Kualitas premium khas ChinguShop. Desain aesthetic dan material pilihan terbaik untuk kamu! ✨</Text>
          </View>
        </ScrollView>
        <View style={styles.footerDetail}>
          <TouchableOpacity style={styles.mainBtn} onPress={() => addToCart(selectedProduct)}>
            <Text style={styles.mainBtnText}>Tambah ke Keranjang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- VIEW: KERANJANG BELANJA ---
  if (currentView === 'cart') {
    return (
      <View style={styles.pageContainer}>
        <View style={styles.headerCart}>
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
              <TouchableOpacity onPress={() => removeFromCart(index)}><Text style={{color: '#FF5252', fontWeight: 'bold'}}>Hapus</Text></TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Keranjang Kosong 🛒</Text></View>}
        />
        {cartItems.length > 0 && (
          <View style={styles.footerCart}>
            <Text style={styles.totalText}>Total: Rp {cartItems.reduce((s, i) => s + i.price, 0).toLocaleString('id-ID')}</Text>
            <TouchableOpacity style={styles.checkoutBtn}><Text style={styles.mainBtnText}>Checkout</Text></TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // --- VIEW: LIST UTAMA (HOME) ---
  return (
    <View style={styles.container}>
      {/* 🎨 UI Requirement: Header dengan Nama App & Jumlah Produk */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>CHINGU<Text style={{color: '#FF80AB'}}>SHOP</Text></Text>
          <Text style={styles.productCount}>{filteredData.length} Produk ditampilkan</Text>
        </View>
        <TouchableOpacity style={styles.cartIcon} onPress={() => setCurrentView('cart')}>
          <Text style={{fontSize: 24}}>🛒</Text>
          {cartItems.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{cartItems.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* R5: Search Bar */}
      <SearchBar value={search} onChange={setSearch} />

      {/* E1: Filter Kategori Chips */}
      <View style={styles.filterArea}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({ item: cat }) => (
            <TouchableOpacity 
              style={[styles.chip, category === cat && styles.activeChip]} 
              onPress={() => {setCategory(cat); setIsSectionMode(false);}}
            >
              <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      {/* TOOLBAR: E2, E3, E4 */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setIsSectionMode(!isSectionMode)}>
          <Text style={styles.toolText}>{isSectionMode ? '📄 List Mode' : '🗂️ Section Mode'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => setNumColumns(numColumns === 2 ? 1 : 2)}>
          <Text style={styles.toolText}>{numColumns === 2 ? '📱 1 Kolom' : '🖼️ 2 Kolom'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={() => {
          const orders = ['none', 'price-asc', 'price-desc', 'rating'];
          setSortOrder(orders[(orders.indexOf(sortOrder) + 1) % orders.length]);
        }}>
          <Text style={styles.toolText}>
            {sortOrder === 'none' ? '🔃 Sort' : sortOrder === 'price-asc' ? '📉 Murah' : sortOrder === 'price-desc' ? '📈 Mahal' : '⭐ Rating'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* R1, R2, R3, R6, E3: Main List Area */}
      {isSectionMode ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} numColumns={1} onPress={handleOpenDetail} />}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FlatList
          key={numColumns} // Force re-render saat toggle grid/list
          data={filteredData}
          numColumns={numColumns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} numColumns={numColumns} onPress={handleOpenDetail} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

// --- 🎨 UI Requirements: StyleSheet.create ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF', paddingTop: 50 },
  pageContainer: { flex: 1, backgroundColor: '#FFF', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  logo: { fontSize: 26, fontWeight: '900', color: '#BA68C8', letterSpacing: 1 },
  productCount: { fontSize: 10, color: '#CE93D8', fontWeight: 'bold' },
  cartIcon: { position: 'relative' },
  badge: { position: 'absolute', right: -5, top: -5, backgroundColor: '#FF80AB', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  filterArea: { marginVertical: 10, height: 40 },
  chip: { paddingHorizontal: 15, marginHorizontal: 5, height: 32, justifyContent: 'center', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E1BEE7' },
  activeChip: { backgroundColor: '#BA68C8', borderColor: '#BA68C8' },
  chipText: { color: '#BA68C8', fontSize: 12, fontWeight: 'bold' },
  activeChipText: { color: '#FFF' },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginBottom: 10 },
  toolBtn: { backgroundColor: '#FFF', padding: 8, borderRadius: 10, width: '31%', alignItems: 'center', borderWidth: 1, borderColor: '#F3E5F5' },
  toolText: { fontSize: 10, color: '#BA68C8', fontWeight: 'bold' },
  sectionHeader: { backgroundColor: '#F3E5F5', padding: 10, fontSize: 14, fontWeight: 'bold', color: '#BA68C8' },
  listContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { color: '#BA68C8', fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  hintText: { color: '#CE93D8', fontSize: 12, textAlign: 'center', marginTop: 5 },
  
  // Detail & Cart Styles
  detailImage: { width: '100%', height: 380, backgroundColor: '#F8F0FF' },
  backButton: { position: 'absolute', top: 20, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 25, elevation: 5 },
  backText: { color: '#BA68C8', fontWeight: 'bold' },
  detailContent: { padding: 25 },
  detailCategory: { color: '#BA68C8', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
  detailName: { fontSize: 26, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  detailPrice: { fontSize: 22, color: '#FF80AB', fontWeight: 'bold' },
  detailRating: { color: '#888', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 20 },
  descTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  descText: { color: '#666', lineHeight: 22, marginTop: 10 },
  footerDetail: { padding: 20, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  mainBtn: { backgroundColor: '#BA68C8', padding: 16, borderRadius: 15, alignItems: 'center' },
  mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  headerCart: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#BA68C8' },
  cartItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', alignItems: 'center' },
  cartImage: { width: 70, height: 70, borderRadius: 10 },
  cartInfo: { flex: 1, marginLeft: 15 },
  cartName: { fontWeight: 'bold', fontSize: 15 },
  cartPrice: { color: '#FF80AB', marginTop: 5, fontWeight: 'bold' },
  footerCart: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  checkoutBtn: { backgroundColor: '#BA68C8', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 10 }
});