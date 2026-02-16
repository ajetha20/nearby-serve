import { Recipient, DeliveryRequest, Volunteer } from './types';

// New Delhi, Connaught Place area
export const CENTER_LAT = 28.6276;
export const CENTER_LNG = 77.2185;

export const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: '1',
    name: 'Group near Hanuman Mandir',
    count: 5,
    description: 'A group of elderly people and 2 children sitting near the temple entrance. They need fresh cooked food.',
    needs: ['Roti & Sabzi', 'Dal Rice', 'Water'],
    location: {
      lat: 28.6289,
      lng: 77.2160,
      addressLabel: 'Baba Kharak Singh Marg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1596280826955-442d2a456108?auto=format&fit=crop&q=80&w=400',
    status: 'active',
    lastSeen: Date.now() - 3600000 // 1 hour ago
  },
  {
    id: '2',
    name: 'Family under Flyover',
    count: 3,
    description: 'Couple with a small baby. They have no stove, need ready-to-eat food.',
    needs: ['Milk', 'Bread', 'Fruits'],
    location: {
      lat: 28.6240,
      lng: 77.2200,
      addressLabel: 'Minto Road Bridge'
    },
    imageUrl: 'https://images.unsplash.com/photo-1605218427306-6354db696db5?auto=format&fit=crop&q=80&w=400',
    status: 'active',
    lastSeen: Date.now() - 7200000 // 2 hours ago
  },
  {
    id: '3',
    name: 'Construction Workers Kids',
    count: 8,
    description: 'Children of daily wage labourers nearby. Need evening snacks or dinner.',
    needs: ['Rice', 'Biscuits', 'Bananas'],
    location: {
      lat: 28.6300,
      lng: 77.2220,
      addressLabel: 'Barakhamba Road Site'
    },
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=400',
    status: 'active',
    lastSeen: Date.now() - 18000000 // 5 hours ago
  }
];

export const MOCK_REQUESTS: DeliveryRequest[] = [
  {
    id: 'req_1',
    recipientId: '1',
    recipientName: 'Group near Hanuman Mandir',
    donorName: 'Rahul Sharma',
    donorPhone: '9876543210',
    items: '10 Rotis & Aloo Sabzi',
    pickupAddress: 'H-Block, CP',
    pickupOtp: '4521',
    pickupLocation: { lat: 28.6304, lng: 77.2177 },
    serviceFee: 40,
    status: 'delivered',
    volunteerId: 'vol_1',
    volunteerName: 'Vikram Singh',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 82800000
  },
  {
    id: 'req_2',
    recipientId: '3',
    recipientName: 'Construction Workers Kids',
    donorName: 'Rahul Sharma',
    donorPhone: '9876543210',
    items: '2kg Bananas & Milk',
    pickupAddress: 'H-Block, CP',
    pickupOtp: '8892',
    pickupLocation: { lat: 28.6310, lng: 77.2180 },
    serviceFee: 30,
    status: 'picked_up',
    volunteerId: 'vol_1',
    volunteerName: 'Vikram Singh',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 900000
  }
];

export const MOCK_VOLUNTEER: Volunteer = {
  id: 'vol_1',
  name: 'Vikram Singh',
  email: "volunteer@nearbyserve.com",   
  verified: true,
  totalDeliveries: 342,
  phone: '+91 98765 43210',
  location: { lat: CENTER_LAT + 0.002, lng: CENTER_LNG - 0.002 },
  isOnline: true
};