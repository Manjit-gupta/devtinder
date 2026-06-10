// Toast is rendered via ToastProvider in App.jsx.
// This file wires the ToastProvider into the tree.
import { ToastProvider } from '../context/ToastContext'

export default function Toast({ children }) {
  return <ToastProvider>{children}</ToastProvider>
}
