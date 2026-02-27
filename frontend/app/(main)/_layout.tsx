import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="subject" />
      <Stack.Screen name="questions" />
      <Stack.Screen name="pdf-export" />
    </Stack>
  );
}
