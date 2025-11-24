import { Check } from 'lucide-react'

interface ToastProps {
  show: boolean
  message: string
}

export default function Toast({ show, message }: ToastProps) {
  if (!show) return null

  return (
    <div className="fixed top-4 left-4 z-50 animate-fade-in">
      <div className="bg-green-300 text-black px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
        <Check className="w-5 h-5" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
}
