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
  status?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_country: string;
  customer_postal_code?: string;
  items: Array<{
    id: string;
    name: string;
    price: string;
    image: string;
    size?: string;
    quantity: number;
  }>;
  total_items: number;
  total_price: number;
  status: string;
  payment_status: string;
  shipping_status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

const ADMIN_PASSWORD = "AdminRopero2025!*"; // Updated admin password
const BUCKET = "product-images"; // Make sure this bucket exists in Supabase Storage

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState({ name: "", price: "$", size: "", images: [] as string[] });
  const [editId, setEditId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      console.error('Orders fetch error:', error);
      // Don't set error for missing table, just return empty array
      if (error.code === 'PGRST116' || error.message.includes('relation "orders" does not exist')) {
        return [];
      }
      setError("Failed to fetch orders");
      return [];
    }
    setError("");
    return (data || []) as Order[];
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("admin-auth") === "true";
      setAuthenticated(isAuth);
    }
    const load = async () => {
      const products = await fetchProducts();
      const orders = await fetchOrders();
      setProducts(products);
      setOrders(orders);
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

  // Order management functions
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (!error) {
      // If marking as incomplete, restore product visibility
      if (newStatus === 'cancelled') {
        const currentOrder = orders.find(o => o.id === orderId);
        if (currentOrder) {
          const productIds = currentOrder.items.map((item) => item.id);
          await supabase
            .from('products')
            .update({ status: 'available' })
            .in('id', productIds);
        }
      }
      
      const updatedOrders = await fetchOrders();
      setOrders(updatedOrders);
    } else {
      setError("Failed to update order status");
    }
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <p className="text-secondary">Gestiona los productos y órdenes de El Ropero De Lau</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'products'
                ? 'bg-accent text-white'
                : 'text-neutral-600 hover:text-primary'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-accent text-white'
                : 'text-neutral-600 hover:text-primary'
            }`}
          >
            Órdenes ({orders.length})
          </button>
        </div>
      </div>
      {activeTab === 'products' && (
        <>
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
        </>
      )}

      {activeTab === 'orders' && (
        <div className="w-full max-w-6xl">
          {loading ? (
            <div className="text-center py-8 text-neutral-500">Cargando órdenes...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-500 mb-4">No hay órdenes aún</div>
              <div className="text-sm text-neutral-400">
                Las órdenes aparecerán aquí cuando los clientes realicen compras
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Orden #{order.order_number}</h3>
                      <p className="text-sm text-neutral-600">
                        {new Date(order.created_at).toLocaleDateString('es-AR')} - {order.customer_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="text-accent hover:text-accent-dark text-sm font-medium"
                      >
                        {selectedOrder?.id === order.id ? 'Ocultar' : 'Ver detalles'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-neutral-600">Total</p>
                      <p className="font-semibold text-accent">{formatPrice(order.total_price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Artículos</p>
                      <p className="font-semibold">{order.total_items}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Email</p>
                      <p className="font-semibold text-sm">{order.customer_email}</p>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="border-t border-neutral-200 pt-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-primary mb-3">Información del Cliente</h4>
                          <div className="space-y-2 text-sm">
                            <p><strong>Nombre:</strong> {order.customer_name}</p>
                            <p><strong>Email:</strong> {order.customer_email}</p>
                            <p><strong>Teléfono:</strong> {order.customer_mobile}</p>
                            <p><strong>Dirección:</strong> {order.customer_address}</p>
                            <p><strong>Ciudad:</strong> {order.customer_city}</p>
                            <p><strong>País:</strong> {order.customer_country}</p>
                            {order.customer_postal_code && (
                              <p><strong>Código Postal:</strong> {order.customer_postal_code}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-primary mb-3">Artículos</h4>
                          <div className="space-y-3">
                            {order.items.map((item, index: number) => (
                              <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{item.name}</p>
                                  {item.size && <p className="text-xs text-neutral-600">Talla: {item.size}</p>}
                                  <p className="text-xs text-neutral-600">Cantidad: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-accent">
                                  {formatPrice(Number((item.price || "").replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.')) * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'paid')}
                          disabled={loading || order.status === 'paid'}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Marcar como Pagado
                        </button>
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'shipped')}
                          disabled={loading || order.status === 'shipped'}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Marcar como Enviado
                        </button>
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'completed')}
                          disabled={loading || order.status === 'completed'}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Marcar como Completado
                        </button>
                        <button
                          onClick={() => handleOrderStatusUpdate(order.id, 'cancelled')}
                          disabled={loading || order.status === 'cancelled'}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancelar Orden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}