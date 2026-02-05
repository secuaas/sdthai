import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import ReturnsListScreen from './src/screens/ReturnsListScreen';
import CreateReturnScreen from './src/screens/CreateReturnScreen';

const Stack = createNativeStackNavigator();

// Mock partner ID - in real app this would come from authentication context
const MOCK_PARTNER_ID = 'demo-partner-id';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Returns"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Returns"
          options={{ title: 'Retours Produits' }}
        >
          {(props) => <ReturnsListScreen {...props} partnerId={MOCK_PARTNER_ID} />}
        </Stack.Screen>
        <Stack.Screen
          name="CreateReturn"
          options={{ title: 'Nouveau Retour' }}
        >
          {(props) => <CreateReturnScreen {...props} partnerId={MOCK_PARTNER_ID} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
