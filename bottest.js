const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager')
const config = require('./configtest.json');
const pricelist = require('./pricelist.json');

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
});
 
client.on("friendMessage", function(steamID, message) {
    if (message == "hi") {
        client.chatMessage(steamID, "hello, nice meme boi.");
    }
});

function acceptOffer(offer) {
	offer.Accept((err)=>{
		if(err) console.log("There was an error accepting the offer.");
	});
}


function declineOffer(offer){
	offer.Decline((err)=>{
		if(err) console.log("There was an error declining the offer.");
	});
}

function processOffer(offer){
	if (offer.isGlitched() || offer.state === 11)
	{
		console.log("Offer was glitched, declined.")
		declineOffer(offer);
	}
	else if(offer.partner.getSteamID64()=== config.ownerID)
	{
		acceptOffer(offer);
	}
	else
	{
		var ourItems = offer.itemsToGive;
		var theirItems = offer.itemsToRecieve;
		var ourValue = 0;
		var theirValue = 0;
		for (var i in ourItems) 
		{
			var items = ourItems[i].market_name;
			if(pricelist[items])
			{
				ourValue += pricelist[item].sell;
			}
			else
			{
				console.log("Invalid value.");
				ourValue += 99999;
			}
		}
		for(var i in theirItems)
		{
			var item= theirItems[i].market_name;
			if(pricelist[item]) 
			{
				theirValue += pricelist[item].buy;
			}
			else
			{
				console.log("Their value was different.")
			}
		}
		console.log("Our value: " + ourValue);
		console.log("Their value: " + theirValue);
		if (ourValue <= theirValue)
		{
			acceptOffer(offer);
		}
		else
		{
		declineOffer(offer);
		}
	}
}

