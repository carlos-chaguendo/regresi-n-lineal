String.prototype.replaceAll = function(search, replacement) {
	var target = this;
	return target.replace(new RegExp(search, 'g'), replacement);
};

var app = angular.module('myApp', [ 'ngSanitize' ]);

app.filter("trust", [ '$sce', function($sce) {
	return function(htmlCode) {
		return $sce.trustAsHtml(htmlCode);
	}
} ]);

var frac = function() {
	return {
		scope : {
			'n' : '@',
			'd' : '@',
		},
		replace : true,
		template : '<span class="frac"><sup ng-bind-html="n">1</sup><span>/</span><sub>{{d}}</sub></span>'
	}
};

app.directive('frac', frac);

app.controller('main', function($scope) {

	$scope.show_mx = false;
	$scope.show_my = false;
	$scope.show_vx = false;
	$scope.show_dx = false;
	$scope.show_cvx = false;
	$scope.show_rl = false;

	$scope.datos = "160\t58\n165\t61\n170\t65\n180\t73\n185\t80";
	$scope.points = [];
	$scope.zx = 0;
	$scope.zy = 0;
	$scope.zxxy = 0;
	$scope.n = 0;

	// Medias
	$scope.mx = 0;
	$scope.my = 0;

	// varianza
	$scope.vx = 0;
	$scope.vy = 0;
	// desviacion
	$scope.dv = 0;
	// covarianza
	$scope.cvx = 0;

	// recata y = mx + b
	$scope.m = 0;
	$scope.b = 0;

	$scope.aproximar = 5;

	var _graph = function() {

		// Define the chart to be drawn.
		var data = new google.visualization.DataTable();
		window.data = data;
		data.addColumn('number', 'Age');
		data.addColumn('number', 'Weight');

		var rows = []
		_.forEach($scope.points, function(p) {

			rows.push([ p.x, p.y ]);
		});

		console.info('graficando', rows)
		data.addRows(rows);

		// Set chart options
		var options = {
			'title' : 'Diagrama de dispersion',
			'width' : 850,
			'height' : 500,
			'legend' : 'none',
			trendlines : {
				0 : {
					type : 'polynomial',
					degree : 1,
					visibleInLegend : true,
				}
			}
		// Draw a trendline for data series 0.

		}

		// Instantiate and draw the chart.
		var chart = new google.visualization.ScatterChart(document
				.getElementById('defaulGrap'));
		chart.draw(data, options);
		window.chart = chart;
	}

	$scope.calcular = function() {

		var data = $scope.datos || document.querySelector('#textarea').value;
		if (!data) {
			alert('Faltan datos');
			return;
		}

		var points = [], sumx = 0, sumy = 0, sumxxy = 0, n = 0;

		var tokens = data.split('\n');
		_.forEach(tokens, function(e) {

			var point = e.replace(/ +/g, ' ').split('\t');
			if (point.length < 2) {
				point = e.replace(/ +/g, ' ').split(' ');
			}

			var x = parseFloat(point[0]), y = parseFloat(point[1]);

			n++;
			sumx += x;
			sumy += y;
			sumxxy += x * y;

			points.push({
				x : x,
				y : y,
				x2 : (x * x),
				y2 : (y * y),
				xy : x * y,
			})
		});

		console.info(points)

		$scope.mx = (sumx / n).toFixed($scope.aproximar);
		$scope.my = (sumy / n).toFixed($scope.aproximar);
		$scope.zxxy = sumxxy;

		// suma de varianxaz = sv
		var sv = 0, sy = 0;
		_.forEach(points, function(p) {
			p.vx = (p.x - $scope.mx) * (p.x - $scope.mx) // varianza x
			p.vy = (p.y - $scope.my) * (p.y - $scope.my) // varianza y
			sv += p.vx
			sy += p.vy
		});

		// Clear prevous dats
		$scope.zx = sumx;
		$scope.zy = sumy;
		$scope.points = points;
		$scope.n = n;

		// varianza
		$scope.vx = (sv / n).toFixed($scope.aproximar);
		$scope.vy = (sy / n).toFixed($scope.aproximar);
		// covarianza
		$scope.cvx = ((sumxxy / n) - ($scope.mx * $scope.my))
				.toFixed($scope.aproximar);
		// desviacion
		$scope.dv = Math.sqrt($scope.vx).toFixed($scope.aproximar);
		$scope.dy = Math.sqrt($scope.vy).toFixed($scope.aproximar);

		$scope.m = ($scope.cvx / $scope.vx).toFixed($scope.aproximar);
		$scope.b = ($scope.my - ($scope.m * $scope.mx))
				.toFixed($scope.aproximar);
		_graph();

	}

});

// 65 69
// 76 81
// 80 86
// 93 95
// 52 53
// 62 60
// 70 75
// 73 73
// 82 86
// 86 88
// 78 77
// 60 63
