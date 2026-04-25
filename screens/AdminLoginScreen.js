//--------------------------------------------
// AdminLogin.js
//--------------------------------------------

// Login screen for admin access before opening the admin panel.
import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLoginScreen({ navigation }) {
  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: '',
  });

  const isFormValid = useMemo(() => {
    return username.trim().length > 0 && password.trim().length > 0;
  }, [username, password]);

  const validate = () => {
    const nextErrors = {
      username: '',
      password: '',
      general: '',
    };

    if (!username.trim()) {
      nextErrors.username = 'Username is required.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (password.trim().length < 4) {
      nextErrors.password = 'Password looks too short.';
    }

    setErrors(nextErrors);

    return !nextErrors.username && !nextErrors.password;
  };

  const handleLogin = () => {
    if (!validate()) return;

    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (u === 'eman' && p === 'admin') {
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        navigation.replace('AdminPanel');
      }, 350);

      return;
    }

    setErrors({
      username: '',
      password: '',
      general: 'Invalid credentials. Use eman / admin.',
    });
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed-outline" size={28} color="#6A4E23" />
            </View>

            <Text style={styles.title}>Admin Login</Text>
            <Text style={styles.subtitle}>
              Enter your admin credentials to continue.
            </Text>

            {errors.general ? (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#b42318"
                />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => usernameInputRef.current?.focus()}
              android_disableSound={true}
              style={[
                styles.inputWrap,
                focusedField === 'username' && styles.inputWrapFocused,
                errors.username ? styles.inputWrapError : null,
              ]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={focusedField === 'username' ? '#6A4E23' : '#999'}
              />
              <TextInput
                ref={usernameInputRef}
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username || errors.general) {
                    setErrors((prev) => ({
                      ...prev,
                      username: '',
                      general: '',
                    }));
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />
            </Pressable>
            {errors.username ? (
              <Text style={styles.fieldError}>{errors.username}</Text>
            ) : null}

            <Pressable
              onPress={() => passwordInputRef.current?.focus()}
              android_disableSound={true}
              style={[
                styles.inputWrap,
                focusedField === 'password' && styles.inputWrapFocused,
                errors.password ? styles.inputWrapError : null,
              ]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={focusedField === 'password' ? '#6A4E23' : '#999'}
              />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password || errors.general) {
                    setErrors((prev) => ({
                      ...prev,
                      password: '',
                      general: '',
                    }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#777"
                />
              </TouchableOpacity>
            </Pressable>
            {errors.password ? (
              <Text style={styles.fieldError}>{errors.password}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                (!isFormValid || loading) && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={!isFormValid || loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.hint}>Use: eman / admin</Text>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={16} color="#6A4E23" />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

//Styling
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#f6f1e9',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  iconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#f6f1e9',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#6A4E23',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: '#666',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    color: '#b42318',
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  inputWrapFocused: {
    backgroundColor: '#fff7ef',
    borderColor: '#6A4E23',
    shadowColor: '#6A4E23',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  inputWrapError: {
    borderColor: '#d33',
    backgroundColor: '#fff8f8',
  },
  input: {
    flex: 1,
    color: '#222',
    fontSize: 14,
    outlineStyle: 'none',
    outlineWidth: 0,
    boxShadow: 'none',
    borderWidth: 0,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  fieldError: {
    color: '#d33',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: -2,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#6A4E23',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 15,
  },
  hint: {
    textAlign: 'center',
    marginTop: 12,
    color: '#777',
    fontSize: 12,
    fontWeight: '600',
  },
  backBtn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backBtnText: {
    color: '#6A4E23',
    fontWeight: '800',
    fontSize: 13,
  },
});
