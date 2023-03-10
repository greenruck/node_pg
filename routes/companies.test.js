const request = require("supertest");

const app = require("../app");
const { createData } = require("../_test-common");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("GET /", function () {

  test("It should respond with array of companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        {code: "apple", description: "Maker of OSX.", name: "Apple"},
        {code: "ibm",  description: "Big blue.", name: "IBM"},
      ]
    });
  })

});


describe("GET /apple", function () {

  test("It return company info", async function () {
    const response = await request(app).get("/companies/apple");
    expect(response.body).toEqual(
        {
          company: {
            code: "apple",
            name: "Apple",
            description: "Maker of OSX.",
            invoices: [1, 2],
          }
        }
    );
  });

  test("It should return 404 for no-such-company", async function () {
    const response = await request(app).get("/companies/greenruck");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("It should add company", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Turtle", description: "cowabunga"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "turtle",
            name: "Turtle",
            description: "cowabunga",
          }
        }
    );
  });

  test("It should return 500 for conflict", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Apple", description: "Again?"});

    expect(response.status).toEqual(500);
  })
});


describe("PATCH /", function () {

  test("It should update company", async function () {
    const response = await request(app)
        .patch("/companies/apple")
        .send({name: "AppleEdit", description: "NewDescrip"});

    expect(response.body).toEqual(
        {
          company: {
            code: "apple",
            name: "AppleEdit",
            description: "NewDescrip",
          }
        }
    );
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .patch("/companies/blargh")
        .send({name: "Blargh"});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .patch("/companies/apple")
        .send({});

    expect(response.status).toEqual(500);
  })
});


describe("DELETE /", function () {

  test("It should delete company", async function () {
    const response = await request(app)
        .delete("/companies/apple");

    expect(response.body).toEqual({ msg: "Deleted!" });
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .delete("/companies/blargh");

    expect(response.status).toEqual(404);
  });
});

