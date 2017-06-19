var express = require('express');
var router = express.Router();
var user = require('../controllers/user')

router.post('/newUser', function(req, res, next) {
  user.createUser("asas", function (id, status) {
   google.getRefreshToken(id, req.body.code, function (status) {
      res.json(id)
    });
  })
})

module.exports = router;
