(function(plugin) {
	
	plugin.service = showtime.createService("NextTV", "nexttv:startpage", "tv", false, plugin.config.path + "nexttv.png");
				
	plugin.settings = plugin.createSettings("NextTV", "video", plugin.config.path + "nexttv_square.png", "NextTV online video service");
	
	plugin.settings.createInfo("info", plugin.config.path + "nexttv.png", "NextTV is a Taiwanese online video streaming service.\n" +
								              "For more information, visit http://http://www.nexttv.com.tw\n\n");
			
	plugin.settings.createBool("enabled", "Enable NextTV", false, function(v) {
		plugin.config.URIRouting = v;
		plugin.config.search = v;
		plugin.service.enabled = v;
	});
	
	function getVerifiableVideoUrl(url) {
		return url + " swfurl=" + "http://img.nexttv.com.tw/live/StrobeMediaPlaybackHD.swf swfvfy=true";
	}
  
	function startPage(page) {
	  	/*
	  	 * 新聞台
	  	 * 綜合台
	  	 * Weather Girls
	  	 */
	  	page.appendItem("nexttv:channel:news", "directory", {
				title: "NextTV News",
				icon: plugin.config.path + "newslarge.png"
				});

		page.appendItem("nexttv:channel:varietyshow", "directory", {
				title: "NextTV Variety Show",
				icon: plugin.config.path + "varietylarge.png"
				});

		page.appendItem("nexttv:channel:weathergirls", "directory", {
				title: "Weather Girls",
				icon: plugin.config.path + "wgirl.jpg"
				//icon: "http://tw.img.nextmedia.com/videos/tv_12/20110621/12253_s.jpg"
				});

		page.type = "directory";
		page.contents = "items";
		page.loading = false;

		page.metadata.logo = plugin.config.path + "nexttv.png";
		page.metadata.title = "NextTV Live";
	}

	plugin.addURI("nexttv:channel:news", function(page, title) {
		page.contents = "video";
		page.type = "directory";
		
		var htmldoc = showtime.httpGet("http://www.nexttv.com.tw/index/news").toString();
		
		page.metadata.logo = plugin.config.path + "nexttv.png";
		page.metadata.title = htmldoc.slice(htmldoc.search("<title>") + 7, htmldoc.search("</title>"));
		
		var metadata = {
			title: "NextTV News (SD)",
			description: "NextTV News (Put some description here)"
		};
		var url = "http://nextmedia-f.akamaihd.net/nexttvlive_1_300@49187";
		//url = getVerifiableVideoUrl(url);
		page.appendItem(url, "video", metadata);
		
		metadata = {
			title: "NextTV News (HD)",
			description: "NextTV News (Put some description here)"
		};
		url = "http://nextmedia-f.akamaihd.net/nexttvlive_1_600@49187";
		//url = getVerifiableVideoUrl(url);
		page.appendItem(url, "video", metadata);		
		
		page.loading = false;		
	});
	
	plugin.addURI("nexttv:channel:weathergirls", function(page, title) {
		page.contents = "item";
		page.type = "directory"
		
		var htmldoc = showtime.httpGet("http://www.nexttv.com.tw/weather").toString();
		
		page.metadata.logo = plugin.config.path + "nexttv.png";
		//page.metadata.title = "Weather Girls";
		page.metadata.title = htmldoc.slice(htmldoc.search("<title>") + 7, htmldoc.search("</title>"));
		page.metadata.logo = plugin.config.path + "nexttv.png";
		
		//var weekday = new Array("", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
		
		function parseData( linkStr ) {
			this.dataid = linkStr.substring(0, 5);
			if( this.dataid == "/issu" ) {
				this.is_issued = false;
				this.dataid = "00000";
				this.issueid = "00000000";
				this.year = "0000";
				this.month = "00";
				this.day = "00";
				this.weekday = "0";
			} else {
				this.is_issued = true;
				this.issueid = linkStr.substring(14, 22);
				this.year = linkStr.substring(14, 18);
				this.month = linkStr.substring(18, 20);
				this.day = linkStr.substring(20, 22);
				this.weekday = linkStr.substring(25, 26);
			}
		}
				
		var offset = 0;
		var i = 1;
		var linkData = new Array();
		var metadata;
		var url;
		
		while( htmldoc.indexOf("weather/section/vdo/", offset) != -1 ) {
			offset = htmldoc.indexOf("weather/section/vdo/", offset);
			linkData[i] = new parseData( htmldoc.substring(htmldoc.indexOf("weather/section/vdo/", offset) + 20, htmldoc.indexOf("/set/", offset) + 6) );
			
			if( linkData[i].is_issued == true ) {
				metadata = {       title: linkData[i].issueid,
					            icon: "http://tw.img.nextmedia.com/videos/tv_12/" + linkData[i].issueid + "/" + linkData[i].dataid + "_s.jpg",
				    	     description: "Weather Girls (Put some description here)"
					   }
				url = "http://video.nexttv.com.tw/videos/tv_12/" + linkData[i].issueid + "/" + linkData[i].dataid + ".mp4"
				page.appendItem(url, "video", metadata);
			}
			
			offset++;
			i++;
		}
		
		page.loading = false;
		
	});
	
	plugin.addURI("nexttv:startpage", startPage);	
})(this);
