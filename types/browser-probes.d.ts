import type { StorageAudit } from '../tests/e2e/storage-audit'

// Native Window extension requires declaration merging; business objects use aliases.
declare global {
  interface Window {
    showcaseStorageAudit: StorageAudit
  }
}
