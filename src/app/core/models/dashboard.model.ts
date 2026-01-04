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

export interface TopClient {
    cliente_id: string;
    nombre: string;
    total_ventas: number;
    total_monto: number;
}

export interface VendedorStats {
    mis_ventas_hoy: number;
    mi_total_hoy: number;
    mis_ventas_mes: number;
    mi_total_mes: number;
    top_clientes: TopClient[];
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
    vendedor_stats?: VendedorStats;
}
