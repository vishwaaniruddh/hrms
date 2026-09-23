<?php
/**
 * Cache Tests
 * Tests cache set/get, TTL expiration, tag invalidation, and remember()
 */
class CacheTest
{
    private Cache $cache;
    private int $passed = 0;
    private int $failed = 0;

    public function __construct()
    {
        $this->cache = Cache::createWith(__DIR__ . '/../../storage/test_cache');
    }

    public function run(): array
    {
        $this->cache->clear();

        $this->testSetAndGet();
        $this->testMiss();
        $this->testDelete();
        $this->testTTLExpiry();
        $this->testHas();
        $this->testRemember();
        $this->testTagInvalidation();
        $this->testClear();

        $this->cache->clear();

        return ['passed' => $this->passed, 'failed' => $this->failed];
    }

    private function testSetAndGet(): void
    {
        $this->cache->set('test_key', ['name' => 'John'], 60);
        $result = $this->cache->get('test_key');
        $this->assert($result !== null && $result['name'] === 'John', 'Set and Get');
    }

    private function testMiss(): void
    {
        $result = $this->cache->get('nonexistent_key');
        $this->assert($result === null, 'Cache Miss');
    }

    private function testDelete(): void
    {
        $this->cache->set('delete_me', 'value', 60);
        $this->cache->delete('delete_me');
        $result = $this->cache->get('delete_me');
        $this->assert($result === null, 'Delete');
    }

    private function testTTLExpiry(): void
    {
        $this->cache->set('expires_fast', 'data', 1);
        sleep(2);
        $result = $this->cache->get('expires_fast');
        $this->assert($result === null, 'TTL Expiry');
    }

    private function testHas(): void
    {
        $this->cache->set('exists', 'yes', 60);
        $this->assert($this->cache->has('exists') === true, 'Has (exists)');
        $this->assert($this->cache->has('not_exists') === false, 'Has (not exists)');
    }

    private function testRemember(): void
    {
        $callCount = 0;
        $value = $this->cache->remember('remembered', 60, function () use (&$callCount) {
            $callCount++;
            return 'computed_value';
        });
        $this->assert($value === 'computed_value' && $callCount === 1, 'Remember (first call)');

        $value2 = $this->cache->remember('remembered', 60, function () use (&$callCount) {
            $callCount++;
            return 'new_value';
        });
        $this->assert($value2 === 'computed_value' && $callCount === 1, 'Remember (cached call)');
    }

    private function testTagInvalidation(): void
    {
        $this->cache->setWithTags('tagged_1', 'data1', ['group_a'], 60);
        $this->cache->setWithTags('tagged_2', 'data2', ['group_a'], 60);
        $this->cache->setWithTags('tagged_3', 'data3', ['group_b'], 60);

        $this->cache->invalidateByTag('group_a');

        $this->assert($this->cache->get('tagged_1') === null, 'Tag Invalidation (tagged_1 cleared)');
        $this->assert($this->cache->get('tagged_2') === null, 'Tag Invalidation (tagged_2 cleared)');
        $this->assert($this->cache->get('tagged_3') === 'data3', 'Tag Invalidation (tagged_3 preserved)');
    }

    private function testClear(): void
    {
        $this->cache->set('a', 1, 60);
        $this->cache->set('b', 2, 60);
        $count = $this->cache->clear();
        $this->assert($count >= 2, 'Clear All');
    }

    private function assert(bool $condition, string $testName): void
    {
        if ($condition) {
            $this->passed++;
            echo "  ✅ PASS: $testName\n";
        } else {
            $this->failed++;
            echo "  ❌ FAIL: $testName\n";
        }
    }
}
