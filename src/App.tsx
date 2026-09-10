import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HistoryPage from './pages/HistoryPage';
import AnalysisFormPage from './pages/AnalysisFormPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analise/nova" element={<AnalysisFormPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/history" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
