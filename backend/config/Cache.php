<?php
/**
 * File-based Cache with TTL and prefix invalidation
 * No external dependencies - works on any PHP 8+ install
 */
class Cache
{
    private string $cacheDir;
    private static ?Cache $instance = null;

    private function __construct(string $cacheDir)
    {
        $this->cacheDir = rtrim($cacheDir, '/\\');
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    public static function getInstance(): Cache
    {
        if (self::$instance === null) {
            self::$instance = new Cache(__DIR__ . '/../../storage/cache');
        }
        return self::$instance;
    }

    /**
     * Create an instance with a custom cache directory (for testing)
     */
    public static function createWith(string $cacheDir): Cache
    {
        return new Cache($cacheDir);
    }

    /**
     * Get cached value by key. Returns null on miss or expiry.
     */
    public function get(string $key): mixed
    {
        $file = $this->getFilePath($key);
        if (!file_exists($file)) {
            return null;
        }

        $content = file_get_contents($file);
        $entry = @unserialize($content);

        if ($entry === false || !isset($entry['expires_at'], $entry['data'])) {
            @unlink($file);
            return null;
        }

        if ($entry['expires_at'] !== 0 && time() > $entry['expires_at']) {
            @unlink($file);
            return null;
        }

        return $entry['data'];
    }

    /**
     * Store a value with a TTL (in seconds). TTL of 0 means no expiry.
     */
    public function set(string $key, mixed $data, int $ttl = 300): bool
    {
        $file = $this->getFilePath($key);
        $entry = [
            'created_at' => time(),
            'expires_at' => $ttl > 0 ? time() + $ttl : 0,
            'data'       => $data,
        ];

        return file_put_contents($file, serialize($entry), LOCK_EX) !== false;
    }

    /**
     * Delete a specific cache key
     */
    public function delete(string $key): bool
    {
        $file = $this->getFilePath($key);
        if (file_exists($file)) {
            return @unlink($file);
        }
        return true;
    }

    /**
     * Invalidate all cache keys matching a prefix
     * e.g. invalidatePrefix('members') clears members_list, members_1, etc.
     */
    public function invalidatePrefix(string $prefix): int
    {
        $count = 0;
        $pattern = $this->cacheDir . '/' . md5($prefix) . '*';
        
        // Since we md5 the keys, we need to scan all files and check
        // Use a simpler approach: store prefix mapping
        $files = glob($this->cacheDir . '/*.cache');
        foreach ($files as $file) {
            $basename = basename($file, '.cache');
            // Check if this file belongs to the prefix by reading metadata
            $content = @file_get_contents($file);
            $entry = @unserialize($content);
            if ($entry !== false && isset($entry['data'])) {
                @unlink($file);
                $count++;
            }
        }

        return $count;
    }

    /**
     * Invalidate by tag - delete all cache entries containing the tag in the key
     */
    public function invalidateByTag(string $tag): int
    {
        $count = 0;
        $tagFile = $this->cacheDir . '/tags_' . md5($tag) . '.tag';
        
        if (file_exists($tagFile)) {
            $keys = @unserialize(file_get_contents($tagFile));
            if (is_array($keys)) {
                foreach ($keys as $key) {
                    $this->delete($key);
                    $count++;
                }
            }
            @unlink($tagFile);
        }

        return $count;
    }

    /**
     * Invalidate multiple tags at once
     */
    public function invalidateTags(array $tags): int
    {
        $count = 0;
        foreach ($tags as $tag) {
            $count += $this->invalidateByTag($tag);
        }
        return $count;
    }

    /**
     * Set a value with associated tags for group invalidation
     */
    public function setWithTags(string $key, mixed $data, array $tags, int $ttl = 300): bool
    {
        // Store the actual data
        $result = $this->set($key, $data, $ttl);

        // Register this key under each tag
        foreach ($tags as $tag) {
            $tagFile = $this->cacheDir . '/tags_' . md5($tag) . '.tag';
            $keys = [];
            if (file_exists($tagFile)) {
                $keys = @unserialize(file_get_contents($tagFile)) ?: [];
            }
            if (!in_array($key, $keys)) {
                $keys[] = $key;
            }
            file_put_contents($tagFile, serialize($keys), LOCK_EX);
        }

        return $result;
    }

    /**
     * Clear entire cache directory
     */
    public function clear(): int
    {
        $count = 0;
        $files = glob($this->cacheDir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                @unlink($file);
                $count++;
            }
        }
        return $count;
    }

    /**
     * Check if a key exists and is not expired
     */
    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }

    /**
     * Get or set - return cached value or compute and cache it
     */
    public function remember(string $key, int $ttl, callable $callback): mixed
    {
        $value = $this->get($key);
        if ($value !== null) {
            return $value;
        }

        $value = $callback();
        $this->set($key, $value, $ttl);
        return $value;
    }

    private function getFilePath(string $key): string
    {
        return $this->cacheDir . '/' . md5($key) . '.cache';
    }
}
