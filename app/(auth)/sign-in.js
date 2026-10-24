import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import Screen from '../../components/Screen';
import Field from '../../components/Field';
import Button from '../../components/Button';

export default function SignIn() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!isLoaded) return;
    setBusy(true);
    setError('');
    try {
      const res = await signIn.create({ identifier: email.trim(), password });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/');
      } else {
        setError('Extra verification is required for this account.');
      }
    } catch (e) {
      setError(e?.errors?.[0]?.longMessage ?? 'Could not sign in. Check your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
          <View className="mb-8 items-center">
            <View className="mb-4 size-20 items-center justify-center rounded-3xl bg-accent"><Text className="text-4xl">🏠</Text></View>
            <Text className="text-3xl font-bold text-primary">3D Home</Text>
            <Text className="mt-1 text-primary/60">Sign in to your scans</Text>
          </View>
          <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" error={error} />
          <Button title={busy ? 'Signing in…' : 'Sign in'} onPress={onSubmit} disabled={busy || !email || !password} />
          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-primary/60">New here?</Text>
            <Link href="/(auth)/sign-up"><Text className="font-bold text-accent">Create an account</Text></Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
