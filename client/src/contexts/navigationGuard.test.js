import test from 'node:test';
import assert from 'node:assert/strict';
import { runNavigationGuard } from './navigationGuard.js';

test('등록된 guard가 전환을 거부하면 action을 실행하지 않는다', () => {
    let actionCount = 0;

    const didNavigate = runNavigationGuard(
        () => false,
        () => { actionCount += 1; }
    );

    assert.equal(didNavigate, false);
    assert.equal(actionCount, 0);
});

test('guard가 없거나 승인하면 action을 한 번 실행한다', () => {
    let actionCount = 0;

    assert.equal(runNavigationGuard(null, () => { actionCount += 1; }), true);
    assert.equal(runNavigationGuard(() => true, () => { actionCount += 1; }), true);
    assert.equal(actionCount, 2);
});
