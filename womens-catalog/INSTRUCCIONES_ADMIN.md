# 📋 INSTRUCCIONES COMPLETAS - EL ROPERO DE LAU

## 🛍️ FLUJO DE COMPRA COMPLETO

### **Para el Cliente:**

#### **1. Navegación y Catálogo**
- El cliente visita la página principal (`/`)
- Ve todos los productos disponibles (los vendidos están ocultos)
- Cada producto tiene un ícono de carrito de compras

#### **2. Agregar al Carrito**
- **Desde el Catálogo**: Hacer clic en el ícono de carrito en cualquier producto
- **Desde la Página del Producto**: Hacer clic en "Agregar al carrito"
- **¿Qué sucede?**
  - El producto se reserva por 20 minutos
  - Aparece en el carrito con cantidad 1 (productos únicos)
  - El ícono cambia a estado "agregado"
  - Otros usuarios no pueden agregar el mismo producto

#### **3. Revisar el Carrito**
- Hacer clic en "Carrito" en la navegación (muestra el número de items)
- Revisar los productos seleccionados
- Puede eliminar productos (los libera automáticamente)
- **No puede cambiar cantidades** (los productos son únicos)

#### **4. Procesar la Compra**
- Hacer clic en "Proceder al pago"
- Llenar el formulario de información del cliente:
  - Nombre completo, email, teléfono
  - Dirección, ciudad, país, código postal
- Hacer clic en "Enviar Pedido"

#### **5. Confirmación de Pedido**
- Se crea la orden en la base de datos
- Los productos se marcan como "vendidos" (desaparecen del catálogo)
- El cliente recibe email de confirmación
- El admin recibe notificación por email

---

## 👨‍💼 PANEL DE ADMINISTRACIÓN

### **Acceso al Admin**
- URL: `/admin`
- Contraseña: `AdminRopero2025!*`

### **Sección de Productos**
- Ver todos los productos (disponibles, reservados, vendidos)
- Agregar nuevos productos
- Editar productos existentes
- Eliminar productos

### **Sección de Órdenes**
- Ver todas las órdenes con detalles del cliente
- Cambiar estado de las órdenes
- Ver información completa de cada pedido

---

## 🔄 ESTADOS DE PRODUCTOS

### **Disponible (available)**
- Producto visible en el catálogo
- Puede ser agregado al carrito
- Estado inicial de todos los productos

### **Reservado (reserved)**
- Producto agregado al carrito
- No visible para otros usuarios
- Reserva expira en 20 minutos
- Si no se compra, vuelve a "disponible"

### **Vendido (sold)**
- Producto comprado exitosamente
- No visible en el catálogo
- Visible solo en el admin
- Estado final de productos vendidos

### **Incompleto (incomplete)**
- Pedido cancelado por el admin
- Producto vuelve a "disponible"
- Visible nuevamente en el catálogo

---

## 📧 SISTEMA DE EMAILS

### **Emails al Cliente**
- **Asunto**: "Confirmación de Pedido #[número] - El Ropero De Lau"
- **Contenido**: Detalles del pedido, productos, información de envío
- **Próximos pasos**: Contacto para pago, envío, seguimiento

### **Emails al Admin**
- **Asunto**: "Nueva Orden #[número] - [nombre del cliente]"
- **Contenido**: Información completa del cliente y productos
- **Acciones requeridas**: Contactar cliente, coordinar pago, preparar envío

### **Configuración de Emails**
- **Servicio**: Resend
- **Dominio**: roperodelau.com (verificado)
- **Email de admin**: edgardo.panza@gmail.com
- **Remitente**: El Ropero De Lau <noreply@roperodelau.com>

---

## 🎛️ GESTIÓN DE ÓRDENES

### **Estados de Órdenes**

#### **Pendiente (pending)**
- Estado inicial al crear la orden
- Requiere acción del admin
- **Acción**: Contactar cliente para coordinar pago

#### **Pagado (paid)**
- Cliente confirmó el pago
- **Acción**: Preparar y enviar el pedido

#### **Enviado (shipped)**
- Pedido enviado al cliente
- **Acción**: Esperar confirmación de entrega

#### **Completado (completed)**
- Pedido entregado exitosamente
- **Acción**: Ninguna, proceso finalizado

#### **Cancelado (cancelled)**
- Pedido cancelado por el admin
- **Acción**: Productos vuelven a "disponible"

### **Cambiar Estado de Orden**
1. Ir a la sección "Órdenes" en el admin
2. Hacer clic en "Ver detalles" en la orden deseada
3. Seleccionar nuevo estado del dropdown
4. Hacer clic en "Actualizar Estado"

---

## 🔧 FUNCIONES TÉCNICAS

### **Reserva Automática**
- Los productos se reservan automáticamente al agregar al carrito
- Reserva expira en 20 minutos
- Si no se completa la compra, el producto vuelve a estar disponible

### **Productos Únicos**
- Cada producto tiene cantidad 1
- No se pueden agregar múltiples veces
- Un producto solo puede estar en un carrito a la vez

### **Filtrado Inteligente**
- Solo se muestran productos "disponibles"
- Productos "reservados" expirados vuelven a aparecer
- Productos "vendidos" permanecen ocultos

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Cliente no recibe email**
1. Verificar que el dominio esté verificado en Resend
2. Revisar carpeta de spam
3. Verificar logs del servidor

### **Producto no aparece en catálogo**
1. Verificar estado del producto en admin
2. Si está "reservado", esperar 20 minutos
3. Si está "vendido", cambiar a "disponible" si es necesario

### **Error al crear orden**
1. Verificar conexión a base de datos
2. Revisar logs del servidor
3. Verificar que todos los campos estén completos

---

## 📱 INFORMACIÓN DE CONTACTO

### **Para Soporte Técnico**
- Email: edgardo.panza@gmail.com
- Revisar logs del servidor para errores
- Verificar configuración de emails

### **Para Clientes**
- Los clientes reciben emails automáticos
- Información de contacto en emails de confirmación
- Proceso de pago es manual (fuera del sistema web)

---

## 🔄 FLUJO COMPLETO RESUMIDO

1. **Cliente** navega catálogo → agrega productos → completa compra
2. **Sistema** crea orden → envía emails → marca productos como vendidos
3. **Admin** recibe notificación → contacta cliente → coordina pago
4. **Admin** marca como pagado → prepara envío → marca como enviado
5. **Admin** confirma entrega → marca como completado

---

## ⚙️ CONFIGURACIÓN TÉCNICA

### **Base de Datos**
- **Tabla products**: id, name, price, image, status, reserved_at, reservation_expires_at
- **Tabla orders**: id, order_number, customer_info, items, total, status, timestamps

### **APIs**
- `/api/orders` - Crear y obtener órdenes
- `/api/products/reserve` - Reservar producto
- `/api/products/unreserve` - Liberar producto
- `/api/products/mark-sold` - Marcar como vendido

### **Servicios**
- **Supabase**: Base de datos y autenticación
- **Resend**: Envío de emails
- **Next.js**: Framework de la aplicación

---

*Documento creado el: 7 de septiembre de 2025*
*Versión: 1.0*
*Sistema: El Ropero De Lau - E-commerce*
