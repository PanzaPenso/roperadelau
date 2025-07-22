"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from '@/utils/supabaseClient';
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  created_at?: string;
  images?: string[]; // Added images array
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState("");
  // Track current image index for each product
  const [carouselIndexes, setCarouselIndexes] = useState<{ [id: string]: number }>({});

  const handlePrev = (id: string, images: string[]) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : images.length - 1,
    }));
  };

  const handleNext = (id: string, images: string[]) => {
    setCarouselIndexes((prev) => ({
      ...prev,
      [id]: prev[id] < images.length - 1 ? prev[id] + 1 : 0,
    }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setLoading(false);
      if (error) {
        setError("Failed to load products");
        setProducts([]);
      } else {
        setError("");
        setProducts(data as Product[]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center px-4 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">El Ropero De Lau</h1>
        <p className="text-lg text-gray-600">Descubre nuestra última colección</p>
      </header>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <main className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => {
            const images = product.images ?? [];
            return (
              <Link key={product.id} href={`/product/${product.id}`} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition">
                <div className="w-full h-64 relative mb-4 flex flex-col items-center">
                  {images.length > 0 && (
                    <>
                      <Image
                        src={images[carouselIndexes[product.id] || 0]}
                        alt={product.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                      {images.length > 1 && (
                        <div className="absolute bottom-2 left-0 right-0 flex justify-between px-2 z-10">
                          <button
                            type="button"
                            className="bg-white/80 rounded-full px-2 py-1 text-gray-700 hover:bg-pink-200"
                            onClick={e => { e.preventDefault(); handlePrev(product.id, images); }}
                          >
                            &#8592;
                          </button>
                          <button
                            type="button"
                            className="bg-white/80 rounded-full px-2 py-1 text-gray-700 hover:bg-pink-200"
                            onClick={e => { e.preventDefault(); handleNext(product.id, images); }}
                          >
                            &#8594;
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{product.name}</h2>
                <span className="text-pink-600 font-bold text-lg">{product.price}</span>
              </Link>
            );
          })}
        </main>
      )}
      <footer className="mt-16 text-gray-400 text-sm">
        @ El Ropero De Lau
      </footer>
    </div>
  );
}
