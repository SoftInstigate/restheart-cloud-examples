import { Component, signal, computed, effect, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";

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
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  private http = inject(HttpClient);

  restHeartUrl = environment.restHeartUrl;

  // Signals for reactive state management
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal("");
  minPrice = signal("");
  maxPrice = signal("");
  selectedCategory = signal("");

  // Computed signal for unique categories
  categories = computed(() => {
    const uniqueCategories = [
      ...new Set(
        this.products()
          .map((p) => p.category)
          .filter(Boolean),
      ),
    ];
    return uniqueCategories;
  });

  private debounceTimeout: number | null = null;

  constructor() {
    // Effect to fetch products whenever filter signals change with debounce
    effect(
      () => {
        // Read all filter signals to track dependencies
        const search = this.searchTerm();
        const min = this.minPrice();
        const max = this.maxPrice();
        const category = this.selectedCategory();

        // Clear previous timeout
        if (this.debounceTimeout !== null) {
          clearTimeout(this.debounceTimeout);
        }

        // Debounce the fetch with 300ms delay
        this.debounceTimeout = setTimeout(() => {
          this.fetchProducts();
        }, 300) as any;
      },
      { allowSignalWrites: true },
    );
  }

  fetchProducts() {
    this.loading.set(true);
    this.error.set(null);

    let filterObj: any = {};

    const search = this.searchTerm();
    const min = this.minPrice();
    const max = this.maxPrice();
    const category = this.selectedCategory();

    if (search) {
      filterObj.name = { $regex: search, $options: "i" };
    }

    if (min || max) {
      filterObj.price = {};
      if (min) filterObj.price.$gte = parseFloat(min);
      if (max) filterObj.price.$lte = parseFloat(max);
    }

    if (category) {
      filterObj.category = category;
    }

    const filter =
      Object.keys(filterObj).length > 0
        ? `?filter=${encodeURIComponent(JSON.stringify(filterObj))}&sort={"price":1}`
        : '?sort={"price":1}';

    this.http
      .get<Product[]>(`${this.restHeartUrl}/products${filter}`)
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
          console.error("Error fetching products:", err);
          this.loading.set(false);
        },
      });
  }

  resetFilters() {
    this.searchTerm.set("");
    this.minPrice.set("");
    this.maxPrice.set("");
    this.selectedCategory.set("");
    // The effect will automatically trigger fetchProducts
  }
}
