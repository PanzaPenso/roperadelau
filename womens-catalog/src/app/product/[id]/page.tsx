"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from '@/utils/supabaseClient';
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  created_at?: string;
  images?: string[]; // Added images to the interface
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [currentImg, setCurrentImg] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [year, setYear] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      setLoading(false);
      if (error || !data) {
        setError("Product not found");
        setProduct(null);
      } else {
        setError("");
        setProduct(data as Product);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.created_at) {
      setFormattedDate(new Date(product.created_at).toLocaleDateString());
    }
  }, [product]);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <h1 className="text-xl font-bold text-primary">Bienvenidos al ropera de Lau</h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Inicio
                </Link>
                <Link href="/#about" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Sobre Nosotros
                </Link>
                <Link href="#" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Carrito (0)
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-neutral-500">Cargando...</div>
        </div>
        <footer className="bg-white border-t border-neutral-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-8">
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="text-center">
              <p className="text-neutral-500 text-sm">© {year} El Ropero De Lau. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <h1 className="text-xl font-bold text-primary">Bienvenidos al ropera de Lau</h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Inicio
                </Link>
                <Link href="/#about" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Sobre Nosotros
                </Link>
                <Link href="#" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                  Carrito (0)
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-error mb-4">{error || "Producto no encontrado"}</div>
          <Link href="/" className="text-accent underline">Volver al catálogo</Link>
        </div>
        <footer className="bg-white border-t border-neutral-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-8">
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary hover:text-accent transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="text-center">
              <p className="text-neutral-500 text-sm">© {year} El Ropero De Lau. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const images = product.images ?? [];

  // Helper to parse suggestions: each numbered line is its own suggestion
  function parseNumberedSuggestions(text: string): string[][] {
    return text
      .split(/\n/)
      .map(s => s.trim())
      .filter(line => /^\d+\./.test(line))
      .map(line => [line]); // Each as its own array for accordion compatibility
  }

  return (
    <div className="min-h-screen bg-cream font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Text */}
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-primary">Bienvenidos al ropero de Lau</h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                Inicio
              </Link>
              <Link href="/sobre-nosotros" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                Sobre Nosotros
              </Link>
              <Link href="#" className="text-primary hover:text-accent font-medium text-sm uppercase tracking-wide transition-colors">
                Carrito (0)
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-primary hover:text-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8 flex flex-col items-center border border-neutral-200">
          <div className="w-full h-96 relative mb-6 flex flex-col items-center">
            {images.length > 0 && (
              <>
                <Image
                  src={images[currentImg]}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2 z-10">
                    <button
                      type="button"
                      className="bg-white/90 rounded-full px-2 py-1 text-neutral-700 hover:bg-accent hover:text-white transition-colors"
                      onClick={() => setCurrentImg(currentImg > 0 ? currentImg - 1 : images.length - 1)}
                    >
                      &#8592;
                    </button>
                    <button
                      type="button"
                      className="bg-white/90 rounded-full px-2 py-1 text-neutral-700 hover:bg-accent hover:text-white transition-colors"
                      onClick={() => setCurrentImg(currentImg < images.length - 1 ? currentImg + 1 : 0)}
                    >
                      &#8594;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mb-4">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${currentImg === idx ? 'border-accent' : 'border-transparent'}`}
                  onClick={() => setCurrentImg(idx)}
                />
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold text-primary mb-2">{product.name}</h1>
          <span className="text-accent font-bold text-2xl mb-4">{product.price}</span>
          {formattedDate && <div className="text-neutral-400 text-sm mb-4">Agregado: {formattedDate}</div>}
          <Link href="/" className="mt-4 text-accent underline">Volver al catálogo</Link>
          {/* AI Outfit Suggestion Section */}
          <button
            className="mt-6 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded hover:shadow-md transition-all duration-300"
            disabled={aiLoading}
            onClick={async () => {
              setAiLoading(true);
              setAiError("");
              setAiSuggestion("");
              try {
                const res = await fetch("/api/outfit-suggestion", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productName: product.name,
                    productType: "", // Optionally add type if available
                    productColor: "", // Optionally add color if available
                    productDescription: "", // Optionally add description if available
                    productImageUrl: (images && images.length > 0) ? images[0] : product.image,
                  }),
                });
                const data = await res.json();
                if (res.ok) {
                  setAiSuggestion(data.suggestion);
                } else {
                  setAiError(data.error || "No se pudo obtener la sugerencia");
                }
              } catch (err) {
                setAiError("No se pudo obtener la sugerencia");
              } finally {
                setAiLoading(false);
              }
            }}
          >
            {aiLoading ? "Obteniendo ideas de conjuntos..." : "¿Cómo combinar esta prenda?"}
          </button>
          {(aiSuggestion || aiError) && (
            <div className="mt-4 w-full bg-neutral-50 border border-accent/20 rounded p-4 text-neutral-800 min-h-[60px]">
              {aiError ? (
                <span className="text-error">{aiError}</span>
              ) : (
                <div>
                  {parseNumberedSuggestions(aiSuggestion).length > 0 ? (
                    <div>
                      {parseNumberedSuggestions(aiSuggestion).map((group, i) => (
                        <div key={i} className="mb-2 border-b last:border-b-0">
                          <button
                            className="w-full text-left font-semibold py-2 px-2 bg-accent/5 hover:bg-accent/10 rounded transition flex justify-between items-center"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            aria-expanded={openIndex === i}
                          >
                            {`Opción ${i + 1}`}
                            <span>{openIndex === i ? '▲' : '▼'}</span>
                          </button>
                          {openIndex === i && (
                            <div className="py-2 px-2 text-neutral-700 animate-fade-in">
                              {group[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span>{aiSuggestion}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Social Media Icons */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              {/* Facebook */}
              <a href="#" className="text-primary hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="text-primary hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.25.75a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
              </a>
              {/* Pinterest */}
              <a href="#" className="text-primary hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-neutral-500 text-sm">© {year} El Ropero De Lau. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 