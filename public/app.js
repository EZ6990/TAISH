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
app.controller('loginController', ['UserService', '$location', '$window','$scope',
    function (UserService, $location, $window) {
        let self = this;
        $scope.forgotSection=false;
        $scope.showHide=function(){

            $scope.showHide=true;
        }
        self.user = { username: 'admin', password: 'Password1' };
        self.multipleSelect = {
            q1: "",
            a1: "",
            q2: "",
            a2: ""
        }
        self.questions = {
            q1: "What is the name of your pet?",
            q2: "What is the name of your favorite teachers name?",
            q3: "In what city were you born?",
            q4: "What is the name of your first school?",
            q5: "Which phone number do you remember most from your childhood?",
            q6: "What was your favorite place to visit as a child?",
            q7: "Who is your favorite actor, musician, or artist?",
            q8: "What is your favorite movie?",
            q9: "What street did you grow up on?"
        }
        self.login = function (valid) {
            if (valid) {
                UserService.login(self.user).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/');
                }).catch(function (error) {
                    self.errorMessage = error.data;
                    $window.alert(self.errorMessage);
                })
            }
        };
    }]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('citiesController', ['$http', 'CityModel', function ($http, CityModel) {
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
app.factory('UserService', ['$http', function ($http) {
 
    let service = {};
    service.isLoggedIn = false;
    service.login = function (user) {
        let data = {
            username: user.username,
            password: user.password
        }; 
        data = JSON.stringify(data)
        return $http({
            method: 'POST',
            url: 'http://127.0.0.1:3000/public/login',
            data: data
        }).then(function (response) {
            let token = response.data;
            $http.defaults.headers.common = {
                'x-auth-token': token,
                'user': user.username
            };
            service.isLoggedIn = true;
            console.log("resolving");
            return Promise.resolve(response);
        }, function (error) {
            return Promise.reject(e);
        });
    };
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "mainController"
        })
        .when("/login", {
            templateUrl: "views/tmplogin.html",
            controller: "loginController"
        })
        .when("/cities", {
            templateUrl: "views/cities.html",
            controller: 'citiesController'
        })
        .when("/StorageExample", {
            templateUrl: "views/StorageExample.html",
            controller: 'StorageExampleController'
        })
        .otherwise({
            redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
