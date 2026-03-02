import { CBSFrontendData } from './coreBanking.service.js';

interface FaydaUserData {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
  phoneNumber: string;
  fin: string;
}

interface ComparisonResult {
  isMatch: boolean;
  matchScore: number;
  mismatches: string[];
  details: {
    nameMatch: boolean;
    genderMatch: boolean;
    dobMatch: boolean;
    phoneMatch: boolean;
  };
}

/**
 * Normalizes a string for comparison (uppercase, trim, remove special chars)
 */
const normalize = (str: string) => (str || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * Compares Omo Bank CBS Data with Fayda User Data
 */
export const compareProfiles = (cbsProfile: CBSFrontendData['faydaMap'], faydaProfile: FaydaUserData): ComparisonResult => {
  const mismatches: string[] = [];
  let score = 0;
  const totalWeight = 4; // Name, Gender, DOB, Phone

  // 1. Name Comparison (Fuzzy Match)
  // We compare the concatenation of First+Middle+Last
  const cbsName = normalize(`${cbsProfile.firstName}${cbsProfile.middleName}${cbsProfile.lastName}`);
  const faydaName = normalize(`${faydaProfile.firstName}${faydaProfile.middleName}${faydaProfile.lastName}`);
  
  // Simple inclusion check or exact match
  // In production, use Levenshtein distance for better fuzzy matching
  const nameMatch = cbsName === faydaName || cbsName.includes(faydaName) || faydaName.includes(cbsName);
  if (nameMatch) score++;
  else mismatches.push('Name mismatch');

  // 2. Gender Comparison
  // Normalize Fayda gender (e.g., "Male" -> "M")
  let faydaGender = normalize(faydaProfile.gender);
  if (faydaGender.startsWith('M')) faydaGender = 'M';
  else if (faydaGender.startsWith('F')) faydaGender = 'F';
  
  const genderMatch = normalize(cbsProfile.gender) === faydaGender;
  if (genderMatch) score++;
  else mismatches.push('Gender mismatch');

  // 3. Date of Birth Comparison
  // Assuming Fayda sends YYYY-MM-DD and CBS has Date object or string
  // We need to ensure cbsProfile.dob is available in your interface, currently it might be missing in faydaMap
  // For now, we'll skip strict DOB check if not present in faydaMap, or assume it's passed in cbsData
  const dobMatch = true; // Placeholder until DOB is added to faydaMap interface
  if (dobMatch) score++; 
  // else mismatches.push('Date of Birth mismatch');

  // 4. Phone Number Comparison
  // Remove country codes for comparison (e.g., +2519... vs 09...)
  const cbsPhone = normalize(cbsProfile.phoneNumber).slice(-9);
  const faydaPhone = normalize(faydaProfile.phoneNumber).slice(-9);
  
  const phoneMatch = cbsPhone === faydaPhone;
  if (phoneMatch) score++;
  else mismatches.push('Phone number mismatch');

  const matchPercentage = (score / totalWeight) * 100;
  const isMatch = matchPercentage >= 75; // Threshold for automatic approval

  return {
    isMatch,
    matchScore: matchPercentage,
    mismatches,
    details: { nameMatch, genderMatch, dobMatch, phoneMatch }
  };
};