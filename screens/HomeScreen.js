//--------------------------------------------
// HomeScreen.js
//--------------------------------------------

// Shows featured and all visible products.
// Handles search, sorting, product detail opening, and add-to-cart actions.
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import ProductCard from '../components/productcard';
import ProductDetailModal from '../components/ProductDetailModal';
import { CatalogContext } from '../state/CatalogContext';
import { CartContext } from '../state/CartContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SCREEN_PADDING = 16;
const FEATURED_CARD_WIDTH = width - SCREEN_PADDING * 2;
const FEATURED_SPACING = 14;
const FEATURED_ITEM_WIDTH = FEATURED_CARD_WIDTH + FEATURED_SPACING;

const SORT_OPTIONS = [
  { key: 'az', label: 'A-Z' },
  { key: 'za', label: 'Z-A' },
  { key: 'highLow', label: 'High to Low' },
  { key: 'lowHigh', label: 'Low to High' },
];

export default function HomeScreen({ navigation }) {
  const { addToCart } = useContext(CartContext);
  const { products = [] } = useContext(CatalogContext);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('az');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const featuredRef = useRef(null);

  const searchQuery = search.trim().toLowerCase();
  const isSearching = searchQuery.length > 0;

  const featuredProducts = useMemo(() => {
    return products.filter((item) => item.featured);
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let list = products.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery) ||
        item.description.toLowerCase().includes(searchQuery);

      return matchesSearch;
    });

    if (sortBy === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'za') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'highLow') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'lowHigh') {
      list = [...list].sort((a, b) => a.price - b.price);
    }

    return list;
  }, [products, searchQuery, sortBy]);

  const sortLabel =
    SORT_OPTIONS.find((option) => option.key === sortBy)?.label || 'A-Z';

  useEffect(() => {
    console.log(
      '[HomeScreen] products changed:',
      products.map((item) => ({
        id: item.id,
        name: item.name,
        featured: !!item.featured,
        price: item.price,
      }))
    );
  }, [products]);

  useEffect(() => {
    console.log(
      '[HomeScreen] featuredProducts changed:',
      featuredProducts.map((item) => ({
        id: item.id,
        name: item.name,
      }))
    );

    setFeaturedIndex((prev) => {
      if (featuredProducts.length === 0) return 0;
      if (prev > featuredProducts.length - 1) return 0;
      return prev;
    });
  }, [featuredProducts]);

  useEffect(() => {
    console.log('[HomeScreen] filters changed:', {
      search,
      searchQuery,
      sortBy,
      filteredCount: filteredAndSortedProducts.length,
      filteredProducts: filteredAndSortedProducts.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    });
  }, [search, searchQuery, sortBy, filteredAndSortedProducts]);

  const handleSearchChange = (text) => {
    console.log('[HomeScreen] search changed:', text);
    setSearch(text);
  };

  const openAdminLogin = () => {
    console.log('[HomeScreen] openAdminLogin');
    navigation.navigate('AdminLogin');
  };

  const handleOpenSortModal = () => {
    console.log('[HomeScreen] openSortModal');
    setSortModalVisible(true);
  };

  const handleSortSelect = (sortKey) => {
    console.log('[HomeScreen] sort selected:', sortKey);
    setSortBy(sortKey);
    setSortModalVisible(false);
  };

  const handleAddToCart = (item) => {
    console.log('[HomeScreen] handleAddToCart:', {
      id: item.id,
      name: item.name,
      price: item.price,
    });

    addToCart(item);
    Alert.alert('Added to cart', `${item.name} was added to your cart.`);
  };

  const openProductDetail = (item) => {
    console.log('[HomeScreen] openProductDetail:', {
      id: item.id,
      name: item.name,
      featured: !!item.featured,
    });

    setSelectedProduct(item);
    setDetailVisible(true);
  };

  const closeProductDetail = () => {
    console.log('[HomeScreen] closeProductDetail');
    setDetailVisible(false);
    setSelectedProduct(null);
  };

  const handleDetailAddToCart = () => {
    if (!selectedProduct) return;

    console.log('[HomeScreen] handleDetailAddToCart:', {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
    });

    addToCart(selectedProduct);
    setDetailVisible(false);
    setSelectedProduct(null);
    Alert.alert(
      'Added to cart',
      `${selectedProduct.name} was added to your cart.`
    );
  };

  useEffect(() => {
    if (isSearching || featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = featuredIndex + 1;

      if (nextIndex >= featuredProducts.length) {
        featuredRef.current?.scrollToOffset({
          offset: 0,
          animated: true,
        });
        setFeaturedIndex(0);
      } else {
        featuredRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
          viewPosition: 0.5,
        });
        setFeaturedIndex(nextIndex);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, [featuredIndex, featuredProducts.length, isSearching]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
          }}
          style={styles.heroImage}
        />
        <Text style={styles.appTitle}>BrewMate</Text>
        <Text style={styles.subtitle}>Crafted coffee, snacks, and drinks.</Text>
        <TouchableOpacity style={styles.adminBtn} onPress={openAdminLogin}>
          <Ionicons name="lock-closed-outline" size={14} color="#6A4E23" />
          <Text style={styles.adminBtnText}>Admin</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            placeholder="Search drinks or snacks"
            placeholderTextColor="#999"
            value={search}
            onChangeText={handleSearchChange}
            style={styles.searchInput}
            returnKeyType="search"
            underlineColorAndroid="transparent"
            selectionColor="#6A4E23"
          />
        </View>

        <TouchableOpacity
          style={styles.sortBtn}
          onPress={handleOpenSortModal}
          activeOpacity={0.85}>
          <Ionicons name="swap-vertical" size={18} color="#6A4E23" />
          <Text style={styles.sortBtnText}>{sortLabel}</Text>
        </TouchableOpacity>
      </View>

      {!isSearching && featuredProducts.length > 0 ? (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <Text style={styles.sectionHint}>Auto sliding</Text>
          </View>

          <FlatList
            ref={featuredRef}
            data={featuredProducts}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={FEATURED_ITEM_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            contentContainerStyle={styles.featuredList}
            renderItem={({ item }) => (
              <View style={styles.featuredItemWrap}>
                <ProductCard
                  item={item}
                  compact
                  showCartButton={true}
                  onCardPress={() => openProductDetail(item)}
                  onAddToCart={() => handleAddToCart(item)}
                />
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: FEATURED_ITEM_WIDTH,
              offset: FEATURED_ITEM_WIDTH * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / FEATURED_ITEM_WIDTH
              );
              setFeaturedIndex(index);
            }}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                featuredRef.current?.scrollToOffset({
                  offset: info.averageItemLength * info.index,
                  animated: true,
                });
              }, 100);
            }}
          />

          <View style={styles.dotsRow}>
            {featuredProducts.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === featuredIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          {isSearching ? 'Search results' : 'All products'}
        </Text>
        <Text style={styles.resultCount}>
          {filteredAndSortedProducts.length} found
        </Text>
      </View>

      {filteredAndSortedProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptyText}>
            Try another search term or change the sort option.
          </Text>
        </View>
      ) : (
        filteredAndSortedProducts.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            showCartButton={true}
            onCardPress={() => openProductDetail(item)}
            onAddToCart={() => handleAddToCart(item)}
          />
        ))
      )}

      <ProductDetailModal
        visible={detailVisible}
        product={selectedProduct}
        onClose={closeProductDetail}
        onAddToCart={handleDetailAddToCart}
      />

      <Modal transparent visible={sortModalVisible} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            console.log('[HomeScreen] closeSortModal');
            setSortModalVisible(false);
          }}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by</Text>

            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionRow,
                  sortBy === option.key && styles.optionRowActive,
                ]}
                onPress={() => handleSortSelect(option.key)}
                activeOpacity={0.85}>
                <Text
                  style={[
                    styles.optionText,
                    sortBy === option.key && styles.optionTextActive,
                  ]}>
                  {option.label}
                </Text>
                {sortBy === option.key ? (
                  <Ionicons name="checkmark" size={18} color="#6A4E23" />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

//Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f1e9',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe4d6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  adminBtnText: {
    color: '#6A4E23',
    fontWeight: '900',
    fontSize: 12,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#6A4E23',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    outlineStyle: 'none',
    outlineWidth: 0,
    boxShadow: 'none',
    borderWidth: 0,
  },
  sortBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6A4E23',
    maxWidth: 88,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6A4E23',
  },
  sectionHint: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: SCREEN_PADDING,
  },
  featuredItemWrap: {
    width: FEATURED_CARD_WIDTH,
    marginRight: FEATURED_SPACING,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(106, 78, 35, 0.18)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#6A4E23',
  },
  resultCount: {
    color: '#777',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6A4E23',
  },
  emptyText: {
    marginTop: 6,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
    marginBottom: 10,
  },
  optionRow: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  optionRowActive: {
    backgroundColor: '#f6f1e9',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  optionTextActive: {
    color: '#6A4E23',
  },
});
