var express = require('express');
var router = express.Router();

//braintree intergration
var braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "32yqmqzm4jwqf269",
  publicKey: "rpmzdgnrt2nzx2b3",
  privateKey: "3507e86793b7bf1d5b35803558bed1a9"
});

//database
var mongoose = require( 'mongoose' );
var users  = mongoose.model( 'users', users );
var campaigns = mongoose.model( 'campaigns', campaigns );

router.post('/', function(req, res){

  var key = req.body.api_key;
  var amount = req.body.amount;

  users.findOne({key:key}, function(err, user){
  	if(err){
  		return res.json({status:"error", message:"server error"});
  	}
  	if(!user){
  		return res.json({status:"error", message:"No authorized key"});
  	}

  	campaigns.findOne({isActive:true}, function(err, campaign){
  		
  		if(!campaign){
  			return res.json({status:"error", message:"No campaign active"});
  		}
  		//update user if the campaign is already exists
  		var activity = {title:"A user donated " + amount + " $ through your website.", when: Date.now()};
  		users.findOneAndUpdate({_id:user._id}, {$push:{activity:activity, tokenLastActive:Date.now()}}, function(err){});
  		users.findOneAndUpdate({_id:user._id, campaigns:{$ne:campaign._id}}, {$push:{campaigns:campaign._id}}, function(err){});
  		
  		//update campaign
  		var participant_iterator;
  		var nonce;
  		for(var i = 0; i<campaign.participants.length; i++){
  			if(campaign.participants[i].user_id.equals(user._id)){
  				participant_iterator=i;
  				nonce = campaign.participants[i].nonce;
  			}
  		}

  		//push to campaign new participant
  		if(participant_iterator == undefined){
  			return res.json({status:"error", message:"No campaign found"});
  		}else{

			  // Use payment method nonce here
			  gateway.transaction.sale({
			    amount: amount,
			    paymentMethodNonce: nonce,
			  }, function (err, result){
			    if(err){
			      return res.json(err);
			    }
			    //if transaction success
			    if(result.success){

		  			var newProperties = {
		  				"participants.$.paidAmount"	: amount,
		  				"participants.$.total"			: amount,
		  				fundingGoal 								: amount*(-1),
		  				funds												: amount
		  			};

		  			campaigns.findOneAndUpdate({_id:campaign._id, "participants.user_id":user._id}, {$inc:newProperties}, function(err, campaign){
		  				if(err){
					  		return res.json({status:"error", message:"server error"});
					  	}
					  	if(!campaign){
					  		return res.json({status:"error", message:"No campaign found"});
					  	}
					  	return res.json({status:"ok", message:"you have been charged for $" + amount});
		  			});

  				}
			  });
  		}
  	});
  });
});

module.exports = router;
