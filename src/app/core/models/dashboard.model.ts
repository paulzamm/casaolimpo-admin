export interface TopProduct {
    product_id: string;
    nombre: string;
    categoria?: string;
    imagen?: string;
    total_vendido: number;
    total_monto: number;
}

export interface TopSeller {
    usuario_id: string;
    nombre: string;
    total_ventas: number;
    total_monto: number;
}

export interface DashboardData {
    ventas_hoy: number;
    ventas_mes: number;
    total_vendido_hoy: number;
    total_vendido_mes: number;
    total_clientes: number;
    productos_bajo_stock: number;
    top_productos: TopProduct[];
    top_vendedores: TopSeller[];
}
