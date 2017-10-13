// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { remote } = require('electron')
var qs = require('qs');
const url = require('url')
const { parse } = require('url')
var axios = require('axios')
var website_url = "http://dilbertapp.ajency.in";


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

   