import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const restHeartUrl = import.meta.env.VITE_RESTHEART_URL || 'https://beta.mrest.it'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let filterObj = {}
      
      if (searchTerm) {
        filterObj.name = { $regex: searchTerm, $options: 'i' }
      }
      
      if (minPrice || maxPrice) {
        filterObj.price = {}
        if (minPrice) filterObj.price.$gte = parseFloat(minPrice)
        if (maxPrice) filterObj.price.$lte = parseFloat(maxPrice)
      }
      
      if (selectedCategory) {
        filterObj.category = selectedCategory
      }
      
      const filter = Object.keys(filterObj).length > 0 
        ? `?filter=${encodeURIComponent(JSON.stringify(filterObj))}&sort={"price":1}`
        : '?sort={"price":1}'
      
      const response = await fetch(`${restHeartUrl}/products${filter}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setProducts(data)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))]
      setCategories(uniqueCategories)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedCategory('')
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, minPrice, maxPrice, selectedCategory])

  return (
    <div className="app">
      <header>
        <h1>🛍️ Product Search</h1>
        <p className="subtitle">Powered by RESTHeart Cloud</p>
      </header>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="search">Search by name:</label>
          <input
            id="search"
            type="text"
            placeholder="Enter product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="minPrice">Min Price:</label>
            <input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="maxPrice">Max Price:</label>
            <input
              id="maxPrice"
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={resetFilters} className="reset-btn">
          Reset Filters
        </button>
      </div>

      {loading && <div className="loading">Loading products...</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="no-results">
          No products found. Try adjusting your filters.
        </div>
      )}
      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <h3>{product.name}</h3>
              <p className="price">${product.price?.toFixed(2)}</p>
              <p className="category">{product.category}</p>
              <p className="description">{product.description}</p>
              {product.features && (
                <div className="features">
                  {product.features.map((feature) => (
                    <span key={feature} className="feature">
                      {feature}
                    </span>
                  ))}
                </div>
              )}
              <p className={`stock ${!product.inStock ? 'out-of-stock' : ''}`}>
                {product.inStock
                  ? `In Stock (${product.quantity})`
                  : 'Out of Stock'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
