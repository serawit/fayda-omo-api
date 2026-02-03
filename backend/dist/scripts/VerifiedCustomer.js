import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import CustomerFayda from '../models/CustomerFayda';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fayda-omo-api';
const firstNames = [
    "Abebe", "Kebede", "Almaz", "Aster", "Bekele", "Chala", "Desta", "Ephrem", "Fikru", "Genet",
    "Hailu", "Indale", "Jemal", "Kassa", "Lemma", "Meron", "Nardos", "Omod", "Paulos", "Qale",
    "Rahel", "Samuel", "Tariku", "Ujulu", "Wondimu", "Yared", "Zenebe", "Tigist", "Meseret", "Birtukan",
    "Dawit", "Elias", "Fasika", "Getachew", "Hana", "Ibrahim", "Jonas", "Kidist", "Lidet", "Martha",
    "Nebiyu", "Olana", "Petros", "Robel", "Solomon", "Tesfaye", "Urgessa", "Worku", "Yonas", "Zelalem"
];
const fatherNames = [
    "Alemu", "Berhanu", "Chane", "Demeke", "Ejigu", "Fekadu", "Girma", "Haile", "Iyasu", "Jemberu",
    "Kifle", "Lema", "Mamo", "Negash", "Oumer", "Poulos", "Qana", "Reda", "Seyoum", "Tadesse",
    "Umer", "Wolde", "Yilma", "Zewdu", "Assefa", "Belay", "Dagne", "Eshetu", "Fisseha", "Gebre",
    "Hadgu", "Ibsa", "Jifar", "Kassahun", "Legesse", "Mekonnen", "Nega", "Oljira", "Pita", "Qoricho",
    "Regassa", "Sileshi", "Tekle", "Uga", "Wondwossen", "Yimer", "Zeleke", "Abate", "Bogale", "Derese"
];
const generateEthiopianName = () => {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const father = fatherNames[Math.floor(Math.random() * fatherNames.length)];
    return `${first} ${father}`;
};
const seedVerifiedCustomers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding verified customers...');
        await User.deleteMany({});
        await CustomerFayda.deleteMany({});
        console.log('Existing users and Fayda customers cleared...');
        const users = [];
        const faydaCustomers = [];
        const baseAccount = 1091880213324801n;
        for (let i = 0; i < 50; i++) {
            const fullName = generateEthiopianName();
            const phoneNumber = `2519${(10000000 + i).toString()}`;
            const accountNumber = (baseAccount + BigInt(i)).toString();
            const faydaNumber = `8${(100000000000000 + i).toString()}`;
            const omoBankUser = {
                fullName,
                phoneNumber,
                accountNumber,
                kycStatus: 'VERIFIED',
                isHarmonized: false,
                role: 'user',
                email: `customer${i + 1}@omobank.et`,
                address: 'Addis Ababa, Ethiopia',
                username: `user_${accountNumber.slice(-6)}`
            };
            users.push(omoBankUser);
            const faydaRegistryRecord = {
                accountNumber,
                faydaNumber,
                fullName,
                phoneNumber,
                gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
                dob: new Date('1990-01-01'),
                status: 'active',
                address: 'Addis Ababa, Ethiopia'
            };
            faydaCustomers.push(faydaRegistryRecord);
        }
        await User.insertMany(users);
        await CustomerFayda.insertMany(faydaCustomers);
        console.log(`Success! Seeded ${users.length} Omo Bank System Users and ${faydaCustomers.length} corresponding Fayda Registry records.`);
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
    finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};
seedVerifiedCustomers();
//# sourceMappingURL=VerifiedCustomer.js.map