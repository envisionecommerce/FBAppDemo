	
// UserService.services.js
(function() {
    'use strict';

    angular
       .module('services', [])
	   .service('UserService', UserService);

    function UserService() {
		//store user data on ionic local storage but you should save it on a database
		
		var service = {
			setUser: setUser,
			getUser: getUser
		};
		
		return service;
		
		 function setUser(user_data) {
			window.localStorage.starter_facebook_user = JSON.stringify(user_data);
		}
		
		function getUser(){
			return JSON.parse(window.localStorage.starter_facebook_user || '{}');
		}
	}
})();