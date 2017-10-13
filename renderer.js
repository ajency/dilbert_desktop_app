// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { remote } = require('electron')
var qs = require('qs');
const url = require('url')
const { parse } = require('url')
var axios = require('axios')
var website_url = "http://dilbert4.ajency.in/api";


let $ = require('jquery') ;
const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_REDIRECT_URI = 'http://127.0.0.1:8101'
const GOOGLE_CLIENT_ID = '76840133643-uka7d6nglcm3rkdfdimklkr7jtgvtk64.apps.googleusercontent.com'
const CLIENT_SECRETE = 'Urg-oA6Yb5jqZTydRu3xpPVT'

var user_data;
var org_data;






function login(){
  console.log("inside login function");
  $('#loading').css('display','block');

  const code = signInWithPopup().then( function(code) {
  	console.log(code);
  	const tokens = fetchAccessTokens(code).then( function(tokens) {
	
	  	console.log(tokens);
	  	let data =  fetchGoogleProfile(tokens.access_token).then( function(data){
	  		console.log(data);

	  		// API request
	  		axios.get(website_url + '/confirm?email=' + data.email + '&content=' + data, true  ).then( function(response){
	  			console.log(response);
	  			
	  			if(response.data && response.data[0].org_id){
	  				user_data =response.data[0];
	  				let org_url = website_url + '/org/info?org_id=' + response.data[0].org_id + '&user_id=' + response.data[0].id;

	  				axios.get( org_url , {
	  				 headers:  {'X-API-KEY' : response.data[0].api_token},
	  				},

	  				).then( function(response){
						if(response.data[0].name != undefined)
							org_data = response.data[0];
		  					console.log(response);

	  					// Create a session 


	  					// Call idle_state function

	  					idleState(org_data.idle_time);

              $('#loading').css('display','none');// Hide the Loading GIF
              $('#loginDiv').css('display','none');
              $('#contentMem').css('display','block');
              // $location.path('/todayscard');

	  				})


	  			}
				
	  		})

	  	})

  	})

  }); 
}

