<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const restHeartUrl = import.meta.env.VITE_RESTHEART_URL || 'https://your-srv-id.restheart.com'
const products = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const minPrice = ref('')
const maxPrice = ref('')
const selectedCategory = ref('')
const categories = ref([])
let debounceTimeout = null

const fetchProducts = async (isInitialLoad = false) => {
  if (isInitialLoad) {
    loading.value = true
  }
  error.value = null

  try {
    let filterObj = {}

    if (searchTerm.value) {
      filterObj.name = { $regex: searchTerm.value, $options: 'i' }
    }

    if (minPrice.value || maxPrice.value) {
      filterObj.price = {}
      if (minPrice.value) filterObj.price.$gte = parseFloat(minPrice.value)
      if (maxPrice.value) filterObj.price.$lte = parseFloat(maxPrice.value)
    }

    if (selectedCategory.value) {
      filterObj.category = selectedCategory.value
    }

    const filter = Object.keys(filterObj).length > 0
      ? `?filter=${encodeURIComponent(JSON.stringify(filterObj))}&sort={"price":1}`
      : '?sort={"price":1}'

    const response = await fetch(`${restHeartUrl}/products${filter}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    products.value = data

    // Extract unique categories
    const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))]
    categories.value = uniqueCategories
  } catch (err) {
    error.value = err.message
    console.error('Error fetching products:', err)
  } finally {
    if (isInitialLoad) {
      loading.value = false
    }
  }
}

const debouncedFetchProducts = () => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  debounceTimeout = setTimeout(() => {
    fetchProducts(false)
  }, 300)
}

const resetFilters = () => {
  searchTerm.value = ''
  minPrice.value = ''
  maxPrice.value = ''
  selectedCategory.value = ''
}

watch([searchTerm, minPrice, maxPrice, selectedCategory], () => {
  debouncedFetchProducts()
})

onMounted(() => {
  fetchProducts(true)
})
</script>

<template>
  <div class="app">
    <header>
      <h1>🛍️ Product Search</h1>
      <p class="subtitle">Powered by RESTHeart Cloud</p>
    </header>

    <div class="filters">
      <div class="filter-group">
        <label for="search">Search by name:</label>
        <input
          id="search"
          v-model="searchTerm"
          type="text"
          placeholder="Enter product name..."
        />
      </div>

      <div class="filter-row">
        <div class="filter-group">
          <label for="minPrice">Min Price:</label>
          <input
            id="minPrice"
            v-model="minPrice"
            type="number"
            placeholder="0"
          />
        </div>

        <div class="filter-group">
          <label for="maxPrice">Max Price:</label>
          <input
            id="maxPrice"
            v-model="maxPrice"
            type="number"
            placeholder="1000"
          />
        </div>

        <div class="filter-group">
          <label for="category">Category:</label>
          <select
            id="category"
            v-model="selectedCategory"
          >
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
      </div>

      <button @click="resetFilters" class="reset-btn">Reset Filters</button>
    </div>

    <div v-if="loading" class="loading">Loading products...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    <div v-else-if="products.length === 0" class="no-results">
      No products found. Try adjusting your filters.
    </div>
    <div v-else class="products-grid">
      <div v-for="product in products" :key="product._id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p class="price">${{ product.price?.toFixed(2) }}</p>
        <p class="category">{{ product.category }}</p>
        <p class="description">{{ product.description }}</p>
        <div v-if="product.features" class="features">
          <span v-for="feature in product.features" :key="feature" class="feature">
            {{ feature }}
          </span>
        </div>
        <p class="stock" :class="{ 'out-of-stock': !product.inStock }">
          {{ product.inStock ? `In Stock (${product.quantity})` : 'Out of Stock' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem;
}

.app {
  max-width: 980px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

header {
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.filters {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.reset-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #5568d3;
}

.loading,
.error,
.no-results {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  font-size: 1.2rem;
}

.error {
  color: #e74c3c;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.product-card h3 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.price {
  color: #667eea;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.category {
  background: #f0f0f0;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: #666;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feature {
  background: #e8f4f8;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #2980b9;
}

.stock {
  font-weight: 600;
  color: #27ae60;
}

.stock.out-of-stock {
  color: #e74c3c;
}

@media (max-width: 768px) {
  body {
    padding: 1rem;
  }

  header h1 {
    font-size: 2rem;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
