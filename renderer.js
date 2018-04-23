// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
const {BrowserWindow} = require('electron').remote;
const app = electron.app;

const {shell} = require('electron');
const os = require('os');
const storage = require('electron-json-storage');


const { remote } = require('electron');
const url = require('url');
const { parse } = require('url');

var axios = require('axios')
var moment = require('moment');
var website_url = "https://dilbert4.ajency.in/api";


var { ipcRenderer } = require('electron');  
var main = remote.require("./main.js");

let $ = require('jquery');
const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_REDIRECT_URI = 'http://127.0.0.1:8101'
const GOOGLE_CLIENT_ID = '76840133643-uka7d6nglcm3rkdfdimklkr7jtgvtk64.apps.googleusercontent.com'
const CLIENT_SECRETE = 'Urg-oA6Yb5jqZTydRu3xpPVT'

const SYSTEM_IDLE = require('@paulcbetts/system-idle-time');
const IDLE_THRESHOLD = 60000; // 1 minute

var user_data
var org_data;
var new_user_data;
var from_state = 'active' , to_state, current_state = 'active', prev_state ='active';
var logged_in = false;
var sleep_flag = false;
var last_ping_time;
var retries;
var no_of_times_retried = 0;

function openInBrowserWindow(){
  console.log('inside openInBrowserWindow');
  // $('#loading').css('display','block');

  shell.openExternal('https://ajency.in')
}

function openDashboard(){
  console.log("opening dashboard")
  shell.openExternal('http://dilbert4.ajency.in')

}

// ipcRenderer.on('ping' , (event,arg) =>{
//   console.log(arg);
// })

// Ping on app close
// app.on('window-all-closed', function () {
//   // On OS X it is common for applications and their menu bar
//   // to stay active until the user quits explicitly with Cmd + Q

//   idleState(-1);
//   console.log("all windows closed");
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

function checkCookies(){

  let dataPath = storage.getDataPath();
  console.log(dataPath);
  
  console.log('inside checkCookies');
   storage.get('user_data', function(error, data) {
      if (error) {
          throw error;
          return;
        }

      console.log(data);
      if(data.data){
       new_user_data = data;
       idleState(new_user_data.data.idle_time);
       retries =new_user_data.data.retries;
       console.log("retries if the ping fails ----",retries);
       document.getElementById("name").innerHTML = new_user_data.data.name;
       showNotification('login');

      // $('#loading').css('display','none');// Hide the Loading GIF
      // $('#loginDiv').css('display','none');
      // $('#contentMem').css('display','block');
      

      var NowMoment = moment();
      var eDisplayMoment = document.getElementById('today');
      eDisplayMoment.innerHTML = NowMoment.format('Do MMMM');

      let d2 = describeArc(100, 70, 65, 240, 480); // describeArc(x, y, radius, startAngle, endAngle)
      document.getElementById("d2").setAttribute("d", d2); 

    }
    });


}


function addClass(){
  let $ = require('jquery') ;
  setTimeout(function(){ 
  console.log('inside addClass');
  $('#dropdown').addClass('open');
   }, 10);

}

function removeClass(){
 let $ = require('jquery') ;
 console.log('inside removeClass');
 $('.dots-with-dd').removeClass('open');
 
}

function logout() {
        let $ = require('jquery') ;
        idleState(-1);
                  
        $('#loginDiv').css('display','block');
        $('#contentMem').css('display','none');
        console.log("switching the layout");
        
  }

