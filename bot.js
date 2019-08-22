const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const steamUserInventory = require('steam-user-inventory');
const config = require('./config.json');
const pricelist = require('./pricelist.json');
//const updateprice = require('./updatepricelist.js');
//setInterval(updatePricelist,600000);
const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en'
});
 
const logOnOptions = {
    accountName: config.username,
    password: config.password,
    twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};
 
client.logOn(logOnOptions);
 
client.on('loggedOn', () => {
    console.log('Logged in successfully.');
    client.setPersona(SteamUser.Steam.EPersonaState.Online);
    client.gamesPlayed(440);
});
 
client.on("friendMessage", function(steamID, message) {
    if (message == "hi") {
        client.chatMessage(steamID, "hello.");
    }
});

client.on('webSession', (sessionid, cookies) => {
	manager.setCookies(cookies);

	community.setCookies(cookies);
    community.startConfirmationChecker(20000, config.identitySecret);
});

function acceptOffer(offer) {
	offer.accept((err)=>{
		community.checkConfirmations();
		console.log("offer accepted");
		if(err) console.log("There was an error accepting the offer.");
	});
}


function declineOffer(offer){
	offer.decline((err)=>{
		console.log("offer declined");
		if(err) console.log("There was an error declining the offer.");
	});
}

 
function processOffer(offer) {
    if (offer.isGlitched() || offer.state === 11) {
        console.log("Offer was glitched, declining.");
        declineOffer(offer);
    }
    else {
        var ourItems = offer.itemsToGive;
        var theirItems = offer.itemsToReceive;
        var ourValue = 0;
        var theirValue = 0;
        for (var i in ourItems) {
            var item = ourItems[i].market_name;
            if(pricelist[item]) {
                ourValue += pricelist[item].sell;
            } else {
                console.log("Invalid Value.");
                ourValue += 99999;
            }
        }
        for(var i in theirItems) {
            var item = theirItems[i].market_name;
            var doesContain = config.hats.indexOf(item) > -1
            if(item == "Refined Metal" || item == "Reclaimed Metal" || item == "Mann Co. Supply Crate Key"){
                theirValue += pricelist[item].buy;
            }
            else if (doesContain && pricelist[item]){
          		var indian = config.hats.indexOf(item);
          		if(config.hatMax[indian]!= config.hatOwned[indian]){
          			theirValue += pricelist[item].buy;
          		}
          		else{
          			i = theirItems;
          		}
            } 
            else {
     	    	console.log("Their value was different.")
            }
        }
    }
    console.log("Our value: "+ourValue);
    console.log("Their value: "+theirValue);
 
    if (ourValue <= theirValue || offer.partner.getSteamID64() === config.ownerID) {
    	config.hatOwned[indian]++;
        acceptOffer(offer);
    } else {
        declineOffer(offer);
    }
}

//function updatePricelist(){
//	updateprice;
//}
//client.setOption("promptSteamGuardCode",false);
manager.on('newOffer', (offer) => {
	console.log("new offer");
	processOffer(offer);

});


