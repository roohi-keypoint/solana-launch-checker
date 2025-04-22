import { getRelativeTimeString, formatTimestampOutput } from '../format'

describe('getRelativeTimeString', () => {
  let originalDateNow: () => number
  let OriginalDate: typeof globalThis.Date

  beforeEach(() => {
    originalDateNow = Date.now
    OriginalDate = global.Date
    const mockNow = new OriginalDate('2025-04-21T12:00:00Z').getTime()
    Date.now = jest.fn(() => mockNow)
    global.Date = class extends OriginalDate {
      constructor(...args: any[]) {
        if (!args || args.length === 0) {
          super(mockNow)
        } else {
          super()
          return new.target.prototype instanceof OriginalDate ? Reflect.construct(OriginalDate, args, new.target) : (OriginalDate as any).apply(this, args)
        }
      }
    } as typeof globalThis.Date
  })

  afterEach(() => {
    Date.now = originalDateNow
    global.Date = OriginalDate
  })

  test('returns seconds for differences less than a minute', () => {
    const date = new Date(Date.now() - 30 * 1000)
    expect(getRelativeTimeString(date)).toBe('30 seconds ago')
    const singleSecondDate = new Date(Date.now() - 1 * 1000)
    expect(getRelativeTimeString(singleSecondDate)).toBe('1 second ago')
  })

  test('returns minutes for differences less than an hour', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000)
    expect(getRelativeTimeString(date)).toBe('30 minutes ago')
    const singleMinuteDate = new Date(Date.now() - 1 * 60 * 1000)
    expect(getRelativeTimeString(singleMinuteDate)).toBe('1 minute ago')
  })

  test('returns hours for differences less than a day', () => {
    const date = new Date(Date.now() - 5 * 60 * 60 * 1000)
    expect(getRelativeTimeString(date)).toBe('5 hours ago')
    const singleHourDate = new Date(Date.now() - 1 * 60 * 60 * 1000)
    expect(getRelativeTimeString(singleHourDate)).toBe('1 hour ago')
  })

  test('returns days for differences less than a month', () => {
    const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    expect(getRelativeTimeString(date)).toBe('5 days ago')
    const singleDayDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    expect(getRelativeTimeString(singleDayDate)).toBe('1 day ago')
  })

  test('returns months for differences less than a year', () => {
    const date = new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000)
    expect(getRelativeTimeString(date)).toBe('2 months ago')
    const singleMonthDate = new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000)
    expect(getRelativeTimeString(singleMonthDate)).toBe('1 month ago')
  })

  test('returns years for differences of a year or more', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)
    expect(getRelativeTimeString(date)).toBe('2 years ago')
    const singleYearDate = new Date(Date.now() - 1 * 365 * 24 * 60 * 60 * 1000)
    expect(getRelativeTimeString(singleYearDate)).toBe('1 year ago')
  })
})

describe('formatTimestampOutput', () => {
  let originalDateNow: () => number
  let OriginalDate: typeof globalThis.Date

  beforeEach(() => {
    originalDateNow = Date.now
    OriginalDate = global.Date
    const mockNow = new OriginalDate('2025-04-21T12:00:00Z').getTime()
    Date.now = jest.fn(() => mockNow)
    global.Date = class extends OriginalDate {
      constructor(...args: any[]) {
        if (!args || args.length === 0) {
          super(mockNow)
        } else {
          super()
          return new.target.prototype instanceof OriginalDate ? Reflect.construct(OriginalDate, args, new.target) : (OriginalDate as any).apply(this, args)
        }
      }
    } as typeof globalThis.Date
  })

  afterEach(() => {
    Date.now = originalDateNow
    global.Date = OriginalDate
  })

  test('formats timestamps correctly', () => {
    const timestamp = Math.floor(new Date('2025-04-20T12:00:00Z').getTime() / 1000)
    const result = formatTimestampOutput(timestamp)
    const parsed = JSON.parse(result)
    expect(parsed).toEqual({
      timestamp,
      date: '2025-04-20T12:00:00.000Z',
      relative: '1 day ago'
    })
  })

  test('handles timestamps from multiple time periods', () => {
    const minuteAgoTimestamp = Math.floor((Date.now() - 60 * 1000) / 1000)
    const minuteAgoResult = JSON.parse(formatTimestampOutput(minuteAgoTimestamp))
    expect(minuteAgoResult.relative).toBe('1 minute ago')
    const hoursAgoTimestamp = Math.floor((Date.now() - 2 * 60 * 60 * 1000) / 1000)
    const hoursAgoResult = JSON.parse(formatTimestampOutput(hoursAgoTimestamp))
    expect(hoursAgoResult.relative).toBe('2 hours ago')
    const monthsAgoTimestamp = Math.floor((Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) / 1000)
    const monthsAgoResult = JSON.parse(formatTimestampOutput(monthsAgoTimestamp))
    expect(monthsAgoResult.relative).toBe('3 months ago')
  })
})
