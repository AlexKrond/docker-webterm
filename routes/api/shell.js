const express = require("express");

const {killSession} = require("../../libs/sessions.js");
const {killContainer, getContainers, runContainer} = require("../../libs/containers.js");
const {getImages} = require("../../libs/images.js");
const {checkHost} = require("../../libs/shellLib.js");


function routerInit(sessions) {
  const router = express.Router();

  router.use((req, res, next) => {
    if (!req.query.host) {
      res.json({status: "false", msg: "No host specified."});
    }
    if (!checkHost(req.query.host)) {
      res.json({status: "false", msg: `No host ${req.query.host}.`});
    }
    next();
  });

  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/containers", async (req, res) => {
    const containers = await getContainers().catch(err => console.log(err));
    res.json(containers);
  });

  router.get("/images", async (req, res) => {
    const images = await getImages().catch(err => console.log(err));
    res.json(images);
  });

  router.get("/sessions/kill/:id", (req, res) => {
    if (killSession(sessions, req.params.id)) {
      res.json({status: "OK", msg: `Terminal with pid ${req.params.id} was killed.`});
    } else {
      res.json({status: "false", msg: `No terminal with pid ${req.params.id}.`});
    }
  });

  router.get("/containers/kill/:id", async (req, res) => {
    const isKilled = await killContainer(req.params.id);

    if (isKilled) {
      res.json({status: "OK", msg: `Container with id ${req.params.id} was killed.`});
    } else {
      res.json({status: "false", msg: `Container with id ${req.params.id} was not killed.`});
    }
  });

  router.get("/containers/run/:image", async (req, res) => {
    const id = await runContainer(req.params.image);

    if (id) {
      res.json({status: "OK", id: id, msg: `Container with image ${req.params.image} was created.`});
    } else {
      res.json({status: "false", msg: `Container with image ${req.params.image} was not created.`});
    }
  });

  router.get("/containers/attach/:id", async (req, res) => {
    const containers = await getContainers();

    if (containers.some(cont => cont.CONTAINER_ID === req.params.id)) {
      res.render("index");
    } else {
      res.json({status: "false", msg: `No container with id ${req.params.id}.`});
    }
  });

  router.get("/images/build/:name", (req, res) => {
    res.render("index");
  });


  return router;
}


module.exports.routerInit = routerInit;
