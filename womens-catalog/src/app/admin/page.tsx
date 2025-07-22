"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from '@/utils/supabaseClient';

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
      console.log('Supabase insert error:', error);
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
      console.log('Supabase update error:', error);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans px-4 py-8">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-xs bg-gray-50 rounded-lg shadow p-6"
        >
          <h1 className="text-2xl font-bold mb-4 text-gray-900 text-center">Admin Login</h1>
          <input
            type="password"
            className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white font-sans px-4 py-8">
      <div className="w-full max-w-3xl flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-400 transition"
        >
          Logout
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>
      <form
        onSubmit={editId === null ? handleAdd : handleUpdate}
        className="w-full max-w-md bg-gray-50 rounded-lg shadow p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editId === null ? "Add New Product" : "Edit Product"}
        </h2>
        <input
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring"
          name="size"
          placeholder="Size (e.g. S, M, L, XL)"
          value={form.size}
          onChange={handleChange}
        />
        <input
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring"
          name="price"
          placeholder="Price (e.g. $49.99)"
          value={form.price}
          onChange={handleChange}
        />
        <div className="mb-3">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block bg-pink-600 text-white px-4 py-2 rounded font-semibold hover:bg-pink-700 transition"
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
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                  {editId !== null && (
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 group-hover:opacity-100"
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
          {uploadError && <div className="text-red-500 mt-2 text-sm">{uploadError}</div>}
        </div>
        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition"
          disabled={loading || uploading}
        >
          {editId === null ? (loading ? "Adding..." : "Add Product") : (loading ? "Updating..." : "Update Product")}
        </button>
        {editId !== null && (
          <button
            type="button"
            className="w-full mt-2 bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400 transition"
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
      {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
      <div className="w-full max-w-3xl">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Size</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const images = product.images ?? [];
                return (
                  <tr key={product.id} className="border-b">
                    <td className="p-2">
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.size}</td>
                    <td className="p-2">{product.price.startsWith("$") ? product.price : "$" + product.price}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                        onClick={() => handleEdit(product)}
                        disabled={loading || uploading}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
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