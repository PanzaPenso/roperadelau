import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';
import { sendOrderEmails } from '@/utils/emailService';

export const runtime = 'nodejs';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: string;
  size?: string;
  quantity: number;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  country: string;
  address: string;
  postalCode: string;
}

interface OrderRequest {
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalPrice: number;
  totalItems: number;
}

export async function POST(req: NextRequest) {
  try {
    const { customerInfo, items, totalPrice, totalItems }: OrderRequest = await req.json();

    // Validate required fields
    if (!customerInfo || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Información de cliente e items son requeridos' },
        { status: 400 }
      );
    }

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return NextResponse.json(
        { error: 'Error generando número de orden' },
        { status: 500 }
      );
    }

    const orderNumber = orderNumberData;

    // Create order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customerInfo.fullName,
        customer_email: customerInfo.email,
        customer_mobile: customerInfo.mobile,
        customer_address: customerInfo.address,
        customer_city: customerInfo.city,
        customer_country: customerInfo.country,
        customer_postal_code: customerInfo.postalCode,
        items: items,
        total_items: totalItems,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending',
        shipping_status: 'pending'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Error creando la orden' },
        { status: 500 }
      );
    }

    // Update product status to 'sold' for all items in the order
    const productIds = items.map(item => item.id);
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({ status: 'sold' })
      .in('id', productIds);

    if (productUpdateError) {
      console.error('Error updating product status:', productUpdateError);
      // Don't fail the order creation, just log the error
    }

    // Send emails
    try {
      await sendOrderEmails(orderData, customerInfo, items);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      orderNumber: orderNumber,
      message: 'Orden creada exitosamente'
    });

  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


// GET endpoint to fetch orders (for admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Error obteniendo órdenes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
