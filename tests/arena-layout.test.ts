import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.tsx','utf8');
const base = readFileSync('src/arena.css','utf8');
const fix = readFileSync('src/arena-hand-grid-fix-v34.css','utf8');
const iphone = readFileSync('src/arena-iphone-layout-v18.css','utf8');

test('combat HUD stays inside the board, never as a direct root grid item',()=>{
  const divider = app.indexOf('className={`battle-divider');
  const hud = app.indexOf('className="arena-combat-hud"');
  const hand = app.indexOf('<section className="arena-hand"');
  assert.ok(divider >= 0 && hud > divider && hand > hud, 'HUD must precede hand inside board');
  const between = app.slice(divider,hud);
  assert.ok(!between.includes('</section>'), 'HUD must remain inside the board section');
  assert.ok(fix.includes('.battle-divider .arena-combat-hud{position:absolute'), 'HUD must not consume grid height');
});

test('portrait layout reserves distinct grid rows for hand, hint and actions',()=>{
  assert.match(base,/grid-template-rows:34px 64px minmax\(0,1fr\)/);
  assert.match(iphone,/\.arena-hand\{overflow:visible/);
  assert.match(fix,/\.mobile-game>\.arena-hand\{grid-row:4/);
  assert.match(fix,/\.mobile-game>\.arena-hint\{grid-row:5/);
  assert.match(fix,/\.mobile-game>\.arena-actions\{grid-row:6/);
});

test('hand card elements remain rendered independently from selected-card HUD',()=>{
  assert.match(app,/className="arena-hand"/);
  assert.match(app,/className="hand-cards"/);
  assert.match(fix,/\.arena-hand-card\{visibility:visible/);
});
