import User from '../models/User.js';

// Access the schema path and print the enum values
const enumValues = (User.schema.path('kycStatus') as any).enumValues;
console.log('Allowed values for kycStatus:', enumValues);
process.exit();