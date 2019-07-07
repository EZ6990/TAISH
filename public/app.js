/**
 * Created by Hasidi on 18/06/2017.
 */
let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);

//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.controller('welcomeController', ['UserService', 'PointOfInterestService', '$scope', function (UserService, PointOfInterestService, $scope) {
    let self = this;
    self.randArr = [];
    let randNum = 3;

    PointOfInterestService.getPointsOfInterest()
        .then(function (result) {
            self.pointsOfInterest = result;

            for (let index = 0; index < randNum; index++) {
                self.randArr[index] = result[Math.floor(Math.random() * result.length)];
            }
        })

}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService', function (UserService) {
    let vm = this;
    vm.userService = UserService;
    vm.homeUrl = { false: "/", true: "/userHome" };
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
                self.sendCat = [];
            }).catch(function (err) {
                console.log(err);
                console.log("---------------------")
                return Promise.reject(err);

            })
        }
    }])
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', 'questionServirce', '$location', '$window', '$scope', '$http',
    function (UserService, questionServirce, $location, $window, $scope, $http) {
        console.log("asfd");
        let self = this;
        $scope.forgotSection = false;
        self.user2 = { username: "admin", password: "Password1" };
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
                self.recievedPasst = true;
                self.restoredPass = result.data;
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
                UserService.login(self.user2).then(function (success) {
                    $window.alert('You are logged in');
                    $location.path('/userHome');
                }).catch(function (error) {
                    self.errorMessage = error.data;
                    $window.alert(self.errorMessage);
                })
            }
        };
    }]);


