const { DatabaseUserService } = require('./src/lib/database-user-service');
const { UserRole, AdminLevel } = require('./src/types');

async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin user...');
    
    const userService = new DatabaseUserService();
    
    // Check if super admin already exists
    const existingAdmins = await userService.findAdmins();
    const superAdmin = existingAdmins.find(admin => admin.adminLevel === AdminLevel.SUPER_ADMIN);
    
    if (superAdmin) {
      console.log('✅ Super admin already exists:', superAdmin.email);
      return;
    }
    
    // Create super admin user
    const superAdminData = {
      email: 'admin@w3kyc.com',
      password: 'Admin123!@#',
      firstName: 'Super',
      lastName: 'Admin',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      address: {
        street: '123 Admin St',
        city: 'Admin City',
        state: 'Admin State',
        postalCode: '12345',
        country: 'United States'
      },
      phoneNumber: '+1234567890',
      kycStatus: 'verified',
      riskScore: 0,
      role: UserRole.SUPER_ADMIN,
      isAdmin: true,
      adminLevel: AdminLevel.SUPER_ADMIN
    };
    
    const createdAdmin = await userService.create(superAdminData);
    
    if (createdAdmin) {
      console.log('✅ Super admin created successfully!');
      console.log('📧 Email:', createdAdmin.email);
      console.log('🔑 Password: Admin123!@#');
      console.log('👑 Role: Super Admin');
      console.log('⚠️  Please change the password after first login!');
    } else {
      console.log('❌ Failed to create super admin');
    }
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  }
}

createSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });