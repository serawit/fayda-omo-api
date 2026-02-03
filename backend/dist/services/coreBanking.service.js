const MOCK_CBS_DB = {
    '10001000': {
        accountNumber: '10001000',
        phoneNumber: '+251911223344',
        fullName: 'Abebe Kebede',
        status: 'ACTIVE',
    },
    '10002000': {
        accountNumber: '10002000',
        phoneNumber: '+251922334455',
        fullName: 'Sara Mohammed',
        status: 'ACTIVE',
    },
    '10009999': {
        accountNumber: '10009999',
        phoneNumber: '+251900000000',
        fullName: 'Inactive User',
        status: 'INACTIVE',
    },
    '29301000': {
        accountNumber: '29301000',
        phoneNumber: '+251930810615',
        fullName: 'UAT Test User One',
        status: 'ACTIVE',
    },
    '94182000': {
        accountNumber: '94182000',
        phoneNumber: '+251941802549',
        fullName: 'UAT Test User Two',
        status: 'ACTIVE',
    },
    '293081061587': {
        accountNumber: '293081061587',
        phoneNumber: '+251930810615',
        fullName: 'UAT Test User (FAN 1)',
        status: 'ACTIVE',
    },
    '941802549105': {
        accountNumber: '941802549105',
        phoneNumber: '+251941802549',
        fullName: 'UAT Test User (FAN 2)',
        status: 'ACTIVE',
    },
};
export const lookupCoreBankingCustomer = async (accountNumber) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const customer = MOCK_CBS_DB[accountNumber];
    return customer || null;
};
//# sourceMappingURL=coreBanking.service.js.map