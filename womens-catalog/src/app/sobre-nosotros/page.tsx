"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function SobreNosotrosPage() {
  const [year, setYear] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

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
              <Link href="/sobre-nosotros" className="text-accent font-medium text-sm uppercase tracking-wide transition-colors">
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
      <div className="flex-1 flex items-center px-4 py-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Logo Section - Half Page */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <Image
                src="/ROPERO_DE_LAU_big.jpg"
                alt="El Ropero De Lau"
                width={500}
                height={200}
                className="h-80 w-auto object-contain shadow-2xl rounded-xl"
                priority
              />
            </div>
          </div>

          {/* Content Section - Half Page */}
          <div className="text-left max-w-lg">
            <h1 className="text-4xl font-bold text-primary mb-8">Sobre Nosotros</h1>
            <div className="text-xl text-secondary leading-relaxed space-y-6">
              <p>
                En El Ropero de Lau creemos que cada prenda tiene mucho que contar. Todas nuestras piezas vienen del armario de una sola mujer y están en excelente estado, listas para vivir nuevas aventuras contigo.
              </p>
              <p>
                Al darles una segunda vida, ayudamos juntos a cuidar el planeta y apoyar la economía circular. Aquí encontrarás moda bonita, accesible y con historia, para que te sientas bien por dentro y por fuera.
              </p>
            </div>
            
            {/* Back to Home */}
            <Link 
              href="/" 
              className="inline-block mt-8 text-accent hover:text-accent-dark underline font-medium transition-colors text-lg"
            >
              Volver al catálogo
            </Link>
          </div>
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