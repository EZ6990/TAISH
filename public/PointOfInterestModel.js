app.factory('PointOfInterestModel', ['$http', function($http) {
    function PointOfInterestModel(poi) {
        if (poi)
            this.setData(poi);
    }
    PointOfInterestModel.prototype = {
        setData: function(poiData) {
            angular.extend(this, poiData);
        },
        load: function(poiID) {
            $http.get('/show/' + poiID).then(function(poiData) {
            });
        },
    };
    return PointOfInterestModel;
}]);