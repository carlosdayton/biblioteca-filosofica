import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Breadcrumbs from './components/Breadcrumbs'
import Toast from './components/Toast'
import KeyboardHint from './components/KeyboardHint'
import PageTransition from './components/PageTransition'
import WelcomeModal from './components/WelcomeModal'
import HomePage from './pages/HomePage'
import QuoteListPage from './pages/QuoteListPage'
import QuoteDetailPage from './pages/QuoteDetailPage'
import QuoteNewPage from './pages/QuoteNewPage'
import QuoteEditPage from './pages/QuoteEditPage'
import SearchPage from './pages/SearchPage'
import NotFoundPage from './pages/NotFoundPage'
import { useToast } from './hooks/useToast'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { ToastContext } from './context/ToastContext'

export default function App() {
  const { toasts, addToast, removeToast } = useToast()
  useKeyboardShortcuts()

  return (
    <ToastContext.Provider value={addToast}>
      <NavBar />
      <Breadcrumbs />
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quotes" element={<QuoteListPage />} />
          <Route path="/quotes/new" element={<QuoteNewPage />} />
          <Route path="/quotes/:id" element={<QuoteDetailPage />} />
          <Route path="/quotes/:id/edit" element={<QuoteEditPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PageTransition>
      <Toast toasts={toasts} onRemove={removeToast} />
      <KeyboardHint />
      <WelcomeModal />
    </ToastContext.Provider>
  )
}
