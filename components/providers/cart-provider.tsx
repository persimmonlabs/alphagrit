'use client'

import * as React from 'react'
import { toast } from 'react-hot-toast'
import { Product } from '@/lib/actions/products'

export interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  currency: 'BRL' | 'USD'
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CURRENCY'; payload: 'BRL' | 'USD' }
  | { type: 'LOAD_CART'; payload: CartState }

interface CartContextType extends CartState {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setCurrency: (currency: 'BRL' | 'USD') => void
  totalItems: number
  subtotal: number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

const initialState: CartState = {
  items: [],
  currency: 'BRL',
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      
      if (existingItem) {
        // For ebooks, we limit quantity to 1 usually, but let's allow updates if needed
        // or just show toast that it's already in cart
        toast.error('Product already in cart')
        return state
      }

      toast.success('Added to cart')
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
      }
    }
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    }
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      }
    }
    case 'SET_CURRENCY': {
      return {
        ...state,
        currency: action.payload,
      }
    }
    case 'LOAD_CART': {
      return action.payload
    }
    default:
      return state
  }
}

const CART_STORAGE_KEY = 'alphagrit-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(cartReducer, initialState)

  // Load from local storage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsed })
      } catch (error) {
        console.error('Failed to parse cart from local storage', error)
      }
    }
  }, [])

  // Save to local storage on change
  React.useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const addItem = React.useCallback((product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }, [])

  const removeItem = React.useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId })
    toast.success('Removed from cart')
  }, [])

  const clearCart = React.useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const setCurrency = React.useCallback((currency: 'BRL' | 'USD') => {
    dispatch({ type: 'SET_CURRENCY', payload: currency })
  }, [])

  const totalItems = React.useMemo(() => {
    return state.items.reduce((acc, item) => acc + item.quantity, 0)
  }, [state.items])

  const subtotal = React.useMemo(() => {
    return state.items.reduce((acc, item) => {
      const price = state.currency === 'BRL' ? item.price_brl : item.price_usd
      return acc + price * item.quantity
    }, 0)
  }, [state.items, state.currency])

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        clearCart,
        setCurrency,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
