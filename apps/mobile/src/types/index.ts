export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  unitPrice: number;
  vatRate: number;
  isActive: boolean;
}

export interface Return {
  id: string;
  partnerId: string;
  partnerName?: string;
  productId: string;
  productName?: string;
  quantity: number;
  reason: 'DAMAGED' | 'EXPIRED' | 'INCORRECT' | 'OTHER';
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateReturnDto {
  partnerId: string;
  productId: string;
  quantity: number;
  reason: 'DAMAGED' | 'EXPIRED' | 'INCORRECT' | 'OTHER';
  description?: string;
  photos: string[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'PARTNER' | 'DRIVER';
}
