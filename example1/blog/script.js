var myApp = angular.module('myApp', ['ng-admin', "agGrid"]);
myApp.config(['NgAdminConfigurationProvider', function (nga) {

			var admin = nga.application('My First Admin')
				.baseApiUrl('http://localhost:3000/api/');

			var datasource = nga.entity('datasource').identifier(nga.field('_id'));
			datasource.creationView().fields([
					nga.field('name').label('Name').validation({
						required : true
					}),
					nga.field('dburl').label('DB Url').validation({
						required : true
					}),
					nga.field('colNames').label('Collections').validation({
						required : true
					})
				]);
			datasource.listView().fields([
					nga.field('name').label('Name').isDetailLink(true),
					nga.field('dburl').label('DB Url'),
					nga.field('colNames').label('Collections')
				]);
			datasource.showView().fields([
					nga.field('name').label('Name').isDetailLink(true),
					nga.field('dburl').label('DB Url'),
					nga.field('colNames').label('Collections')
				]);
			datasource.editionView().fields([
					nga.field('name').label('Name').validation({
						required : true
					}),
					nga.field('dburl').label('DB Url').validation({
						required : true
					}),
					nga.field('colNames').label('Collections').validation({
						required : true
					})
				]);
			admin.addEntity(datasource)
			var datasource1 = nga.entity('datasource').identifier(nga.field('dburl'));

			var query = nga.entity('query').identifier(nga.field('_id'));
			query.creationView().fields([
					nga.field('name').label('Name').validation({
						required : true
					}),
					nga.field('desc').label('Description').validation({
						required : true
					}),
					nga.field('dburl', 'reference')
					.label('DB Url')
					.targetEntity(datasource1)
					.targetField(nga.field('dburl'))
					.singleApiCall(_ids => ({
								'_id' : _ids
							}))
					.validation({
						required : true
					}),
					nga.field('collection').label('Collection Name').validation({
						required : true
					}),
					nga.field('cols').label('Column Names').validation({
						required : true
					})
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
					nga.field('dburl', 'reference')
					.label('DB Url')
					.targetEntity(datasource1)
					.targetField(nga.field('dburl')),
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

myApp.controller('myCtrl', function ($scope, $http, $timeout, $q) {

	$scope.onDiscover = function () {

		var parameter = {
			"databaseName" : $scope.entry.values["dburl"]
		};


		$http.post("http://localhost:4000/api/collections", parameter).then(function (response) {
			console.log("Collections name on discover", response.data);
			$scope.entry.values["colNames"]= response.data;
		
		});
		
		
		$http.get("http://localhost:4000/api/schemas").then(function (response) {
			console.log("Schemas name on discover", response);
			console.log("Schemas name on discover", response.data.fields);
				
		
		});

	}

});

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

				//on Page load

				function init() {

					$scope.gridOptions = {

						enableColResize : true,
						
						columnDefs : null,
						rowData : null,
						enableServerSideSorting : true,
						rowModelType : 'virtual'

					};

				}

				init();
				
				// export data
				
				
				$scope.onBtExport =function() {
					console.log("Export ");
					var params = {
						skipHeader : false,
						skipFooters : false,
						skipGroups : true,
						allColumns : true,
						onlySelected : false,
						fileName : "data",
						columnSeparator : ","
					};
			/*
					if (getBooleanValue('#useCellCallback')) {
						params.processCellCallback = function (params) {
							if (params.value && params.value.toUpperCase) {
								return params.value.toUpperCase();
							} else {
								return params.value;
							}
						};
					}

					if (getBooleanValue('#customHeader')) {
						params.customHeader = '[[[ This ia s sample custom header - so meta data maybe?? ]]]\n';
					}
					if (getBooleanValue('#customFooter')) {
						params.customFooter = '[[[ This ia s sample custom footer - maybe a summary line here?? ]]]\n';
					}
			*/
					$scope.gridOptions.api.exportDataAsCsv(params);
				}

				// on Run button click

				$scope.onRun = function () {

					// changing column defination

					var columnDefs = [{
							headerName : "#",
							width : 50,
							cellRenderer : function (params) {
								return params.node.id + 1;
							}
						}
					];
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

					createNewDatasource();
				}

				function createNewDatasource() {

					var dataSource = {
						rowCount : null, // behave as infinite scroll
						pageSize : 40,
						overflowSize : 100,
						getRows : function (params) {

							var parameter = {
								"CollectionName" : $scope.collection,
								"databaseName" : $scope.url,
								"startRow" : params.startRow,
							};

							if (params.sortModel[0]) {

								var value;
								if (params.sortModel[0].sort == "asc") {
									value = 1;
								} else {
									value = -1;
								}

								parameter = {
									"CollectionName" : $scope.collection,
									"databaseName" : $scope.url,
									"startRow" : params.startRow,
									"colName" : params.sortModel[0].colId,
									"sort" : value
								}

							}

							console.log("Start Row ", params.startRow);
							console.log("End Row ", params.endRow);
							$http.post("http://localhost:4000/api", parameter).then(function (response) {

								console.log("Response data", response);
								var rowData = response.data;
								console.log(rowData);
								params.successCallback(rowData);
							});

						}

					};

					$scope.gridOptions.api.setDatasource(dataSource);
				}

			}
		]
	};
});
