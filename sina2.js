var casper = require("casper").create({
	clientScripts:  [
        'includes/jquery.js'
    	],
	pageSettings : {
		loadImages : false,
        	webSecurityEnabled: false
	}
	//},
	//'verbose': true,
    	//'logLevel': 'info'
});

var targetUrl = "http://finance.sina.com.cn/"

casper.userAgent("Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36");

String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
};

function getAllNews(){
        var news = new Array();
        var newsObjs = $("#fin_bd_list > div > div > div > span.bd_i_txt");
        var timeObjs = $("#fin_bd_list > div > div > div > span.bd_i_time");
        for(i = 0; i < newsObjs.length; i ++){
                var msg = {};
                msg.news = newsObjs.eq(i).text().trim();
                msg.time = timeObjs.eq(i).text().trim();
                news.push(msg);
        };

        return news;
}

function reportNews(newsObj){
	var news = JSON.stringify(newsObj);
	var srvSay = "OO";
	$.ajaxSetup({   async : false , timeout : 5000 });
	$.post("http://192.168.1.103/report_news", news, function(data,status){
		srvSay = data + " | " + status;
	});
	return srvSay;
}

casper.on('remote.message', function(msg) {
    this.log(msg, 'info');
});

casper.start(targetUrl, function(){
	casper.echo("page open!");
});

casper.wait(1000, function(){
	casper.click("#fin_tabs0_1 > h2");
});

casper.wait(1000, function(){
	this.click("#fin_bd_auto");
});

function reloadPage(){
	casper.reload();
	
	casper.wait(1000, function(){
		casper.echo("click tab button.");
	        casper.click("#fin_tabs0_1 > h2");
	});
	
	casper.wait(1000, function(){
		casper.echo("disable auto refresh.");
	        this.click("#fin_bd_auto");
	});
}

var lastNews = "";

function refresh(){
	casper.click("#fin_bd_refresh");
}


function dateDetector(){
	lastDay = ""
	return function(){
		var date = new Date();
		var today = date.getDate();
		if(today != lastDay){
			lastDay = today;
			return true;
		}

		return false;
	}
}

var isAnotherDay = dateDetector();


//loadPage("http://finance.sina.com.cn/");

function getDate(){
	var date = new Date();
	var year = date.getFullYear();
	var mon = date.getMonth() + 1;
	var d = date.getDate();
	return year + "-" + mon + "-" + d;
}


function loop(){
	/*
	if(isAnotherDay()){
		reloadPage();
	} else {
		refresh();
	}
	*/
	refresh();

	casper.wait(2000, function(){
		var date = getDate();

        	var news = this.evaluate(getAllNews);
		if(news.length <= 0){
			return;
		}

		for( i in news ){
			if(lastNews == news[i].news){
				var myDay = new Date();
				var now = myDay.toLocaleTimeString();
				this.echo(now + ": old news, break.")
				break;
			}
			this.echo(news[i].time + " " + news[i].news);
			this.echo("sending news");
			var newsObj = {};
			newsObj.news = news[i].news;
			newsObj.date = date;
			newsObj.time = news[i].time;
			newsObj.from = "xinlang";
			this.echo(this.evaluate(reportNews, newsObj));
			this.echo("sent");
		}

		lastNews = news[0].news
	});

	casper.run(loop);
}

casper.run(loop);
