const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatDate } = require('./thoughts');

test('date-only thought dates display on their calendar day in Toronto', () => {
    assert.equal(formatDate('2026-09-21'), 'September 21, 2026');
});
