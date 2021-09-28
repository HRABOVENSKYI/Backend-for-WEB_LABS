const Joi = require("joi");
const express = require("express");
const db = require("./database");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

function validateZoo(zoo) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    num_of_animals: Joi.number().integer().required(),
    num_of_visitors: Joi.number().integer().required(),
  });

  return schema.validate(zoo);
}

// GET
app.get("/", (req, resp) => {
  resp.send("Hello, World!!!");
});

app.get("/api/zoos", async (req, resp) => {
  let result = [];
  if (req.query.searchKey) {
    result = await db
      .promise()
      .query(`select * from zoo where name like '%${req.query.searchKey}%';`);
  } else {
    result = await db.promise().query(`select * from zoo`);
  }
  const zoos = result[0];
  resp.status(200).send(zoos);
});

app.get("/api/zoos/:id", async (req, resp) => {
  // get zoo by id
  const result = await db
    .promise()
    .query(`select * from zoo where id='${req.params.id}'`);
  const zoo = result[0][0];
  if (!zoo) {
    return resp.status(404).send("The zoo with the given ID was not found.");
  }

  resp.send(zoo);
});

// POST
app.post("/api/zoos", (req, resp) => {
  // validate zoo
  const { error } = validateZoo(req.body); // destructuring --> result.error
  if (error) {
    resp.status(400).send(error.details[0].message);
    return;
  }

  // store zoo in db
  try {
    db.query(
      `insert into zoo(name, num_of_animals, num_of_visitors) value ('${req.body.name}', '${req.body.num_of_animals}', '${req.body.num_of_visitors}')`
    );
    resp.status(200).send({ msg: "zoo created" });
  } catch (err) {
    console.log(err);
  }
});

// PUT
app.put("/api/zoos/:id", async (req, resp) => {
  // get zoo by id
  const result = await db
    .promise()
    .query(`select * from zoo where id='${req.params.id}'`);
  const zoo = result[0][0];
  if (!zoo) {
    return resp.status(404).send("The zoo with the given ID was not found.");
  }

  // validate zoo
  const { error } = validateZoo(req.body); // destructuring --> result.error
  if (error) {
    resp.status(400).send(error.details[0].message);
    return;
  }

  // update zoo
  try {
    db.query(
      `update zoo set name='${req.body.name}', num_of_animals='${req.body.num_of_animals}', num_of_visitors='${req.body.num_of_visitors}' where id='${req.params.id}'`
    );
  } catch (err) {
    console.log(err);
  }

  resp.send(zoo);
});

// DELETE
app.delete("/api/zoos/:id", async (req, resp) => {
  // get zoo by id
  const result = await db
    .promise()
    .query(`select * from zoo where id='${req.params.id}'`);
  const zoo = result[0][0];

  // delete zoo
  if (zoo) {
    db.query(`delete from zoo where id='${req.params.id}'`);
  } else {
    return resp.status(404).send("The zoo with the given ID was not found.");
  }

  resp.send(zoo);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
