/**
 * Unit tests for rate-limit.ts
 *
 * Tests the in-memory rate limiting utility for development environments.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit, getIpAddress, type RateLimitOptions } from "../rate-limit";

describe("rate-limit", () => {
  // Reset module state between tests by using unique identifiers
  let testId = 0;
  const getTestId = () => `test-${Date.now()}-${testId++}`;

  describe("rateLimit", () => {
    it("should allow first request", () => {
      const options: RateLimitOptions = {
        identifier: getTestId(),
        limit: 10,
        windowMs: 60000,
      };

      const result = rateLimit(options);

      expect(result.success).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
      expect(result.reset).toBeGreaterThan(Date.now());
    });

    it("should decrement remaining on each request", () => {
      const identifier = getTestId();
      const options: RateLimitOptions = {
        identifier,
        limit: 5,
        windowMs: 60000,
      };

      // Make 3 requests
      rateLimit(options);
      rateLimit(options);
      const result = rateLimit(options);

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("should reject requests when limit exceeded", () => {
      const identifier = getTestId();
      const options: RateLimitOptions = {
        identifier,
        limit: 3,
        windowMs: 60000,
      };

      // Exhaust the limit
      rateLimit(options);
      rateLimit(options);
      rateLimit(options);

      // Fourth request should fail
      const result = rateLimit(options);

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after window expires", () => {
      const identifier = getTestId();
      const now = Date.now();

      // Mock Date.now to control time
      const dateSpy = vi.spyOn(Date, "now");
      dateSpy.mockReturnValue(now);

      const options: RateLimitOptions = {
        identifier,
        limit: 2,
        windowMs: 1000, // 1 second window
      };

      // Exhaust limit
      rateLimit(options);
      rateLimit(options);
      const exhausted = rateLimit(options);
      expect(exhausted.success).toBe(false);

      // Move time forward past the window
      dateSpy.mockReturnValue(now + 2000);

      // Should allow new request
      const result = rateLimit(options);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);

      dateSpy.mockRestore();
    });

    it("should track different identifiers separately", () => {
      const options1: RateLimitOptions = {
        identifier: getTestId(),
        limit: 1,
        windowMs: 60000,
      };

      const options2: RateLimitOptions = {
        identifier: getTestId(),
        limit: 1,
        windowMs: 60000,
      };

      // Exhaust first identifier
      rateLimit(options1);
      const result1 = rateLimit(options1);
      expect(result1.success).toBe(false);

      // Second identifier should still work
      const result2 = rateLimit(options2);
      expect(result2.success).toBe(true);
    });
  });

  describe("getIpAddress", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "192.168.1.1, 10.0.0.1",
        },
      });

      expect(getIpAddress(request)).toBe("192.168.1.1");
    });

    it("should extract IP from x-real-ip header", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-real-ip": "203.0.113.50",
        },
      });

      expect(getIpAddress(request)).toBe("203.0.113.50");
    });

    it("should prefer x-forwarded-for over x-real-ip", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "203.0.113.50",
        },
      });

      expect(getIpAddress(request)).toBe("192.168.1.1");
    });

    it("should return 'unknown' when no IP headers present", () => {
      const request = new Request("https://example.com");

      expect(getIpAddress(request)).toBe("unknown");
    });

    it("should trim whitespace from forwarded-for header", () => {
      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "  192.168.1.1  , 10.0.0.1",
        },
      });

      expect(getIpAddress(request)).toBe("192.168.1.1");
    });
  });
});
