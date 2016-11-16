
// controllers.js
angular
	.module('controllers', []);

// WelcomeCtrl.controllers.js
angular
    .module('controllers')
	.controller('WelcomeCtrl', WelcomeCtrl);
	
	function WelcomeCtrl($scope, $state, $q, UserService, $ionicLoading) {
	
		//This is the success callback from the login method
		var fbLoginSuccess = facebookLogin;
		function facebookLogin(response) {
			if (!response.authResponse){
			  fbLoginError("Cannot find the authResponse");
			  return;
			}
		
			var authResponse = response.authResponse;
		
			getFacebookProfileInfo(authResponse)
			.then(function(profileInfo) {
			  //store user data on local storage
			  UserService.setUser({
				authResponse: authResponse,
						userID: profileInfo.id,
						name: profileInfo.name,
						email: profileInfo.email,
						picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
			  });
		
			  $ionicLoading.hide();
			  $state.go('app.home');
		
			}, function(fail){
			  //fail get profile info
			  console.log('profile info fail', fail);
			});
	  	}
	
	
	  //This is the fail callback from the login method
	  var fbLoginError = function(error){
		console.log('fbLoginError', error);
		$ionicLoading.hide();
	  };
	
	  //this method is to get the user profile info from the facebook api
	  var getFacebookProfileInfo = function (authResponse) {
		var info = $q.defer();
	
		facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
		  function (response) {
					console.log(response);
			info.resolve(response);
		  },
		  function (response) {
					console.log(response);
			info.reject(response);
		  }
		);
		return info.promise;
	  };
	
	  //This method is executed when the user press the "Login with facebook" button
	  $scope.facebookSignIn = facebookSignIn;
	  
	  function facebookSignIn() {
	
		facebookConnectPlugin.getLoginStatus(function(success){
		 if(success.status === 'connected'){
			// the user is logged in and has authenticated your app, and response.authResponse supplies
			// the user's ID, a valid access token, a signed request, and the time the access token
			// and signed request each expire
			console.log('getLoginStatus', success.status);
	
					//check if we have our user saved
					var user = UserService.getUser('facebook');
	
					if(!user.userID)
					{
						getFacebookProfileInfo(success.authResponse)
						.then(function(profileInfo) {
	
							//store user data on local storage
							UserService.setUser({
								authResponse: success.authResponse,
								userID: profileInfo.id,
								name: profileInfo.name,
								email: profileInfo.email,
								picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
							});
	
							$state.go('app.home');
	
						}, function(fail){
							//fail get profile info
							console.log('profile info fail', fail);
						});
					}else{
						$state.go('app.home');
					}
	
		 } else {
			//if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
			//else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
			console.log('getLoginStatus', success.status);
	
				  $ionicLoading.show({
			  template: 'Logging in...'
			});
	
			//ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
			facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
		  }
		});
	  }
	}


// AppCtrl.controllers.js
angular
    .module('controllers')
	.controller('AppCtrl', AppCtrl);
	
	function AppCtrl($scope){
	}


// HomeCtrl.controllers.js
angular
    .module('controllers')
	.controller('HomeCtrl', HomeCtrl);
	
	function HomeCtrl($scope, UserService, $ionicActionSheet, $state, $ionicLoading){
	
		$scope.user = UserService.getUser();
	
		$scope.showLogOutMenu = showLogOutMenu;
		
		function showLogOutMenu() {
			var hideSheet = $ionicActionSheet.show({
				destructiveText: 'Logout',
				titleText: 'Are you sure you want to logout?',
				cancelText: 'Cancel',
				cancel: function() {},
				buttonClicked: function(index) {
					return true;
				},
				destructiveButtonClicked: function(){
					$ionicLoading.show({
						template: 'Logging out...'
					});
	
			//facebook logout
			facebookConnectPlugin.logout(function(){
			  $ionicLoading.hide();
			  $state.go('welcome');
			},
			function(fail){
			  $ionicLoading.hide();
			});
				}
			});
		}
	}
