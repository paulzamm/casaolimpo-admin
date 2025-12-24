export enum Role {
    ADMIN = 'ADMIN',
    VENDEDOR = 'VENDEDOR'
}

export interface User {
    _id?: string;
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    rol: Role;
    activo: boolean;
}

export interface UserCreate extends Omit<User, '_id'> {
    password: string;
}
