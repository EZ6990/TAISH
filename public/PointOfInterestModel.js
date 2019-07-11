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