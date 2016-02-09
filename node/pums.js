//DEPENDENCIES

var io = require('indian-ocean');
var d3 = require('d3');
var d3_scale = require('d3-scale');

//READ IN DATA AND TEMPORARILY SHRINK IT
var pums = io.readDataSync('ss14pid.csv');
var pumsPersonKey = io.readDataSync('pumsPersonKey.json');

var newPums = [];

//VARIOUS UTILITY FUNCTIONS
var util = {
	unspaceUncase: function(object){
		object = object.split(' ')[0].toUpperCase();
		return object;
	}
};

//VARIOUS SCALES
var scale = {
	label: d3.scale.ordinal()
		.domain(pumsPersonKey.map(function(m){return util.unspaceUncase(m.id);}))
		.range(pumsPersonKey.map(function(m){return m.label;})),
	rawScale: function(d){
		if(d===undefined){
			console.log(d);
			console.log('There was something undefined in your JSON key thing')
		}
 		else {
			return d;
		}
	}
};


var percentile = {
	calculate: function(dataset,variable){
		var countZero = 0;
		var countNonzero = 0;
		var total = d3.extent(dataset,function(d){
			if(+d[variable]!=0) {
				countNonzero++;
				return d[variable];
			}
			else {
				countZero++;
			}
		});
		dataset.forEach(function(dD,iD){
			// console.log(dD[variable]);
		});
		console.log(total)
		console.log(countZero)
		console.log(countNonzero)

	},
	restrict: function(dataset,variable){
		//Pulls out one top-level code from the dataset
	}
};

//ADD SCALES FOR EVERY SINGLE KEY ITEM
pumsPersonKey.forEach(function(d){

	if(JSON.stringify(d.keys).indexOf('..')==-1){
		var thisScale = d3.scale.ordinal()
			.domain(d.keys.map(function(m){return m.key;}))
			.range(d.keys.map(function(m){return m.label;}));

		scale[util.unspaceUncase(d.id)] = thisScale;
	}
	//If it has only one item, them we only need the direct value
	else {
		scale[util.unspaceUncase(d.id)] = scale.rawScale;
	}
});

pums.forEach(function(dP,iP){
	var keys = d3.keys(dP).filter(function(f){return f!==undefined;});
	keys.forEach(function(dK,iK){
		dK = util.unspaceUncase(dK);
		if(scale[dK]!==undefined){
			dP[dK] = scale[dK](dP[dK]);
		}
	});
});

//CALCULATE THE PERCENTILES

percentile.calculate(pums,"WAGP");


 // console.log(pums[10]);

//LABEL AND CODE EVERY RELEVANT DATAPOINT

// io.writeDataSync('pums.json',newPums);
// io.writeDataSync('fullPums.json',pums);
