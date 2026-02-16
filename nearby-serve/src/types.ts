export enum UserRole {
  DONOR = 'DONOR',
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN'
}

export interface Recipient {
  id: string;
  name: string; 
  count: number; 
  description: string;
  needs: string[]; 
  location: {
    lat: number;
    lng: number;
    addressLabel: string;
  };
  imageUrl: string;
  status: 'active' | 'helped';
  distance?: number;
  lastSeen: number; 
  reportedBy?: string;
}

export interface DeliveryRequest {
  id: string;
  recipientId: string;
  recipientName: string;
  donorName: string;
  donorPhone?: string; 
  items: string;
  pickupAddress: string;
  pickupOtp?: string; 
  pickupLocation?: {
    lat: number;
    lng: number;
  };
  serviceFee: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'delivered' | 'paid';
  volunteerId?: string;
  volunteerName?: string;
  proofUrl?: string; // URL for the video/image proof
  proofType?: 'image' | 'video';
  createdAt: number;
  updatedAt: number;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string; // Added for login
  verified: boolean;
  totalDeliveries: number;
  phone: string;
  location?: {
    lat: number;
    lng: number;
  };
  isOnline?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isLoggedIn: boolean;
  password?: string; // Only used internally for auth checks
}