// Modelos para items de venta
export interface SaleItem {
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface SaleItemDetail extends SaleItem {
    producto: {
        _id: string;
        codigo: string;
        nombre: string;
        categoria: {
            _id: string;
            nombre: string;
        };
        marca: {
            _id: string;
            nombre: string;
        };
    };
}

// Enums
export enum MetodoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    TRANSFERENCIA = 'TRANSFERENCIA'
}

// Modelo para crear venta (lo que envía el frontend al backend)
export interface SaleCreate {
    cliente_id: string;
    detalles: Array<{ product_id: string; cantidad: number }>;
    metodo_pago: string;
}

// Modelo de venta completa (lo que devuelve el backend)
export interface Sale {
    _id?: string;
    numero_venta: string;
    fecha: string;
    cliente_id: string;
    cliente_nombre: string;
    usuario_id: string;
    usuario_nombre: string;
    detalles: Array<{
        producto_id: string;
        nombre_producto: string;
        cantidad: number;
        precio_unitario: number;
        subtotal: number;
    }>;
    total: number;
    metodo_pago: string;
}

// Modelo para items en el carrito
export interface CartItem {
    producto_id: string;
    codigo: string;
    nombre: string;
    precio_unitario: number;
    cantidad: number;
    stock_disponible: number;
    subtotal: number;
}

// Dashboard
export interface TopProduct {
    product_id: string;
    nombre: string;
    total_vendido: number;
}

export interface SalesDashboard {
    ventas_hoy: number;
    total_vendido_hoy: number;
    ultima_venta?: Sale;
}
