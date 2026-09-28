"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../public/contest-rules');

test('official price interval uses inward rounding and inclusive cent ticks', () => {
  assert.deepEqual(rules.priceLimits('225.14'), ['213.89', '236.39']);
  assert.deepEqual(rules.priceLimits('225.15'), ['213.90', '236.40']);
  assert.equal(rules.withinLimits('213.89', rules.priceLimits('225.15')), false);
  assert.equal(rules.withinLimits('236.40', rules.priceLimits('225.15')), true);
  for (const price of [225.15, '225.151', '1e2', '-10', '0']) assert.equal(rules.isDecimal(price), false);
});
test('expiry includes the next sweep, not an additional round', () => {
  assert.equal(rules.nextSweep({n:126}),127);
  assert.equal(rules.expirySweep({n:126},1),127);
  assert.equal(rules.expirySweep({for:127},3),129);
  assert.equal(rules.expirySweep({n:2555},9),2556);
  assert.equal(rules.tradingOpen(Date.parse('2026-09-25T11:59:59Z')),false);
  assert.equal(rules.tradingOpen(Date.parse('2026-09-25T12:00:00Z')),true);
  assert.equal(rules.tradingOpen(Date.parse('2026-10-04T09:00:00Z')),false);
});
test('fee is max(base, closing advantage), separately for each side', () => {
  assert.equal(rules.baseFee('96','10'),'9.600000');
  assert.deepEqual(rules.sideFees('sell','96','10','100'),{maker:'9.600000',taker:'40.000000'});
  assert.deepEqual(rules.sideFees('buy','104','10','100'),{maker:'10.400000',taker:'40.000000'});
  assert.deepEqual(rules.sideFees('buy','100','0.10','100'),{maker:'0.100000',taker:'0.100000'});
});
test('terms reject extras, missing keys and numeric price coercion', () => {
  const terms={id:'a',maker:'did',px:'100',qty:'0.10',side:'buy',taker:'any',until:1};
  assert.equal(Boolean(rules.exactTermsShape(terms)),true);
  for (const bad of [{...terms,px:100},{...terms,qty:'0.001'},{...terms,extra:true},{...terms,until:'1'}]) assert.equal(Boolean(rules.exactTermsShape(bad)),false);
  delete terms.id;
  assert.equal(Boolean(rules.exactTermsShape(terms)),false);
});
