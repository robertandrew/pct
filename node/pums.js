//DEPENDENCIES
var io = require('indian-ocean');
var d3 = require('d3');
var d3_scale = require('d3-scale');

//READ IN DATA
var rawPums = io.readDataSync('ss14pid.csv');
var pumsPersonKey = io.readDataSync('pumsPersonKey.json');

//VARIOUS UTILITY FUNCTIONS
var util = {
	unspaceUncase: function(object){
		object = object.split(' ')[0].toUpperCase();
		return object;
	}
};

var edLevels = [
	{
	   "key": "bb",
	   "output":"none",
	   "label": "N/A (less than 3 years old)"
	}, {
	   "key": "1",
	   "output":"none",
	   "label": "No schooling completed"
	}, {
	   "key": "2",
	   "output":"elementary",
	   "label": "Nursery school, preschool"
	}, {
	   "key": "3",
	   "output":"elementary",
	   "label": "Kindergarten"
	}, {
	   "key": "4",
	   "output":"elementary",
	   "label": "Grade 1"
	}, {
	   "key": "5",
	   "output":"elementary",
	   "label": "Grade 2"
	}, {
	   "key": "6",
	   "output":"elementary",
	   "label": "Grade 3"
	}, {
	   "key": "7",
	   "output":"elementary",
	   "label": "Grade 4"
	}, {
	   "key": "8",
	   "output":"elementary",
	   "label": "Grade 5"
	}, {
	   "key": "9",
	   "output":"middle",
	   "label": "Grade 6"
	}, {
	   "key": "10",
	   "output":"middle",
	   "label": "Grade 7"
	}, {
	   "key": "11",
	   "output":"middle",
	   "label": "Grade 8"
	}, {
	   "key": "12",
	   "output":"high",
	   "label": "Grade 9"
	}, {
	   "key": "13",
	   "output":"high",
	   "label": "Grade 10"
	}, {
	   "key": "14",
	   "output":"high",
	   "label": "Grade 11"
	}, {
	   "key": "15",
	   "output":"high",
	   "label": "12th grade - no diploma"
	}, {
	   "key": "16",
	   "output":"highGrad",
	   "label": "Regular high school diploma"
	}, {
	   "key": "17",
	   "output":"highGrad",
	   "label": "GED or alternative credential"
	}, {
	   "key": "18",
	   "output":"someCollege",
	   "label": "Some college, but less than 1 year"
	}, {
	   "key": "19",
	   "output":"someCollege",
	   "label": "1 or more years of college credit, no degree"
	}, {
	   "key": "20",
	   "output":"someCollege",
	   "label": "Associate's degree"
	}, {
	   "key": "21",
	   "output":"bachelor",
	   "label": "Bachelor's degree"
	}, {
	   "key": "22",
	   "output":"master",
	   "label": "Master's degree"
	}, {
	   "key": "23",
	   "output":"master",
	   "label": "Professional degree beyond a bachelor's degree"
	}, {
	   "key": "24",
	   "output":"phd",
	   "label": "Doctorate degree"
   }
];


//SUMMARIZE COLUMNS WHEN NECESARy
var addColumns = {
	init: function(dataset){
		dataset.forEach(function(d,i){
			//Each new column gets added
			addColumns.NEWRACE(d);
			addColumns.NEWAGE(d);
			addColumns.NEWWORKER(d);
			addColumns.NEWSCHOOL(d);
		});
		return dataset;
	},
	NEWSCHOOL: function(datapoint){
		// console.log(datapoint);
		datapoint.NEWSCHOOL = addColumns.schoolCategorizer(datapoint.SCHL);

		console.log(datapoint.NEWSCHOOL);

	},
	NEWRACE: function(datapoint){
		var race = +datapoint.RAC1P;
		var NEWRACE;
		if(+datapoint.HISP!=1){
			NEWRACE = 'hispanic';
		} else if(race == 1) {
			NEWRACE = 'white';
		} else if(race == 2) {
			NEWRACE = 'black';
		} else if(race == 3 || race==4 || race == 5) {
			NEWRACE = 'indian';
		} else if(race == 7 || race ==6){
			NEWRACE = "asian";
		} else if(race == 8 || race == 9) {
			NEWRACE = "other";
		}
		datapoint.NEWRACE = NEWRACE;
	},
	NEWAGE: function(datapoint){
		var age = +datapoint.AGEP;
		var NEWAGE;

		if(age<=15){
			NEWAGE='15';
		} else if(age<=24){
			NEWAGE='24';
		} else if(age<=34){
			NEWAGE='34';
		} else if(age<=44){
			NEWAGE='44';
		} else if(age<=54){
			NEWAGE='54';
		} else if(age<=64){
			NEWAGE='64';
		} else if(age>=65){
			NEWAGE='200';
		} else {
			NEWAGE="";
			console.log(datapoint.AGEP + " wasn't defined");
		}
		datapoint.NEWAGE = NEWAGE;
	},
	NEWWORKER: function(datapoint){
		var worker = datapoint.COW;
		var selfOrFamily = ["8","6","7"];
		if (selfOrFamily.indexOf(worker)!=-1){
			datapoint.NEWWORKER = "10";
		} else {
			datapoint.NEWWORKER = worker;
		}
	},

   schoolCategorizer: d3.scale.ordinal()
   		.domain((edLevels).map(function(d){return d.key}))
   		.range((edLevels).map(function(d){return d.output}))

};

