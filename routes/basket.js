var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var mongoose = require( 'mongoose' );
var users = mongoose.model( 'users', users );
var campaigns = mongoose.model( 'campaigns', campaigns );
var littlebit = require('../lb_modules/node/littlebit.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	return res.render('basket');
});
router.post('/', function(req, res, next) {
	if (req.body.amount) {
		lb = new littlebit('3365645617dab0a1856a99b444fc73e4a87e947f');
		lb.donate(req.body.amount);
		return res.json({status:"ok", message:"you have donated $" + amount.toFix(2)});
	}
	return res.json({status:"ok"});
});
module.exports = router;
