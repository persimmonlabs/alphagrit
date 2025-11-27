// alphagrit/components/ui/toast/use-toast.ts
import * as React from 'react'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<string, Toast>

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  onDismiss?: () => void
  onAutoDismiss?: () => void
}

type State = {
  toasts: Toast[]
}

type Action =
  | {
      type: 'ADD_TOAST'
      toast: Toast
    }
  | {
      type: 'UPDATE_TOAST'
      toast: Toast
    }
  | {
      type: 'DISMISS_TOAST'
      toastId?: string
    }
  | {
      type: 'REMOVE_TOAST'
      toastId?: string
    }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case 'DISMISS_TOAST': {
      const { toastId } = action

      // ! Side effects !
      if (toastId) {
        toastTimeouts.get(toastId) && clearTimeout(toastTimeouts.get(toastId) as NodeJS.Timeout)
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                onOpenChange: (open) => {
                  if (!open) {
                    addToRemoveQueue(t.id)
                  }
                },
              }
            : t
        ),
      }
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type ToastFunction = (toast: Omit<Toast, 'id'>) => {
  id: string
  dismiss: () => void
  update: (toast: Toast) => void
}

const useToast = (): {
  toast: ToastFunction
  dismiss: (toastId?: string) => void
  toasts: Toast[]
} => {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast: React.useCallback(
      (props: Omit<Toast, 'id'>) => {
        const id = crypto.randomUUID()

        const update = (props: Toast) =>
          dispatch({
            type: 'UPDATE_TOAST',
            toast: { ...props, id },
          })
        const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

        dispatch({
          type: 'ADD_TOAST',
          toast: {
            ...props,
            id,
            onOpenChange: (open) => {
              if (!open) {
                dismiss()
              }
            },
          },
        })

        return {
          id: id,
          dismiss,
          update,
        }
      },
      [dispatch]
    ),
    dismiss: React.useCallback(
      (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
      [dispatch]
    ),
  }
}

export { useToast }
