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

// Module-level cache bound to user ID so switching accounts invalidates cache
let cachedUserId: string | null = null
let cachedPermissions: Record<string, PermEntry> | null = null
let cachedIsSuperAdmin = false
let cachedIsAdministrator = false

export function usePermissions(): UsePermissionsResult {
  const { user } = useApp()

  // Invalidate cache if user logged out or switched accounts
  if (user?.id !== cachedUserId) {
    cachedUserId = user?.id ?? null
    cachedPermissions = null
    cachedIsSuperAdmin = false
    cachedIsAdministrator = false
  }

  const [loading, setLoading] = React.useState(true)
  const [permissions, setPermissions] = React.useState<Record<string, PermEntry>>(cachedPermissions || {})
  const [isSuperAdmin, setIsSuperAdmin] = React.useState(cachedIsSuperAdmin)
  const [isAdministrator, setIsAdministrator] = React.useState(cachedIsAdministrator)

  const fetchPerms = React.useCallback(async () => {
    if (!user) {
      setIsSuperAdmin(false)
      setIsAdministrator(false)
      setPermissions({})
      setLoading(false)
      return
    }

    // SUPER_ADMIN always bypasses group permissions — sees everything
    if (user.role === 'SUPER_ADMIN') {
      setIsSuperAdmin(true)
      setIsAdministrator(false)
      cachedIsSuperAdmin = true
      cachedIsAdministrator = false
      cachedPermissions = null
      setPermissions({})
      setLoading(false)
      return
    }

    // Non-super-admin users check group permissions
    setIsSuperAdmin(false)
    cachedIsSuperAdmin = false

    try {
      const res = await fetch('/api/groups?me=true', { cache: 'no-store' })
      if (!res.ok) {
        setPermissions({})
        setIsAdministrator(user.role === 'ADMINISTRATOR')
        setLoading(false)
        return
      }
      const d = await res.json()
      const perms = d.permissions || {}
      const userGroups = d.groups || []

      setPermissions(perms)
      cachedPermissions = perms

      // An ADMINISTRATOR who is NOT in any group gets fallback unrestricted access.
      // If placed in specific group(s), their group permissions are enforced.
      const isUnrestrictedAdmin = user.role === 'ADMINISTRATOR' && userGroups.length === 0
      setIsAdministrator(isUnrestrictedAdmin)
      cachedIsAdministrator = isUnrestrictedAdmin

      setLoading(false)
    } catch {
      setPermissions({})
      setIsAdministrator(user.role === 'ADMINISTRATOR')
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    fetchPerms()
  }, [fetchPerms])

  // Build allowed modules set
  const allowedModules = React.useMemo(() => {
    if (isSuperAdmin || isAdministrator) {
      return new Set<string>(['__all__'])
    }
    const set = new Set<string>(['admin-dashboard']) // Dashboard is always allowed
    for (const [mod, p] of Object.entries(permissions)) {
      if (p.canView) set.add(mod)
    }
    return set
  }, [permissions, isSuperAdmin, isAdministrator])

  const hasAllAccess = isSuperAdmin || isAdministrator

  const canView = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    if (module === 'admin-dashboard' || module === 'dashboard') return true
    if (module === 'admin-cms') {
      return (
        !!permissions['admin-cms']?.canView ||
        Object.keys(permissions).some((k) => k.startsWith('cms-') && permissions[k]?.canView)
      )
    }
    if (module.startsWith('cms-')) {
      return !!permissions['admin-cms']?.canView || !!permissions[module]?.canView
    }
    return !!permissions[module]?.canView
  }, [permissions, hasAllAccess])

  const canCreate = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    if (module === 'admin-cms') {
      return (
        !!permissions['admin-cms']?.canCreate ||
        Object.keys(permissions).some((k) => k.startsWith('cms-') && permissions[k]?.canCreate)
      )
    }
    if (module.startsWith('cms-')) {
      return !!permissions['admin-cms']?.canCreate || !!permissions[module]?.canCreate
    }
    return !!permissions[module]?.canCreate
  }, [permissions, hasAllAccess])

  const canEdit = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    if (module === 'admin-cms') {
      return (
        !!permissions['admin-cms']?.canEdit ||
        Object.keys(permissions).some((k) => k.startsWith('cms-') && permissions[k]?.canEdit)
      )
    }
    if (module.startsWith('cms-')) {
      return !!permissions['admin-cms']?.canEdit || !!permissions[module]?.canEdit
    }
    return !!permissions[module]?.canEdit
  }, [permissions, hasAllAccess])

  const canDelete = React.useCallback((module: string) => {
    if (hasAllAccess) return true
    if (module === 'admin-cms') {
      return (
        !!permissions['admin-cms']?.canDelete ||
        Object.keys(permissions).some((k) => k.startsWith('cms-') && permissions[k]?.canDelete)
      )
    }
    if (module.startsWith('cms-')) {
      return !!permissions['admin-cms']?.canDelete || !!permissions[module]?.canDelete
    }
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
