import dbConnect from './mongodb'

// Export the database connection function with the expected name
export const connectDB = dbConnect

// Also export the default for backward compatibility
export default dbConnect 