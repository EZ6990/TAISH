/**
 * Created by Hasidi on 18/06/2017.
 */
let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);
//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService', function (UserService) {
    let vm = this;
    vm.greeting = 'Have a nice day';
    vm.userService = UserService;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', '$location', '$window',
    function(UserService, $location, $window) {
        let self = this;
        self.user = {username: '', password: ''};

        self.login = function(valid) {
            if (valid) {
                UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/');
                }, function (error) {
                    self.errorMessage = error.data;
                    $window.alert('log-in has failed');
                })
            }
        };
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('citiesController', ['$http', 'CityModel', function($http, CityModel) {
        let self = this;
        self.fieldToOrderBy = "name";
        // self.cities = [];
        self.getCities = function () {
            $http.get('/cities')
                .then(function (res) {
                    // self.cities = res.data;
                    //We build now cityModel for each city
                    self.cities = [];
                    angular.forEach(res.data, function (city) {
                        self.cities.push(new CityModel(city));
                    });
                });
        };
        self.addCity = function () {
          let city = new CityModel(self.myCity);
          if (city) {
              city.add();
              self.getCities();
          }
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.factory('UserService', ['$http', function($http) {
    let service = {};
    service.isLoggedIn = false;
    service.login = function(user) {
        return $http.post('/login', user)
            .then(function(response) {
                let token = response.data;
                $http.defaults.headers.common = {
                    'my-Token': token,
                    'user' : user.username
                };
                service.isLoggedIn = true;
                return Promise.resolve(response);
            })
            .catch(function (e) {
                return Promise.reject(e);
            });
    };
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);
app.config( ['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl : "views/home.html",
            controller : "mainController"
        })
        .when("/login", {
            templateUrl : "views/login.html",
            controller : "loginController"
        })
        .when("/cities", {
            templateUrl : "views/cities.html",
            controller: 'citiesController'
        })
        .when("/StorageExample", {
            templateUrl : "views/StorageExample.html",
            controller: 'StorageExampleController'
        })
        .otherwise({redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
