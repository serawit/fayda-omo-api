import User from '../models/User.js';
const enumValues = User.schema.path('kycStatus').enumValues;
console.log('Allowed values for kycStatus:', enumValues);
process.exit();
//# sourceMappingURL=checkEnum.js.map