export interface Product {
    _id?: string;
    nombre: string;
    codigo: string;
    precio: number;
    stock: number;
    categoria: string;
    marca: string;
    descripcion?: string;
    tallas?: string[];
    colores?: string[];
    imagen?: string;
}