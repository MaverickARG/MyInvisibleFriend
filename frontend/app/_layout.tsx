import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/services/AuthContext';
import { useEffect } from 'react';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isPublicScreen = segments[0] === 'login' || segments[0] === 'reveal';

    if (!user && !isPublicScreen) {
      // Si no hay usuario y no es una pantalla pública, redirigir a login
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      // Si hay usuario y estamos en login, redirigir a inicio (pero permitimos ver reveal logueado)
      router.replace('/');
    }
  }, [user, isLoading, segments]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ title: 'Amigo Invisible' }} />
      <Stack.Screen name="history" options={{ title: 'Historial de Sorteos' }} />
      <Stack.Screen name="reveal" options={{ title: '🎁 Tu Amigo Invisible', presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
