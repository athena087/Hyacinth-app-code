import { Stack } from 'expo-router';

// Nested stack inside the Search tab: the search screen pushes /search/results
// on top of itself, so the outer tab bar stays visible and back pops to search.
export default function SearchStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
