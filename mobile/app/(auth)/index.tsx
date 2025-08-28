import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import React from 'react'
import styles from '../../assets/styles/login.styles'
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';
import { Link } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

const LoginScreen = () => {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const {isLoading, login} = useAuthStore()

  const handleLogin = async () => {
    const result = await login(email, password);
    if (!result.success) {
      Alert.alert('Login Error', result.message || 'An error occurred during login.');
    }
  }



  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      <View style={styles.container}>
        {/* image */}
        <View style={styles.topIllustration}>
          <Image
            source={require('../../assets/images/i.png')}
            style={styles.illustrationImage}
            contentFit='contain' />
        </View>
        <View style={styles.card}>
          <View style={styles.formContainer}>
            {/* email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name='mail-outline'
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Enter your email'
                  placeholderTextColor={COLORS.placeholderText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
              </View>
            </View>
            {/* password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name='lock-closed-outline'
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder='Enter your password'
                  placeholderTextColor={COLORS.placeholderText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )
              }
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href='/signup' asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>

              </Link>
            </View>

          </View>
        </View>
      </View>
    </KeyboardAvoidingView>

  )
}

export default LoginScreen