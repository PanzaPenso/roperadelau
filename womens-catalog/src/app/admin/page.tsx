"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from '@/utils/supabaseClient';
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: string;
  size: string;
  images: string[];
  created_at?: string;
}

const ADMIN_PASSWORD = "AdminRopero2025!*"; // Updated admin password
const BUCKET = "product-images"; // Make sure this bucket exists in Supabase Storage

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "$", size: "", images: [] as string[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError("Failed to fetch products");
      return [];
    }
    setError("");
    return data as Product[];
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("admin-auth") === "true";
      setAuthenticated(isAuth);
    }
    const load = async () => {
      const products = await fetchProducts();
      setProducts(products);
    };
    load();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem("admin-auth", "true");
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("admin-auth");
    setPassword("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "price") {
      // Always keep $ at the start
      setForm({ ...form, price: value.startsWith("$") ? value : "$" + value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleDeleteImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${i}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, { upsert: true });
      if (error) {
        setUploadError("Failed to upload image: " + error.message);
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      uploadedUrls.push(publicUrlData.publicUrl);
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || form.images.length === 0) return;
    setLoading(true);
    const { error } = await supabase.from('products').insert([{ ...form, images: form.images }]);
    setLoading(false);
    if (!error) {
      setForm({ name: "", price: "$", size: "", images: [] });
      if (fileInputRef.current) fileInputRef.current.value = "";
      const products = await fetchProducts();
      setProducts(products);
    } else {
      setError("Failed to add product: " + error.message);
      console.error('Supabase insert error:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      price: product.price.startsWith("$") ? product.price : "$" + product.price,
      size: product.size || "",
      images: product.images || [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId === null) return;
    setLoading(true);
    const { error } = await supabase.from('products').update({ ...form, images: form.images }).eq('id', editId);
    setLoading(false);
    if (!error) {
      setEditId(null);
      setForm({ name: "", price: "$", size: "", images: [] });
      if (fileInputRef.current) fileInputRef.current.value = "";
      const products = await fetchProducts();
      setProducts(products);
    } else {
      setError("Failed to update product: " + error.message);
      console.error('Supabase update error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await supabase.from('products').delete().eq('id', id);
    setLoading(false);
    const products = await fetchProducts();
    setProducts(products);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream font-sans px-4 py-8">
        <div className="text-center mb-8">
          <Image
            src="/ROPERO_DE_LAU_mid.jpg"
            alt="El Ropero De Lau"
            width={200}
            height={80}
            className="mx-auto h-16 w-auto object-contain mb-4"
          />
          <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
        </div>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-xs bg-white rounded-lg shadow-lg p-6 border border-neutral-200"
        >
          <h2 className="text-xl font-bold mb-4 text-primary text-center">Admin Login</h2>
          <input
            type="password"
            className="w-full mb-3 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className="text-error mb-2 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-dark text-white py-2 rounded font-semibold transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-cream font-sans px-4 py-8">
      <div className="w-full max-w-3xl flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-4 py-2 rounded font-semibold transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="text-center mb-6">
        <Image
          src="/ROPERO_DE_LAU_mid.jpg"
          alt="El Ropero De Lau"
          width={200}
          height={80}
          className="mx-auto h-16 w-auto object-contain mb-4"
        />
        <h1 className="text-3xl font-bold mb-2 text-primary">Admin Dashboard</h1>
        <p className="text-secondary">Gestiona los productos de El Ropero De Lau</p>
      </div>
      <form
        onSubmit={editId === null ? handleAdd : handleUpdate}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mb-8 border border-neutral-200"
      >
        <h2 className="text-xl font-semibold mb-4 text-primary">
          {editId === null ? "Add New Product" : "Edit Product"}
        </h2>
        <input
          className="w-full mb-3 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          name="size"
          placeholder="Size (e.g. S, M, L, XL)"
          value={form.size}
          onChange={handleChange}
        />
        <input
          className="w-full mb-4 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          name="price"
          placeholder="Price (e.g. $49.99)"
          value={form.price}
          onChange={handleChange}
        />
        <div className="mb-3">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
            multiple
          />
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <Image src={img} alt={`Preview ${idx + 1}`} width={80} height={80} className="w-20 h-20 object-cover rounded" />
                  {editId !== null && (
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-error text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 group-hover:opacity-100"
                      onClick={() => handleDeleteImage(idx)}
                      style={{ transform: 'translate(40%,-40%)' }}
                    >
                      &#128465;
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {uploadError && <div className="text-error mt-2 text-sm">{uploadError}</div>}
        </div>
        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent-dark text-white py-2 rounded font-semibold transition-colors"
          disabled={loading || uploading}
        >
          {editId === null ? (loading ? "Adding..." : "Add Product") : (loading ? "Updating..." : "Update Product")}
        </button>
        {editId !== null && (
          <button
            type="button"
            className="w-full mt-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 py-2 rounded font-semibold transition-colors"
            onClick={() => {
              setEditId(null);
              setForm({ name: "", price: "$", size: "", images: [] });
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            disabled={loading || uploading}
          >
            Cancel
          </button>
        )}
      </form>
      {error && <div className="text-error mb-4 text-sm">{error}</div>}
      <div className="w-full max-w-3xl">
        {loading ? (
          <div className="text-center py-8 text-neutral-500">Loading...</div>
        ) : (
          <table className="w-full table-auto border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-neutral-100">
                <th className="p-2 text-left text-primary">Image</th>
                <th className="p-2 text-left text-primary">Name</th>
                <th className="p-2 text-left text-primary">Size</th>
                <th className="p-2 text-left text-primary">Price</th>
                <th className="p-2 text-left text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const images = product.images ?? [];
                return (
                  <tr key={product.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                    <td className="p-2">
                      <Image
                        src={images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-2 text-primary">{product.name}</td>
                    <td className="p-2 text-secondary">{product.size}</td>
                    <td className="p-2 text-accent font-semibold">{product.price.startsWith("$") ? product.price : "$" + product.price}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-accent hover:bg-accent-dark text-white px-3 py-1 rounded text-sm transition-colors"
                        onClick={() => handleEdit(product)}
                        disabled={loading || uploading}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-error hover:bg-error/80 text-white px-3 py-1 rounded text-sm transition-colors"
                        onClick={() => handleDelete(product.id)}
                        disabled={loading || uploading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 