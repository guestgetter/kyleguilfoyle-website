const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatDate } = require('./thoughts');

test('date-only thought dates display on their calendar day in Toronto', () => {
    assert.equal(formatDate('2026-09-21'), 'September 21, 2026');
});

const fs = require('node:fs');
test('episode 1 can be watched inline with a responsive player', () => {
  const page = fs.readFileSync('src/thoughts/tiny-little-machines-1.html', 'utf8');
  assert.match(page, /<iframe[^>]+src="https:\/\/www\.youtube-nocookie\.com\/embed\/Bc5QBFNeIGk"/);
  assert.match(page, /referrerpolicy="strict-origin-when-cross-origin"/);
  assert.match(page, /allowfullscreen/);
  const css = fs.readFileSync('src/style.css', 'utf8');
  assert.match(css, /aspect-ratio: 16 \/ 9/);
});
