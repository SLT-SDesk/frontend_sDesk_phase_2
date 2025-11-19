export interface User {
    id: string;
    email: string;
    name: string;
    token: string;
    role: 'admin' | 'user' | 'technician';
}