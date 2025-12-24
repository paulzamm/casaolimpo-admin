export interface SaleDetail {
    product_id: string;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface Sale {
    _id?: string;
    cliente_id: string;
    cliente_nombre: string;
    usuario_id: string;
    usuario_nombre: string;
    fecha: Date;
    detalles: SaleDetail[];
    total: number;
    metodo_pago: string;
}

export interface SaleCreateDetail {
    product_id: string;
    cantidad: number;
}

export interface SaleCreate {
    cliente_id: string;
    metodo_pago: string;
    detalles: SaleCreateDetail[];
}

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
