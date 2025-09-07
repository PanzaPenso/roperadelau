import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

interface OrderData {
  id: string;
  order_number: string;
  created_at: string;
  total_price: number;
  total_items: number;
}

export async function sendOrderEmails(
  orderData: OrderData,
  customerInfo: CustomerInfo,
  items: OrderItem[]
): Promise<void> {
  try {
    // Send customer confirmation email
    await sendCustomerEmail(orderData, customerInfo, items);
    
    // Send admin notification email
    await sendAdminEmail(orderData, customerInfo, items);
  } catch (error) {
    console.error('Error sending order emails:', error);
    throw error;
  }
}

async function sendCustomerEmail(
  orderData: OrderData,
  customerInfo: CustomerInfo,
  items: OrderItem[]
): Promise<void> {
  const formattedDate = new Date(orderData.created_at).toLocaleDateString('es-AR');
  const formattedPrice = new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(orderData.total_price);

  const itemsHtml = items.map(item => {
    const itemPrice = new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(Number((item.price || "").replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.')) * item.quantity);

    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${item.name}</h3>
            ${item.size ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Talla: ${item.size}</p>` : ''}
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Cantidad: ${item.quantity}</p>
            <p style="margin: 0; color: #d97706; font-weight: 600; font-size: 16px;">${itemPrice}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Pedido - El Ropero De Lau</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d97706; margin: 0;">El Ropero De Lau</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Prendas con estilo, historia y nuevas oportunidades</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #1f2937; margin: 0 0 16px 0;">¡Gracias por tu pedido!</h2>
        <p style="margin: 0 0 16px 0;">Hola ${customerInfo.fullName},</p>
        <p style="margin: 0 0 16px 0;">Hemos recibido tu pedido y estamos procesándolo. Te contactaremos pronto para coordinar el pago y envío.</p>
        
        <div style="background-color: white; border-radius: 6px; padding: 16px; margin: 16px 0;">
          <h3 style="margin: 0 0 12px 0; color: #1f2937;">Detalles del Pedido</h3>
          <p style="margin: 0 0 8px 0;"><strong>Número de Orden:</strong> ${orderData.order_number}</p>
          <p style="margin: 0 0 8px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Total:</strong> ${formattedPrice}</p>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0;">Artículos Pedidos</h3>
        ${itemsHtml}
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0;">Información de Envío</h3>
        <p style="margin: 0 0 8px 0;"><strong>Nombre:</strong> ${customerInfo.fullName}</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
        <p style="margin: 0 0 8px 0;"><strong>Teléfono:</strong> ${customerInfo.mobile}</p>
        <p style="margin: 0 0 8px 0;"><strong>Dirección:</strong> ${customerInfo.address}</p>
        <p style="margin: 0 0 8px 0;"><strong>Ciudad:</strong> ${customerInfo.city}</p>
        <p style="margin: 0 0 8px 0;"><strong>País:</strong> ${customerInfo.country}</p>
        ${customerInfo.postalCode ? `<p style="margin: 0;"><strong>Código Postal:</strong> ${customerInfo.postalCode}</p>` : ''}
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #92400e; margin: 0 0 8px 0;">Próximos Pasos</h3>
        <p style="margin: 0 0 8px 0; color: #92400e;">1. Te contactaremos en las próximas 24 horas para coordinar el pago</p>
        <p style="margin: 0 0 8px 0; color: #92400e;">2. Una vez confirmado el pago, prepararemos tu pedido</p>
        <p style="margin: 0; color: #92400e;">3. Te enviaremos los datos de envío y seguimiento</p>
      </div>

      <div style="text-align: center; color: #6b7280; font-size: 14px;">
        <p style="margin: 0;">¿Tienes alguna pregunta? Contáctanos</p>
        <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} El Ropero De Lau. Todos los derechos reservados.</p>
      </div>
    </body>
    </html>
  `;

  try {
    console.log('Attempting to send customer email to:', customerInfo.email);
    console.log('Order number:', orderData.order_number);
    
    const result = await resend.emails.send({
      from: 'El Ropero De Lau <onboarding@resend.dev>',
      to: [customerInfo.email],
      subject: `Confirmación de Pedido #${orderData.order_number} - El Ropero De Lau`,
      html: emailHtml,
    });
    
    console.log('Customer email sent successfully:', result);
    if (result.error) {
      console.error('Customer email error:', result.error);
    }
  } catch (error) {
    console.error('Error sending customer email:', error);
    // Fallback to console log if email fails
    console.log('Customer email would be sent:', {
      to: customerInfo.email,
      subject: `Confirmación de Pedido #${orderData.order_number} - El Ropero De Lau`,
      html: emailHtml
    });
  }
}

async function sendAdminEmail(
  orderData: OrderData,
  customerInfo: CustomerInfo,
  items: OrderItem[]
): Promise<void> {
  const formattedDate = new Date(orderData.created_at).toLocaleDateString('es-AR');
  const formattedPrice = new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    maximumFractionDigits: 0 
  }).format(orderData.total_price);

  const itemsHtml = items.map(item => {
    const itemPrice = new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(Number((item.price || "").replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(/,/g, '.')) * item.quantity);

    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${item.name}</h3>
            ${item.size ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Talla: ${item.size}</p>` : ''}
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">Cantidad: ${item.quantity}</p>
            <p style="margin: 0; color: #d97706; font-weight: 600; font-size: 16px;">${itemPrice}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva Orden - El Ropero De Lau</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #d97706; margin: 0;">El Ropero De Lau - Admin</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">Nueva orden recibida</p>
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h2 style="color: #92400e; margin: 0 0 16px 0;">¡Nueva Orden Recibida!</h2>
        <p style="margin: 0; color: #92400e;">Se ha recibido una nueva orden que requiere tu atención.</p>
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0;">Detalles del Pedido</h3>
        <p style="margin: 0 0 8px 0;"><strong>Número de Orden:</strong> ${orderData.order_number}</p>
        <p style="margin: 0 0 8px 0;"><strong>Fecha:</strong> ${formattedDate}</p>
        <p style="margin: 0 0 8px 0;"><strong>Total:</strong> ${formattedPrice}</p>
        <p style="margin: 0;"><strong>ID de Orden:</strong> ${orderData.id}</p>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0;">Artículos Pedidos</h3>
        ${itemsHtml}
      </div>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 16px 0;">Información del Cliente</h3>
        <p style="margin: 0 0 8px 0;"><strong>Nombre:</strong> ${customerInfo.fullName}</p>
        <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${customerInfo.email}</p>
        <p style="margin: 0 0 8px 0;"><strong>Teléfono:</strong> ${customerInfo.mobile}</p>
        <p style="margin: 0 0 8px 0;"><strong>Dirección:</strong> ${customerInfo.address}</p>
        <p style="margin: 0 0 8px 0;"><strong>Ciudad:</strong> ${customerInfo.city}</p>
        <p style="margin: 0 0 8px 0;"><strong>País:</strong> ${customerInfo.country}</p>
        ${customerInfo.postalCode ? `<p style="margin: 0;"><strong>Código Postal:</strong> ${customerInfo.postalCode}</p>` : ''}
      </div>

      <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #1e40af; margin: 0 0 8px 0;">Acciones Requeridas</h3>
        <p style="margin: 0 0 8px 0; color: #1e40af;">1. Contactar al cliente para coordinar el pago</p>
        <p style="margin: 0 0 8px 0; color: #1e40af;">2. Una vez confirmado el pago, marcar como "paid"</p>
        <p style="margin: 0; color: #1e40af;">3. Preparar y enviar el pedido</p>
      </div>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
           style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Ver en Admin Panel
        </a>
      </div>
    </body>
    </html>
  `;

  try {
    const result = await resend.emails.send({
      from: 'El Ropero De Lau <onboarding@resend.dev>',
      to: [process.env.ADMIN_EMAIL || 'admin@roperodelau.com'],
      subject: `Nueva Orden #${orderData.order_number} - ${customerInfo.fullName}`,
      html: emailHtml,
    });
    
    console.log('Admin email sent successfully:', result.data?.id);
  } catch (error) {
    console.error('Error sending admin email:', error);
    // Fallback to console log if email fails
    console.log('Admin email would be sent:', {
      to: process.env.ADMIN_EMAIL || 'admin@roperodelau.com',
      subject: `Nueva Orden #${orderData.order_number} - ${customerInfo.fullName}`,
      html: emailHtml
    });
  }
}
