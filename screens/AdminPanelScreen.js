//--------------------------------------------
// AdminPanelScreen.js
//--------------------------------------------

// Admin area for managing categories, products, and sales stats.
// Supports add/edit products, visibility control, and reset actions.
import React, { useContext, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
  Switch,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CatalogContext, DEFAULT_PRODUCT_IMAGE } from '../state/CatalogContext';

const blankProduct = {
  name: '',
  description: '',
  price: '',
  image: '',
  categoryId: null,
  featured: false,
};

export default function AdminPanelScreen({ navigation }) {
  const {
    categories = [],
    allProducts = [],
    addCategory,
    addProduct,
    updateProduct,
    toggleProductVisibility,
    resetCatalog,
    resetSalesOnly,
  } = useContext(CatalogContext);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productsModalVisible, setProductsModalVisible] = useState(false);
  const [sellersModalVisible, setSellersModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);

  const [productActionsModalVisible, setProductActionsModalVisible] =
    useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [sellersMode, setSellersMode] = useState('top');
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('☕');
  const [productForm, setProductForm] = useState(blankProduct);
  const [editingProductId, setEditingProductId] = useState(null);

  const [categoryErrors, setCategoryErrors] = useState({
    name: '',
    icon: '',
  });

  const [productErrors, setProductErrors] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: '',
  });

  useEffect(() => {
    console.log(
      '[AdminPanel] allProducts changed:',
      allProducts.map((item) => ({
        id: item.id,
        name: item.name,
        isVisible: item.isVisible !== false,
      }))
    );
  }, [allProducts]);

  const totalProducts = allProducts.length;
  const totalCategories = categories.length;
  const visibleProductsCount = allProducts.filter(
    (item) => item.isVisible !== false
  ).length;

  const totalUnitsSold = useMemo(
    () => allProducts.reduce((sum, product) => sum + (product.sales || 0), 0),
    [allProducts]
  );

  const totalRevenue = useMemo(
    () =>
      allProducts.reduce(
        (sum, product) =>
          sum + (product.sales || 0) * Number(product.price || 0),
        0
      ),
    [allProducts]
  );

  const topSelling = useMemo(
    () =>
      [...allProducts]
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, 3),
    [allProducts]
  );

  const lowSelling = useMemo(
    () =>
      [...allProducts]
        .sort((a, b) => (a.sales || 0) - (b.sales || 0))
        .slice(0, 3),
    [allProducts]
  );

  const sellersList = sellersMode === 'top' ? topSelling : lowSelling;
  const sellersTitle =
    sellersMode === 'top' ? 'Top 3 sellers' : 'Bottom 3 sellers';

  const selectedCategory = categories.find(
    (cat) => cat.id === productForm.categoryId
  );

  const productsListKey = useMemo(
    () =>
      allProducts
        .map((item) => `${item.id}-${item.isVisible !== false ? '1' : '0'}`)
        .join('|'),
    [allProducts]
  );

  const closeProductActionsModal = () => {
    setProductActionsModalVisible(false);
    setActiveProduct(null);
    setToggleLoading(false);
  };

  const openProductActionsModal = (product) => {
    console.log('[AdminPanel] openProductActionsModal:', {
      id: product.id,
      name: product.name,
      isVisible: product.isVisible !== false,
    });
    setActiveProduct(product);
    setProductActionsModalVisible(true);
  };

  const openAddCategory = () => {
    setCategoryName('');
    setCategoryIcon('☕');
    setCategoryErrors({ name: '', icon: '' });
    setCategoryModalVisible(true);
  };

  const openAddProduct = (categoryId = categories[0]?.id || null) => {
    if (!categories.length) {
      Alert.alert('No categories', 'Create a category first.');
      return;
    }

    setEditingProductId(null);
    setProductErrors({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
    });
    setProductForm({
      ...blankProduct,
      categoryId,
      image: DEFAULT_PRODUCT_IMAGE,
    });
    setProductModalVisible(true);
  };

  const openEditProduct = (product) => {
    console.log('[AdminPanel] openEditProduct:', {
      id: product.id,
      name: product.name,
      isVisible: product.isVisible !== false,
    });

    setEditingProductId(product.id);
    setProductErrors({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
    });
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image: product.image,
      categoryId: product.categoryId,
      featured: !!product.featured,
    });
    setProductModalVisible(true);
  };

  const validateCategory = () => {
    const nextErrors = { name: '', icon: '' };

    if (!categoryName.trim()) {
      nextErrors.name = 'Category name is required.';
    } else if (categoryName.trim().length < 2) {
      nextErrors.name = 'Category name is too short.';
    }

    if (!categoryIcon.trim()) {
      nextErrors.icon = 'Category icon is required.';
    }

    setCategoryErrors(nextErrors);
    return !nextErrors.name && !nextErrors.icon;
  };

  const validateProduct = () => {
    const nextErrors = {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
    };

    if (!productForm.name.trim()) {
      nextErrors.name = 'Product name is required.';
    } else if (productForm.name.trim().length < 2) {
      nextErrors.name = 'Product name is too short.';
    }

    if (!productForm.description.trim()) {
      nextErrors.description = 'Description is required.';
    } else if (productForm.description.trim().length < 8) {
      nextErrors.description = 'Description is too short.';
    }

    if (!String(productForm.price).trim()) {
      nextErrors.price = 'Price is required.';
    } else if (
      Number(productForm.price) <= 0 ||
      Number.isNaN(Number(productForm.price))
    ) {
      nextErrors.price = 'Enter a valid price.';
    }

    if (!productForm.categoryId) {
      nextErrors.categoryId = 'Please choose a category.';
    }

    if (productForm.image && !productForm.image.trim().startsWith('http')) {
      nextErrors.image = 'Image URL should start with http.';
    }

    setProductErrors(nextErrors);

    return (
      !nextErrors.name &&
      !nextErrors.description &&
      !nextErrors.price &&
      !nextErrors.categoryId &&
      !nextErrors.image
    );
  };

  const handleSaveCategory = () => {
    if (!validateCategory()) return;

    const newCategory = addCategory({
      name: categoryName.trim(),
      icon: categoryIcon.trim() || '☕',
    });

    setCategoryModalVisible(false);

    setProductForm({
      ...blankProduct,
      categoryId: newCategory.id,
      image: DEFAULT_PRODUCT_IMAGE,
    });
    setEditingProductId(null);
    setProductErrors({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
    });
    setProductModalVisible(true);
  };

  const handleSaveProduct = () => {
    if (!validateProduct()) return;

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: productForm.price,
      image: productForm.image?.trim() || DEFAULT_PRODUCT_IMAGE,
      categoryId: productForm.categoryId,
      featured: productForm.featured,
    };

    console.log('[AdminPanel] handleSaveProduct:', {
      editingProductId,
      payload,
    });

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      addProduct(payload);
    }

    setProductModalVisible(false);
    setEditingProductId(null);
    setProductForm(blankProduct);
    setProductErrors({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: '',
    });
  };

  const handleEditFromActions = () => {
    if (!activeProduct) return;

    const productToEdit = activeProduct;

    closeProductActionsModal();
    setProductsModalVisible(false);

    setTimeout(() => {
      openEditProduct(productToEdit);
    }, 120);
  };

  const handleToggleVisibilityDirect = async () => {
    if (!activeProduct) return;

    const currentlyVisible = activeProduct.isVisible !== false;
    const actionLabel = currentlyVisible ? 'hide' : 'show';

    console.log('[AdminPanel] handleToggleVisibilityDirect start:', {
      id: activeProduct.id,
      name: activeProduct.name,
      currentlyVisible,
      hasToggleFn: typeof toggleProductVisibility === 'function',
    });

    if (typeof toggleProductVisibility !== 'function') {
      Alert.alert(
        'Missing function',
        'toggleProductVisibility() is not available in CatalogContext.'
      );
      return;
    }

    try {
      setToggleLoading(true);

      await toggleProductVisibility(activeProduct.id);

      console.log('[AdminPanel] handleToggleVisibilityDirect finished:', {
        id: activeProduct.id,
        name: activeProduct.name,
        action: actionLabel,
      });

      if (
        String(editingProductId) === String(activeProduct.id) &&
        currentlyVisible
      ) {
        setProductModalVisible(false);
        setEditingProductId(null);
        setProductForm(blankProduct);
      }

      closeProductActionsModal();
    } catch (error) {
      console.log('[AdminPanel] handleToggleVisibilityDirect error:', error);
      setToggleLoading(false);
      Alert.alert('Update failed', `Could not ${actionLabel} the product.`);
    }
  };

  const renderProductRow = ({ item }) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    const isVisible = item.isVisible !== false;

    return (
      <View
        style={[
          styles.productRowModal,
          !isVisible && styles.productRowModalHidden,
        ]}>
        <TouchableOpacity
          style={styles.productInfoPressable}
          onPress={() => {
            console.log('[AdminPanel] product info tapped:', {
              id: item.id,
              name: item.name,
            });
            setProductsModalVisible(false);
            openEditProduct(item);
          }}
          activeOpacity={0.85}>
          <View style={styles.productTitleRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>

            <View
              style={[
                styles.stockBadge,
                isVisible ? styles.stockBadgeVisible : styles.stockBadgeHidden,
              ]}>
              <Text
                style={[
                  styles.stockBadgeText,
                  isVisible
                    ? styles.stockBadgeTextVisible
                    : styles.stockBadgeTextHidden,
                ]}>
                {isVisible ? 'In stock' : 'Out of stock'}
              </Text>
            </View>
          </View>

          <Text style={styles.productMeta}>
            {cat ? `${cat.icon} ${cat.name}` : 'Unassigned'} • $
            {Number(item.price).toFixed(2)} • Sold {item.sales || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowActionBtn}
          onPress={() => openProductActionsModal(item)}
          activeOpacity={0.85}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-vertical" size={16} color="#6A4E23" />
        </TouchableOpacity>
      </View>
    );
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  const handleResetAll = async () => {
    setResetModalVisible(false);
    try {
      await resetCatalog();
      Alert.alert(
        'Reset complete',
        'Everything has been restored to defaults.'
      );
    } catch (error) {
      Alert.alert('Reset failed', 'Could not reset the catalog.');
    }
  };

  const handleResetSalesOnly = async () => {
    setResetModalVisible(false);

    if (typeof resetSalesOnly !== 'function') {
      Alert.alert(
        'Missing function',
        'Your CatalogContext needs a resetSalesOnly() method for this option.'
      );
      return;
    }

    try {
      await resetSalesOnly();
      Alert.alert('Done', 'Sales data has been cleared.');
    } catch (error) {
      Alert.alert('Reset failed', 'Could not clear sales data.');
    }
  };

  const openSellersModal = (mode) => {
    setSellersMode(mode);
    setSellersModalVisible(true);
  };

  const openProductsModal = () => {
    console.log('[AdminPanel] openProductsModal');
    setProductsModalVisible(true);
  };

  const activeProductIsVisible = activeProduct?.isVisible !== false;

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator
          persistentScrollbar
          overScrollMode="always"
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled>
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTitleWrap}>
                <View style={styles.heroBadge}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color="#6A4E23"
                  />
                  <Text style={styles.heroBadgeText}>Admin controls</Text>
                </View>

                <Text style={styles.header}>Admin Panel</Text>
                <Text style={styles.subheader}>
                  Manage categories, products, and sales from one place.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.85}>
                <Ionicons name="log-out-outline" size={16} color="#6A4E23" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={openAddCategory}
                activeOpacity={0.9}>
                <Ionicons name="albums-outline" size={16} color="#fff" />
                <Text style={styles.primaryActionText}>Add Category</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryAction}
                onPress={() => openAddProduct()}
                activeOpacity={0.9}>
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <Text style={styles.primaryActionText}>Add Product</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.manageBtn}
              onPress={openProductsModal}
              activeOpacity={0.9}>
              <Ionicons name="list-outline" size={18} color="#6A4E23" />
              <Text style={styles.manageBtnText}>Manage all products</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalCategories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalProducts}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{visibleProductsCount}</Text>
              <Text style={styles.statLabel}>Availble Now</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalUnitsSold}</Text>
              <Text style={styles.statLabel}>Units Sold</Text>
            </View>

            <View style={styles.statCardWide}>
              <Text style={styles.statNumber}>$ {totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sales stats</Text>
            </View>

            <View style={styles.grid}>
              <TouchableOpacity
                style={styles.tile}
                onPress={() => openSellersModal('top')}
                activeOpacity={0.85}>
                <View style={styles.tileIconWrap}>
                  <Ionicons
                    name="trending-up-outline"
                    size={20}
                    color="#6A4E23"
                  />
                </View>
                <Text style={styles.tileText}>Top sellers</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tile}
                onPress={() => openSellersModal('bottom')}
                activeOpacity={0.85}>
                <View style={styles.tileIconWrap}>
                  <Ionicons
                    name="trending-down-outline"
                    size={20}
                    color="#6A4E23"
                  />
                </View>
                <Text style={styles.tileText}>Low sellers</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.resetMainBtn}
              onPress={() => setResetModalVisible(true)}
              activeOpacity={0.9}>
              <Ionicons name="refresh-outline" size={16} color="#fff" />
              <Text style={styles.resetMainText}>Reset data</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />

          <Modal
            transparent
            visible={productsModalVisible}
            animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setProductsModalVisible(false)}>
              <Pressable style={styles.modalCardLarge} onPress={() => {}}>
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalHeaderTextWrap}>
                    <Text style={styles.modalTitle}>All products</Text>
                    <Text style={styles.modalSubtitle}>
                      Tap product details to edit. Tap the menu button on the
                      right for stock actions.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setProductsModalVisible(false)}
                    style={styles.closeBtn}
                    activeOpacity={0.85}>
                    <Ionicons name="close" size={18} color="#6A4E23" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  key={productsListKey}
                  data={allProducts}
                  extraData={productsListKey}
                  keyExtractor={(item) => String(item.id)}
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.modalListContent}
                  renderItem={renderProductRow}
                  ListEmptyComponent={
                    <View style={styles.modalEmpty}>
                      <Text style={styles.modalEmptyTitle}>
                        No products yet
                      </Text>
                      <Text style={styles.modalEmptyText}>
                        Add your first product to get started.
                      </Text>
                    </View>
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>

          <Modal
            transparent
            visible={productActionsModalVisible}
            animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={closeProductActionsModal}>
              <Pressable style={styles.modalCard} onPress={() => {}}>
                <Text style={styles.modalTitle}>Product actions</Text>
                <Text style={styles.modalSubtitle}>
                  {activeProduct
                    ? `Choose an action for "${activeProduct.name}".`
                    : 'Choose an action.'}
                </Text>

                <TouchableOpacity
                  style={styles.actionOptionBtn}
                  onPress={handleEditFromActions}
                  activeOpacity={0.9}>
                  <Ionicons name="create-outline" size={18} color="#6A4E23" />
                  <Text style={styles.actionOptionText}>Edit product</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionOptionBtn,
                    activeProductIsVisible
                      ? styles.actionOptionBtnSoftRed
                      : styles.actionOptionBtnSoftGreen,
                  ]}
                  onPress={handleToggleVisibilityDirect}
                  activeOpacity={0.9}
                  disabled={toggleLoading}>
                  <Ionicons
                    name={
                      activeProductIsVisible ? 'eye-off-outline' : 'eye-outline'
                    }
                    size={18}
                    color={activeProductIsVisible ? '#9b4a4a' : '#2f7b52'}
                  />
                  <Text
                    style={[
                      styles.actionOptionText,
                      activeProductIsVisible
                        ? styles.actionOptionTextSoftRed
                        : styles.actionOptionTextSoftGreen,
                    ]}>
                    {toggleLoading
                      ? 'Updating...'
                      : activeProductIsVisible
                      ? 'Mark out of stock'
                      : 'Mark available'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryModalBtnSingle}
                  onPress={closeProductActionsModal}
                  activeOpacity={0.85}>
                  <Text style={styles.secondaryModalBtnText}>Cancel</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>

          <Modal transparent visible={sellersModalVisible} animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setSellersModalVisible(false)}>
              <Pressable style={styles.modalCardLarge} onPress={() => {}}>
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>{sellersTitle}</Text>
                    <Text style={styles.modalSubtitle}>
                      Tap a product to edit it.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSellersModalVisible(false)}
                    style={styles.closeBtn}
                    activeOpacity={0.85}>
                    <Ionicons name="close" size={18} color="#6A4E23" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={sellersList}
                  keyExtractor={(item) => String(item.id)}
                  showsVerticalScrollIndicator
                  contentContainerStyle={styles.modalListContent}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.sellerRow}
                      onPress={() => {
                        setSellersModalVisible(false);
                        openEditProduct(item);
                      }}
                      activeOpacity={0.85}>
                      <View style={styles.rankBadgeLarge}>
                        <Text style={styles.rankBadgeLargeText}>
                          {index + 1}
                        </Text>
                      </View>

                      <View style={styles.sellerInfo}>
                        <Text style={styles.sellerName}>{item.name}</Text>
                        <Text style={styles.sellerMeta}>
                          {item.sales || 0} sold • ${' '}
                          {Number(item.price).toFixed(2)}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.modalEmpty}>
                      <Text style={styles.modalEmptyTitle}>No sales yet</Text>
                      <Text style={styles.modalEmptyText}>
                        Once orders are placed, the list will appear here.
                      </Text>
                    </View>
                  }
                />
              </Pressable>
            </Pressable>
          </Modal>

          <Modal
            transparent
            visible={categoryModalVisible}
            animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setCategoryModalVisible(false)}>
              <Pressable style={styles.modalCard} onPress={() => {}}>
                <Text style={styles.modalTitle}>Add Category</Text>
                <Text style={styles.modalSubtitle}>
                  Create a new category, then add a product into it.
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    categoryErrors.name ? styles.inputError : null,
                  ]}
                  placeholder="Category name"
                  placeholderTextColor="#999"
                  value={categoryName}
                  onChangeText={(text) => {
                    setCategoryName(text);
                    if (categoryErrors.name) {
                      setCategoryErrors((prev) => ({ ...prev, name: '' }));
                    }
                  }}
                />
                {categoryErrors.name ? (
                  <Text style={styles.fieldError}>{categoryErrors.name}</Text>
                ) : null}

                <TextInput
                  style={[
                    styles.input,
                    categoryErrors.icon ? styles.inputError : null,
                  ]}
                  placeholder="Icon / emoji"
                  placeholderTextColor="#999"
                  value={categoryIcon}
                  onChangeText={(text) => {
                    setCategoryIcon(text);
                    if (categoryErrors.icon) {
                      setCategoryErrors((prev) => ({ ...prev, icon: '' }));
                    }
                  }}
                  maxLength={2}
                />
                {categoryErrors.icon ? (
                  <Text style={styles.fieldError}>{categoryErrors.icon}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleSaveCategory}
                  activeOpacity={0.9}>
                  <Text style={styles.modalPrimaryText}>
                    Save & Add Product
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>

          <Modal transparent visible={productModalVisible} animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setProductModalVisible(false)}>
              <Pressable style={styles.modalCardLarge} onPress={() => {}}>
                <Text style={styles.modalTitle}>
                  {editingProductId ? 'Edit Product' : 'Add Product'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Fill the form, choose a category, and save it to the catalog.
                </Text>

                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalListContent}
                  showsVerticalScrollIndicator
                  keyboardShouldPersistTaps="handled">
                  <TextInput
                    style={[
                      styles.input,
                      productErrors.name ? styles.inputError : null,
                    ]}
                    placeholder="Product name"
                    placeholderTextColor="#999"
                    value={productForm.name}
                    onChangeText={(text) => {
                      setProductForm((prev) => ({ ...prev, name: text }));
                      if (productErrors.name) {
                        setProductErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                  />
                  {productErrors.name ? (
                    <Text style={styles.fieldError}>{productErrors.name}</Text>
                  ) : null}

                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      productErrors.description ? styles.inputError : null,
                    ]}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    value={productForm.description}
                    onChangeText={(text) => {
                      setProductForm((prev) => ({
                        ...prev,
                        description: text,
                      }));
                      if (productErrors.description) {
                        setProductErrors((prev) => ({
                          ...prev,
                          description: '',
                        }));
                      }
                    }}
                    multiline
                  />
                  {productErrors.description ? (
                    <Text style={styles.fieldError}>
                      {productErrors.description}
                    </Text>
                  ) : null}

                  <TextInput
                    style={[
                      styles.input,
                      productErrors.price ? styles.inputError : null,
                    ]}
                    placeholder="Price"
                    placeholderTextColor="#999"
                    value={String(productForm.price)}
                    onChangeText={(text) => {
                      setProductForm((prev) => ({ ...prev, price: text }));
                      if (productErrors.price) {
                        setProductErrors((prev) => ({ ...prev, price: '' }));
                      }
                    }}
                    keyboardType="decimal-pad"
                  />
                  {productErrors.price ? (
                    <Text style={styles.fieldError}>{productErrors.price}</Text>
                  ) : null}

                  <TextInput
                    style={[
                      styles.input,
                      productErrors.image ? styles.inputError : null,
                    ]}
                    placeholder="Image URL"
                    placeholderTextColor="#999"
                    value={productForm.image}
                    onChangeText={(text) => {
                      setProductForm((prev) => ({ ...prev, image: text }));
                      if (productErrors.image) {
                        setProductErrors((prev) => ({ ...prev, image: '' }));
                      }
                    }}
                  />
                  {productErrors.image ? (
                    <Text style={styles.fieldError}>{productErrors.image}</Text>
                  ) : null}

                  <Text style={styles.selectorLabel}>Choose category</Text>
                  <TouchableOpacity
                    style={styles.dropdownBtn}
                    onPress={() => setCategoryDropdownVisible(true)}
                    activeOpacity={0.85}>
                    <Text style={styles.dropdownBtnText}>
                      {selectedCategory
                        ? `${selectedCategory.icon} ${selectedCategory.name}`
                        : 'Select category'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6A4E23" />
                  </TouchableOpacity>
                  {productErrors.categoryId ? (
                    <Text style={styles.fieldError}>
                      {productErrors.categoryId}
                    </Text>
                  ) : null}

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Featured product</Text>
                    <Switch
                      value={productForm.featured}
                      onValueChange={(value) =>
                        setProductForm((prev) => ({ ...prev, featured: value }))
                      }
                      trackColor={{ false: '#ddd', true: '#6A4E23' }}
                      thumbColor="#fff"
                    />
                  </View>

                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={styles.secondaryModalBtn}
                      onPress={() => setProductModalVisible(false)}
                      activeOpacity={0.85}>
                      <Text style={styles.secondaryModalBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalPrimaryBtn}
                      onPress={handleSaveProduct}
                      activeOpacity={0.9}>
                      <Text style={styles.modalPrimaryText}>
                        {editingProductId ? 'Save changes' : 'Save product'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>

          <Modal
            transparent
            visible={categoryDropdownVisible}
            animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setCategoryDropdownVisible(false)}>
              <Pressable style={styles.dropdownModalCard} onPress={() => {}}>
                <Text style={styles.modalTitle}>Select category</Text>
                <ScrollView
                  showsVerticalScrollIndicator
                  contentContainerStyle={styles.dropdownList}>
                  {categories.map((cat) => {
                    const active = productForm.categoryId === cat.id;

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.dropdownItem,
                          active && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setProductForm((prev) => ({
                            ...prev,
                            categoryId: cat.id,
                          }));
                          if (productErrors.categoryId) {
                            setProductErrors((prev) => ({
                              ...prev,
                              categoryId: '',
                            }));
                          }
                          setCategoryDropdownVisible(false);
                        }}
                        activeOpacity={0.85}>
                        <Text
                          style={[
                            styles.dropdownItemText,
                            active && styles.dropdownItemTextActive,
                          ]}>
                          {cat.icon} {cat.name}
                        </Text>
                        {active ? (
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>

          <Modal transparent visible={resetModalVisible} animationType="fade">
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setResetModalVisible(false)}>
              <Pressable style={styles.modalCard} onPress={() => {}}>
                <Text style={styles.modalTitle}>Reset data</Text>
                <Text style={styles.modalSubtitle}>
                  Choose whether to reset everything or only the sales data.
                </Text>

                <TouchableOpacity
                  style={styles.resetOptionBtn}
                  onPress={handleResetAll}
                  activeOpacity={0.9}>
                  <Text style={styles.resetOptionTitle}>Reset all</Text>
                  <Text style={styles.resetOptionText}>
                    Restores default categories, products, and sales stats.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetOptionBtnSoft}
                  onPress={handleResetSalesOnly}
                  activeOpacity={0.9}>
                  <Text
                    style={[
                      styles.resetOptionTitle,
                      styles.resetOptionTitleSoft,
                    ]}>
                    Reset sales only
                  </Text>
                  <Text
                    style={[
                      styles.resetOptionText,
                      styles.resetOptionTextSoft,
                    ]}>
                    Clears sales counts and stats, keeps products and
                    categories.
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//Styling
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#f6f1e9' },
  content: { padding: 16, paddingBottom: 30, flexGrow: 1 },

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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroTitleWrap: { flex: 1 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f6f1e9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginBottom: 10,
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
    lineHeight: 19,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f6f1e9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 12,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#6A4E23',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  manageBtn: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe4d6',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  manageBtnText: {
    color: '#6A4E23',
    fontWeight: '900',
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statCardWide: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6A4E23',
  },
  statLabel: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
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
  tileIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tileText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 18,
  },

  resetMainBtn: {
    marginTop: 12,
    backgroundColor: '#6A4E23',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  resetMainText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },

  bottomSpacer: { height: 24 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
  },
  modalCardLarge: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6A4E23',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  modalHeaderTextWrap: {
    flex: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f6f1e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalListContent: {
    paddingBottom: 8,
  },
  modalEmpty: {
    backgroundColor: '#f9f6f1',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
  },
  modalEmptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6A4E23',
  },
  modalEmptyText: {
    marginTop: 6,
    color: '#666',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },

  productRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e7db',
    padding: 12,
    marginBottom: 10,
  },
  productRowModalHidden: {
    opacity: 0.78,
    backgroundColor: '#fcfbf8',
  },
  productInfoPressable: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingRight: 10,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productName: {
    flex: 1,
    fontWeight: '800',
    color: '#222',
    marginRight: 8,
  },
  productMeta: {
    color: '#777',
    fontSize: 12,
    marginTop: 4,
  },

  stockBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  stockBadgeVisible: {
    backgroundColor: '#eef8f1',
  },
  stockBadgeHidden: {
    backgroundColor: '#fff4f4',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stockBadgeTextVisible: {
    color: '#1f7a45',
  },
  stockBadgeTextHidden: {
    color: '#9f5555',
  },

  rowActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f6f1e9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionOptionBtn: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#f6f1e9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionOptionBtnSoftRed: {
    backgroundColor: '#fff7f7',
  },
  actionOptionBtnSoftGreen: {
    backgroundColor: '#f3fbf5',
  },
  actionOptionText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 14,
  },
  actionOptionTextSoftRed: {
    color: '#975252',
  },
  actionOptionTextSoftGreen: {
    color: '#2f7b52',
  },

  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0e7db',
    padding: 12,
    marginBottom: 10,
  },
  rankBadgeLarge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f6f1e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeLargeText: {
    color: '#6A4E23',
    fontWeight: '900',
    fontSize: 13,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontWeight: '900',
    color: '#222',
  },
  sellerMeta: {
    color: '#777',
    marginTop: 3,
    fontSize: 12,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 12,
    backgroundColor: '#fafafa',
    color: '#222',
  },
  inputError: {
    borderColor: '#d33',
    backgroundColor: '#fff8f8',
  },
  fieldError: {
    color: '#d33',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: -2,
    marginLeft: 4,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  selectorLabel: {
    color: '#6A4E23',
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 2,
  },
  dropdownBtn: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#efe4d6',
    borderRadius: 16,
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownBtnText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 14,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingVertical: 8,
  },
  switchLabel: {
    color: '#222',
    fontWeight: '800',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryModalBtn: {
    flex: 1,
    backgroundColor: '#f6f1e9',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryModalBtnSingle: {
    backgroundColor: '#f6f1e9',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryModalBtnText: {
    color: '#6A4E23',
    fontWeight: '900',
    fontSize: 14,
  },
  modalPrimaryBtn: {
    flex: 1.3,
    backgroundColor: '#6A4E23',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },

  dropdownModalCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    maxHeight: '75%',
  },
  dropdownList: {
    paddingBottom: 6,
  },
  dropdownItem: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#f9f6f1',
    borderWidth: 1,
    borderColor: '#efe4d6',
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#6A4E23',
    borderColor: '#6A4E23',
  },
  dropdownItemText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  dropdownItemTextActive: {
    color: '#fff',
  },

  resetOptionBtn: {
    backgroundColor: '#6A4E23',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  resetOptionBtnSoft: {
    backgroundColor: '#f9f6f1',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#efe4d6',
  },
  resetOptionTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  resetOptionText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  resetOptionTitleSoft: {
    color: '#6A4E23',
  },
  resetOptionTextSoft: {
    color: '#666',
  },
});
