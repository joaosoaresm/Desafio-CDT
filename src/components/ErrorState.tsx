type ErrorStateProps = {
  message: string
  onRetry: () => void
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div>
      <p role="alert">{message}</p>
      <button type="button" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  )
}

export default ErrorState
