import WalletManager from '@/components/wallet';
import { WalletDetails } from '@/components/balance';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={< WalletManager />} />
          <Route path="/wallet/:blockchain/:publicKey" element={<WalletDetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;