var tradeOfferManager = require('steam-tradeoffer-manager');
var manager = new tradeOfferManager({
	
});
manager.getInventoryContents(440,2,true,function(err,inventory){
	if(err){
		console.log(err);
		return;
	} else {
		console.log(inventory);
	}
});
