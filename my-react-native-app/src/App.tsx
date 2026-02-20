import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TrialManagerScreen } from './screens';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TrialManager">
        <Stack.Screen name="TrialManager" component={TrialManagerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;