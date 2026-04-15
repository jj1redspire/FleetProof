export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function getConditionColor(status: string): string {
  const colors: Record<string, string> = {
    good: 'text-green-700',
    minor_damage: 'text-yellow-700',
    needs_repair: 'text-red-700',
  }
  return colors[status] ?? 'text-charcoal-400'
}

export function getConditionBg(status: string): string {
  const colors: Record<string, string> = {
    good: 'bg-green-50 border-green-200',
    minor_damage: 'bg-yellow-50 border-yellow-200',
    needs_repair: 'bg-red-50 border-red-200',
  }
  return colors[status] ?? 'bg-surface-muted border-surface-border'
}

export function getSessionStatusBadge(status: string): string {
  const classes: Record<string, string> = {
    active: 'badge-checked-out',
    completed: 'badge-available',
    disputed: 'badge-needs-repair',
  }
  return classes[status] ?? 'badge-available'
}

export function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    golf_cart: 'Golf Cart',
    lsv: 'LSV',
    shuttle: 'Shuttle',
    utility: 'Utility Vehicle',
    bicycle: 'Bicycle',
    scooter: 'Scooter',
    other: 'Other',
  }
  return labels[type] ?? type
}

export function duration(start: string, end: string | null): string {
  if (!end) return 'In progress'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const hrs = Math.floor(ms / 3600000)
  const mins = Math.floor((ms % 3600000) / 60000)
  if (hrs === 0) return `${mins}m`
  return `${hrs}h ${mins}m`
}
