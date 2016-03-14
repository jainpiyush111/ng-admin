var myApp = angular.module('myApp', ['ng-admin', "agGrid"]);
myApp.config(['NgAdminConfigurationProvider', function (nga) {

			var admin = nga.application('My First Admin')
				.baseApiUrl('http://localhost:3000/api/');

			var query = nga.entity('query').identifier(nga.field('_id'));
			query.creationView().fields([
					nga.field('search')
				]);
			query.listView().fields([
					nga.field('_id').isDetailLink(true),
					nga.field('search')
				]);
			query.showView().fields([
					nga.field('_id').isDetailLink(true),
					nga.field('search')
				]);
			query.editionView().fields([
					nga.field('_id').isDetailLink(true),
					nga.field('search')
				]);
			admin.addEntity(query)

			var product = nga.entity('product').identifier(nga.field('_id'));
			product.creationView().fields([
					nga.field('search')
				]);
			product.listView().fields([
					nga.field('_id').isDetailLink(true),
					nga.field('search')
				]);
			product.showView().fields([
					nga.field('_id').isDetailLink(true),
					nga.field('search')
				]);
			product.editionView().fields([
					nga.field('_id').isDetailLink(true),
					nga.field('search')
				]);
			admin.addEntity(product)

			nga.configure(admin);

		}
	]);

myApp.config(['RestangularProvider', function (RestangularProvider) {
			RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response) {

				console.log('addResponseInterceptor:');
				console.log(JSON.stringify(operation));
				console.log(JSON.stringify(what));
				console.log(JSON.stringify(url));
				console.log(JSON.stringify(data));

				if (operation === 'getList' || operation === 'get') {
					return data.data;
				} else {
					return data;
				}
			});
		}
	]);

myApp.directive("myCtrl", function () {

	return {

		restrict : "E",
		scope : {
			collection : '=collection',
			fields : '@fields'
		},
		templateUrl : 'aggridInit.html',
		controller : ['$scope', '$http', function ($scope, $http) {

				var arr = $scope.fields.split(',');

				var columnDefs = [];

				for (i = 0; i < arr.length; i++) {
					columnDefs.push({
						headerName : arr[i].toUpperCase(),
						field : arr[i],
						width : 150,
						sortingOrder : ['asc', 'desc']
					});
				}

				$scope.gridOptions = {
					columnDefs : columnDefs,
					rowData : null,
					enableSorting : true,
					sortingOrder : ['desc', 'asc', null]

				};

				var rowData = [];

				$scope.create = function () {

					$http.get("http://localhost:3000/api/" + $scope.collection).then(function (response) {

						console.log(response);
						rowData = response.data.data;
						console.log(rowData);
						createNewDatasource();
					});

				}

				function createNewDatasource() {
					if (!rowData) {
						// in case user selected 'onPageSizeChanged()' before the json was loaded
						return;
					}

					var dataSource = {
						//rowCount: ???, - not setting the row count, infinite paging will be used
						pageSize : 10, // changing to number, as scope keeps it as a string
						getRows : function (params) {

							var rowsThisPage = rowData.slice(params.startRow, params.endRow);

							console.log(rowsThisPage);
							var lastRow = -1;
							params.successCallback(rowsThisPage);

						}

					};

					$scope.gridOptions.api.setDatasource(dataSource);
				}

			}
		]
	};
});