function login(){
  let $ = require('jquery') ;

  let dataPath = storage.getDataPath();
  console.log(dataPath);

  console.log("inside login function");
   $('#loading').css('display','block');

  const code = signInWithPopup().then( function(code) {
  	console.log(code);
  	const tokens = fetchAccessTokens(code).then( function(tokens) {
	
	  	console.log(tokens);
	  	let data =  fetchGoogleProfile(tokens.access_token).then( function(data){
	  		console.log(data);

	  		// API request
      var website_url = "https://dilbert4.ajency.in/api";

      axios.get(website_url + '/api/login/google/en?token=' + tokens.access_token).then( function(response){
        console.log(response);
        if(response.data.status == 200){

          if(response.data.next_url == '/dashboard'){
            new_user_data = response.data;

            console.log('---------------------------------------------');
            

            storage.set('user_data', new_user_data , function(error) {
              if (error) throw error;

              console.log('data set');

            //   storage.get('user_data', function(error, data) {
            //   if (error) throw error;

            //   console.log(data);
            // });

            });

            
            

            console.log('---------------------------------------------');

            idleState(new_user_data.data.idle_time);
            retries =new_user_data.data.retries;
            console.log("retries if the ping fails ----",retries);

            document.getElementById("name").innerHTML = new_user_data.data.name;
            showNotification('login');

         
          

          var NowMoment = moment();
          var eDisplayMoment = document.getElementById('today');
          eDisplayMoment.innerHTML = NowMoment.format('Do MMMM');

          let d2 = describeArc(100, 70, 65, 240, 480); // describeArc(x, y, radius, startAngle, endAngle)
          document.getElementById("d2").setAttribute("d", d2); 


          }
          else if(response.data.next_url == "/join_organisation"){
            // Handle condition for join organisation
           $('#loading').css('display','none');

            showNotification("join organisation");
            shell.openExternal('http://dilbert4.ajency.in/joinorganisation');

          }

          else if (response.data.next_url == "/create_organisation"){
            // Handle condtion for create organisation
           $('#loading').css('display','none');

            showNotification("create organisation");
            shell.openExternal('http://dilbert4.ajency.in/createorganisation');

          }
          else{
           $('#loading').css('display','none');

            showNotification("connection error");
          }
          
           // checkStateChange();

         
        }

        else{
           $('#loading').css('display','none');
            
            showNotification("connection error");
          }

      });


	  		// axios.get(website_url + '/confirm?email=' + data.email + '&content=' + data, true  ).then( function(response){
	  		// 	console.log(response);
	  			
	  		// 	if(response.data && response.data[0].org_id){
	  		// 		user_data =response.data[0];
     //        document.getElementById("name").innerHTML = user_data.name
	  		// 		let org_url = website_url + '/org/info?org_id=' + response.data[0].org_id + '&user_id=' + response.data[0].id;

	  		// 		axios.get( org_url , {
	  		// 		 headers:  {'X-API-KEY' : response.data[0].api_token},
	  		// 		}

	  		// 		).then( function(response){
					// 	if(response.data[0].name != undefined)
					// 		org_data = response.data[0];
		  	// 				console.log(response);

	  		// 			// Create a session 


	  		// 			// Call idle_state function

	  		// 			idleState(org_data.idle_time);

            
     //          // $location.path('/todayscard');

	  		// 		})


	  		// 	}
				
	  		// })

	  	})

  	})

  }); 
}


function signInWithPopup () {
	console.log("inside signInWithPopup");

  const { parse } = require('url')

  const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
  const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
  const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
  const GOOGLE_REDIRECT_URI = 'http://127.0.0.1:8101'
  const GOOGLE_CLIENT_ID = '76840133643-uka7d6nglcm3rkdfdimklkr7jtgvtk64.apps.googleusercontent.com'
  const CLIENT_SECRETE = 'Urg-oA6Yb5jqZTydRu3xpPVT'

  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
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
    // const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`
      const authUrl = GOOGLE_AUTHORIZATION_URL + '?response_type=code' + '&redirect_uri='+GOOGLE_REDIRECT_URI + '&client_id='+GOOGLE_CLIENT_ID+'&scope=profile email';
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
      $('#loading').css('display','none');
      
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

  const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
  const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
  const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
  const GOOGLE_REDIRECT_URI = 'http://127.0.0.1:8101'
  const GOOGLE_CLIENT_ID = '76840133643-uka7d6nglcm3rkdfdimklkr7jtgvtk64.apps.googleusercontent.com'
  const CLIENT_SECRETE = 'Urg-oA6Yb5jqZTydRu3xpPVT'

	
	return new Promise((resolve,reject) => {
	
		console.log("inside fetchAccessTokens", code);
    let urlParams = 'code=' +code + '&client_id=' + GOOGLE_CLIENT_ID + '&client_secret='+ CLIENT_SECRETE + '&redirect_uri=' + GOOGLE_REDIRECT_URI + '&grant_type=authorization_code';
	  	const response =  axios.post(GOOGLE_TOKEN_URL, urlParams
	  	).then( function(response) {
	  		resolve(response.data);
	  		console.log(response.data);
	  });
	})

}


