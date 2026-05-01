import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { loginWithEmail, registerWithEmail, loginWithGoogle, resetPasswordWithEmail } from '../src/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !confirmPassword)) {
      setError('Por favor llena todos los campos.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await resetPasswordWithEmail(email);
      Alert.alert('Revisa tu correo', 'Te hemos enviado un enlace para restablecer tu contraseña.');
      setIsResettingPassword(false); // Volvemos a la pantalla de login
    } catch (err: any) {
      setError(err.message || 'Error al intentar restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      // Si el usuario simplemente cancela, no mostramos error. Para otros errores, sí.
      if (err.code !== 'SIGN_IN_CANCELLED') {
        setError(err.message || 'Error al iniciar sesión con Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🎅 Amigo Invisible 🎁</Text>
        <Text style={styles.subtitle}>
          {isResettingPassword 
            ? 'Ingresa tu correo para recibir un enlace'
            : isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para guardar tus sorteos'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          placeholderTextColor="#a4b0be"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          returnKeyType={isResettingPassword ? "done" : "next"}
          onSubmitEditing={() => {
            if (isResettingPassword) {
              handleResetPassword();
            } else {
              passwordRef.current?.focus();
            }
          }}
          blurOnSubmit={isResettingPassword}
        />
        
        {!isResettingPassword && (
          <>
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#a4b0be"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType={isLogin ? "done" : "next"}
              onSubmitEditing={() => {
                if (isLogin) handleAuth();
                else confirmPasswordRef.current?.focus();
              }}
              blurOnSubmit={isLogin}
            />
            
            {!isLogin && (
              <TextInput
                ref={confirmPasswordRef}
                style={styles.input}
                placeholder="Repetir Contraseña"
                placeholderTextColor="#a4b0be"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleAuth}
              />
            )}

            {isLogin && (
              <TouchableOpacity onPress={() => { setIsResettingPassword(true); setError(''); }} style={styles.forgotBtn} disabled={isLoading}>
                <Text style={styles.forgotBtnText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {isResettingPassword ? (
          <>
            <TouchableOpacity style={styles.mainBtn} onPress={handleResetPassword} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>Enviar Enlace</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsResettingPassword(false); setError(''); }} style={styles.switchBtn}>
              <Text style={styles.switchBtnText}>Volver a iniciar sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.mainBtn} onPress={handleAuth} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainBtnText}>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }} style={styles.switchBtn}>
              <Text style={styles.switchBtnText}>
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>o entra con</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleAuth} disabled={isLoading}>
              <Text style={styles.googleBtnText}>🌐 Iniciar sesión con Google</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#2f3542', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#747d8c', textAlign: 'center', marginBottom: 25 },
  error: { color: '#ff4757', backgroundColor: '#ffeaa7', padding: 10, borderRadius: 8, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  input: {
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#2f3542',
  },
  forgotBtn: { alignItems: 'flex-end', marginBottom: 15 },
  forgotBtnText: { color: '#747d8c', fontWeight: 'bold' },
  mainBtn: {
    backgroundColor: '#ff4757',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  mainBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  switchBtn: { marginTop: 15, alignItems: 'center' },
  switchBtnText: { color: '#747d8c', fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#f1f2f6' },
  dividerText: { marginHorizontal: 10, color: '#a4b0be', fontWeight: 'bold' },
  googleBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dfe4ea',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  googleBtnText: { color: '#2f3542', fontSize: 16, fontWeight: 'bold' },
});