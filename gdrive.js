function handleClientLoad() {
    // Loads the client library and the auth2 library together for efficiency.
    // Loading the auth2 library is optional here since `gapi.client.init` function will load
    // it if not already loaded. Loading it upfront can save one network request.
    gapi.load('client:auth2', initClient);
  }

  function initClient() {
    // Initialize the client with API key and People API, and initialize OAuth with an
    // OAuth 2.0 client ID and scopes (space delimited string) to request access.
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        clientId: CLIENT_ID,
        scope: 'profile https://www.googleapis.com/auth/drive'
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  }

  function updateSigninStatus(isSignedIn) {
    // When signin status changes, this function is called.
    // If the signin status is changed to signedIn, we make an API call.
    if (isSignedIn) {
      var user=(gapi.auth2.getAuthInstance().currentUser.get())
      var profile = user.getBasicProfile()
      var auth=(user.getAuthResponse())
      AUTH_TOKEN=auth.access_token
      console.log(profile.getImageUrl())
      var img=document.createElement("img");
      img.setAttribute("height",30);
      img.setAttribute("align","absmiddle");
      img.style.borderRadius='99% 99%';
      img.src=profile.getImageUrl();
      var content=document.createElement("SPAN");
      content.innerHTML=" "+profile.getName();
      var signin=document.getElementById("signin-button");
      signin.innerHTML='';
      signin.appendChild(img);
      signin.appendChild(content);
      document.getElementById("signout-button").style.display=""
      
      init()
    }
  }

  function handleSignInClick(event) {
    // Ideally the button should only show up after gapi.client.init finishes, so that this
    // handler won't be called before OAuth is initialized.
    gapi.auth2.getAuthInstance().signIn();
  }

  function handleSignOutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    document.getElementById("signin-button").innerHTML= "Sign In"
      
    AUTH_TOKEN = ""
    reactApp.reset()
    init()
  }

  function retrieveAllFiles(callback) {
      var retrievePageOfFiles = function(request, result) {
          request.execute(function(resp) {
          result = result.concat(resp.items);
          var nextPageToken = resp.nextPageToken;
          if (nextPageToken) {
              request = gapi.client.drive.files.list({
              'pageToken': nextPageToken
              });
              retrievePageOfFiles(request, result);
          } else {
              callback(result);
          }
          });
      }
      var initialRequest = gapi.client.drive.files.list();
      retrievePageOfFiles(initialRequest, []);
  }
