export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    status: string;
    role: string;
    createdAt: Date;
}