console.log(addColumns.levels);


var arrays = {
	subsets: ['NEWSCHOOL','SEX','OC'],
	// subsets: ['42430','SCHL','SEX','OC','NATIVITY','RAC1P','SCIENGRLP','VPS','WAOB','AGEP'],
	expandSubsets: function(subsets){
		var expanded = [];
		subsets.forEach(function(dSub,iSub){
			subsetArray = [];
			var thisSubKeys = (scale.key(dSub).keys);
			thisSubKeys.forEach(function(dKey,iKey){
				combinedId = "K_" + dSub + "_" + dKey.key;
				subsetArray.push(combinedId);
				scale.combinedId.push({combinedId:combinedId,
					label:dKey.label,
				id:dSub});

			});
			expanded.push(subsetArray);
		});
		return expanded;
	},

	permute: function(){
		var inputArrays = arrays.expandSubsets(arrays.subsets);

		//The counter seeks to limit my trips through the array fiesta...
		var finished = 0;
		//Which will fill this unique object...
		var uniqueArrays = [];
		//...using a recursive function called pusher, which pushes things into other things
		function pusher(){
			//...use the counter to zip through all unfinished arrays...
			var remaining = d3.range(finished,inputArrays.length);


			remaining.forEach(function(i){

				//A blank object will hold the new things so that it doesn't mess with the old things.
				var newStuff = [];

				inputArrays[i].forEach(function(dI,iI){
					//Fill up the first layer
					if(finished===0){
						uniqueArrays.push([dI]);
					}
					//Otherwise, combine every remaining item with every previous item
					else {
						//Go through the entire backlog...
						uniqueArrays.forEach(function(dU,iU){
							//...and as long as we haven't added a thing for a parcular level of pivoting yet...
							var alreadyPresent = false;

							//...and we have to check every single level to make sure that's the case...
							inputArrays[i].forEach(function(dI,iI){
								if(dU.indexOf(dI)!=-1){
									alreadyPresent = true;
								}
							});

							//..and if it's not present...
							if(alreadyPresent === false){
								//...then make a new item!...
								newItem = [];
								//...that has everything the previous one did...
								dU.forEach(function(dUI){
									newItem.push(dUI);
								});
								//...plus the one new thing...
								newItem.push(dI);

								//...and isn't already present in the unique set, which we check by creating huge, wacky strings...
								uniqueString = "|" + uniqueArrays.join("|") + '|';
								input = newItem.sort();
								inputString = "|" + input.join() + '|';

								//and if those strings don't return a match...
								if(uniqueString.indexOf(inputString)==-1) {
									//we add it in!
									newStuff.push(input);
								}
							}
						});

					}
				});
				//And then we combine all the new stuff, rinse...
				uniqueArrays = uniqueArrays.concat(newStuff).sort(function(a,b){
					return d3.ascending(a.length,b.length);
				});

				//...and repeat
				if(i == inputArrays.length-1 && finished <= inputArrays.length-1){
					finished++;
					pusher();
				}

			});
		}
		pusher();
		return uniqueArrays;
	}
};

//VARIOUS SCALES
var scale = {
	key: d3.scale.ordinal()
		.domain(pumsPersonKey.map(function(m){return util.unspaceUncase(m.id);}))
		.range(pumsPersonKey.map(function(m){return m;})),
	rawScale: function(d){
		if(d===undefined){
			console.log(d);
			console.log('There was something undefined in your JSON key thing');
		}
 		else {
			return d;
		}
	},
	combinedId : [],

};


