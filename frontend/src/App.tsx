import React, { useState } from 'react';
import TopPanel from './components/TopPanel';
import GatewayList from './components/GatewayList';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'

import ErrorContext from './store/errorContext';

import './App.sass';

const queryClient = new QueryClient()

function App() {
  const [ errorMessage, setErrorMessage ] = useState<string>("")
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorContext.Provider value={{errorMessage, setErrorMessage}}>
        <div className="app">
          <TopPanel />
          <div className="content">
            <GatewayList />
          </div>
        </div>
      </ErrorContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
