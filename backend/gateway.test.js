const request = require("supertest");
const app = require("./app");
const { response } = require("express");
const omitDeep = require("omit-deep-lodash");

const serial1 = Math.floor(Math.random() * 1000000).toString();
const serial2 = Math.floor(Math.random() * 1000000).toString();
const serial3 = Math.floor(Math.random() * 1000000).toString();
let gate1Id, gate2Id, gate3Id;

const gateway_partial = {
  serial: serial1,
  ipv4: "127.0.0.1",
};
const gateway_full = {
  serial: serial2,
  ipv4: "127.0.0.1",
  name: "test gateway",
};
describe("Test the gateways", () => {
  test("Partial creation", () => {
    return request(app)
      .post("/gateway")
      .send(gateway_partial)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.ipv4).toBe("127.0.0.1");
        expect(response.body.serial).toBe(serial1);
        expect(response.body.name).toBe(undefined);
        gate1Id = response.body.id;
      });
  });

  test("Double serial", () => {
    return request(app)
      .post("/gateway")
      .send(gateway_partial)
      .then((response) => {
        expect(response.statusCode).toBe(500);
      });
  });

  test("Full creation", () => {
    return request(app)
      .post("/gateway")
      .send(gateway_full)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.ipv4).toBe("127.0.0.1");
        expect(response.body.serial).toBe(serial2);
        expect(response.body.name).toBe("test gateway");
        gate2Id = response.body.id;
      });
  });

  test("Get partial", () => {
    return request(app)
      .get(`/gateway/${gate1Id}`)
      .then((response) => {
        expect(response.body).toMatchObject(gateway_partial);
      });
  });

  test("Get full", () => {
    return request(app)
      .get(`/gateway/${gate2Id}`)
      .then((response) => {
        expect(response.body).toMatchObject(gateway_full);
      });
  });

  test("Patch check", () => {
    return request(app)
      .patch(`/gateway/${gate2Id}`)
      .send({
        ...gateway_full,
        name: "Patched gateway",
      })
      .then((response) => {
        expect(response.body.name).toBe("Patched gateway");
      });
  });

  test("Delete", async () => {
    await request(app)
      .post("/gateway")
      .send({
        ipv4: "127.0.0.1",
        serial: serial3,
      })
      .then((response) => {
        gate3Id = response.body.id;
      });
    return request(app)
      .delete(`/gateway/${gate3Id}`)
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });

  test("Create without ipv4", () => {
    return request(app)
      .post("/gateway")
      .send({
        serial: serial3,
      })
      .then((response) => {
        expect(response.statusCode).toBe(500);
      });
  });

  test("Get non-existing", () => {
    return request(app)
      .get(`/gateway/${serial3}`)
      .then((response) => {
        expect(response.statusCode).toBe(404);
      });
  });
});

let device2Id;
const device_partial = {
  UID: 12345,
};
const device_full = {
  UID: 23456,
  vendor: "Motorama",
  status: "online",
};
describe("Test the devices", () => {
  test("Partial creation", () => {
    return request(app)
      .post(`/gateway/${gate1Id}/devices`)
      .send(device_partial)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.UID).toBe(12345);
        expect(response.body.UID).not.toBe("12345");
        expect(response.body.status).toBe(undefined);
        expect(response.body.dateCreated).toBeTruthy();
        device1Id = response.body.id;
      });
  });

  test("Full creation", () => {
    return request(app)
      .post(`/gateway/${gate1Id}/devices`)
      .send(device_full)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toMatchObject(device_full);
        device2Id = response.body.id;
      });
  });

  test("Patch check", () => {
    return request(app)
      .patch(`/gateway/${gate1Id}/devices/${device2Id}`)
      .send({
        ...device_full,
        status: "offline",
      })
      .then((response) => {
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe("offline");
      });
  });

  test("More than 10 restriction", async () => {
    for (let i = 0; i < 9; i++) {
      await request(app).post(`/gateway/${gate1Id}/devices`).send(device_full);
    }
    return request(app)
      .post(`/gateway/${gate1Id}/devices`)
      .send(device_full)
      .then((response) => {
        expect(response.statusCode).toBe(500);
      });
  });

  test("Wrong gateway post check", () => {
    return request(app)
      .post(`/gateway/0/devices`)
      .send(device_partial)
      .then((response) => {
        expect(response.statusCode).toBe(404);
      });
  });

  test("Wrong gateway patch check", () => {
    return request(app)
      .patch(`/gateway/0/devices`)
      .send(device_partial)
      .then((response) => {
        expect(response.statusCode).toBe(404);
      });
  });

  test("Wrong gateway delete check", () => {
    return request(app)
      .delete(`/gateway/0/devices`)
      .send(device_partial)
      .then((response) => {
        expect(response.statusCode).toBe(404);
      });
  });
});

describe("Big get /gateway test", () => {
  test("Get all gateways", () => {
    const gateway1 = {
      ID: gate1Id,
      serial: serial1,
      ipv4: "127.0.0.1",
      devices: [
        {
          UID: 12345,
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "offline",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
        {
          UID: 23456,
          vendor: "Motorama",
          status: "online",
        },
      ],
    };
    const gateway2 = {
      ID: gate2Id,
      serial: serial2,
      name: "Patched gateway",
      ipv4: "127.0.0.1",
      devices: [],
    };
    return request(app)
      .get(`/gateway`)
      .then((response) => {
        expect(
          omitDeep(response.body, "dateCreated", "deviceID")
        ).toContainEqual(gateway1);
        expect(response.body).toContainEqual(gateway2);
      });
  });
});
