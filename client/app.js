/**
 * Created by Hasidi on 18/06/2017.
 */
let app = angular.module('myApp', ['ngRoute', 'LocalStorageModule']);
//-------------------------------------------------------------------------------------------------------------------
app.config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('node_angular_App');
});
//-------------------------------------------------------------------------------------------------------------------
app.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
}]);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/welcomePage.html",
        })
        .when("/userHome", {
            templateUrl: "views/loggedInHome.html",
        })
        .when("/login", {
            templateUrl: "views/login.html",
        })
        .when("/register", {
            templateUrl: "views/register.html",
        })
        .when("/search", {
            templateUrl: "views/search.html",
        })
        .when("/show/:poiId", {
            templateUrl: "views/poi.html",
        })
        .when("/favorites", {
            templateUrl: "views/favorite.html",
        })
        .when("/about", {
            templateUrl: "views/about.html",
        })
        .otherwise({
            redirect: '/',
        });
}]);
//-------------------------------------------------------------------------------------------------------------------
