import './ErrorState.css'

type ErrorStateProps = {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <p className="error-state__message" role="alert">
        {message}
      </p>
      <button type="button" className="button" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  )
}

export default ErrorState
