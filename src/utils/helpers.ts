import * as bcrypt from "bcrypt";

export const generateHash = async (password: string): Promise<string> => {
  const passwordSalt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, passwordSalt);
  return hash;
};
export const isCorrectPassword = async (password: string, hash: string): Promise<boolean> => {
  const isEqual = await bcrypt.compare(password, hash);
  return isEqual;
};
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};