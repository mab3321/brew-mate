//--------------------------------------------
// CategoriesScreen.js
//--------------------------------------------

// Shows products grouped by category.
// Lets user filter by category, open product details, and add items to cart.
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/productcard';
import ProductDetailModal from '../components/ProductDetailModal';
import { CatalogContext } from '../state/CatalogContext';
import { CartContext } from '../state/CartContext';

export default function CategoriesScreen() {
  const { addToCart } = useContext(CartContext);
  const { categories = [], products = [] } = useContext(CatalogContext);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === null) return products;

    return products.filter(
      (p) => String(p.categoryId) === String(activeCategoryId)
    );
  }, [activeCategoryId, products]);

  const activeCategoryName =
    categories.find((c) => String(c.id) === String(activeCategoryId))?.name ||
    'All Products';

  useEffect(() => {
    console.log(
      '[CategoriesScreen] categories changed:',
      categories.map((item) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
      }))
    );
  }, [categories]);

  useEffect(() => {
    console.log(
      '[CategoriesScreen] products changed:',
      products.map((item) => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        featured: !!item.featured,
      }))
    );
  }, [products]);

  useEffect(() => {
    console.log('[CategoriesScreen] filter changed:', {
      activeCategoryId,
      activeCategoryName,
      filteredCount: filteredProducts.length,
      filteredProducts: filteredProducts.map((item) => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
      })),
    });
  }, [activeCategoryId, activeCategoryName, filteredProducts]);

  const handleCategorySelect = (categoryId) => {
    console.log('[CategoriesScreen] category selected:', {
      categoryId,
      categoryName:
        categories.find((c) => String(c.id) === String(categoryId))?.name ||
        'Unknown',
    });

    setActiveCategoryId(categoryId);
  };

  const handleResetCategory = () => {
    console.log('[CategoriesScreen] category reset to All Products');
    setActiveCategoryId(null);
  };

  const handleAddToCart = (item) => {
    console.log('[CategoriesScreen] handleAddToCart:', {
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
    });

    addToCart(item);
    Alert.alert('Added to cart', `${item.name} was added to your cart.`);
  };

  const openProductDetail = (item) => {
    console.log('[CategoriesScreen] openProductDetail:', {
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
    });

    setSelectedProduct(item);
    setDetailVisible(true);
  };

  const closeProductDetail = () => {
    console.log('[CategoriesScreen] closeProductDetail');
    setDetailVisible(false);
    setSelectedProduct(null);
  };

  const handleDetailAddToCart = () => {
    if (!selectedProduct) return;

    console.log('[CategoriesScreen] handleDetailAddToCart:', {
      id: selectedProduct.id,
      name: selectedProduct.name,
      categoryId: selectedProduct.categoryId,
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="grid-outline" size={20} color="#6A4E23" />
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {filteredProducts.length} items
            </Text>
          </View>
        </View>

        <Text style={styles.header}>Categories</Text>
        <Text style={styles.subheader}>
          Browse drinks and snacks by category.
        </Text>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Browse categories</Text>
          <TouchableOpacity onPress={handleResetCategory} activeOpacity={0.8}>
            <Text style={styles.clearText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity
            style={[
              styles.tile,
              activeCategoryId === null && styles.tileActive,
            ]}
            onPress={handleResetCategory}
            activeOpacity={0.85}>
            <View style={styles.tileIconWrap}>
              <Ionicons
                name="apps-outline"
                size={20}
                color={activeCategoryId === null ? '#fff' : '#6A4E23'}
              />
            </View>
            <Text
              style={[
                styles.tileText,
                activeCategoryId === null && styles.tileTextActive,
              ]}
              numberOfLines={2}>
              All Products
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isActive = String(activeCategoryId) === String(cat.id);

            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tile, isActive && styles.tileActive]}
                onPress={() => handleCategorySelect(cat.id)}
                activeOpacity={0.85}>
                <View style={styles.tileIconWrap}>
                  <Text
                    style={[
                      styles.tileEmoji,
                      isActive && styles.tileEmojiActive,
                    ]}>
                    {cat.icon}
                  </Text>
                </View>
                <Text
                  style={[styles.tileText, isActive && styles.tileTextActive]}
                  numberOfLines={2}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.title}>{activeCategoryName}</Text>
        <Text style={styles.count}>{filteredProducts.length} items</Text>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No products</Text>
          <Text style={styles.emptyText}>
            This category will have items soon.
          </Text>
        </View>
      ) : (
        filteredProducts.map((item) => (
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
    paddingBottom: 30,
  },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f6f1e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    backgroundColor: '#f6f1e9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 12,
  },
  header: {
    fontSize: 30,
    fontWeight: '900',
    color: '#6A4E23',
  },
  subheader: {
    marginTop: 4,
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  sectionBlock: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
  },
  clearText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 13,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    backgroundColor: '#f9f6f1',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#efe4d6',
    minHeight: 96,
    justifyContent: 'space-between',
  },
  tileActive: {
    backgroundColor: '#6A4E23',
    borderColor: '#6A4E23',
  },
  tileIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileEmoji: {
    fontSize: 18,
  },
  tileEmojiActive: {
    color: '#fff',
  },
  tileText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 18,
  },
  tileTextActive: {
    color: '#fff',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 10,
    alignItems: 'baseline',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6A4E23',
  },
  count: {
    fontSize: 12,
    color: '#777',
    fontWeight: '700',
  },

  empty: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
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
    fontSize: 13,
    lineHeight: 19,
  },
});
