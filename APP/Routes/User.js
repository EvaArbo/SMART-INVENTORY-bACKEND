const router = require('express').Router();

const userController = require('./../Controller/User/user');

router.get("/", userController.index);
router.post("/", userController.create);
router.patch("/:id", userController.update);
router.delete("/:id", userController.destroy);

module.exports = router;