var casper = require("casper").create({
	clientScripts:  [
        'includes/jquery.js'
    	],
	pageSettings : {
		loadImages : false
	},
	viewportSize : {
		width: 800, 
		height: 600
	}
});

casper.userAgent("Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36");

String.prototype.trim = function() { 
  return this.replace(/(^\s*)|(\s*$)/g, ''); 
};

function getAllNews(){
        var news = new Array();
        var newsObjs = $("body > div.pwrap.textliveshow_wrap > div.pbody > div > div.col_lm > div > div.live_part > div.live_part_bd > div > div.content_lst > div > div > div.live_share");
        var timeObjs = $("body > div.pwrap.textliveshow_wrap > div.pbody > div > div.col_lm > div > div.live_part > div.live_part_bd > div > div.content_lst > div > div > div.item_time");
        for(i = 0; i < newsObjs.length; i ++){
                var msg = {};
                msg.news = newsObjs.eq(i).attr("_sharetx").trim();
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

function getDate(){
        var date = new Date();
        var year = date.getFullYear();
        var mon = date.getMonth() + 1;
        var d = date.getDate();
        return year + "-" + mon + "-" + d;
}



casper.start('http://money.163.com/', function(){
	this.echo("page open!");
});

casper.wait(1000, function (){
	var url = this.getElementAttribute("#index2016_wrap > div > div.index2016_content > div.idx_main.common_wrap.clearfix > div.right_sidebar > div:nth-child(2) > div > div > h3 > a", "href");
	this.echo("openning news page.");
	this.open(url);
	this.echo("news page opened.");
});

var lastNews = "";

function loop(){
	casper.wait(1000, function(){
		var date = getDate();

        	var news = this.evaluate(getAllNews);
		if(news.length <= 0){
			return;
		}

		for( i in news ){
			if(lastNews == news[i].news){
				this.echo("old news, break.")
				break;
			}
			this.echo(news[i].time + " " + news[i].news);
			this.echo("sending news");
                        var newsObj = {};
                        newsObj.news = news[i].news;
                        newsObj.date = date;
                        newsObj.time = news[i].time;
                        newsObj.from = "wangyi";
                        this.echo(this.evaluate(reportNews, newsObj));
                        this.echo("sent");
		}

		lastNews = news[0].news
	});

	casper.run(loop);
}

casper.run(loop);
