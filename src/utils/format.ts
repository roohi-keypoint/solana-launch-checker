export const getRelativeTimeString = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffMonths / 12)
  
  if (diffYears > 0) return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`
  if (diffMonths > 0) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`
  if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  if (diffHr > 0) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  if (diffMin > 0) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  return `${diffSec} second${diffSec === 1 ? '' : 's'} ago`
}

export const formatTimestampOutput = (timestamp: number): string => {
  const deployDate = new Date(timestamp * 1000)
  const formattedDate = deployDate.toISOString()
  
  return JSON.stringify({
    timestamp,
    date: formattedDate,
    relative: getRelativeTimeString(deployDate)
  }, null, 2)
}
