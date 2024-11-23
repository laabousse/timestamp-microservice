// tests/timestamp.test.js
const request = require("supertest");
const { app, server } = require("../index");

// Close the server after all tests are done
afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

describe("Timestamp Microservice Tests", () => {
  // Test 2: Valid date should return unix timestamp as number
  test("Valid date should return unix timestamp as number", async () => {
    const response = await request(app).get("/api/2015-12-25").expect(200);

    expect(response.body).toHaveProperty("unix");
    expect(typeof response.body.unix).toBe("number");
  });

  // Test 3: Valid date should return properly formatted UTC string
  test("Valid date should return properly formatted UTC string", async () => {
    const response = await request(app).get("/api/1970-01-01").expect(200);

    expect(response.body).toHaveProperty("utc");
    expect(typeof response.body.utc).toBe("string");
    expect(response.body.utc).toMatch(
      /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/
    );
  });

  // Test 4: Specific timestamp should return exact values
  test("Timestamp 1451001600000 should return specific date values", async () => {
    const response = await request(app).get("/api/1451001600000").expect(200);

    expect(response.body).toEqual({
      unix: 1451001600000,
      utc: "Fri, 25 Dec 2015 00:00:00 GMT",
    });
  });

  // Test 5: Should handle various parseable date formats
  test("Should handle various valid date formats", async () => {
    const testDates = [
      "2015-12-25",
      "2015/12/25",
      "25 Dec 2015",
      "December 25, 2015",
    ];

    for (const date of testDates) {
      const response = await request(app)
        .get(`/api/${encodeURIComponent(date)}`)
        .expect(200);

      expect(response.body).toHaveProperty("unix");
      expect(response.body).toHaveProperty("utc");
      expect(typeof response.body.unix).toBe("number");
      expect(typeof response.body.utc).toBe("string");
    }
  });

  // Test 6: Invalid date should return error object
  test("Invalid date should return error object", async () => {
    const response = await request(app).get("/api/invalid-date").expect(200);

    expect(response.body).toEqual({
      error: "Invalid Date",
    });
  });

  // Test 7 & 8: Empty date parameter should return current time
  test("Empty date parameter should return current time with unix and utc", async () => {
    const response = await request(app).get("/api").expect(200);

    // Test 7: Check unix property
    expect(response.body).toHaveProperty("unix");
    expect(typeof response.body.unix).toBe("number");

    // Test 8: Check utc property
    expect(response.body).toHaveProperty("utc");
    expect(typeof response.body.utc).toBe("string");
    expect(response.body.utc).toMatch(
      /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/
    );

    // Verify the timestamp is current (within 1 second)
    const currentTime = new Date().getTime();
    expect(Math.abs(response.body.unix - currentTime)).toBeLessThan(1000);
  });

  // Additional test to verify date handling edge cases
  test("Should handle edge case dates", async () => {
    const testCases = [
      {
        input: "1970-01-01",
        expectedUnix: 0,
        expectedUtc: "Thu, 01 Jan 1970 00:00:00 GMT",
      },
      {
        input: "2000-01-01",
        expectedUnix: 946684800000,
        expectedUtc: "Sat, 01 Jan 2000 00:00:00 GMT",
      },
    ];

    for (const testCase of testCases) {
      const response = await request(app)
        .get(`/api/${testCase.input}`)
        .expect(200);

      expect(response.body.unix).toBe(testCase.expectedUnix);
      expect(response.body.utc).toBe(testCase.expectedUtc);
    }
  });
});
