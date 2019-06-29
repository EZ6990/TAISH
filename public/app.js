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
        self.questions = questionServirce.questions;
        let cUrl = basicUrl+'getCountries';
        let rcURL=basicUrl+'registerClient';
        $http.get(cUrl).then(function (response) {
        self.countries=response.data;
        console.log(self.countries);            
        },
        function(error){
            console.log("trouble uploading countries")
        });
        self.getPass = function () {
            var req = {
                method: 'POST',
                url: rcURL,
                data: {
                    username: self.username,
                    password: self.password,
                    firstname: self.firstname,
                    lastname: self.lastname,
                    city: self.city,
                    country: self.country,
                    email: self.email,
                    question1: self.question1,
                    answer1: self.answer1,
                    question2: self.question2,
                    answer2: self.answer2,
                    categories: self.categories
                }
            }
            $http(req).then(function (result) {
                console.log(result)
            }).catch(function (err) {
                console.log(nope)
                res.send(err)
            })
        }
    }])
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', 'questionServirce', '$location', '$window', '$scope',
    function (UserService, questionServirce, $location, $window, $scope) {
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
                console.log(result)
            }).catch(function (err) {
                console.log(nope)
                res.send(err)
            })
        }
        self.showHide = function () {
            $scope.forgotSection = true;
        }
        self.user = { username: 'admin', password: 'Password1' };
        self.multipleSelect = {
            q1: "",
            a1: "",
            q2: "",
            a2: ""
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

//-------------------------------------------------------------------------------------------------------------------
app.controller('searchController', ['$http', 'PointOfInterestModel', function ($http, PointOfInterestModel) {
    let self = this;
    self.searchResults = []
    self.categoriesPossibleFilter = []
    self.getPointsOfInterest = function () {
        $http.get('http://127.0.0.1:3000/public/getALLPOI')
            .then(function (res) {
                self.pointsOfInterest = [];
                angular.forEach(res.data, function (poi) {
                    self.pointsOfInterest.push(new PointOfInterestModel(poi));
                });
            });
    };
    self.search = function (name) {
        self.searchResults = []
        self.categoriesPossibleFilter = [];
        angular.forEach(self.pointsOfInterest, function (item) {
            if (item.Name.includes(name)) {
                self.searchResults.push(item);
            }

        });
    }
    angular.forEach(self.searchResults, function (pointOfInterest) {
        angular.forEach(pointOfInterest.Categories, function (category) {
            bAdd = true;
            angular.forEach(self.categoriesPossibleFilter, function (filterCategory) {
                console.log(category);
                angular.forEach(self.categoriesPossibleFilter, function (filterCategory) {
                    console.log(filterCategory);
                    if (filterCategory.Name == category.Name) {
                        bAdd = false;
                    }
                });
                if (bAdd) {
                    self.categoriesPossibleFilter.push(category);
                    self.categoriesFilter[category.Id] = true;
                }
            });
        });
    });
    self.getPointsOfInterest();
    self.filterByCategory = function () {
        return function (pointOfInterest) {
            angular.forEach(pointOfInterest.Categories, function (category) {
                if (self.categoriesFilter[category.Id])
                    return true;
            });
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
            console.log("resolving");
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
