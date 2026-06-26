import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import FolderView from './components/FolderView';
import { ViewProvider } from './context/ViewContext';

function App() {
  return (
    <ViewProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="folder/:id" element={<FolderView />} />
          </Route>
        </Routes>
      </Router>
    </ViewProvider>
  );
}

export default App;
