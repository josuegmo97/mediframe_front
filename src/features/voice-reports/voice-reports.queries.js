import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/voice-reports.api'
import { useAuth } from '@/features/auth/auth-provider'
import { normalizeDeviceId } from '@/lib/device-description'
import { qk } from '@/lib/query-keys'

const MINUTE = 60_000

/** Lista completa: { settings, period, items, stats }. Es la fuente principal de la sección. */
export function useVoiceReportDevicesQuery(options = {}) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: qk.voiceReports.devices(),
    queryFn: api.listVoiceReportDevices,
    staleTime: 5 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

/** Configuración global. Reusa la copia que viene en la lista mientras no haya carga propia. */
export function useVoiceReportSettingsQuery(options = {}) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const listState = queryClient.getQueryState(qk.voiceReports.devices())
  const cached = listState?.data?.settings
  return useQuery({
    queryKey: qk.voiceReports.settings(),
    queryFn: () => api.getVoiceReportSettings().then((data) => data.settings),
    initialData: cached,
    initialDataUpdatedAt: cached ? listState?.dataUpdatedAt : undefined,
    staleTime: 5 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && (options.enabled ?? true),
  })
}

export function useVoiceReportDeviceQuery(deviceId) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const key = normalizeDeviceId(deviceId)
  const listState = queryClient.getQueryState(qk.voiceReports.devices())
  const cached = listState?.data?.items?.find((item) => normalizeDeviceId(item.device_id) === key)
  return useQuery({
    queryKey: qk.voiceReports.device(key),
    queryFn: () => api.getVoiceReportDevice(key).then((data) => data.item),
    initialData: cached,
    initialDataUpdatedAt: cached ? listState?.dataUpdatedAt : undefined,
    staleTime: 5 * MINUTE,
    gcTime: 60 * MINUTE,
    enabled: isAdmin && Boolean(key),
  })
}

/** Historial paginado en servidor: { items, pagination }. */
export function useVoiceReportDeviceUsageQuery(deviceId, params) {
  const { isAdmin } = useAuth()
  const key = normalizeDeviceId(deviceId)
  return useQuery({
    queryKey: qk.voiceReports.usage(key, params),
    queryFn: () => api.getVoiceReportDeviceUsage(key, params),
    placeholderData: (previous) => previous,
    staleTime: 2 * MINUTE,
    gcTime: 30 * MINUTE,
    enabled: isAdmin && Boolean(key),
  })
}

/** Al cambiar la configuración global cambian los estados de todos los devices: se invalida la lista. */
export function useUpdateVoiceReportSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: (patch) => api.updateVoiceReportSettings(patch).then((data) => data.settings),
    onSuccess: (settings) => {
      queryClient.setQueryData(qk.voiceReports.settings(), settings)
      queryClient.setQueryData(qk.voiceReports.devices(), (old) => (old ? { ...old, settings } : old))
      queryClient.invalidateQueries({ queryKey: qk.voiceReports.devices() })
    },
  })
}

export function useUpdateVoiceReportDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: ({ deviceId, patch }) => api.updateVoiceReportDevice(deviceId, patch).then((data) => data.item),
    onSuccess: (item) => {
      if (!item) return
      const key = normalizeDeviceId(item.device_id)
      queryClient.setQueryData(qk.voiceReports.device(key), item)
      queryClient.setQueryData(qk.voiceReports.devices(), (old) => {
        if (!old) return old
        const exists = old.items.some((i) => normalizeDeviceId(i.device_id) === key)
        const items = exists ? old.items.map((i) => (normalizeDeviceId(i.device_id) === key ? item : i)) : [...old.items, item]
        return { ...old, items }
      })
      queryClient.invalidateQueries({ queryKey: qk.voiceReports.devices() })
    },
  })
}

/**
 * Habilita (o deshabilita) varios dispositivos en serie. Devuelve { ok, failed }.
 * Se hace en serie para no disparar el rate limiter del backend (100 req/15 min por IP).
 */
export function useBulkSetVoiceReportEnabled() {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { silent: true },
    mutationFn: async ({ deviceIds, enabled }) => {
      const failed = []
      let ok = 0
      for (const deviceId of deviceIds) {
        try {
          await api.updateVoiceReportDevice(deviceId, { enabled })
          ok += 1
        } catch (error) {
          failed.push({ deviceId, error })
          if (error?.isRateLimited) break
        }
      }
      return { ok, failed }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.voiceReports.all })
    },
  })
}
