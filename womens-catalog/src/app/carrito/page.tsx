"use client";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  const formatPrice = (price: string) => {
    const priceNumber = Number((price || "").replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.'));
    return isNaN(priceNumber)
      ? price
      : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(priceNumber);
  };

  // Quantities are fixed to 1 for unique items; no changes allowed

  const handleRemoveItem = (id: string) => {
    // Unreserve on remove
    fetch('/api/products/unreserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const handleClearCart = () => {
    // Unreserve all items
    state.items.forEach(item => {
      fetch('/api/products/unreserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      }).catch(() => {});
    });
    dispatch({ type: 'CLEAR_CART' });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-cream font-sans flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <h1 className="text-xl font-bold text-primary">El Ropero De Lau</h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Inicio
                </Link>
                <Link href="/#about" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Sobre Nosotros
                </Link>
                <Link href="/carrito" className="text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Carrito (0)
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Empty Cart */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-primary mb-4">Tu carrito está vacío</h1>
            <p className="text-neutral-600 mb-8">Agrega algunos productos para comenzar tu compra</p>
            <Link 
              href="/" 
              className="inline-block bg-accent hover:bg-accent-dark text-white py-3 px-8 rounded-lg font-semibold transition-all duration-300 hover:shadow-md"
            >
              Ver catálogo
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-neutral-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-neutral-500 text-sm">© {year} El Ropero De Lau. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-primary">El Ropero De Lau</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                Inicio
              </Link>
              <Link href="/#about" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                Sobre Nosotros
              </Link>
              <Link href="/carrito" className="text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                Carrito ({state.totalItems})
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Carrito de Compras</h1>
            <button
              onClick={handleClearCart}
              className="text-error hover:text-error/80 font-medium text-sm underline"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            {state.items.map((item) => (
              <div key={item.id} className="flex items-center p-6 border-b border-neutral-200 last:border-b-0">
                <div className="w-20 h-20 relative flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 ml-4">
                  <h3 className="text-lg font-semibold text-primary mb-1">{item.name}</h3>
                  {item.size && (
                    <p className="text-sm text-neutral-600 mb-1">Talla: {item.size}</p>
                  )}
                  <p className="text-accent font-semibold">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-sm text-neutral-600">Cantidad: 1</div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-error hover:text-error/80 p-2 transition-colors"
                    title="Eliminar del carrito"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-primary">Total ({state.totalItems} {state.totalItems === 1 ? 'artículo' : 'artículos'}):</span>
              <span className="text-2xl font-bold text-accent">
                {formatPrice(state.totalPrice.toString())}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/" 
                className="flex-1 text-center bg-neutral-200 hover:bg-neutral-300 text-neutral-700 py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Continuar comprando
              </Link>
              <Link 
                href="/checkout" 
                className="flex-1 text-center bg-accent hover:bg-accent-dark text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-md"
              >
                Proceder al pago
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-neutral-500 text-sm">© {year} El Ropero De Lau. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
