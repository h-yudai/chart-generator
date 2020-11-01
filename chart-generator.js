var ChartGenerator = function() {}

var dataLabelPlugin = {
	afterDatasetsDraw: function (chart, easing) {
		// To only draw at the end of animation, check for easing === 1
		var ctx = chart.ctx;

		// Calc Percent
		chart.data.datasets.forEach(function (dataset, i) {
			var dataSum = 0;
			dataset.data.forEach(function (element){
				dataSum += Number(element);
			});

			var meta = chart.getDatasetMeta(i);
			if (!meta.hidden) {
				meta.data.forEach(function (element, index) {
					// Draw the text in black, with the specified font
					ctx.fillStyle = 'rgb(96, 96, 96)';

					var fontSize = 14;
					var fontStyle = 'normal';
					var fontFamily = 'Helvetica Neue';
					ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

					// Just naively convert to string for now
					var labelString = chart.data.labels[index].toString();
					var dataString = (Math.round(dataset.data[index] / dataSum * 100 * 10) / 10).toString() + "%";
					//var dataString = (Math.floor(((dataset.data[index] / dataSum) * 100) + 0.5)).toString() + "%";

					// Make sure alignment settings are correct
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';

					var padding = 0;
					var position = element.tooltipPosition();
					//ctx.fillText(labelString, position.x, position.y - (fontSize / 2) - padding);
					//ctx.fillText(dataString, position.x, position.y + (fontSize / 2) - padding);
					ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
				});
			}
		});
	}
};

ChartGenerator.prototype = {
	barChart: null,
	lineChart: null,
	pieChart: null,
	generateChart: function(type, domId, dataName, resources) {
		var self = this;
		var url = location.origin + "/chart/data/" + dataName + "/setting.json";
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function(){
			var json = JSON.parse(xhr.response);

			// Make Canvas
			var labelAry = json.labels.split(',');
			switch (type) {
				case 'bar':
					self.makeBarCanvas(domId, json.title, labelAry, json.ylabel);
					break;
				case 'line':
					self.makeLineCanvas(domId, json.title, labelAry, json.ylabel);
					break;
				case 'pie':
					self.makePieCanvas(domId, json.title, labelAry);
					break;
				default:
					console.log('No Type');
			}

			// Add Data
			var resourceAry = resources.split(',');
			for (let i = 0; i < resourceAry.length; ++i) {
				var resource = resourceAry[i];
				switch (type) {
					case 'bar':
						self.addBarData(dataName, resource);
						break;
					case 'line':
						self.addLineData(dataName, resource);
						break;
					case 'pie':
						self.addPieData(dataName, resource);
						break;
					default:
						console.log('No Type');
				}
			}

			// Update Chart
			if(self.barChart) {
				self.barChart.update();				
			}
			if(self.lineChart) {
				self.lineChart.update();				
			}
			if(self.pieChart) {
				self.pieChart.update();				
			}
		},false);
		xhr.open("GET", url, true);
		xhr.send(null);
	},
	makeBarCanvas: function(domId, title, labelAry, ylabel) {
		if(this.barChart) {
			this.barChart.destroy();
		}
		var ctx = document.getElementById(domId).getContext('2d');
		this.barChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				responsive: true,
				legend: {
					position: 'top',
				},
				scales: {
					xAxes: [{
						display: true
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: ylabel
						},
						ticks: {
							maxTicksLimit: 6,
							callback: function(label, index, labels) {
								return label.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
							}
						}
					}]
				},
				title: {
					display: false,
					text: title
				},
				tooltips: {
					callbacks: {
							label: function(tooltipItem, data){
							return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						}
					}
				}
			}
		});
	},
	makeLineCanvas: function(domId, title, labelAry, ylabel) {
		if(this.lineChart) {
			this.lineChart.destroy();
		}
		var ctx = document.getElementById(domId).getContext('2d');
		this.lineChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				responsive: true,
				legend: {
					position: 'top',
				},
				scales: {
					xAxes: [{
						display: true
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: ylabel
						},
						ticks: {
							maxTicksLimit: 6,
							callback: function(label, index, labels) {
								return label.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
							}
						}
					}]
				},
				title: {
					display: false,
					text: title
				},
				tooltips: {
					callbacks: {
							label: function(tooltipItem, data){
							return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						}
					}
				}
			}
		});
	},
	makePieCanvas: function(domId, title, labelAry) {
		if(this.pieChart) {
			this.pieChart.destroy();
		}
		var ctx = document.getElementById(domId).getContext('2d');
		this.pieChart = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				title: {
					display: false,
					text: title
				},
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							//get the concerned dataset
							var dataset = data.datasets[tooltipItem.datasetIndex];
							//calculate the total of this data set
							var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
								return Number(previousValue) + Number(currentValue);
							});
							//get the current items value
							var label = data.labels[tooltipItem.index];
							var currentValue = Number(dataset.data[tooltipItem.index]);
							//calculate the percentage based on the total and current item, also this does a rough rounding to give a whole number
							//var percentage = Math.floor(((currentValue/total) * 100) + 0.5);
							var percentage = Math.round(currentValue / total * 100 * 10) / 10;
							return label + " : " + percentage + '%';

							/*
							var label = data.labels[tooltipItem.index];
							var dataset = data.datasets[tooltipItem.datasetIndex];
							var valueStr = dataset.data[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');	
							return label + " : " + valueStr;
							*/
						}
					}
				}
			},
			//plugins: [dataLabelPlugin]
		});
	},
	addBarData: function(dataName, resource) {
		var self = this;
		var url = location.origin + "/chart/data/" + dataName + "/" + resource + ".json";
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function() {
			var json = JSON.parse(xhr.response);
			var dataset = {
				label: json.label,
				backgroundColor: Chart.helpers.color(json.color).alpha(0.5).rgbString(),
				borderColor: Chart.helpers.color(json.color).alpha(0.5).rgbString(),
				borderWidth: 1,
				data: json.values.split(',')
			}
			self.barChart.data.datasets.push(dataset);
		},false);
		xhr.open("GET", url, false);
		xhr.send(null);
