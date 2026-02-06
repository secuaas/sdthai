import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Types de base
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Configuration du client API
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Intercepteur pour ajouter le token JWT
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        // Si 401, déconnecter l'utilisateur
        if (error.response?.status === 401) {
          this.clearToken();
          // Rediriger vers la page de login si on n'y est pas déjà
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Gestion du token
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Méthodes HTTP
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Gestion des erreurs
  handleError(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      return axiosError.response?.data?.message || 'Une erreur est survenue';
    }
    return 'Une erreur inattendue est survenue';
  }
}

// Instance singleton
export const apiClient = new ApiClient();

// Types pour l'authentification
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  nom: string;
  prenom: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'PARTNER';
  partenaire?: Partner;
}

export interface Partner {
  id: string;
  nomCommercial: string;
  raisonSociale: string;
  siret: string;
  adresse: string;
  telephone: string;
  email: string;
  statut: 'ACTIF' | 'INACTIF' | 'EN_ATTENTE';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  unitPrice: number;
  vatRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // French aliases for backward compatibility
  nom?: string;
  prixUnitaire?: number;
}

export interface OrderItem {
  produitId: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  partnerId: string;
  partner?: Partner;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARED' | 'DELIVERED' | 'CANCELLED';
  requestedDate: string;
  isUrgent: boolean;
  urgentReason?: string;
  urgentApproved?: boolean;
  deadlineType: 'STANDARD' | 'LATE' | 'DEROGATION';
  requiresApproval: boolean;
  deliveryType: 'STANDARD' | 'ON_SITE';
  onSiteDeliveryTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // French aliases for backward compatibility
  numero?: string;
  partenaireId?: string;
  partenaire?: Partner;
  montantTotal?: number;
  statut?: 'EN_ATTENTE' | 'CONFIRMEE' | 'PREPAREE' | 'LIVREE' | 'ANNULEE';
  dateLivraison?: string;
  commentaire?: string;
}

// API Routes
export const authApi = {
  login: (data: LoginDto) => apiClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterDto) => apiClient.post<AuthResponse>('/auth/register', data),
  me: () => apiClient.get<User>('/auth/me'),
};

export const productsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<Product>>('/products', { params }),
  get: (id: string) => apiClient.get<Product>(`/products/${id}`),
  getByBarcode: (barcode: string) => apiClient.get<Product>(`/products/barcode/${barcode}`),
  create: (data: Partial<Product>) => apiClient.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => apiClient.patch<Product>(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string; partnerId?: string; requiresApproval?: boolean }) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }),
  get: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  create: (data: { partnerId: string; items: { productId: string; quantity: number }[]; requestedDate: string; isUrgent?: boolean; urgentReason?: string; deliveryType?: 'STANDARD' | 'ON_SITE'; onSiteDeliveryTime?: string; notes?: string }) =>
    apiClient.post<Order>('/orders', data),
  update: (id: string, data: Partial<Order>) => apiClient.patch<Order>(`/orders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/orders/${id}`),
  updateStatus: (id: string, status: Order['status']) =>
    apiClient.patch<Order>(`/orders/${id}/status`, { status }),
  approve: (id: string) => apiClient.post<Order>(`/orders/${id}/approve`, {}),
  reject: (id: string, reason?: string) => apiClient.post<Order>(`/orders/${id}/reject`, { reason }),
};

export const partnersApi = {
  list: (params?: { page?: number; limit?: number; statut?: string }) =>
    apiClient.get<PaginatedResponse<Partner>>('/partenaires', { params }),
  get: (id: string) => apiClient.get<Partner>(`/partenaires/${id}`),
  create: (data: Partial<Partner>) => apiClient.post<Partner>('/partenaires', data),
  update: (id: string, data: Partial<Partner>) => apiClient.patch<Partner>(`/partenaires/${id}`, data),
  delete: (id: string) => apiClient.delete(`/partenaires/${id}`),
};

export interface POSTransaction {
  id: string;
  partnerId: string;
  partnerName?: string;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  items: POSTransactionItem[];
  createdAt: string;
}

export interface POSTransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreatePOSTransactionDto {
  partnerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
}

export const posApi = {
  create: (data: CreatePOSTransactionDto) =>
    apiClient.post<POSTransaction>('/pos/transactions', data),
  list: (params?: { partnerId?: string; page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<POSTransaction>>('/pos/transactions', { params }),
  get: (id: string) => apiClient.get<POSTransaction>(`/pos/transactions/${id}`),
};

export interface PartnerSession {
  id: string;
  partnerId: string;
  partnerName?: string;
  code: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export const partnerSessionsApi = {
  validate: (code: string) => apiClient.post<PartnerSession>('/partner-sessions/validate', { code }),
  getActive: (partnerId: string) => apiClient.get<PartnerSession>(`/partner-sessions/active/${partnerId}`),
  create: (partnerId: string) => apiClient.post<PartnerSession>('/partner-sessions', { partnerId }),
  deactivate: (id: string) => apiClient.patch<PartnerSession>(`/partner-sessions/${id}/deactivate`, {}),
};
