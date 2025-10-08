import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocumentPage from './pages/DocumentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:docId" element={<DocumentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
