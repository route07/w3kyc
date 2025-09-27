import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  walletAddress: string | null;
  kycStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Mock database - in production, use a real database
let users: User[] = [
  {
    id: '1',
    email: 'demo@w3kyc.com',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    firstName: 'Demo',
    lastName: 'User',
    walletAddress: null,
    kycStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'alice@example.com',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    firstName: 'Alice',
    lastName: 'Johnson',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    kycStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export class UserService {
  static async findByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email) || null;
  }

  static async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return users.find(u => u.walletAddress === walletAddress) || null;
  }

  static async findById(id: string): Promise<User | null> {
    return users.find(u => u.id === id) || null;
  }

  static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: (users.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  }

  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return users[userIndex];
  }

  static async getAll(): Promise<User[]> {
    return [...users];
  }

  static async delete(id: string): Promise<boolean> {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    users.splice(userIndex, 1);
    return true;
  }

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static toPublicUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
}