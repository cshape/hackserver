var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/ideas', function(req, res, next) {
	var title = req.body.username;
	var leader = req.body.leader;
	var description = req.body.description;
	console.log("Idea Noted:", title);
});

router.get('/cool', function(req, res, next) {
  res.send('i am cool!!!!');
  console.log('cool page visited');
});

module.exports = router;