//-------------------------------------------------------------------------------------------------------------------
app.controller('pointOfInterestController', ['$scope', '$routeParams', 'PointOfInterestService', function ($scope, $routeParams, PointOfInterestService) {
    let self = this;
    self.pointOfInterest = {};
    self.poiReviews = [];

    $scope.range = function (num) {
        var ratings = [];
        for (var i = 0; i < num; i++) {
            ratings.push(i)
        }
        return ratings;
    };
    PointOfInterestService.getPointOfInterestById($routeParams.poiId)
        .then(function (poi) {
            self.pointOfInterest = poi;
            return self.pointOfInterest.getReviews();
        })
        .then(function (reviews) {
            self.poiReviews = reviews;
            // if(!$scope.$$phase){
            //     $scope.$digest();
            // }
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
app.service('PointOfInterestService', ['$http', 'PointOfInterestModel', function ($http, PointOfInterestModel) {
    let self = this;
    self.pointsOfInterest = [];
    self.getPointsOfInterest = function () {
        if (self.pointsOfInterest.length == 0) {
            return $http.get('http://127.0.0.1:3000/public/getALLPOI')
                .then(function (res) {
                    self.pointsOfInterest = [];
                    angular.forEach(res.data, function (poi) {
                        self.pointsOfInterest.push(new PointOfInterestModel(poi));
                    });
                    return self.pointsOfInterest;
                });
        }
        else {
            return Promise.resolve(self.pointsOfInterest);
        }
    };
    self.getPointOfInterestById = function (poiId) {
        return self.getPointsOfInterest()
            .then(function (pois) {
                for (let i = 0; i < pois.length; i++) {
                    let poi = pois[i];
                    if (poi.Id == poiId)
                        return poi;
                }
            })
    };


}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loggedInController', ['UserService', '$window', function (UserService, $window) {
    let self = this;
    self.username = $window.sessionStorage.getItem('username');
    self.favPOI = [];
    self.reqPOI = [];
    self.hasFav=false;

    UserService.getFavorites()
        .then(function (response) {
            self.hasFav=response.length>0;
            console.log(self.hasFav);
            self.favPOI.push(response[response.length - 1]);
            self.favPOI.push(response[response.length - 2]);

        });

    UserService.getRecommended()
        .then(function (response) {

            self.reqPOI.push(response[response.length - 1]);
            self.reqPOI.push(response[response.length - 2]);
        });

}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('favoriteController', ['UserService', '$scope', '$window', '$http', function (UserService, $scope, $window, $http) {
    let self = this;
    self.favPOI = [];


    UserService.getFavorites()
        .then(function (response) {
            self.favPOI = response;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        });

    $scope.propertyName = 'pos';
    $scope.reverse = false;
    $scope.favPOI = self.favPOI;
    $scope.sortBy = function (propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };



    $scope.deleteRow = function (poiId) {
        UserService.removeFromFavorite(poiId);
    };
    $scope.saveOrder = function () {
        let order = [];
        self.favPOI.sort(function (a, b) {
            return a.pos - b.pos;
        });
        angular.forEach(self.favPOI, function (item) {
            order.push(item.Id);
        });
        UserService.saveNewOrder(order);
    };
    $scope.goUp = function (pos) {
        var max = 0;
        var comArr = eval(self.favPOI);
        for (var i = 0; i < comArr.length; i++) {
            if (!max || parseInt(self.favPOI[i].pos) > max)
                max = self.favPOI[i].pos;
        }
        if (pos < max) {
            for (var i = 0; i < comArr.length; i++) {
                if (self.favPOI[i].pos === pos + 1) {
                    self.favPOI[i].pos = pos;
                }
                else if (self.favPOI[i].pos === pos) {
                    self.favPOI[i].pos = self.favPOI[i].pos + 1;
                }
            }
        }

    }
    $scope.goDown = function (pos) {
        var min = Number.MAX_SAFE_INTEGER;
        var comArr = eval(self.favPOI);
        for (var i = 0; i < comArr.length; i++) {
            if (parseInt(self.favPOI[i].pos) < min)
                min = self.favPOI[i].pos;
        }
        if (pos > min) {
            for (var i = 0; i < comArr.length; i++) {
                if (self.favPOI[i].pos === pos - 1) {
                    self.favPOI[i].pos = pos;
                }
                else if (self.favPOI[i].pos === pos) {
                    self.favPOI[i].pos = self.favPOI[i].pos - 1;
                }
            }
        }
    }
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('searchController', ['PointOfInterestService', '$scope', 'UserService', function (PointOfInterestService, $scope, UserService) {
    let self = this;
    self.searchResults = [];
    self.categoriesPossibleFilter = [];
    self.categoriesFilter = {};
    self.pointsOfInterest = [];
    self.isLoggedIn = UserService.isLoggedIn;

    $scope.range = function (num) {
        var ratings = [];
        for (var i = 0; i < num; i++) {
            ratings.push(i)
        }
        return ratings;
    };

    PointOfInterestService.getPointsOfInterest()
        .then(function (result) {
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

    self.removeFromFavorite = function (poiId) {
        UserService.removeFromFavorite(poiId);
    };
    self.addToFavorite = function (poiId) {
        UserService.addToFavorite(poiId)
            .then(function (response) {
                // if(!$scope.$$phase){
                //     $scope.$digest();
                // }
            })
    };
    self.isInFavorite = function (poiId) {
        return UserService.isInFavorite(poiId);
    };
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
app.factory('UserService', ['$http', '$window', 'PointOfInterestModel', 'PointOfInterestService', function ($http, $window, PointOfInterestModel, PointOfInterestService) {
    let service = {};

    let self = this;
    self.currentUser = {};
    self.currentUser.favorites = [];
    self.currentUser.favorites = [];

    service.isLoggedIn = false;

    service.login = function (user) {
        $window.sessionStorage.setItem('username', user.username);

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
            $window.sessionStorage.setItem('token', token);
            $http.defaults.headers.common = {
                'x-auth-token': token,
                'user': user.username
            };
            service.isLoggedIn = true;
            return service.getFavorites();
        })
            .then(function (response) {

            })
            .catch(function (error) {
                return Promise.reject(error);
            });
    };
    service.getFavorites = function () {
        if (service.isLoggedIn) {
            if (self.currentUser.favorites.length == 0) {
                return $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/private/user/getSavedPOI',
                    headers: { 'x-auth-token': $window.sessionStorage.getItem('token') }
                })
                    .then(function (response) {
                        self.currentUser.favorites = [];
                        let i = 1;
                        angular.forEach(response.data, function (poi) {
                            poi["pos"] = i;
                            i++;
                            self.currentUser.favorites.push(new PointOfInterestModel(poi));
                        });
                        return self.currentUser.favorites;
                    })
            }
            else {
                return Promise.resolve(self.currentUser.favorites);
            }
        }
        else {
            return Promise.reject("User not logged in");
        }
    };
    service.getRecommended = function () {
        if (service.isLoggedIn) {
            if (self.currentUser.favorites.length == 0) {
                return $http({
                    method: 'GET',
                    url: 'http://127.0.0.1:3000/private/user/getSavedPOI',
                    headers: { 'x-auth-token': $window.sessionStorage.getItem('token') }
                })
                    .then(function (response) {
                        self.currentUser.recommended = [];
                        angular.forEach(response.data, function (poi) {
                            self.currentUser.recommended.push(new PointOfInterestModel(poi));
                        })
                        return self.currentUser;
                    })
            }
            else {
                return Promise.resolve(self.currentUser.favorites);
            }
        }
    };
    service.saveNewOrder = function (poiArr) {
        var req = {
            method: 'PUT',
            url: 'http://127.0.0.1:3000/private/user//insertDefaultPOIOrder',
            headers: {
                'x-auth-token': $window.sessionStorage.getItem('token')
            },
            data: {
                POIId: poiArr
            }
        }
        $http(req).then(function (result) {
        }).catch(function (err) {
            res.send(err)
        })
    };
    service.addToFavorite = function (poiId) {

        var ans = service.isInFavorite(poiId);
        if (ans[0])
            return Promise.reject("already in favorites");

        var req = {
            method: 'POST',
            url: 'http://127.0.0.1:3000/private/user/savePOI',
            headers: {
                'x-auth-token': $window.sessionStorage.getItem('token'),
                "Content-Type": "application/json;charset=utf-8"
            },
            data: {
                POIId: poiId
            }
        }
        return $http(req)
            .then(function (result) {
                return PointOfInterestService.getPointOfInterestById(poiId);
            })
            .then(function (poi) {
                newpoi = new PointOfInterestModel(poi);
                newpoi["pos"] = self.currentUser.favorites.length + 1;

                console.log(self.currentUser.favorites);
                self.currentUser.favorites.push(newpoi);
                console.log(self.currentUser.favorites);

                return self.currentUser.favorites;
            })
            .catch(function (err) {
                return Promise.reject(err);

            })
    };
    service.removeFromFavorite = function (poiId) {


        favorites = self.currentUser.favorites;
        var ans = service.isInFavorite(poiId);
        if (!ans[0])
            return Promise.reject(favorites[ans[1]].Name + " not in favorites");

        console.log(favorites);
        for (var i = 0; i < favorites.length; i++)
            if (favorites[ans[1]].pos < favorites[i].pos)
                favorites[i].pos--;


        favorites.splice(ans[1], 1);

        var req = {
            method: 'DELETE',
            url: 'http://127.0.0.1:3000/private/user/removeSavedPOI',
            headers: {
                'x-auth-token': $window.sessionStorage.getItem('token')
                , "Content-Type": "application/json;charset=utf-8"
            },
            data: {
                POIId: poiId
            }
        }
        $http(req).then(function (result) {
        }).catch(function (err) {
            res.send(err)
        })
    };
    service.isInFavorite = function (poiId) {
        var favorites = self.currentUser.favorites;
        for (var i = 0; i < favorites.length; i++) {
            if (favorites[i].Id === poiId) {
                return [true, i];
            }
        }
        return [false, -1];
    };
    //service.login({ username: "admin", password: "Password1" });
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
            templateUrl: "public/views/welcomePage.html",
        })
        .when("/userHome", {
            templateUrl: "public/views/loggedInHome.html",
        })
        .when("/login", {
            templateUrl: "public/views/tmplogin.html",
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
        .when("/favorites", {
            templateUrl: "public/views/favorite.html",
        })
        .otherwise({
            redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
