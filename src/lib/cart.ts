import { Product } from './database.types'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedVariant?: string
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  updatedAt: Date
}

// Cart utilities
export class CartManager {
  private static STORAGE_KEY = 'eticaret_cart'

  // Get cart from localStorage
  static getCart(): Cart {
    if (typeof window === 'undefined') {
      return this.createEmptyCart()
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return this.createEmptyCart()
      }

      const parsed = JSON.parse(stored)
      return {
        ...parsed,
        updatedAt: new Date(parsed.updatedAt),
        items: parsed.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      return this.createEmptyCart()
    }
  }

  // Save cart to localStorage
  static saveCart(cart: Cart): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  // Create empty cart
  static createEmptyCart(): Cart {
    return {
      items: [],
      totalItems: 0,
      totalAmount: 0,
      updatedAt: new Date()
    }
  }

  // Add item to cart
  static addItem(cart: Cart, product: Product, quantity: number = 1, variant?: string): Cart {
    const existingItemIndex = cart.items.findIndex(
      item => item.product.id === product.id && item.selectedVariant === variant
    )

    let newItems: CartItem[]

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      newItems = cart.items.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `${product.id}-${variant || 'default'}-${Date.now()}`,
        product,
        quantity,
        selectedVariant: variant,
        addedAt: new Date()
      }
      newItems = [...cart.items, newItem]
    }

    return this.calculateTotals({
      ...cart,
      items: newItems,
      updatedAt: new Date()
    })
  }

  // Remove item from cart
  static removeItem(cart: Cart, itemId: string): Cart {
    const newItems = cart.items.filter(item => item.id !== itemId)
    
    return this.calculateTotals({
      ...cart,
      items: newItems,
      updatedAt: new Date()
    })
  }

  // Update item quantity
  static updateQuantity(cart: Cart, itemId: string, quantity: number): Cart {
    if (quantity <= 0) {
      return this.removeItem(cart, itemId)
    }

    const newItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    )

    return this.calculateTotals({
      ...cart,
      items: newItems,
      updatedAt: new Date()
    })
  }

  // Clear cart
  static clearCart(): Cart {
    const emptyCart = this.createEmptyCart()
    this.saveCart(emptyCart)
    return emptyCart
  }

  // Calculate totals
  static calculateTotals(cart: Cart): Cart {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    
    const totalAmount = cart.items.reduce((sum, item) => {
      const price = item.product.is_campaign && item.product.campaign_price 
        ? item.product.campaign_price 
        : item.product.price
      return sum + (price * item.quantity)
    }, 0)

    return {
      ...cart,
      totalItems,
      totalAmount: Math.round(totalAmount * 100) / 100 // Round to 2 decimal places
    }
  }

  // Get formatted price
  static formatPrice(amount: number): string {
    return `₺${amount.toFixed(2)}`
  }

  // Check if product is in cart
  static isInCart(cart: Cart, productId: string, variant?: string): boolean {
    return cart.items.some(
      item => item.product.id === productId && item.selectedVariant === variant
    )
  }

  // Get item quantity in cart
  static getItemQuantity(cart: Cart, productId: string, variant?: string): number {
    const item = cart.items.find(
      item => item.product.id === productId && item.selectedVariant === variant
    )
    return item ? item.quantity : 0
  }
} 