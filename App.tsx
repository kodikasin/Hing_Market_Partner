import React, { useEffect } from 'react';
import { RealmProvider } from '@realm/react';
import { realmSchemas } from './src/store/realmConfig';
import AppNavigation from './src/navigation';

const App = () => {
  return (
    <RealmProvider schema={realmSchemas}>
      <AppNavigation />
    </RealmProvider>
  );
};

export default App;
