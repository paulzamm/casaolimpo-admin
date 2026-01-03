export interface Token {
    access_token: string;
    token_type: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    cedula: string;
    nombres: string;
    apellidos: string;
    correo: string;
    
}
