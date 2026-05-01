// Mock de servicio de autenticación preparado para Firebase/Supabase
export const login = async (email: string) => {
  console.log(`Mock login para: ${email}`);
  return { user: { id: '1', email } };
};

export const logout = async () => {
  console.log('Mock logout');
};
