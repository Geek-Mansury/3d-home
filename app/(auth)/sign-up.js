import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignUp } from '@clerk/clerk-expo';
import Screen from '../../components/Screen';
import Field from '../../components/Field';
import Button from '../../components/Button';

export default function SignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false); // waiting for the emailed code
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    if (!isLoaded) return;
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e?.errors?.[0]?.longMessage ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const onSignUp = () =>
    run(async () => {
      await signUp.create({ emailAddress: email.trim(), password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPending(true);
    });

  const onVerify = () =>
    run(async () => {
      const res = await signUp.attemptEmailAddressVerification({ code: code.trim() });
      if (res.status === 'complete') {
        await setActive({ session: res.createdSessionId });
        router.replace('/');
      } else {
        setError('Verification is not complete yet.');
      }
    });

  return (
    <Screen className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center p-6" keyboardShouldPersistTaps="handled">
          <Text className="mb-1 text-3xl font-bold text-primary">{pending ? 'Check your email' : 'Create account'}</Text>
          <Text className="mb-8 text-primary/60">{pending ? `We sent a 6-digit code to ${email}` : 'Start scanning your home in 3D'}</Text>
          {!pending ? (
            <>
              <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" />
              <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" error={error} />
              <Button title={busy ? 'Creating…' : 'Sign up'} onPress={onSignUp} disabled={busy || !email || password.length < 8} />
            </>
          ) : (
            <>
              <Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad" placeholder="123456" error={error} />
              <Button title={busy ? 'Verifying…' : 'Verify'} onPress={onVerify} disabled={busy || code.length < 6} />
            </>
          )}
          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="text-primary/60">Already have an account?</Text>
            <Link href="/(auth)/sign-in"><Text className="font-bold text-accent">Sign in</Text></Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
