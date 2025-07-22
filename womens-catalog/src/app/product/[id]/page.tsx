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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando...</div>;
  }
  if (error || !product) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-500">{error || "Producto no encontrado"}<Link href="/" className="mt-4 text-pink-600 underline">Volver al catálogo</Link></div>;
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
    <div className="min-h-screen flex flex-col items-center bg-white font-sans px-4 py-8">
      <div className="w-full max-w-xl bg-gray-50 rounded-lg shadow p-8 flex flex-col items-center">
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
                    className="bg-white/80 rounded-full px-2 py-1 text-gray-700 hover:bg-pink-200"
                    onClick={() => setCurrentImg(currentImg > 0 ? currentImg - 1 : images.length - 1)}
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    className="bg-white/80 rounded-full px-2 py-1 text-gray-700 hover:bg-pink-200"
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
                className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${currentImg === idx ? 'border-pink-600' : 'border-transparent'}`}
                onClick={() => setCurrentImg(idx)}
              />
            ))}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <span className="text-pink-600 font-bold text-2xl mb-4">{product.price}</span>
        {formattedDate && <div className="text-gray-400 text-sm mb-4">Agregado: {formattedDate}</div>}
        <Link href="/" className="mt-4 text-pink-600 underline">Volver al catálogo</Link>
        {/* AI Outfit Suggestion Section */}
        <button
          className="mt-6 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
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
          <div className="mt-4 w-full bg-gray-100 border border-pink-200 rounded p-4 text-gray-800 min-h-[60px]">
            {aiError ? (
              <span className="text-red-500">{aiError}</span>
            ) : (
              <div>
                {parseNumberedSuggestions(aiSuggestion).length > 0 ? (
                  <div>
                    {parseNumberedSuggestions(aiSuggestion).map((group, i) => (
                      <div key={i} className="mb-2 border-b last:border-b-0">
                        <button
                          className="w-full text-left font-semibold py-2 px-2 bg-pink-50 hover:bg-pink-100 rounded transition flex justify-between items-center"
                          onClick={() => setOpenIndex(openIndex === i ? null : i)}
                          aria-expanded={openIndex === i}
                        >
                          {`Opción ${i + 1}`}
                          <span>{openIndex === i ? '▲' : '▼'}</span>
                        </button>
                        {openIndex === i && (
                          <div className="py-2 px-2 text-gray-700 animate-fade-in">
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
  );
} 