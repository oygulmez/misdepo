'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Product } from '@/lib/database.types'
import { Cart, CartItem, CartManager } from '@/lib/cart'

// Context Types
interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number, variant?: string) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string, variant?: string) => boolean
  getItemQuantity: (productId: string, variant?: string) => number
  formatPrice: (amount: number) => string
}

// Reducer Actions
type CartAction =
  | { type: 'LOAD_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; variant?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }

// Reducer
function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'LOAD_CART':
      return action.payload

    case 'ADD_ITEM':
      const newCart = CartManager.addItem(
        state,
        action.payload.product,
        action.payload.quantity,
        action.payload.variant
      )
      CartManager.saveCart(newCart)
      return newCart

    case 'REMOVE_ITEM':
      const cartAfterRemove = CartManager.removeItem(state, action.payload)
      CartManager.saveCart(cartAfterRemove)
      return cartAfterRemove

    case 'UPDATE_QUANTITY':
      const cartAfterUpdate = CartManager.updateQuantity(
        state,
        action.payload.itemId,
        action.payload.quantity
      )
      CartManager.saveCart(cartAfterUpdate)
      return cartAfterUpdate

    case 'CLEAR_CART':
      const emptyCart = CartManager.clearCart()
      return emptyCart

    default:
      return state
  }
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider Component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, CartManager.createEmptyCart())

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = CartManager.getCart()
    dispatch({ type: 'LOAD_CART', payload: savedCart })
  }, [])

  // Context value
  const contextValue: CartContextType = {
    cart,
    addToCart: (product: Product, quantity = 1, variant?: string) => {
      dispatch({
        type: 'ADD_ITEM',
        payload: { product, quantity, variant }
      })
    },
    removeFromCart: (itemId: string) => {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId })
    },
    updateQuantity: (itemId: string, quantity: number) => {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { itemId, quantity }
      })
    },
    clearCart: () => {
      dispatch({ type: 'CLEAR_CART' })
    },
    isInCart: (productId: string, variant?: string) => {
      return CartManager.isInCart(cart, productId, variant)
    },
    getItemQuantity: (productId: string, variant?: string) => {
      return CartManager.getItemQuantity(cart, productId, variant)
    },
    formatPrice: (amount: number) => {
      return CartManager.formatPrice(amount)
    }
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 