function fetchGoogleProfile (accessToken) {
	return new Promise ( (resolve, reject) =>{
  const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'

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
  let $ = require('jquery') ;
  var website_url = "https://dilbert4.ajency.in/api";
  // var no_of_times_retried = 0;
  // retries = 5;
  
  console.log("inside idleState");

  let ping_freq = new_user_data.data.ping_freq * 60000;
  console.log("ping_freq......inside idleState", ping_freq);
  console.log(idleInterval_C);

  idleInterval = idleInterval_C;


  if(idleInterval_C > -1){
  			

    // New Calls
    console.log("Calling Idle State");

    var data = {'from_state': '-', 'to_state': 'New Session'};
    // data = decodeURI(data);
     $.ajax({
            url: website_url + '/api/ping', // url to confirm the user if present in company database & receive ID else create that user w.r.t that domain
            crossDomain : true,
            type: 'GET',
            timeout: 15000,
            headers: {
              //'User-Agent': 'request'
              'X-API-KEY': new_user_data.data.x_api_key,
              'from' : new_user_data.data.user_id
            },
            data: data
            ,success: function(response) {
              if(response.status == 401){
                $('#loading').css('display','none');// Hide the Loading GIF
                showNotification('session expired');
              }
              else if(response.status == 400){
                $('#loading').css('display','none');// Hide the Loading GIF
                showNotification('params missing');
              }
              else if(response.status == 403){
                $('#loading').css('display','none');// Hide the Loading GIF
                showNotification('authorization error');
              }
              else{
                $('#loading').css('display','none');// Hide the Loading GIF
                $('#loginDiv').css('display','none');
                $('#contentMem').css('display','block');
                
                logged_in = true;
                last_ping_time = new Date().getTime();
                console.log(last_ping_time);
                console.log(response);
                TodaysCardController(response);
                checkStateChange();
                // clientSideUpdateTime(response);                
              }
              
            }, error: function(XMLHttpRequest, textStatus, errorThrown) {

                console.log("retries ----------",retries);
                setTimeout(function(){ 

                  if(retries != undefined){
                    console.log("retries is defined ....");
                    console.log("no_of_times_retried ----", no_of_times_retried);
                    no_of_times_retried +=1;
                    if(no_of_times_retried <= retries){
                       console.log("If ping fails logged_in ---", logged_in);
                       if(!logged_in){
                        console.log('******* Ping failed .... Calling idleState again');
                        idleState(new_user_data.data.idle_time);  
                      }
                    }
                    else{
                      console.log("retries limit over ...User has no internet connection")
                    }
                  }

                  else{
                    console.log("retries is not defined...");
                    if(!logged_in){
                      console.log('******* Ping failed .... Calling idleState again');
                      idleState(new_user_data.data.idle_time);  
                    }
                  }     
                  
                }, ping_freq);

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



  else { /* User logged out */
    console.log("User logged out");

        // New calls

         var data = {'from_state': prev_state, 'to_state': 'Offline'};
         console.log("from_state = " + data.from_state + " and to_state = " + data.to_state);
        $.ajax({
          url: website_url + '/api/ping', // url to confirm the user if present in company database & receive ID else create that user w.r.t that domain
          crossDomain : true,
          type: 'GET',
          timeout: 15000,
          headers: {
              //'User-Agent': 'request'
              'X-API-KEY': new_user_data.data.x_api_key,
              'from' : new_user_data.data.user_id
          },
          data: data
          ,success: function(dataS) {
            console.log(dataS);
            logged_in = false;
            // Remove data from storage on logout

            storage.remove('user_data', function(error) {
              if (error) throw error;
              else{
                console.log("storage cleared");
              }
            });
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



function get_Time(sumUp) { // for active, sumUp = 0, else sumUp = timeInterval
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

   
function TodaysCardController(data) {
  
    console.log("Calling Controller --", data);
    if(data.total_time == '-' && data.start_time == '-' && data.end_time == '-'){

    document.getElementById("hr").innerHTML = '00';
    document.getElementById("min").innerHTML = '00';
    document.getElementById("start_time").innerHTML = '-';
    document.getElementById("end_time").innerHTML = '-';

    }

    else{


    document.getElementById("hr").innerHTML = data.total_time.split(':')[0];
    document.getElementById("min").innerHTML = data.total_time.split(':')[1];
    document.getElementById("start_time").innerHTML = moment(data.start_time.split(' ')[1], "kk:mm:ss").format("hh:mm A");
    document.getElementById("end_time").innerHTML = moment(data.end_time.split(' ')[1], "kk:mm:ss").format("hh:mm A");
      
      if (data.total_time || data.total_time !== '') {
          var temp = data.total_time.split(':');
          if (parseInt(temp[0], 10) >= 10) {
              var time_completed = 100.00;
              var d = describeArc(100, 70, 65, 240, (time_completed * 2.4) + 240);
              document.getElementById("d1").setAttribute("d", d); 

          } else {
              var hrs = parseInt(temp[0], 10);
              var mins = parseInt(temp[1], 10);
              var minInPercentage = (mins / 60);
              var hrsInPercentage = (hrs / 10) * 100;
              var time_completed = (hrsInPercentage + (10 * (minInPercentage))).toFixed(2);
              //console.log(_this.today.timeCompleted);
              var d = describeArc(100, 70, 65, 240, (time_completed * 2.4) + 240);
              document.getElementById("d1").setAttribute("d", d); 

          }
        }  

    }
}

// function clientSideUpdateTime(data){
//   console.log("clientSideUpdateTime --", data);
//     if(data.total_time == '-' && data.start_time == '-' && data.end_time == '-'){

//     // document.getElementById("hr").innerHTML = '00';
//     // document.getElementById("min").innerHTML = '00';
//     // document.getElementById("start_time").innerHTML = '-';
//     // document.getElementById("end_time").innerHTML = '-';

//     }

//     else{

//     setInterval( (function){
//       if(difference between end_time and current time is < 3 minutes){
//         // Update the end_time and total_time

//       }

//       else{
//         // set end time and total time to the response 
//       }

//     },30000)

//     }
// }


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


function checkStateChange(){

  var online;
  const alertOnlineStatus = () => {
    // window.alert(navigator.onLine ? 'online' : 'offline')
    console.log(navigator.onLine ? 'online' : 'offline');
    if(navigator.onLine){
      online = true;
      showNotification('online');
      console.log(online);
    }
    else{
      online = false;
      showNotification('offline');
      console.log(online);
    }
  }

  window.addEventListener('online',  alertOnlineStatus)
  window.addEventListener('offline',  alertOnlineStatus)

  alertOnlineStatus();

  let ping_freq = new_user_data.data.ping_freq * 60000;
  let idle_time = new_user_data.data.idle_time * 60000;
  console.log(ping_freq , idle_time);
  console.log(new_user_data);
  from_state = 'active';
  to_state = 'active';
  current_state = 'active';
  prev_state = 'active';
  console.log("........................ Status checking ...................................");
  console.log("logged_in status -- ",logged_in);

  setInterval(function () {
    if(logged_in && online){
      sleep_flag = false;

      var idletime = SYSTEM_IDLE.getIdleTime();
      // console.log("idle time: ", idletime/1000);

      if(idletime >= idle_time  && prev_state == 'active'){
        // make api call to indicate idle time
        // console.log("state change ------active to idle");
        from_state = 'active';
        to_state = 'idle';

        current_state = 'idle';
      }

      if(idletime < idle_time && prev_state == 'idle'){
        // console.log("state change ------idle to active");
        from_state = 'idle';
        to_state = 'active'; 

        current_state = 'active';
      }
    }

    // If the user is disconnected from internet for more than 10 minutes
    // else if(logged_in && !online){
    //   var sleeptime = SYSTEM_IDLE.getIdleTime();
    //   if(sleeptime >= (idle_time * 2)){
    //     sleep_flag = true;
    //   }

    // }


  }, 1000);


  setInterval(function(){
    if(logged_in && online){
      
      console.log("Pinging server after 1 minutes", logged_in);
      let time_difference_btwn_two_ping = (new Date().getTime() - last_ping_time);
      console.log("time_difference_btwn_two_ping -----",time_difference_btwn_two_ping);
      

      if(time_difference_btwn_two_ping > idle_time){

         var data = {'from_state': '-', 'to_state': 'New Session'};
         prev_state = 'active';
         console.log("from_state = -  and to_state = New Session");

      }
      else{

       from_state = prev_state;
       var data = {'from_state': from_state, 'to_state': current_state};
       prev_state = current_state;
       console.log("from_state = " + from_state + "  and to_state = " + current_state);

      }



     $.ajax({
            url: website_url + '/api/ping', // url to confirm the user if present in company database & receive ID else create that user w.r.t that domain
            crossDomain : true,
            type: 'GET',
            timeout: 15000,
            headers: {
              //'User-Agent': 'request'
              'X-API-KEY': new_user_data.data.x_api_key,
              'from' : new_user_data.data.user_id
            },
            data: data
            ,success: function(response) {
              // console.log(response);

             if(response.status == 401){
                $('#loading').css('display','none');// Hide the Loading GIF
                $('#loginDiv').css('display','block');
                $('#contentMem').css('display','none');// Hide the Loading GIF
                showNotification('session expired');
                logged_in = false;

              }
              else if(response.status == 400){
                $('#loading').css('display','none');// Hide the Loading GIF
                $('#loginDiv').css('display','block');
                $('#contentMem').css('display','none');// Hide the Loading GIF
                showNotification('params missing');
                logged_in = false;

              }
              else if(response.status == 403){
                $('#loading').css('display','none');// Hide the Loading GIF
                $('#loginDiv').css('display','block');
                $('#contentMem').css('display','none');// Hide the Loading GIF
                showNotification('authorization error');
                logged_in = false;

              }
              else{
                logged_in = true;
                last_ping_time = new Date().getTime();
                console.log(last_ping_time);
                // console.log(response);
                TodaysCardController(response);
              }

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
  },ping_freq);

}

function showNotification(type){
  console.log("inside showNotification");

  if(type == 'login'){
  //   let myNotification = new Notification('Dilbert', {
  //   body: ''
  // })

  //   myNotification.onclick = () => {
  //   console.log('Notification clicked')
  // }
 }


  if(type == 'online'){
    let myNotification = new Notification('Psst...', {
    body: 'Hey, you are connected to the Dilbert server.',
    icon : 'assets/icons/png/48x48.png',
  })

    myNotification.onclick = () => {
    console.log('Notification clicked')
  }
 }

  if(type == 'offline'){
    let myNotification = new Notification('Whoops...', {
    body: 'Sorry, but it seems you are not connected to the server..',
    icon : 'assets/icons/png/48x48.png',
  })

    myNotification.onclick = () => {
    console.log('Notification clicked')
  }
 }

  if(type == 'join organisation'){
    let myNotification = new Notification('Dilbert',{
    title : 'Dilbert',
    body: 'Hey, please join organisation and login again',
    icon : 'assets/icons/png/48x48.png',
    hasReply : true
  })

    myNotification.onClick = () => {
    console.log('Notification clicked')
  }
 }

  if(type == 'create organisation'){
    let myNotification = new Notification('Dilbert', {
    body: 'Hey, please create a new organisation and login again',
    icon : 'assets/icons/png/48x48.png',
  })

    myNotification.onclick = () => {
    console.log('Notification clicked')
  }
 }

   if(type == 'connection error'){
    let myNotification = new Notification('Dilbert', {
    body: 'Connection error... please try logging in again',
    icon : 'assets/icons/png/48x48.png',
  })

    myNotification.onclick = () => {
    console.log('Notification clicked')
  }
 }


  if(type == 'session expired'){
    let myNotification = new Notification('Dilbert',{
    title : 'Dilbert',
    body: 'Hey, your session has expired... please login again',
    icon : 'assets/icons/png/48x48.png',
    hasReply : true
  })

    myNotification.onClick = () => {
    console.log('Notification clicked')
  }
 }

  if(type == 'params missing'){
    let myNotification = new Notification('Dilbert',{
    title : 'Dilbert',
    body: 'Hey, something went wrong... please login again',
    icon : 'assets/icons/png/48x48.png',
    hasReply : true
  })

    myNotification.onClick = () => {
    console.log('Notification clicked')
  }
 }



  if(type == 'authorization error'){
    let myNotification = new Notification('Dilbert',{
    title : 'Dilbert',
    body: 'Hey, you do not have permissions to login',
    icon : 'assets/icons/png/48x48.png',
    hasReply : true
  })

    myNotification.onClick = () => {
    console.log('Notification clicked')
  }
 }

}