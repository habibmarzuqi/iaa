/**
 * usePermissions — React hook for fetching and caching the current user's
 * group-based module permissions.
 *
 * Returns:
 *   - loading: boolean (true while fetching)
 *   - isSuperAdmin: boolean (bypass all checks)
 *   - isAdministrator: boolean (bypass all checks)
 *   - allowedModules: Set<string> of module keys the user can view
 *   - permissions: full permission map { module: { canView, canCreate, canEdit, canDelete } }
 *   - canView(module): boolean
 *   - canCreate(module): boolean
 *   - canEdit(module): boolean
 *   - canDelete(module): boolean
 *   - refresh(): re-fetch permissions
 */
'use client'

import * as React from 'react'
import { useApp } from '@/lib/store'

interface PermEntry {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

interface UsePermissionsResult {
  loading: boolean
  isSuperAdmin: boolean
  isAdministrator: boolean
  allowedModules: Set<string>
  permissions: Record<string, PermEntry>
  canView: (module: string) => boolean
  canCreate: (module: string) => boolean
  canEdit: (module: string) => boolean
  canDelete: (module: string) => boolean
  refresh: () => void
}

// Module-level cache so multiple components share the same fetch result
let cachedPermissions: Record<string, PermEntry> | null = null
let cachedIsSuperAdmin = false
let cachedIsAdministrator = false

export function usePermissions(): UsePermissionsResult {
  const { user } = useApp()
  const [loading, setLoading] = React.useState(true)
  const [permissions, setPermissions] = React.useState<Record<string, PermEntry>>(cachedPermissions || {})
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(cachedIsSuperAdmin)
  const [isAdministrator, setIsAdministrator] = React.useState(cachedIsAdministrator)

  const fetchPerms = React.useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    // SUPER_ADMIN & ADMINISTRATOR bypass group permissions — they see everything
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMINISTRATOR') {
      setIsSuperAdmin(user.role === 'SUPER_ADMIN')
      setIsAdministrator(user.role === 'ADMINISTRATOR')
      cachedIsSuperAdmin = user.role === 'SUPER_ADMIN'
      cachedIsAdministrator = user.role === 'ADMINISTRATOR'
      cachedPermissions = null // null = see everything
      setPermissions({})
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/groups?me=true', { cache: 'no-store' })
      if (!res.ok) {
        setPermissions({})
        setLoading(false)
        return
      }
      const d = await res.json()
      const perms = d.permissions || {}
      setPermissions(perms)
      cachedPermissions = perms
      setLoading(false)
    } catch {
      setPermissions({})
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchPerms()
  }, [fetchPerms])

  // Build allowed modules set
  const allowedModules = React.useMemo(() => {
    if (isSuperAdmin || isAdministrator) {
      // Return a special marker — all modules allowed
      return new Set<string>(['__all__'])
    }
    const set = new Set<string>()
    for (const [mod, p] of Object.entries(permissions)) {
      if (p.canView) set.add(mod)
    }
    return set
  }, [permissions, isSuperAdmin, isAdministrator])

  const hasAllAccess = isSuperAdmin || isAdministrator

  const canView = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    return !!permissions[module]?.canView
  }, [permissions, hasAllAccess])

  const canCreate = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    return !!permissions[module]?.canCreate
  }, [permissions, hasAllAccess])

  const canEdit = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    return !!permissions[module]?.canEdit
  }, [permissions, hasAllAccess])

  const canDelete = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    return !!permissions[module]?.canDelete
  }, [permissions, hasAllAccess])

  return {
    loading,
    isSuperAdmin,
    isAdministrator,
    allowedModules,
    permissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    refresh: fetchPerms,
  }
}
