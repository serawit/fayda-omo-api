export interface AuthResponse {
    message: string;
    token: string;
    user: { id: string; fullName: string; kycStatus: string };
}