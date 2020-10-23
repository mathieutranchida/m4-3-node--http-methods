"use strict";

// import the needed node_modules.
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { stock, customers } = require("./data/inventory");

express()
  // Below are methods that are included in express(). We chain them for convenience.
  // --------------------------------------------------------------------------------

  // This will give us will log more info to the console. see https://www.npmjs.com/package/morgan
  .use(morgan("tiny"))
  .use(bodyParser.json())

  // Any requests for static files will go into the public folder
  .use(express.static("public"))

  // Nothing to modify above this line
  // ---------------------------------
  // add new endpoints here 👇

  .post("/order", (req, res) => {
    const {
      order,
      size,
      givenName,
      surname,
      email,
      address,
      province,
      postcode,
      country,
      city,
    } = req.body;

    // let doesCustExist = false;

    let currentError = undefined;

    const repeatError = customers.some((customer) => {
      const rError =
        customer.email.toLowerCase() === email.toLowerCase() ||
        customer.surname.toLowerCase() === surname.toLowerCase() ||
        customer.address.toLowerCase() === address.toLowerCase();
      if (rError) {
        currentError = "repeat-customer";
      }
      return rError;
    });

    let undeliverableError = undefined;
    if (country.toLowerCase() !== "canada") {
      undeliverableError = true;
      currentError = "undeliverable";
    }

    let missingError = undefined;
    if (!email.includes("@")) {
      missingError = true;
      currentError = "missing-data";
    }

    let unavailableError = undefined;
    if (order === "shirt" && stock[order][size] < 1) {
      unavailableError = true;
      currentError = "unavailable";
    } else if (stock[order] < 1) {
      unavailableError = true;
      currentError = "unavailable";
    }

    if (repeatError || undeliverableError || missingError || unavailableError) {
      res.status(400).json({ status: "error", message: currentError });
      return;
    } else {
      res.status(200).json({ status: 200, message: "success" });
      return;
    }
  })

  // add new endpoints here ☝️
  // ---------------------------------
  // Nothing to modify below this line

  // this is our catch all endpoint.
  .get("*", (req, res) => {
    res.status(404).json({
      status: 404,
      message: "This is obviously not what you are looking for.",
    });
  })

  // Node spins up our server and sets it to listen on port 8000.
  .listen(8000, () => console.log(`Listening on port 8000`));
