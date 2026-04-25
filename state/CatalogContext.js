//--------------------------------------------
// CatalogContext.js
//--------------------------------------------

// Stores catalog data for categories and products.
// Handles add, edit, visibility updates, sales registration, persistence, and reset.
import React, {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { categories as seedCategories } from '../data/Categories';
import { products as seedProducts } from '../data/products';

export const CatalogContext = createContext();

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80';

const WORKING_COPY_KEY = '@brewmate_catalog_working_copy_v2';

const LEGACY_SNAPSHOT_KEYS = [
  '@brewmate_catalog_working_copy_v1',
  '@brewmate_catalog_v6',
  '@brewmate_catalog_v5',
  '@brewmate_catalog_v4',
  '@brewmate_catalog_v3',
];

const LEGACY_CATEGORIES_KEY = '@brewmate_categories_v2';
const LEGACY_PRODUCTS_KEY = '@brewmate_products_v2';

const cloneCategories = () =>
  seedCategories.map((category) => ({
    ...category,
    icon: category.icon || '☕',
  }));

const findCategoryIdByName = (categoryName) => {
  if (!categoryName) return null;

  const match = seedCategories.find(
    (category) =>
      category.name.trim().toLowerCase() ===
      String(categoryName).trim().toLowerCase()
  );

  return match ? match.id : null;
};

const normalizeCategory = (category) => ({
  ...category,
  id: category.id,
  name: category.name || '',
  icon: category.icon || '☕',
});

const normalizeProduct = (product, availableCategories = []) => {
  const categoryId =
    product.categoryId ?? findCategoryIdByName(product.category) ?? null;

  const categoryName =
    availableCategories.find(
      (category) => String(category.id) === String(categoryId)
    )?.name ||
    product.category ||
    '';

  return {
    ...product,
    id: product.id ?? Date.now() + Math.floor(Math.random() * 100000),
    name: product.name || '',
    description: product.description || '',
    price: Number(product.price) || 0,
    image: product.image || DEFAULT_PRODUCT_IMAGE,
    featured: !!product.featured,
    sales: product.sales ?? 0,
    isVisible: product.isVisible !== false,
    categoryId,
    category: categoryName,
  };
};

const buildSeedSnapshot = () => {
  const categories = cloneCategories();
  const products = seedProducts.map((product) =>
    normalizeProduct(
      {
        ...product,
        sales: product.sales ?? 0,
        isVisible: true,
      },
      categories
    )
  );

  return {
    categories,
    products,
  };
};

const safeParse = (raw, fallback = null) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeSnapshot = (snapshot) => {
  const fallback = buildSeedSnapshot();

  const categories = Array.isArray(snapshot?.categories)
    ? snapshot.categories.map((category) => normalizeCategory(category))
    : fallback.categories;

  const products = Array.isArray(snapshot?.products)
    ? snapshot.products.map((product) => normalizeProduct(product, categories))
    : fallback.products;

  return {
    categories,
    products,
  };
};

export const CatalogProvider = ({ children }) => {
  const [catalog, setCatalog] = useState(buildSeedSnapshot());
  const [hydrated, setHydrated] = useState(false);

  const catalogRef = useRef(catalog);
  const writeQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    catalogRef.current = catalog;
  }, [catalog]);

  const persistCatalog = async (nextCatalog) => {
    writeQueueRef.current = writeQueueRef.current
      .catch(() => {})
      .then(() =>
        AsyncStorage.setItem(WORKING_COPY_KEY, JSON.stringify(nextCatalog))
      )
      .catch((error) => {
        console.log('Error saving catalog:', error);
      });

    return writeQueueRef.current;
  };

  const commitCatalog = async (updater) => {
    const current = catalogRef.current;
    const resolved = typeof updater === 'function' ? updater(current) : updater;

    const nextCatalog = normalizeSnapshot({
      categories: Array.isArray(resolved?.categories)
        ? resolved.categories
        : current.categories,
      products: Array.isArray(resolved?.products)
        ? resolved.products
        : current.products,
    });

    catalogRef.current = nextCatalog;
    setCatalog(nextCatalog);
    await persistCatalog(nextCatalog);

    return nextCatalog;
  };

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const currentRaw = await AsyncStorage.getItem(WORKING_COPY_KEY);

        if (currentRaw) {
          const nextCatalog = normalizeSnapshot(
            safeParse(currentRaw, buildSeedSnapshot())
          );
          catalogRef.current = nextCatalog;
          setCatalog(nextCatalog);
          return;
        }

        for (const legacyKey of LEGACY_SNAPSHOT_KEYS) {
          const legacyRaw = await AsyncStorage.getItem(legacyKey);

          if (legacyRaw) {
            const migratedCatalog = normalizeSnapshot(
              safeParse(legacyRaw, buildSeedSnapshot())
            );
            catalogRef.current = migratedCatalog;
            setCatalog(migratedCatalog);
            await persistCatalog(migratedCatalog);
            return;
          }
        }

        const [legacyCategoriesRaw, legacyProductsRaw] = await Promise.all([
          AsyncStorage.getItem(LEGACY_CATEGORIES_KEY),
          AsyncStorage.getItem(LEGACY_PRODUCTS_KEY),
        ]);

        if (legacyCategoriesRaw || legacyProductsRaw) {
          const fallback = buildSeedSnapshot();

          const migratedCatalog = normalizeSnapshot({
            categories: safeParse(legacyCategoriesRaw, fallback.categories),
            products: safeParse(legacyProductsRaw, fallback.products),
          });

          catalogRef.current = migratedCatalog;
          setCatalog(migratedCatalog);
          await persistCatalog(migratedCatalog);
          return;
        }

        const seedCatalog = buildSeedSnapshot();
        catalogRef.current = seedCatalog;
        setCatalog(seedCatalog);
        await persistCatalog(seedCatalog);
      } catch (error) {
        console.log('Error loading catalog:', error);

        const fallbackCatalog = buildSeedSnapshot();
        catalogRef.current = fallbackCatalog;
        setCatalog(fallbackCatalog);
        await persistCatalog(fallbackCatalog);
      } finally {
        setHydrated(true);
      }
    };

    loadCatalog();
  }, []);

  const addCategory = ({ name, icon }) => {
    const newCategory = {
      id: Date.now(),
      name: name.trim(),
      icon: icon?.trim() || '☕',
    };

    void commitCatalog((current) => ({
      ...current,
      categories: [...current.categories, newCategory],
    }));

    return newCategory;
  };

  const addProduct = (product) => {
    const currentCategories = catalogRef.current.categories;

    const newProduct = normalizeProduct(
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: product.name.trim(),
        description: product.description.trim(),
        price: Number(product.price) || 0,
        categoryId: product.categoryId,
        category:
          currentCategories.find(
            (category) => String(category.id) === String(product.categoryId)
          )?.name || '',
        image: product.image?.trim() || DEFAULT_PRODUCT_IMAGE,
        featured: !!product.featured,
        sales: 0,
        isVisible: true,
      },
      currentCategories
    );

    void commitCatalog((current) => ({
      ...current,
      products: [...current.products, newProduct],
    }));

    return newProduct;
  };

  const updateProduct = (productId, updates) => {
    void commitCatalog((current) => {
      const nextProducts = current.products.map((product) => {
        if (String(product.id) !== String(productId)) return product;

        const nextCategoryId =
          updates.categoryId !== undefined
            ? updates.categoryId
            : product.categoryId;

        const nextCategoryName =
          current.categories.find(
            (category) => String(category.id) === String(nextCategoryId)
          )?.name ||
          product.category ||
          '';

        return normalizeProduct(
          {
            ...product,
            ...updates,
            name:
              updates.name !== undefined ? updates.name.trim() : product.name,
            description:
              updates.description !== undefined
                ? updates.description.trim()
                : product.description,
            price:
              updates.price !== undefined
                ? Number(updates.price) || 0
                : product.price,
            image:
              updates.image !== undefined
                ? updates.image.trim() || DEFAULT_PRODUCT_IMAGE
                : product.image,
            featured:
              updates.featured !== undefined
                ? !!updates.featured
                : product.featured,
            categoryId: nextCategoryId,
            category: nextCategoryName,
            isVisible:
              updates.isVisible !== undefined
                ? !!updates.isVisible
                : product.isVisible !== false,
          },
          current.categories
        );
      });

      return {
        ...current,
        products: nextProducts,
      };
    });
  };

  const toggleProductVisibility = async (productId, forcedValue) => {
    await commitCatalog((current) => ({
      ...current,
      products: current.products.map((product) => {
        if (String(product.id) !== String(productId)) return product;

        const currentVisible = product.isVisible !== false;
        const nextVisible =
          typeof forcedValue === 'boolean' ? forcedValue : !currentVisible;

        return {
          ...product,
          isVisible: nextVisible,
        };
      }),
    }));
  };

  // keep this for backward compatibility
  // any old delete call will now just hide the product
  const removeProduct = async (productId) => {
    await toggleProductVisibility(productId, false);
  };

  const registerSale = (cartItems) => {
    void commitCatalog((current) => ({
      ...current,
      products: current.products.map((product) => {
        const match = cartItems.find(
          (item) => String(item.id) === String(product.id)
        );

        if (!match) return product;

        return {
          ...product,
          sales: (product.sales || 0) + match.quantity,
        };
      }),
    }));
  };

  const resetCatalog = async () => {
    await commitCatalog(buildSeedSnapshot());
  };

  const resetSalesOnly = async () => {
    await commitCatalog((current) => ({
      ...current,
      products: current.products.map((product) => ({
        ...product,
        sales: 0,
      })),
    }));
  };

  const allProducts = catalog.products;

  const products = useMemo(
    () => allProducts.filter((product) => product.isVisible !== false),
    [allProducts]
  );

  const totalSalesUnits = useMemo(
    () => allProducts.reduce((sum, product) => sum + (product.sales || 0), 0),
    [allProducts]
  );

  return (
    <CatalogContext.Provider
      value={{
        categories: catalog.categories,
        products,
        allProducts,
        hydrated,
        totalSalesUnits,
        addCategory,
        addProduct,
        updateProduct,
        toggleProductVisibility,
        removeProduct,
        registerSale,
        resetCatalog,
        resetSalesOnly,
      }}>
      {children}
    </CatalogContext.Provider>
  );
};