/* 		var url = location.origin + "/chart/data/" + dataName + "/" + resource + ".json";
		fetch(url)
			.then((response) => {
				if(response.ok) {
					return response.json();
				} else {
					throw new Error();
				}
			})
			.then((data) => {
				var dataset = {
					label: data.label,
					backgroundColor: Chart.helpers.color(data.color).alpha(0.5).rgbString(),
					borderColor: Chart.helpers.color(data.color).alpha(0.5).rgbString(),
					borderWidth: 1,
					data: data.values.split(',')
				}
				self.chart.data.datasets.push(dataset);
			})
			.catch((error) => console.log(error)); */
	},
	addLineData: function(dataName, resource) {
		var self = this;
		var url = location.origin + "/chart/data/" + dataName + "/" + resource + ".json";
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function() {
			var json = JSON.parse(xhr.response);
			var dataset = {
				label: json.label,
				fill: false,
				lineTension: 0,
				pointRadius: 5,
				pointHoverRadius: 8,
				pointHoverBackgroundColor: Chart.helpers.color(json.color).alpha(0.5).rgbString(),
				backgroundColor: Chart.helpers.color(json.color).alpha(0.5).rgbString(),
				borderColor: Chart.helpers.color(json.color).alpha(0.5).rgbString(),
				borderWidth: 1,
				data: json.values.split(',')
			}
			self.lineChart.data.datasets.push(dataset);
		},false);
		xhr.open("GET", url, false);
		xhr.send(null);
	},
	addPieData: function(dataName, resource) {
		var self = this;
		var url = location.origin + "/chart/data/" + dataName + "/" + resource + ".json";
		var xhr = new XMLHttpRequest();
		xhr.addEventListener('load',function() {
			var json = JSON.parse(xhr.response);
			var dataAry = json.values.split(',')
			var colorAry = json.color.split(';')
			var colorAlphaAry = [];
			for (let i = 0; i < colorAry.length; ++i) {
				colorAlphaAry.push(Chart.helpers.color(colorAry[i]).alpha(0.5).rgbString())
			}
			var dataset = {
				label: json.label,
				backgroundColor: colorAlphaAry,
				hoverBackgroundColor: colorAlphaAry,
				data: dataAry
			}
			self.pieChart.data.datasets.push(dataset);
		},false);
		xhr.open("GET", url, false);
		xhr.send(null);
	}
}
