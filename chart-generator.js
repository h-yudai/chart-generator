class ChartGenerator {
	constructor() {
		this.chart = null
		this.dataLabelPlugin = {
			// データラベル表示（パイチャート）
			afterDatasetsDraw: function(chart, easing) {
				var ctx = chart.ctx;
				// データセット数分繰り返し
				chart.data.datasets.forEach(function(dataset, i) {
					// 合計値
					var dataSum = 0;
					dataset.data.forEach(function(element) {
						dataSum += Number(element);
					});
					var meta = chart.getDatasetMeta(i);
					if(!meta.hidden) {
						// データ数分繰り返し
						meta.data.forEach(function(element, index) {
							// 文字色
							ctx.fillStyle = 'rgb(96, 96, 96)';
							// フォント
							var fontSize = 14;
							var fontStyle = 'normal';
							var fontFamily = 'Helvetica Neue';
							ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
							// 表示文字列
							//var labelString = chart.data.labels[index].toString();
							//var ratioString = (Math.floor(((dataset.data[index] / dataSum) * 100) + 0.5)).toString() + "%";
							var ratioString = (Math.round(dataset.data[index] / dataSum * 100 * 10) / 10).toString() + "%";
							// 表示位置
							ctx.textAlign = 'center';
							ctx.textBaseline = 'middle';
							var padding = 0;
							var position = element.tooltipPosition();
							//ctx.fillText(labelString, position.x, position.y - (fontSize / 2) - padding);
							//ctx.fillText(ratioString, position.x, position.y + (fontSize / 2) - padding);
							ctx.fillText(ratioString, position.x, position.y - (fontSize / 2) - padding);
						});
					}
				});
			}
		}
	}
	async generateChart(type, domId, dataName, resources) {
		var url = location.origin + "/chart/data/" + dataName + "/setting.json?" + Math.random();
		var prms = await fetch(url);
		var data = await prms.json();

		// Make Chart
		var labelAry = data.labels.split(',');
		var ctx = document.getElementById(domId).getContext('2d');
		switch (type) {
			case 'bar':
				this.makeBarChart(ctx, data.title, labelAry, data.ylabel);
				break;
			case 'stacked-bar':
				this.makeStackedBarChart(ctx, data.title, labelAry, data.ylabel);
				break;
			case 'line':
				this.makeLineChart(ctx, data.title, labelAry, data.ylabel);
				break;
			case 'pie':
				this.makePieChart(ctx, data.title, labelAry);
				break;
			default:
				console.log('No Type');
				return;
		}

		// Add Data
		var resourceAry = resources.split(',');
		for (let i = 0; i < resourceAry.length; ++i) {
			var resource = resourceAry[i];
			url = location.origin + "/chart/data/" + dataName + "/" + resource + ".json?" + Math.random();
			prms = await fetch(url);
			data = await prms.json();
			switch (type) {
				case 'bar':
					this.addBarData(data);
					break;
				case 'stacked-bar':
					this.addStackedBarData(data);
					break;
				case 'line':
					this.addLineData(data);
					break;
				case 'pie':
					this.addPieData(data);
					break;
			}
		}

		// Update Chart
		this.chart.update();
	}
	makeBarChart(ctx, title, labelAry, ylabel) {
		this.chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				animation: {duration: 0},
				responsive: true,
				legend: {position: 'top'},
				title: {display: false, text: title},
				scales: {
					yAxes: [{
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
				tooltips: {
					callbacks: {
							label: function(tooltipItem, data){
							return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						}
					}
				}
			}
		});
	}
	makeStackedBarChart(ctx, title, labelAry, ylabel) {
		this.chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				animation: {duration: 0},
				responsive: true,
				legend: {position: 'top'},
				title: {display: false, text: title},
				scales: {
					xAxes: [{
						stacked: true
					}],
					yAxes: [{
						stacked: true,
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
				tooltips: {
					callbacks: {
							label: function(tooltipItem, data){
							return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						}
					}
				}
			}
		});
	}
	makeLineChart(ctx, title, labelAry, ylabel) {
		this.chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				animation: {duration: 0},
				responsive: true,
				legend: {position: 'top'},
				title: {display: false, text: title},
				scales: {
					yAxes: [{
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
				tooltips: {
					callbacks: {
							label: function(tooltipItem, data){
							return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
						}
					}
				}
			}
		});
	}
	makePieChart(ctx, title, labelAry) {
		this.chart = new Chart(ctx, {
			type: 'pie',
			data: {
				labels: labelAry,
				datasets: []
			},
			options: {
				animation: {duration: 0},
				responsive: true,
				legend: {position: 'top'},
				title: {display: false, text: title},
				maintainAspectRatio: false,
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							var dataset = data.datasets[tooltipItem.datasetIndex];
							var total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
								return Number(previousValue) + Number(currentValue);
							});
							var label = data.labels[tooltipItem.index];
							var currentValue = Number(dataset.data[tooltipItem.index]);
							//var percentage = Math.floor(((currentValue/total) * 100) + 0.5);
							var percentage = Math.round(currentValue / total * 100 * 10) / 10;
							return label + ' : ' + percentage + '%';

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
			//plugins: [this.dataLabelPlugin]
		});
	}
	addBarData(data) {
		var color = Chart.helpers.color(data.color).alpha(0.5).rgbString();
		var dataset = {
			label: data.label,
			backgroundColor: color,
			borderColor: color,
			borderWidth: 1,
			data: data.values.split(',')
		}
		this.chart.data.datasets.push(dataset);
	}
	addStackedBarData(data) {
		var color = Chart.helpers.color(data.color).alpha(0.5).rgbString();
		var dataset = {
			label: data.label,
			backgroundColor: color,
			borderColor: color,
			borderWidth: 1,
			data: data.values.split(',')
		}
		this.chart.data.datasets.push(dataset);
	}
	addLineData(data) {
		var color = Chart.helpers.color(data.color).alpha(0.5).rgbString();
		var dataset = {
			label: data.label,
			fill: false,
			lineTension: 0,
			pointRadius: 5,
			pointHoverRadius: 8,
			pointHoverBackgroundColor: color,
			backgroundColor: color,
			borderColor: color,
			borderWidth: 1,
			data: data.values.split(',')
		}
		this.chart.data.datasets.push(dataset);
	}
	addPieData(data) {
		var colorAry = data.color.split(';');
		var colorAlphaAry = [];
		for (let i = 0; i < colorAry.length; ++i) {
			colorAlphaAry.push(Chart.helpers.color(colorAry[i]).alpha(0.5).rgbString())
		}
		var dataset = {
			label: data.label,
			backgroundColor: colorAlphaAry,
			hoverBackgroundColor: colorAlphaAry,
			data: data.values.split(',')
		}
		this.chart.data.datasets.push(dataset);
	}
}
