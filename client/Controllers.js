app.controller('myModalController', ['$scope', 'UserService', function ($scope, UserService) {

    $scope.range = function (num) {
        var ratings = [];
        for (var i = 0; i < num; i++) {
            ratings.push(i)
        }
        return ratings;
    };
    var self = this;
    self.rate = -1;
    self.details = "";

    self.insertReview = function (poiId, rate, details) {
        UserService.insertReview(poiId, rate, details)
            .then(
                function (result) {
                    $('.modal').modal('hide');
                    $scope.$parent.UpdateReviews();
                })
            .catch(function (error) {
            });
    };


}]);
app.directive('myCustomer', function () {
    return {
        restrict: 'E',
        templateUrl: 'public/views/reviewModal.html',
        scope: {
            poi: '=lolo'
        },
        transclude: true,
        controller: 'myModalController as modalCtrl',
        link: function (scope, ele, attrs) {
            $(ele).find('.trans-layer').on('click', function (event) {
                scope.$apply();
                //window.location.href = "#!home";

            })
        }
    };
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
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        })

}]);

//-------------------------------------------------------------------------------------------------------------------
app.controller('mainController', ['UserService', '$scope', function (UserService, $scope) {
    let vm = this;
    vm.userService = UserService;
    vm.numInFavorites = 0;
    vm.homeUrl = { false: "/", true: "/userHome" };

    vm.FavoritesChanges = function () {
        return vm.userService.getFavorites()
            .then(function (favorites) {
                vm.numInFavorites = favorites.length;
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            })
    }
    UserService.addFavoritesObservers(vm.FavoritesChanges)

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
            });



        $http.get(cUrl).then(function (response) {
            self.countries = response.data;
        },
            function (error) {
            });


        self.registerNewUser = function () {
            angular.forEach(self.chosenCats, function (value, key) {
                if (value == true)
                    self.sendCat.push(key);
            });

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
                self.sendCat = [];
                $window.alert('Registration successful');
                $location.path('/userHome');
            }).catch(function (err) {
                return Promise.reject(err);

            })
        }
    }])
//-------------------------------------------------------------------------------------------------------------------
app.controller('loginController', ['UserService', 'questionServirce', '$location', '$window', '$scope', '$http',
    function (UserService, questionServirce, $location, $window, $scope, $http) {
        let self = this;
        $scope.forgotSection = false;
        // self.user2 = { username: "admin", password: "Password1" };
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
                    $location.path('/userHome');
                }).catch(function (error) {
                    self.errorMessage = error.data;
                    $window.alert(self.errorMessage);
                })
            }
        };
    }]);


//-------------------------------------------------------------------------------------------------------------------
app.controller('pointOfInterestController', ['$scope', '$routeParams', 'PointOfInterestService', 'UserService', function ($scope, $routeParams, PointOfInterestService, UserService) {
    let self = this;
    self.pointOfInterest = {};
    self.poiReviews = [];
    self.isLoggedIn = UserService.isLoggedIn;

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
            if (!$scope.$$phase) {
                $scope.$digest();
            }
            return true;
        })
        .then(function (succeed) {
            self.pointOfInterest.increaseVisits();
        });

    self.removeFromFavorite = function (poiId) {
        UserService.removeFromFavorite(poiId);
    };
    self.addToFavorite = function (poiId) {
        UserService.addToFavorite(poiId)
            .then(function (response) {
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            })
    };
    self.isInFavorite = function (poiId) {
        return UserService.isInFavorite(poiId);
    };
}]);
//-------------------------------------------------------------------------------------------------------------------
app.controller('loggedInController', ['UserService', '$window', '$scope', function (UserService, $window, $scope) {
    let self = this;
    self.username = $window.sessionStorage.getItem('username');
    self.favPOI = [];
    self.reqPOI = [];
    self.hasFav = false;

    UserService.getFavorites()
        .then(function (response) {
            self.hasFav = response.length > 2;
            if (response.length >= 2) {
                self.favPOI.push(response[response.length - 1]);
                self.favPOI.push(response[response.length - 2]);

                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
        });

    UserService.getRecommended()
        .then(function (response) {
            if (response.length >= 2) {
                self.reqPOI.push(response[0]);
                self.reqPOI.push(response[1]);

                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
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

    $scope.UpdateReviews = function (){
        PointOfInterestService.getPointsOfInterest()
        .then(function (result) {
            self.pointsOfInterest = result;
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        });
    }

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
                if (!$scope.$$phase) {
                    $scope.$digest();
                }
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