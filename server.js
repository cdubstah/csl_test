const parser = require('rss-parser');
const http = require('http');
const port = 3000
let prevData = [];
let newData = [];
const RSS_FEED = 'https://cstarleague.com/feed.rss';
const FCM = require('fcm-node');
const serverKey = 'AAAAk9PaFgo:APA91bGUew2wMyfbSiX5Lruv6HUU0j0Cx0nrjmrP4a18bpAytlT9419Og7zmrdumBFk5Y1ymEK97CMXYA3ci7wXEQjqqLbN8lS9JZ-4bhQAas-fRA_MdCLEuZG_frop8DY3nJiMiMICp';
const fcm = new FCM(serverKey);

var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: '/topics/news', 
    notification: {
        title: 'Collegiate Star League', 
        body: 'MMR Dynamics in CSL'
    },
    
    data: {  //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value'
    }
};

function pushNotification(pushMessage) {
    message.notification.body = pushMessage;
    fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Successfully sent with response: ", response);
    }
    });
}


// function that parses data. 
function parsedFeed(callback) {
	console.log("Starting to Parse..................");
	let dataArray = [];
 	parser.parseURL(RSS_FEED, function(err, parsed) {
  	for (let entry of parsed.feed.entries) {
            dataArray.push(entry.pubDate + '|' + entry.title);
        }
        callback(dataArray);
    });
 	
    return dataArray;
}

parsedFeed(data => {
  console.log('data assigned');
  prevData = data;
});

function compareData() {
	parsedFeed(data => {
  console.log('new data assigned');
  newData = data;

});
	if ( prevData[prevData.length-1] == newData[newData.length-1])   {
		console.log(prevData[prevData.length-1]);
		console.log(newData[newData.length-1]);
		return;
	}
	else {
		prevData = newData;
		let stringToPush =  JSON.stringify(prevData[0]);
		splitArray = stringToPush.split('|');
		stringToPush = splitArray[1];
    pushNotification(stringToPush);
		console.log("changes detected, pushing notifications");
	}
}

function compare(){
    setTimeout(compare, 60000);
    compareData();
    
    // newData.push('Tue, 07 Feb 2017 09:47:51 -0800|MMR Dynamics in CSL')
}


const requestHandler = (request, response) =>  { 
	response.end("HI THIS IS A HEROKU SERVER");
} 

const server = http.createServer(requestHandler)

server.listen(port, (err) => {  
  	if (err) {
    return console.log('something bad happened', err);
  	}

  	console.log(`server is listening on ${port}`);
})

compare();