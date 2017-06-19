var express = require('express');
var router = express.Router();
var user = require('../controllers/user')

router.post('/newUser', function(req, res, next) {
  // user.createUser("asas", function (id, status) {
  //   res.json(id)
  // })
  res.json({id: 1});
})

module.exports = router;