function signInWithPopup () {
	console.log("inside signInWithPopup");
  return new Promise((resolve, reject) => {
    const authWindow = new remote.BrowserWindow({
      width: 500,
      height: 600,
      show: true,
    })

    // TODO: Generate and validate PKCE code_challenge value
    const urlParams = {
      response_type: 'code',
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      scope: 'profile email',
    }
    const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

   console.log(authUrl);

    function handleNavigation (url) {
      console.log('inside handleNavigation');
      const query = parse(url, true).query
      
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`))
        } else if (query.code) {
          // Login is complete
          console.log(query.code);
          authWindow.removeAllListeners('closed')
          setImmediate(() => authWindow.close())

          // This is the authorization code we need to request tokens
          resolve(query.code)
        }
      }
    }

    authWindow.on('closed', () => {
      // TODO: Handle this smoothly
      throw new Error('Auth window was closed by user')
    })

    authWindow.webContents.on('will-navigate', (event, url) => {
      console.log("navigating to handleNavigation");
      console.log("event--", event);
      console.log("url--", url);
      handleNavigation(url);
    })

    authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      handleNavigation(newUrl)
    })

    authWindow.loadURL(authUrl)
  })
}

function fetchAccessTokens (code) {
	
	return new Promise((resolve,reject) => {
	
		console.log("inside fetchAccessTokens", code);
	  	const response =  axios.post(GOOGLE_TOKEN_URL, qs.stringify({
		    code : code,
		    client_id: GOOGLE_CLIENT_ID,
		    client_secret : CLIENT_SECRETE,
		    redirect_uri: GOOGLE_REDIRECT_URI,
		    grant_type: 'authorization_code',
	  	})
	  	).then( function(response) {
	  		resolve(response.data);
	  		console.log(response.data);
	  });
	})

}


function fetchGoogleProfile (accessToken) {
	return new Promise ( (resolve, reject) =>{

		const response =  axios.get(GOOGLE_PROFILE_URL, {
		    headers: {
		      'Content-Type': 'application/json',
		      'Authorization': `Bearer ${accessToken}`,
		    },

		  }).then( function(response) {
		  	resolve(response.data);

		  })


		}) 
}






function idleState(idleInterval_C = 1) { // if idleInterval_C is null, then set to default i.e. 1
  
  console.log("inside idleState");
  console.log(idleInterval_C);

  idleInterval = idleInterval_C;


  if(idleInterval_C > -1){
  			
  			var data = {'user_id': user_data.id, 'from_state': '-', 'to_state': 'New Session', 'cos': get_Time(0), 'ip_addr': org_data.ip, 'api_token':user_data.api_token, 'data_from':'chrome App', 'socket_id':''};

          $.ajax({
            url: website_url + '/api/fire', // url to confirm the user if present in company database & receive ID else create that user w.r.t that domain
            crossDomain : true,
            type: 'GET',
            timeout: 15000,
            headers: {
              //'User-Agent': 'request'
              'X-API-KEY': user_data.api_token
            },
            data: data
            ,success: function(dataS) {
              console.log(dataS);
              TodaysCardController();

            }, error: function(XMLHttpRequest, textStatus, errorThrown) {
              if (XMLHttpRequest.readyState == 4) { // HTTP error (can be checked by XMLHttpRequest.status and XMLHttpRequest.statusText)
                console.log("state 4");
              } else if (XMLHttpRequest.readyState == 0) { // Network error (i.e. connection refused, access denied due to CORS, etc.)
                console.log("Offline");
              } else { // something weird is happening
                console.log("state weird");
              }
            }
          });



    
    console.log("Calling Idle State");
    //chrome.idle.setDetectionInterval(idleInterval_C * 60);

    console.log(idleInterval_C);
  } 



  else { /* User logged out */
    console.log("User logged out");

  		var data = {'user_id': user_data.id, 'from_state': 'active', 'to_state': 'offline', 'cos': get_Time(0), 'ip_addr': org_data.ip, 'data_from':'chrome App', 'socket_id':''};

        $.ajax({
          url: website_url + '/api/fire', // url to confirm the user if present in company database & receive ID else create that user w.r.t that domain
          crossDomain : true,
          type: 'GET',
          timeout: 15000,
          headers: {
            //'User-Agent': 'request'
            'X-API-KEY': user_data.api_token
          },
          data: data
          ,success: function(dataS) {
            console.log(dataS);
          }, error: function(XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.readyState == 4) { // HTTP error (can be checked by XMLHttpRequest.status and XMLHttpRequest.statusText)
              console.log("state 4");
            } else if (XMLHttpRequest.readyState == 0) { // Network error (i.e. connection refused, access denied due to CORS, etc.)
              console.log("Offline");
            } else { // something weird is happening
              console.log("state weird");
            }
          }
        });
     
    
  }
}



var get_Time = function(sumUp) { // for active, sumUp = 0, else sumUp = timeInterval
  var t = new Date(); // for now
  var diff = 0;
  if(t.getMinutes() - sumUp < 10 && t.getMinutes() - sumUp >= 0) /* If the diff < 10 but diff >= 0*/
      var min = '0' + (t.getMinutes() - sumUp).toString();
  else if(t.getMinutes() - sumUp < 0) { /* if diff < 0 */
    /*var min = (60 - (t.getMinutes() - sumUp)).toString();
    diff = 1;*/
    
    var tempMin = t.getMinutes() - sumUp;
    
    do{
      tempMin = (60 - tempMin);
      diff += 1;
    } while((60 - tempMin < 0) || (60 - tempMin >= 60)); /* i.e. stop the loop if mins is within [0, 59] */
    
    var min = tempMin.toString();
  } else /* if diff */
      var min = (t.getMinutes() - sumUp).toString();

  if(t.getHours() - diff < 10)
      var hr = '0' + (t.getHours() - diff).toString();
  else
      var hr = (t.getHours() - diff).toString();

  time = hr + ':' + min;

  console.log("get Time");
  console.log(time);
  return time;
}

   

function TodaysCardController() {
  console.log("Calling Controller ");
  
  //this.d2 = describeArc(100, 130, 100, 240, 480);
  // this.d2 = describeArc(100, 70, 65, 240, 480); // describeArc(x, y, radius, startAngle, endAngle)
  // var _this = this;
  // var apiToken = "";

  var todaysDate = formatDate(new Date());

        var date = {
            start_date: todaysDate,
            end_date: todaysDate,
        };

        var data = {
          "user_id": user_data.id,
          "api_token": user_data.api_token,
          "date": date
        };

      getData(data);


      // var intervalID = setInterval(function(){//$interval(function() {
      //   console.log("Calling interval Todays Card");
      //    getData(data);
        
      // },15000); // check every 15 secs


  function toSeconds(timeString) {
      var p = timeString.split(':');
      return (parseInt(p[0], 10) * 3600) + (parseInt(p[1], 10) * 60);
  }

  function fill(s, digits) {
      s = s.toString();
      while (s.length < digits) {
          s = '0' + s;
      };
      return s;
  }

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
      var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
          x: centerX + (radius * Math.cos(angleInRadians)),
          y: centerY + (radius * Math.sin(angleInRadians))
      };
  }

  function describeArc(x, y, radius, startAngle, endAngle) {
      var start = polarToCartesian(x, y, radius, endAngle);
      var end = polarToCartesian(x, y, radius, startAngle);
      var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      var d = [
          'M', start.x, start.y,
          'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(' ');
      return d;
  }

  function timeConversion(milliseconds) {
      // Get hours from milliseconds
      var hours = milliseconds / (1000 * 60 * 60);
      var absoluteHours = Math.floor(hours);
      var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;
      // Get remainder from hours and convert to minutes
      var minutes = (hours - absoluteHours) * 60;
      var absoluteMinutes = Math.floor(minutes);
      var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;
      return h + ':' + m;
  }

  function formatDate(date) {
      var temp = new Date(date);

    return temp.getFullYear() + '-' + (temp.getMonth() + 1 < 10 ? '0' + (temp.getMonth() + 1) : temp.getMonth() + 1) + '-' + (temp.getDate() < 10 ? '0' + (temp.getDate()) : (temp.getDate()));
  }

  function getWeek(date) {
      var temp = new Date(date);
      var onejan = new Date(temp.getFullYear(), 0, 1);
      var temp2 = temp.getTime() - onejan.getTime();
      return Math.ceil((((temp2) / 86400000) + onejan.getDay() + 1) / 7);
  }

  function getStartAndEndOfDate(date, isMonth) {
      if (isMonth) {
          var temp = new Date(date), y = temp.getFullYear(), m = temp.getMonth();
          var firstDay = new Date(y, m, 1);
          var lastDay = new Date(y, m + 1, 0);
          return {
              start: firstDay,
              end: lastDay
          };
      }
      else {
          var curr = new Date(date);
          var firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
          var lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 7));
          return {
              start: firstDay,
              end: lastDay
          };
      }
  }

  function getData(data) {
    //var _this = this;
    if(data){

          let card_data_url = website_url + '/api/data/user?' + 'user_id='+ data.user_id + 'start_date=' + data.date.start_date + 'end_date='+ data.date.end_date;

            axios.get( card_data_url , {
             headers:  {'X-API-KEY' : data.api_token},
            },

            ).then( function(response){
              console.log(response);
            })


        // var t = response;
        //     if (response.length !== 0 && response.data.length !== 0 && response.data[0].data.length !== 0) {
        //         t = response.data[0].data[0];
        //         //console.log(t.start_time);
        //         _this.today = {
        //             date: new Date(),
        //             timeCovered: {
        //                 hrs: t.total_time.split(':')[0],
        //                 mins: t.total_time.split(':')[1]
        //             },
        //             start_time: t.start_time.replace(' ','T') + ".000Z",
        //             end_time: t.end_time.replace(' ','T') + ".000Z",
        //         };
                
        //         if (t.total_time || t.total_time !== '') {
        //             var temp = t.total_time.split(':');
        //             if (parseInt(temp[0], 10) >= 10) {
        //                 _this.today.timeCompleted = 100.00;
        //                 _this.d = describeArc(100, 70, 65, 240, (_this.today.timeCompleted * 2.4) + 240);
        //             } else {
        //                 var hrs = parseInt(temp[0], 10);
        //                 var mins = parseInt(temp[1], 10);
        //                 var minInPercentage = (mins / 60);
        //                 var hrsInPercentage = (hrs / 10) * 100;
        //                 _this.today.timeCompleted = (hrsInPercentage + (10 * (minInPercentage))).toFixed(2);
        //                 //console.log(_this.today.timeCompleted);
        //                 _this.d = describeArc(100, 70, 65, 240, (_this.today.timeCompleted * 2.4) + 240);
        //             }
        //         }
        //     } else {
        //         _this.today = {
        //             date: new Date(),
        //             timeCovered: {
        //                 hrs: 0,
        //                 mins: 0
        //             },
        //             start_time: 0,
        //             end_time: 0,
        //         };
        //     }
            //$route.reload();
            //$scope.$apply(function(){});
      
    }
  }
}
