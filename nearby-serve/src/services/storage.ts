import { DeliveryRequest, Recipient, UserProfile, UserRole, Volunteer } from "../types";

// Keys for LocalStorage
const KEYS = {
  USERS: 'nearby_serve_users',
  RECIPIENTS: 'nearby_serve_recipients',
  REQUESTS: 'nearby_serve_requests',
  CURRENT_USER: 'nearby_serve_session'
};

// Initial Admin Account
const DEFAULT_ADMIN: UserProfile = {
  id: 'admin_01',
  name: 'System Admin',
  email: 'admin@annadaan.org',
  password: 'admin', // Simple password for demo
  role: UserRole.ADMIN,
  isLoggedIn: false
};

const DEFAULT_VOLUNTEER: UserProfile = {
  id: 'vol_01',
  name: 'Vikram Singh',
  email: 'vikram@annadaan.org',
  password: '123',
  role: UserRole.VOLUNTEER,
  isLoggedIn: false
};

const DEFAULT_VOLUNTEER_DETAILS: Volunteer = {
  id: 'vol_01',
  name: 'Vikram Singh',
  email: 'vikram@annadaan.org',
  verified: true,
  totalDeliveries: 12,
  phone: '9876543210',
  isOnline: true,
  location: { lat: 28.6276, lng: 77.2185 }
};

// --- DATA HELPERS ---

const load = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- SERVICE METHODS ---

export const storageService = {
  // --- AUTHENTICATION & USERS ---
  
  init: () => {
    // Ensure admin exists
    const users = load<UserProfile[]>(KEYS.USERS, []);
    if (!users.find(u => u.role === UserRole.ADMIN)) {
      users.push(DEFAULT_ADMIN);
      // Add a default volunteer for testing
      if (!users.find(u => u.email === DEFAULT_VOLUNTEER.email)) {
        users.push(DEFAULT_VOLUNTEER);
      }
      save(KEYS.USERS, users);
    }
  },

  registerUser: (user: Omit<UserProfile, 'isLoggedIn'>) => {
    const users = load<UserProfile[]>(KEYS.USERS, []);
    if (users.find(u => u.email === user.email)) {
      throw new Error("Email already registered.");
    }
    users.push({ ...user, isLoggedIn: false });
    save(KEYS.USERS, users);
    return user;
  },

  loginUser: (email: string, pass: string): UserProfile | null => {
    const users = load<UserProfile[]>(KEYS.USERS, []);
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      const session = { ...user, isLoggedIn: true };
      sessionStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(session));
      return session;
    }
    return null;
  },

  getCurrentSession: (): UserProfile | null => {
    try {
      const sess = sessionStorage.getItem(KEYS.CURRENT_USER);
      return sess ? JSON.parse(sess) : null;
    } catch { return null; }
  },

  logout: () => {
    sessionStorage.removeItem(KEYS.CURRENT_USER);
  },

  getVolunteers: (): Volunteer[] => {
    // We map users with role VOLUNTEER to the Volunteer interface
    // In a real app, these would be separate tables joined by ID.
    // For this demo, we'll store specific volunteer details in a separate mapping or just reconstruct
    const users = load<UserProfile[]>(KEYS.USERS, []);
    // Just mock mapping existing user-volunteers to the Volunteer type for the dashboard
    return users.filter(u => u.role === UserRole.VOLUNTEER).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        verified: true,
        totalDeliveries: 0,
        phone: 'N/A', // In a real DB, this would be in a profile table
        isOnline: false
    }));
  },

  // --- RECIPIENTS ---

  getRecipients: (): Recipient[] => {
    return load<Recipient[]>(KEYS.RECIPIENTS, []);
  },

  addRecipient: (recipient: Recipient) => {
    const list = load<Recipient[]>(KEYS.RECIPIENTS, []);
    list.unshift(recipient);
    save(KEYS.RECIPIENTS, list);
  },

  updateRecipient: (recipient: Recipient) => {
    const list = load<Recipient[]>(KEYS.RECIPIENTS, []);
    const idx = list.findIndex(r => r.id === recipient.id);
    if (idx !== -1) {
      list[idx] = recipient;
      save(KEYS.RECIPIENTS, list);
    }
  },

  deleteRecipient: (id: string) => {
    let list = load<Recipient[]>(KEYS.RECIPIENTS, []);
    list = list.filter(r => r.id !== id);
    save(KEYS.RECIPIENTS, list);
  },

  // --- REQUESTS ---

  getRequests: (): DeliveryRequest[] => {
    return load<DeliveryRequest[]>(KEYS.REQUESTS, []);
  },

  addRequest: (req: DeliveryRequest) => {
    const list = load<DeliveryRequest[]>(KEYS.REQUESTS, []);
    list.unshift(req);
    save(KEYS.REQUESTS, list);
  },

  updateRequestStatus: (id: string, status: DeliveryRequest['status'], extraData?: Partial<DeliveryRequest>) => {
    const list = load<DeliveryRequest[]>(KEYS.REQUESTS, []);
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], status, ...extraData, updatedAt: Date.now() };
      save(KEYS.REQUESTS, list);
    }
    return list;
  }
};

// Initialize DB
storageService.init();