"use client";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface CustomerInfo {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  country: string;
  address: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: "",
    email: "",
    mobile: "",
    city: "",
    country: "",
    address: "",
    postalCode: "",
  });
  const [year, setYear] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  const formatPrice = (price: string) => {
    const priceNumber = Number((price || "").replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.'));
    return isNaN(priceNumber)
      ? price
      : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(priceNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerInfo,
          items: state.items,
          totalPrice: state.totalPrice,
          totalItems: state.totalItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar la orden');
      }

      setSubmitSuccess(true);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al procesar la orden');
    } finally {
      setIsSubmitting(false);
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

        {/* Empty Cart Redirect */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-primary mb-4">Tu carrito está vacío</h1>
            <p className="text-neutral-600 mb-8">Agrega algunos productos para proceder al pago</p>
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

  if (submitSuccess) {
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

        {/* Success Message */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-primary mb-4">¡Orden enviada con éxito!</h1>
            <p className="text-neutral-600 mb-8">
              Hemos recibido tu pedido y te enviaremos un email con todos los detalles. 
              Te contactaremos pronto para coordinar el pago y envío.
            </p>
            <Link 
              href="/" 
              className="inline-block bg-accent hover:bg-accent-dark text-white py-3 px-8 rounded-lg font-semibold transition-all duration-300 hover:shadow-md"
            >
              Volver al catálogo
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">Finalizar Compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information Form */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Información de Contacto</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={customerInfo.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-primary mb-2">
                    Teléfono móvil *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={customerInfo.mobile}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-primary mb-2">
                    Dirección *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Calle, número, piso, departamento"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-primary mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={customerInfo.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Buenos Aires"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-primary mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={customerInfo.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="1234"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-primary mb-2">
                    País *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={customerInfo.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Argentina"
                  />
                </div>

                {submitError && (
                  <div className="text-error text-sm bg-error/10 p-3 rounded-lg">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent-dark text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Pedido"}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-primary">{item.name}</h3>
                      {item.size && (
                        <p className="text-sm text-neutral-600">Talla: {item.size}</p>
                      )}
                      <p className="text-sm text-neutral-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-primary">
                    Total ({state.totalItems} {state.totalItems === 1 ? 'artículo' : 'artículos'}):
                  </span>
                  <span className="text-2xl font-bold text-accent">
                    {formatPrice(state.totalPrice.toString())}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">
                  * Te contactaremos para coordinar el pago y envío
                </p>
              </div>

              <div className="mt-6">
                <Link 
                  href="/carrito" 
                  className="text-accent hover:text-accent-dark underline text-sm"
                >
                  ← Volver al carrito
                </Link>
              </div>
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
