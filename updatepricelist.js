var fs = require('fs');
var jsonfile = require('jsonfile');
var config = require('./config.json');
var util = require('util');
var request = require('request');
var https = require('https');
var express = require('express');
var cheerio = require('cheerio');
var file = "./pricelist.json";
var async = require('async');
var pushobj;
var obj = {
	"Refined Metal":{
		"buy": 1,
		"sell": 1
	},
	"Reclaimed Metal":{
		"buy": 0.33,
		"sell": 0.33
	},
	"Scrap Metal":{
		"buy": 0.11,
		"sell": 0.11
	},
	"Mann Co. Supply Crate Key":{
		"buy": 32.33,
		"sell": 32.66
	},
};
var lengthHats = Object.keys(config.hats).length;
//console.log(lengthHats);
var q = async.queue(function(task, done){
	request({
		url: task.url,
		json: true
	},
	function(err,res,body){
		if(err) return done(err);
		if(res.statusCode != 200) return done(res.statusCode);
			var itemData = {
				cost:"",
				name:"",
			}
			if(body.total != 0)
			{
				itemData.cost = body.buy.listings[0].currencies.metal;
				itemData.name = task.name;
				//console.log(itemData);
				var name = itemData.name;
				pushobj = {
					[name]:{
						"buy": Number((itemData.cost).toFixed(2)),
						"sell": Number((itemData.cost + 0.11).toFixed(2))
					}
				}
				console.log(pushobj);
				obj = Object.assign(obj,pushobj);
				//console.log(obj);
				//console.log(util.inspect(body,false,null));
				jsonfile.writeFile(file, obj,{spaces: 2}, function(err){
					console.error("Wrote to file");
				});
			} else
			{
				console.log(task.name + " not found");
				var newConfig = config;
				var ind = newConfig.hats.indexOf(task.name);
				newConfig.hats.splice(ind, 1);
				newConfig.hatMax.splice(ind,1);
				newConfig.hatOwned.splice(ind,1);
				jsonfile.writeFile("./config.json", newConfig,{spaces: 2}, function(err){
					console.error("removed " + task.name + " from config");
				});
			}
		});
}, lengthHats);

for(var i = 0; i < lengthHats; i++)
{
	//console.log(i);
	//console.log("https://backpack.tf/api/classifieds/search/v1?key=" + config.apiKey + "&item=" + config.hats[i] + "&intent=buy&steamid=" + config.orange);
	q.push({ url: "https://backpack.tf/api/classifieds/search/v1?key=" + config.apiKey + "&item=" + config.hats[i] + "&intent=buy&steamid=" + config.orange, name: config.hats[i]})
}