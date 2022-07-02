angular.module('page', ['ngAnimate', 'ui.bootstrap']);
angular.module('page')
.factory('httpRequestInterceptor', function () {
	var csrfToken = null;
	return {
		request: function (config) {
			config.headers['X-Requested-With'] = 'Fetch';
			config.headers['X-CSRF-Token'] = csrfToken ? csrfToken : 'Fetch';
			return config;
		},
		response: function(response) {
			var token = response.headers()['x-csrf-token'];
			if (token) {
				csrfToken = token;
			}
			return response;
		}
	};
})
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('httpRequestInterceptor');
}])
.factory('$messageHub', [function(){
	var messageHub = new FramesMessageHub();

	var message = function(evtName, data){
		messageHub.post({data: data}, 'chronos-app.Employees.Assignment.' + evtName);
	};

	var on = function(topic, callback){
		messageHub.subscribe(callback, topic);
	};

	return {
		message: message,
		on: on,
		onEntityRefresh: function(callback) {
			on('chronos-app.Employees.Assignment.refresh', callback);
		},
		onEmployeeModified: function(callback) {
			on('chronos-app.Employees.Employee.modified', callback);
		},
		onProjectModified: function(callback) {
			on('chronos-app.Employees.Project.modified', callback);
		},
		onEmployeeSelected: function(callback) {
			on('chronos-app.Employees.Employee.selected', callback);
		},
		messageEntityModified: function() {
			message('modified');
		}
	};
}])
.controller('PageController', function ($scope, $http, $messageHub) {

	var api = '/services/v4/js/chronos-app/gen/api/Employees/Assignment.js';
	var employeeidOptionsApi = '/services/v4/js/chronos-app/gen/api/Employees/Employee.js';
	var projectidOptionsApi = '/services/v4/js/chronos-app/gen/api/Projects/Project.js';

	$scope.dateOptions = {
		startingDay: 1
	};
	$scope.dateFormats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
	$scope.monthFormats = ['yyyy/MM', 'MMMM-yyyy', 'MM.yyyy', 'MMMM/yyyy'];
	$scope.weekFormats = ['yyyy/w', 'w-yyyy', 'w.yyyy', 'w/yyyy', "w"];
	$scope.dateFormat = $scope.dateFormats[0];
	$scope.monthFormat = $scope.monthFormats[1];
	$scope.weekFormat = $scope.weekFormats[3];

	$scope.employeeidOptions = [];

	$scope.projectidOptions = [];

	function employeeidOptionsLoad() {
		$http.get(employeeidOptionsApi)
		.then(function(data) {
			$scope.employeeidOptions = data.data;
		});
	}
	employeeidOptionsLoad();

	function projectidOptionsLoad() {
		$http.get(projectidOptionsApi)
		.then(function(data) {
			$scope.projectidOptions = data.data;
		});
	}
	projectidOptionsLoad();

	$scope.dataPage = 1;
	$scope.dataCount = 0;
	$scope.dataOffset = 0;
	$scope.dataLimit = 50;

	$scope.getPages = function() {
		return new Array($scope.dataPages);
	};

	$scope.nextPage = function() {
		if ($scope.dataPage < $scope.dataPages) {
			$scope.loadPage($scope.dataPage + 1);
		}
	};

	$scope.previousPage = function() {
		if ($scope.dataPage > 1) {
			$scope.loadPage($scope.dataPage - 1);
		}
	};

	$scope.loadPage = function(pageNumber) {
		$scope.dataPage = pageNumber;
		$http.get(api + '/count')
		.then(function(data) {
			$scope.dataCount = data.data;
			$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
			$http.get(api + '?EmployeeId=' + $scope.masterEntityId + '&$offset=' + ((pageNumber - 1) * $scope.dataLimit) + '&$limit=' + $scope.dataLimit)
			.then(function(data) {
				$scope.data = data.data;
			});
		});
	};

	$scope.openNewDialog = function() {
		$scope.actionType = 'new';
		$scope.entity = {};
		toggleEntityModal();
	};

	$scope.openEditDialog = function(entity) {
		$scope.actionType = 'update';
		$scope.entity = entity;
		$scope.entityForm.$valid = true;
		toggleEntityModal();
	};

	$scope.openDeleteDialog = function(entity) {
		$scope.actionType = 'delete';
		$scope.entity = entity;
		toggleEntityModal();
	};

	$scope.close = function() {
		$scope.loadPage($scope.dataPage);
		toggleEntityModal();
	};

	$scope.create = function() {
		if ($scope.entityForm.$valid) {
			$scope.entity.EmployeeId = $scope.masterEntityId;
			$http.post(api, JSON.stringify($scope.entity))
			.then(function(data) {
				$scope.loadPage($scope.dataPage);
				toggleEntityModal();
				$messageHub.messageEntityModified();
			}, function(data) {
				alert(JSON.stringify(data.data));
			});
		}	
	};

	$scope.update = function() {
		if ($scope.entityForm.$valid) {
			$scope.entity.EmployeeId = $scope.masterEntityId;

			$http.put(api + '/' + $scope.entity.Id, JSON.stringify($scope.entity))
			.then(function(data) {
				$scope.loadPage($scope.dataPage);
				toggleEntityModal();
				$messageHub.messageEntityModified();
			}, function(data) {
				alert(JSON.stringify(data.data));
			})
		}
	};

	$scope.delete = function() {
		$http.delete(api + '/' + $scope.entity.Id)
		.then(function(data) {
			$scope.loadPage($scope.dataPage);
			toggleEntityModal();
			$messageHub.messageEntityModified();
		}, function(data) {
			alert(JSON.stringify(data));
		});
	};

	$scope.updateCalculatedProperties = function() {
		var entity = $scope.entity;
	};

	$scope.startOpenCalendar = function($event) {
		$scope.startCalendarStatus.opened = true;
	};

	$scope.startCalendarStatus = {
		opened: false
	};

	$scope.endOpenCalendar = function($event) {
		$scope.endCalendarStatus.opened = true;
	};

	$scope.endCalendarStatus = {
		opened: false
	};

	$scope.employeeidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.employeeidOptions.length; i ++) {
			if ($scope.employeeidOptions[i].Id === optionKey) {
				return $scope.employeeidOptions[i].Name;
			}
		}
		return null;
	};
	$scope.projectidOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.projectidOptions.length; i ++) {
			if ($scope.projectidOptions[i].Id === optionKey) {
				return $scope.projectidOptions[i].Name;
			}
		}
		return null;
	};

	$messageHub.onEntityRefresh($scope.loadPage($scope.dataPage));
	$messageHub.onEmployeeModified(employeeidOptionsLoad);
	$messageHub.onProjectModified(projectidOptionsLoad);

	$messageHub.onEmployeeSelected(function(event) {
		$scope.masterEntityId = event.data.id;
		$scope.loadPage($scope.dataPage);
	});

	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});
