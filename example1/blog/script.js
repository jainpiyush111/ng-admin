var myApp = angular.module('myApp', ['ng-admin', "agGrid"]);
myApp.config(['NgAdminConfigurationProvider', function (nga) {

			var admin = nga.application('My First Admin')
				.baseApiUrl('http://localhost:3000/api/');

			var query = nga.entity('query').identifier(nga.field('_id'));
			query.creationView().fields([
					nga.field('name').label('Name'),
					nga.field('desc').label('Description'),
					nga.field('dburl').label('DB Url'),
					nga.field('collection').label('Collection Name'),
					nga.field('cols').label('Column Names')
				]);
			query.listView().fields([
					nga.field('name').label('Name').isDetailLink(true),
					nga.field('desc').label('Description'),
					nga.field('dburl').label('DB Url'),
					nga.field('collection').label('Collection Name'),
					nga.field('cols').label('Column Names')
				]);
			query.showView().fields([
					nga.field('name').label('Name').isDetailLink(true),
					nga.field('desc').label('Description'),
					nga.field('dburl').label('DB Url'),
					nga.field('collection').label('Collection Name'),
					nga.field('cols').label('Column Names')
				]);
			query.editionView().fields([
					nga.field('name').label('Name'),
					nga.field('desc').label('Description'),
					nga.field('dburl').label('DB Url'),
					nga.field('collection').label('Collection Name'),
					nga.field('cols').label('Column Names')
				]);
			admin.addEntity(query)

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
			url : '=url',
			collection : '=collection',
			fields : '=fields'
		},
		templateUrl : 'aggridInit.html',
		controller : ['$scope', '$http', function ($scope, $http) {

				

				function init() {

					$scope.gridOptions = {
						columnDefs : null,
						rowData : null,
						enableSorting : true,
						sortingOrder : ['desc', 'asc', null]
					};

				}

				init();

				$scope.onRun = function () {

					// changing column defination

					var columnDefs = [{
						headerName : "#",
						width : 50,
						cellRenderer : function (params) {
							return params.node.id + 1;
						}
					}];
					var arr = [];
					console.log("Fields", $scope.fields);
					arr = $scope.fields.split(',');

					for (i = 0; i < arr.length; i++) {
						columnDefs.push({
							headerName : arr[i].toUpperCase(),
							field : arr[i],
							width : 150,
							sortingOrder : ['asc', 'desc']
						});
					}
					console.log("Column defs ", columnDefs);

					$scope.gridOptions.api.setColumnDefs(columnDefs);

					// changing row data

					console.log(" Url Name", $scope.url);
					console.log(" Collection Name", $scope.collection);
					
					var data = {"CollectionName":$scope.collection , "databaseName":$scope.url};
					console.log(data);
					
					$http.post("http://localhost:4000/api",data).then(function (response) {
						
						console.log("Response data",response);
						var resData = response.data;
						console.log(resData);
						createNewDatasource(resData);
					});

				}

				function createNewDatasource(rowData) {
					if (!rowData) {
						// in case user selected 'onPageSizeChanged()' before the json was loaded
						return;
					}

					var dataSource = {
						//rowCount: ???, - not setting the row count, infinite paging will be used
						pageSize : 15, // changing to number, as scope keeps it as a string
						getRows : function (params) {

							var rowsThisPage = rowData.slice(params.startRow, params.endRow);

							console.log(rowsThisPage);
							var lastRow = -1;
							params.successCallback(rowsThisPage, lastRow);

						}

					};

					$scope.gridOptions.api.setDatasource(dataSource);
				}

			}
		]
	};
});
