import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  features?: string[];
  inStock: boolean;
  quantity: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  restHeartUrl = environment.restHeartUrl;
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  minPrice = '';
  maxPrice = '';
  selectedCategory = '';
  categories: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading = true;
    this.error = null;

    let filterObj: any = {};

    if (this.searchTerm) {
      filterObj.name = { $regex: this.searchTerm, $options: 'i' };
    }

    if (this.minPrice || this.maxPrice) {
      filterObj.price = {};
      if (this.minPrice) filterObj.price.$gte = parseFloat(this.minPrice);
      if (this.maxPrice) filterObj.price.$lte = parseFloat(this.maxPrice);
    }

    if (this.selectedCategory) {
      filterObj.category = this.selectedCategory;
    }

    const filter =
      Object.keys(filterObj).length > 0
        ? `?filter=${encodeURIComponent(JSON.stringify(filterObj))}&sort={"price":1}`
        : '?sort={"price":1}';

    this.http.get<Product[]>(`${this.restHeartUrl}/products${filter}`).subscribe({
      next: (data) => {
        this.products = data;
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((p) => p.category).filter(Boolean))];
        this.categories = uniqueCategories;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        console.error('Error fetching products:', err);
        this.loading = false;
      }
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.selectedCategory = '';
    this.fetchProducts();
  }
}
