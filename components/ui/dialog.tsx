'use client'

import type { ComponentProps } from 'react'
import { X } from 'lucide-react'
import { useRef } from 'react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { Button } from './button'
import { DialogClose, DialogContent as SharedDialogContent } from './ztd-me/ui/dialog'

export {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ztd-me/ui/dialog'

type ContentProps = ComponentProps<typeof SharedDialogContent> & {
  showCloseButton?: boolean
}

export function DialogContent({
  children,
  showCloseButton = true,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: ContentProps): React.JSX.Element {
  const { t } = useSiteTranslation()
  const closeLabel = t('a11y.close')
  const previousFocusRef = useRef<HTMLElement | null>(null)
  return (
    <SharedDialogContent
      data-slot="dialog-content"
      {...props}
      onOpenAutoFocus={(event) => {
        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
        onOpenAutoFocus?.(event)
      }}
      onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event)
        if (!event.defaultPrevented && previousFocusRef.current?.isConnected === true) {
          event.preventDefault()
          previousFocusRef.current.focus({ preventScroll: true })
        }
      }}
    >
      {children}
      {showCloseButton && (
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2" aria-label={closeLabel}>
            <X size={16} aria-hidden="true" />
          </Button>
        </DialogClose>
      )}
    </SharedDialogContent>
  )
}
