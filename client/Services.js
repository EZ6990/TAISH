app.factory('PointOfInterestModel', ['$http', function($http) {
    function PointOfInterestModel(poi) {
        if (poi)
            this.setData(poi);
    }
    PointOfInterestModel.prototype = {
        setData: function(poiData) {
            angular.extend(this, poiData);
        },
        getReviews: function() {
                return $http.get('http://127.0.0.1:3000/public/getPOIReviews/' + this.Id + '/' + -1)
                .then(function(reviews) {
                    return reviews.data;
            });
        },
        increaseVisits: function() {
            var req = {
                method: 'PUT',
                url: 'http://127.0.0.1:3000/public/POIViewIncrease',
                data: {
                    POIId: this.Id
                }
            }
            return $http(req)
                .then(function (result) {
                    return result;
                })
                .catch(function (err) {
                    return Promise.reject(err);
                })
    },
        
    };
    return PointOfInterestModel;
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
app.factory('UserService', ['$http', '$window', 'PointOfInterestModel', 'PointOfInterestService', function ($http, $window, PointOfInterestModel, PointOfInterestService) {
    let service = {};

    let self = this;
    self.favoritesObservers = [];
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
        })
            .then(function (response) {
                let token = response.data;
                $window.sessionStorage.setItem('token', token);
                $http.defaults.headers.common = {
                    'x-auth-token': token,
                    'user': user.username
                };
                service.isLoggedIn = true;
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
                        if (typeof response !== "undefined" || response.length > 0) {
                            self.currentUser.favorites = [];
                            let i = 1;
                            angular.forEach(response.data, function (poi) {

                                poi["pos"] = i;
                                i++;
                                self.currentUser.favorites.push(new PointOfInterestModel(poi));
                            });
                            self.notifyFavoritesChanges();
                            return self.currentUser.favorites;
                        }
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
                    url: 'http://127.0.0.1:3000/private/user/getReccomendedPOI',
                    headers: { 'x-auth-token': $window.sessionStorage.getItem('token') }
                })
                    .then(function (response) {
                        self.currentUser.recommended = [];
                        angular.forEach(response.data, function (poi) {
                            self.currentUser.recommended.push(new PointOfInterestModel(poi));
                        })
                        return self.currentUser.recommended;
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

                self.currentUser.favorites.push(newpoi);
                self.notifyFavoritesChanges();
                return self.currentUser.favorites;
            })
            .catch(function (err) {
                return Promise.reject(err);
            })
    };
    service.insertReview = function (poiId, rate, details) {


        var req = {
            method: 'POST',
            url: 'http://127.0.0.1:3000/private/user/insertReview',
            headers: {
                'x-auth-token': $window.sessionStorage.getItem('token'),
                "Content-Type": "application/json;charset=utf-8"
            },
            data: {
                POIId: poiId,
                Rate: rate,
                Details: details
            }
        }
        return $http(req)
            .then(function (result) {
                return result;
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
            self.notifyFavoritesChanges();
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
    service.addFavoritesObservers = function (callback) {
        self.favoritesObservers.push(callback);
    };
    self.notifyFavoritesChanges = function () {
        angular.forEach(self.favoritesObservers, function (callback) {
            callback();
        });
    };
    //service.login({ username: "admin", password: "Password1" });
    return service;
}]);
//-------------------------------------------------------------------------------------------------------------------
app.service('PointOfInterestService', ['$http', 'PointOfInterestModel', function ($http, PointOfInterestModel) {
    let self = this;
    self.pointsOfInterest = [];
    self.getPointsOfInterest = function () {
        //if (self.pointsOfInterest.length == 0) {
            return $http.get('http://127.0.0.1:3000/public/getALLPOI')
                .then(function (res) {
                    self.pointsOfInterest = [];
                    angular.forEach(res.data, function (poi) {
                        self.pointsOfInterest.push(new PointOfInterestModel(poi));
                    });
                    return self.pointsOfInterest;
                });
        //}
        // else {
        //     return Promise.resolve(self.pointsOfInterest);
        // }
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