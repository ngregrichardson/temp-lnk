require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const { isAfter } = require("date-fns");
let admin = require("firebase-admin");

let serviceAccount = require(`${__dirname}/${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

let db = admin.firestore();
let linksCollection = db.collection("links");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("../client/build"));

app.listen(process.env.PORT || 8000, () => console.log("Server started"));

app.post("/create", (req, res) => {
  const { redirectTo, type, maxClicks, expirationDate } = req.body;
  if (!redirectTo || redirectTo.trim() === "") {
    res.status(400).json({
      type: "error",
      statusCode: 400,
      message: "Invalid value for `redirectTo` field.",
    });
  }
  if (!redirectTo || (type !== "CLICKS" && type !== "DAYS")) {
    res.status(400).json({
      type: "error",
      statusCode: 400,
      message: "Invalid value for `type` field.",
    });
  }
  if (type === "CLICKS" && (!maxClicks || maxClicks < 1)) {
    res.status(400).json({
      type: "error",
      statusCode: 400,
      message: "Invalid value for `maxClicks` field.",
    });
  }
  if (type === "DAYS" && !expirationDate) {
    res.status(400).json({
      type: "error",
      statusCode: 400,
      message: "Invalid value for `maxClicks` field.",
    });
  }

  linksCollection
    .add({
      redirectTo,
      type,
      maxClicks,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      clicks: 0,
    })
    .then((doc) => {
      const shortId = doc.id.slice(-6);
      res.status(200).json({
        type: "success",
        statusCode: 200,
        message: "Your link was created and copied to your clipboard!",
        data: `${
          process.env.ENV === "prod"
            ? "https://templnk.iamnoah.dev"
            : `http://localhost:${process.env.PORT || 8000}`
        }/${shortId}`,
      });
      doc
        .update({ id: doc.id, shortId: shortId })
        .catch((e) => console.error(e));
    })
    .catch((e) => {
      res.status(500).json({
        type: "error",
        statusCode: 500,
        message: e.message,
      });
    });
});

app.get("/:shortId", (req, res) => {
  if (req.params.shortId) {
    linksCollection
      .where("shortId", "==", req.params.shortId)
      .get()
      .then((snapshots) => {
        if (!snapshots.empty) {
          let doc = snapshots.docs[0].data();
          if (doc.type === "CLICKS") {
            if (doc.clicks >= doc.maxClicks) {
              res.sendFile(path.resolve("../client/build/index.html"));
              linksCollection
                .doc(doc.id)
                .delete()
                .catch((e) => console.error(e));
              return;
            }
            linksCollection
              .doc(doc.id)
              .update({ clicks: doc.clicks + 1 })
              .catch((e) => console.error(e));
          } else if (doc.type === "DAYS") {
            if (isAfter(new Date(), doc.expirationDate.toDate())) {
              res.sendFile(path.resolve("../client/build/index.html"));
              linksCollection
                .doc(doc.id)
                .delete()
                .catch((e) => console.error(e));
              return;
            }
          }
          res.redirect(doc.redirectTo);
        } else {
          res.sendFile(path.resolve("../client/build/index.html"));
        }
      });
  }
});

app.get("*", (req, res) => {
  return res.sendFile(path.resolve("../client/build/index.html"));
});
