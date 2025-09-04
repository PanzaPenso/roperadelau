import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    // Check current status
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.status && product.status !== 'available') {
      return NextResponse.json({ error: 'Product not available' }, { status: 409 });
    }

    // Auto-expire reservation after 20 minutes
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000).toISOString();

    // Try to reserve by setting status to 'reserved'
    const { error: updateError } = await supabase
      .from('products')
      .update({ status: 'reserved', reserved_at: new Date().toISOString(), reservation_expires_at: expiresAt })
      .eq('id', id)
      .or('status.eq.available,reservation_expires_at.lt.' + new Date().toISOString());

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


