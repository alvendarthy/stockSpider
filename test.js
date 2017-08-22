var casper = require("casper").create({
	clientScripts:  [
        'includes/jquery.js'
    	],
	pageSettings : {
		loadImages : false
	}
});

casper.userAgent("Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36");

String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
};

function getAllNews(){
	var news = new Array();
	var newsObjs = $("#entries > ul > li.content");
	var timeObjs = $("#entries > ul > li.time.pconly");
	for(i = 0; i < newsObjs.length; i ++){
		var msg = {};
		msg.news = newsObjs.eq(i).text().trim();
		msg.time = timeObjs.eq(i).text().trim();
		news.push(msg);
	};

	return news;
}

casper.start('http://www.cailianpress.com/', function(){
	this.echo("page open!");
});

var lastNews = "";

function jobLoop(){
	casper.reload();

	casper.then( function(){
		this.wait(1000, function() {  
			var allNews = casper.evaluate(getAllNews);

			for( index = 0; index < allNews.length; index ++){
				
				this.echo(allNews[index].time + " : " + allNews[index].news);
			}

			lastNews = allNews[0].news;
		});
	});

	casper.run(jobLoop);
}


casper.then(function(){
	this.echo(this.getPageContent());
});

casper.run(function(){
	this.capture("t.jpg").exit();
});  
