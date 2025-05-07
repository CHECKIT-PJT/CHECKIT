import { BrowserRouter } from 'react-router-dom';
import Router from './router/Router.tsx';
import ScrollToTop from './components/common/ScrollToTop.tsx';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Router />
    </BrowserRouter>
  );
}

export default App;
