import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store, { loadPersistedOrders, loadPersistedCompany } from './src/store/store';
import AppNavigation from './src/navigation';

const App = () => {
  useEffect(() => {
    // load persisted orders into store
    loadPersistedOrders().catch((e) => console.warn(e));
    // load persisted company details
    loadPersistedCompany().catch((e) => console.warn(e));
  }, []);

  return (
    <Provider store={store}>
      <AppNavigation />
    </Provider>
  );
};

export default App;