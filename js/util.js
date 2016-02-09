var grey6 ='#231f20';
var grey5 ='#333333';
var grey4 ='#727272';
var grey3 ='#bfbfbf';
var grey2 ='#e2e3e4';
var grey1 ='#eeeff0';
var yellow3 ='#c3a730';
var yellow2 ='#edc639';
var yellow1 ='#ffd63d';
var tan2 ='#eee2bd';
var tan1 ='#f5eeda';
var brown2 ='#bfb980';
var brown1 ='#dedab9';
var orange3 ='#e29320';
var orange2 ='#f9a224';
var orange1 ='#fdc47c';
var red3 ='#ce3139';
var red2 ='#ee3a43';
var red1 ='#fcd6ca';
var blue5 ='#0079ae';
var blue4 ='#0098db';
var blue3 ='#95cbee';
var blue2 ='#c9e2f5';
var blue1 ='#e6eff9';
var green5 ='#52a045';
var green4 ='#63bc51';
var green3 ='#a2d292';
var green2 ='#c6e2ba';
var green1 ='#e6f2e1';
var purple2 ='#bb2b77';
var purple1 ='#d991b2';


var util = {
    destroyTransitions: function(selector){
        //Fantastic obliterator of transitions that I borrowed and modified from Mike Bostock and friends
        //Interrupts transitions on specific element types

        d3.selectAll(selector).interrupt();

        d3.selection.prototype.interrupt = function(){
            return this.each(function(){
                var lock = this.__transition__;
                if (lock) {
                    var active = -1;
                    for (var id in lock) if ((id = +id) > active) active = id;
                lock.active = active + 1;
                }
            })
        }

    },
    rounderRect: function(x, y, rectW, rectH, tl, tr, bl, br, flag, key) {
        //I borrowed this from an excellent stack overflow post and rewrote it for my own purposes.
        var rectPath;

        //The starting point
        rectPath  = "M" + (x + tl) + "," + y;
        //add top path
        rectPath += "h" + (rectW - tl - tr);

        //add top right
        rectPath += "a" + tr + "," + tr + " 0 0 1 " + tr + "," + tr;
        //add right path
        rectPath += "v" + (rectH - tr - br);

        //add bottom right
        rectPath += "a" + br + "," + br + " 0 0 1 " + -br + "," + br;
        //add bottom path
        rectPath += "h" + ((br+bl) - rectW);

        //add bottom left
        rectPath += "a" + bl + "," + bl + " 0 0 1 " + -bl + "," + -bl;
        //add left path
        rectPath += "v" + ((bl + tl) - rectH);

        //add top left
        rectPath += "a" + tl + "," + tl + " 0 0 1 " + tl + "," + -tl;

        //end it all
        rectPath += "z";

        //And spit it out
        return rectPath;
    },
    quickTable: function(dataset){
          //Quick tabler of data
          d3.select('body').append('table')
            .style('outline','0.25px solid white')
            .style('font-size','60%');

          var heders = d3.keys(dataset[0]);

          var thisHeder = d3.select('table').append('tr');
          thisHeder.selectAll('th').data(heders).enter().append('th').text(function(d){return d});
          thisHeder.append('th').text('index');

          dataset.forEach(function(dRow,iRow){
            var thisRow = d3.select('table').append('tr');

            heders.forEach(function(dCell){
              thisRow.append('td').text(dRow[dCell]);
            })
            thisRow.append('td').text(iRow);
          })
    },
	addCommas: function(datapoint){
		var thisFormat = d3.format(',');
		return thisFormat(datapoint);

	},
	removeCommas: function(datapoint){
		datapoint = datapoint.replace(/,/g,'')
		return datapoint;
	},
    selectDistinct: function(dataset,value){
      //Create an empty array
      var distinctSet = [];

      //Go through the dataset and find unique entries
      dataset.forEach(function(dSet,iSet){

        //...the first entry will always be unique
        if(iSet==0){
          distinctSet.push(dSet[value]);}
        //...otherwise, we filter the set to see if the value in the dataset matches
        else if (distinctSet.filter(function(dFilter,iFilter){
        return dFilter == dSet[value]}).length==0){
            distinctSet.push(dSet[value]);
        }
      })
      return distinctSet;
    }
}