var percentile = {
	calculate: function(dataset,id){

		var included = 0;
		var excluded = 0;
		// 	var incomeVar = "WAGP";//wages and salary
		var incomeVar = "PINCP";//Personal income, signed
		// var incomeVar = "PERNP";//Earnings
		var weight = "PWFTP";

		//RESTRICT IT ONLY TO NONZERO, DEFINED VALUES
		var liveSet = dataset.filter(function(f){
			if(+f[incomeVar]!==0) {
				included++;
				return f[incomeVar];
			}
			else {
				excluded++;
			}
		});

		//FLAG TINY SAMPLES
		// if(included<=100){
		// 	console.log('Your subsample is only ' + included + ', which is definitely something to look out for.');
		// }

		//SORT IT BY INCOME
		liveSet = liveSet.sort(function(a,b){
			return d3.descending(a[incomeVar],b[incomeVar]);
		});

		//ABOVE AND BELOW COUNT WEIGHT ABOVE AND BELOW

		var poorer = d3.sum(liveSet,function(s){return s[weight];});
		var richer = 0;
		var countPoorer = liveSet.length-1;
		var countRicher = 0;
		var total = d3.sum(liveSet,function(s){return s[weight];});

		//And create an almost-empty object to hold the percentile breaks
		var percentiles = [{percentile:0,
			bottomBreak:+liveSet[0][incomeVar]}];

		liveSet.forEach(function(dD,iD){

			//CALCULATE THE BEFORE AND AFTER PERCENTS
			var pctRicher = richer/total * 100;
			var pctThis = +dD[weight]/total * 100;
			var pctRicherNext = pctRicher + pctThis;
			var pctPoorer = (poorer - (+dD[weight]))/total * 100;
			var thisPercentile = ((pctRicherNext) + "").split('.')[0];

			if((pctRicher + "").split('.')[0]!=thisPercentile && iD!=liveSet.length-1){

				var thisValue = +liveSet[iD][incomeVar];
				var nextValue = +liveSet[iD+1][incomeVar];
				var thisGap = nextValue - thisValue;


				 thisItem = {
					 percentile:+thisPercentile,
				 };


				 //FIRST, ZERO GAPS CAN BE INSERTED UNTOUCHED
				 if(thisGap === 0) {
					 thisItem.bottomBreak = thisValue;
				 } else {
					var percentAdjustment = (thisPercentile-pctRicher);
					var valueAdjustment = +(thisGap * percentAdjustment).toFixed(1);

					thisItem.bottomBreak = +thisValue + valueAdjustment;
				 }
				 if(thisItem===null){
					 console.log(dD);
				 }
				 percentiles.push(thisItem);
			}

			//INCREMENT EVERYTHING AT THE END
			poorer -= +dD[weight];
			richer += +dD[weight];
			countPoorer--;
			countRicher++;
		});


		//Sort percentiles for coherence sake
		var thisObject =
		{
			percentiles: percentiles.sort(function(a,b){
				return d3.ascending(a.percentile,b.percentile);
			}),
	 		sample:included,
		};

		return thisObject;

	},
	blob: function(dataset,permutations){
		// console.log(scale.combinedId);
		var blob = {
			all: percentile.calculate(dataset,'all')
		};
		filterCount = 0;

		permutations.forEach(function(dPerm,iPerm){
			var filtered = dataset;
			var identifier = dPerm.sort().join("|");
			dPerm.forEach(function(dFilter,iFilter){
				filterOn = dFilter.split('_')[1];
				filterOut = dFilter.split('_')[2];

				filtered = dataset.filter(function(f){

					return f[filterOn]==filterOut;});
				filterCount++;
			});
			if(filtered.length!==0){
				blob[identifier] = percentile.calculate(filtered,identifier);
			} else {
				console.log(identifier + " filtered out literally everybody");
			}
			// console.log(filtered.length)
		});

		return blob;

	}
};

// ADD SCALES FOR EVERY SINGLE KEY ITEM
pumsPersonKey.forEach(function(d){
	//
	// if(d.id=="NEWAGE"){
	// 	console.log(d);
	// }
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
//
// pums.forEach(function(dP,iP){
// 	var keys = d3.keys(dP).filter(function(f){return f!==undefined;});
// 	keys.forEach(function(dK,iK){
// 		dK = util.unspaceUncase(dK);
// 		// if(scale[dK]!==undefined){
// 		// 	dP[dK] = scale[dK](dP[dK]);
// 		// }
// 	});
// });

//CALCULATE THE PERCENTILES
// console.log(arrays.permute())//Increment the finished indicator
var permutations = arrays.permute();
console.log(d3.sum(permutations,function(s){return s.length}))
console.log(permutations.length)

var blob = percentile.blob(addColumns.init( rawPums ),permutations);
d3.keys(blob).forEach(function(d,i){
	var sample = blob[d].sample;
	console.log(d, sample)
})

// io.writeDataSync('pums.json',blob);
// io.writeDataSync('fullPums.json',pums);
