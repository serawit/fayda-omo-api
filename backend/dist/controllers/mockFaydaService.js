export const validateFan = async (fan) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (fan.startsWith('0000')) {
        throw new Error('Fayda ID not found in national registry');
    }
    return {
        valid: true,
        fullName: "Abebe Kebede"
    };
};
export const verifyFace = async (fan, faceImageBase64) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (fan.endsWith('9999'))
        return false;
    return true;
};
//# sourceMappingURL=mockFaydaService.js.map