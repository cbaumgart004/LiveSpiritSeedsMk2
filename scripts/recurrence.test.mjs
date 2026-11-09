// node --test scripts/*.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { regularDates, repeatText } from '../src/cms/recurrence.js'

test('weekly and every other week run from today on, to the Until date, leaving out skipped days', () => {
  const e = { date: '2026-10-24', repeat: 'weekly', repeatUntil: '2026-12-12', skipDates: [{ date: '2026-11-28' }] }
  assert.deepEqual(regularDates(e, '2026-11-09'), ['2026-11-14', '2026-11-21', '2026-12-05', '2026-12-12'])
  assert.deepEqual(regularDates({ ...e, repeat: 'biweekly', skipDates: [] }, '2026-11-09'), ['2026-11-21', '2026-12-05'])
})

test('an ongoing pattern stops at the most it is asked for, and today itself counts', () => {
  const dates = regularDates({ date: '2026-01-03', repeat: 'weekly' }, '2026-11-14', 3)
  assert.deepEqual(dates, ['2026-11-14', '2026-11-21', '2026-11-28'])
})

test('monthly keeps the date, or the weekday and its place in the month', () => {
  assert.deepEqual(regularDates({ date: '2026-01-31', repeat: 'monthlyDate' }, '2026-02-01', 3), ['2026-02-28', '2026-03-31', '2026-04-30'])
  // November 14, 2026 is the second Saturday.
  assert.deepEqual(regularDates({ date: '2026-11-14', repeat: 'monthlyWeekday' }, '2026-11-15', 3), ['2026-12-12', '2027-01-09', '2027-02-13'])
  // The fifth of a weekday means the last one.
  assert.deepEqual(regularDates({ date: '2026-10-31', repeat: 'monthlyWeekday' }, '2026-11-01', 2), ['2026-11-28', '2026-12-26'])
})

test('nothing for an event that does not repeat regularly, or whose pattern has ended', () => {
  assert.deepEqual(regularDates({ date: '2026-11-14', repeat: 'custom' }, '2026-11-01'), [])
  assert.deepEqual(regularDates({ date: '2026-11-14' }, '2026-11-01'), [])
  assert.deepEqual(regularDates({ date: '2026-10-03', repeat: 'weekly', repeatUntil: '2026-10-31' }, '2026-11-01'), [])
})

test('says the pattern in words', () => {
  assert.equal(repeatText({ date: '2026-11-14', repeat: 'weekly' }), 'Every Saturday')
  assert.equal(repeatText({ date: '2026-11-14', repeat: 'biweekly' }), 'Every other Saturday')
  assert.equal(repeatText({ date: '2026-11-12', repeat: 'monthlyDate' }), 'Monthly on the 12th')
  assert.equal(repeatText({ date: '2026-11-14', repeat: 'monthlyWeekday' }), 'Monthly on the second Saturday')
  assert.equal(repeatText({ date: '2026-11-14', repeat: 'custom' }), '')
})
