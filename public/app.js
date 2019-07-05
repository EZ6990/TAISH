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

app.controller('registerController', ['questionServirce', '$http',
    function (questionServirce, $http) {
        let self = this;
        let basicUrl = 'http://127.0.0.1:3000/public/';
        let cUrl = basicUrl + 'getCountries';
        let rcURL = basicUrl + 'registerClient';
        let catUrl = basicUrl + 'getAllCategories';
        self.questions = questionServirce.questions;
        self.chosenCats = [];
        self.sendCat = [];
        $http.get(catUrl).then(function (response) {
            self.categories = response.data;
        },
            function (error) {
                console.log("trouble uploading categories")
            });



        $http.get(cUrl).then(function (response) {
            self.countries = response.data;
        },
            function (error) {
                console.log("trouble uploading countries")
            });


        self.registerNewUser = function () {
            angular.forEach(self.chosenCats, function (value, key) {
                if (value == true)
                    self.sendCat.push(key);
            });
           // console.log(self.sendCat);
           
            var req = {
                method: 'POST',
                url: rcURL,
                data: {
                    username: self.username,
                    password: self.password,
                    firstname: self.firstname,
                    lastname: self.lastname,
                    city: self.city,
                    country: parseInt(self.country),
                    email: self.email,
                    question1: self.question1,
                    answer1: self.answer1,
                    question2: self.question2,
                    answer2: self.answer2,
                    categories: self.sendCat
                }
            }
            $http(req).then(function (result) {
                console.log(result)
                self.sendCat=[];
            }).catch(function (err) {
                console.log(err);
                console.log("---------------------")
                return Promise.reject(err);
                
            })
        }
    }])
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', 'questionServirce', '$location', '$window', '$scope','$http',
    function (UserService, questionServirce, $location, $window, $scope,$http) {
        console.log("asfd");
        let self = this;
        $scope.forgotSection = false;
        // self.restoredPass;
        // self.recievedPass;
        //  $scope.showHide = true;
        self.getPass = function () {
            var req = {
                method: 'POST',
                url: 'http://127.0.0.1:3000/public/restorePassword',
                data: {
                    username: self.user.username,
                    question1: self.firstQuestion,
                    answer1: self.firstAnswer,
                    question2: self.secondQuestion,
                    answer2: self.secondAnswer
                }
            }
            $http(req).then(function (result) {
               self.recievedPasst=true;
               self.restoredPass=result.data;
            }).catch(function (err) {
                console.log(nope)
                res.send(err)
            })
        }
        self.showHide = function () {
            $scope.forgotSection = true;
        }
        self.questions = questionServirce.questions;
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

app.controller('pointOfInterestController', ['$http','$routeParams','$rootScope','PointOfInterestService', function ($http,$routeParams,$rootScope,PointOfInterestService) {
    let self = this;
    PointOfInterestService.getPointOfInterestById($routeParams.poiId)
    .then(function(poi){
        self.pointOfInterest = poi;
    });
}]);

app.service('PointOfInterestService',['$http','PointOfInterestModel', function($http,PointOfInterestModel) {
    let self = this;
    self.pointsOfInterest = [];

    self.getPointsOfInterest = function () { 
        if (self.pointsOfInterest.length == 0){
            return $http.get('http://127.0.0.1:3000/public/getALLPOI')
                .then(function (res) {
                    self.pointsOfInterest = [];
                    angular.forEach(res.data, function (poi) {
                        self.pointsOfInterest.push(new PointOfInterestModel(poi));
                    });
                    return self.pointsOfInterest;
                });
        }
        else{
            return Promise.resolve(self.pointsOfInterest);
        }
    };
    self.getPointOfInterestById = function (poiId) {
        return self.getPointsOfInterest()
        .then(function(pois){
            for (let i = 0; i < pois.length; i++){
                let poi = pois[i];
                if (poi.Id == poiId)
                    return poi;
            }
        })
    };
  }]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('searchController', ['PointOfInterestService', function (PointOfInterestService) {
    let self = this;
    self.searchResults = [];
    self.categoriesPossibleFilter = [];
    self.categoriesFilter = {};
    self.pointsOfInterest = [];
    PointOfInterestService.getPointsOfInterest()
    .then(function(result){
        self.pointsOfInterest = result;
    });
    
    self.search = function (name) {
        self.searchResults = [];
        self.categoriesPossibleFilter = [];
        self.categoriesFilter = {};
        angular.forEach(self.pointsOfInterest, function (item) {
            if (item.Name.includes(name)) {
                self.searchResults.push(item);
            }
        });
        angular.forEach(self.searchResults, function (pointOfInterest) {
            angular.forEach(pointOfInterest.Categories, function (category) {
                bAdd = true;
                angular.forEach(self.categoriesPossibleFilter, function (filterCategory) {
                    if (filterCategory.Id == category.Id) {
                        bAdd = false;
                    }
                });
                if (bAdd) {
                    self.categoriesPossibleFilter.push(category);
                    self.categoriesFilter[category.Id] = true;
                }
            });
        });
    }
    self.filterByCategory = function (pointOfInterest) {
        for (i = 0; i < pointOfInterest.Categories.length; i++) {
            var category = pointOfInterest.Categories[i];
            if (self.categoriesFilter[category.Id] == true) {
                return pointOfInterest;
            }
            return false;
        };
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
            console.log(token);
            return Promise.resolve(response);
        }, function (error) {
            return Promise.reject(e);
        });
    };
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.service('questionServirce', function () {
    this.questions = [
        "What is the name of your pet?",
        "What is the name of your favorite teachers name?",
        "In what city were you born?",
        "What is the name of your first school?",
        "Which phone number do you remember most from your childhood?",
        "What was your favorite place to visit as a child?",
        "Who is your favorite actor, musician, or artist?",
        "What is your favorite movie?",
        "What street did you grow up on?"
    ];

    this.getQuestions = function () {
        return this.questions;
    }

});
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "public/views/home.html",
            controller: "mainController"
        })
        .when("/login", {
            templateUrl: "public/views/tmplogin.html",
        })
        .when("/cities", {
            templateUrl: "public/views/cities.html",
        })
        .when("/register", {
            templateUrl: "public/views/register.html",
        })
        .when("/search", {
            templateUrl: "public/views/search.html",
        })
        .when("/show/:poiId", {
            templateUrl: "public/views/poi.html",
        })
        .otherwise({
            redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
