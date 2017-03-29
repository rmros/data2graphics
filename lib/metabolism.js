import D3 from 'd3'
import { detectSVG, vPattern } from './utils/detect'
import { clone } from './utils/clone'
import baseConf from './default-config/metabolism.config'


var d3 = Object.assign({},
    D3,
    require('d3-shape'),
    require('d3-format'),
    require('d3-selection'),
    require('d3-request'),
    require('d3-drag'),
    require('d3-color'),
    require('d3-array'),
    require('d3-random'),
    require('d3-axis'),
    require('d3-scale')
);

export function metabolism(parent, config) {

    let input = config || baseConf;
    detectSVG(parent);




    let svg = d3.select('#' + parent.id + ' svg'),
        margin = { top: 50, right: 60, bottom: 150, left: 130 };

    svg.attr('width', 1000)
        .attr('height', 800);

    let width = svg.attr('width') - margin.left - margin.right,
        height = svg.attr('height') - margin.top - margin.bottom,
        g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var formatNumber = d3.format('.2%');



    vPattern(svg, [0, 4], 4, 27, 'salmon');
    vPattern(svg, [0, 4], 4, 27, 'orange');
    vPattern(svg, [0, 4], 4, 27, 'seagreen');


    var yArr = baseConf.data.map((e, i) => (e.y));



    // define basic location Axis
    var x = d3.scaleLinear()
        .domain([
            d3.min(
                baseConf.data.map((e, i) => (e.x[0]))
            ),
            d3.max(
                baseConf.data.map((e, i) => (e.x[1]))
            )
        ])
        .range([0, width]);


    var y = d3.scaleLinear()
        .domain([0, d3.max(yArr)])
        .range([height, 0]);

    var yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickSize(4)
        .tickFormat((d) => {
            return formatNumber(d)
        });

    var xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickSize(4)
        .tickFormat((d, i) => {
            return d
        });

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(30,' + (height + 30) + ')')
        .call(customXAxis);

    g.append('g')
        .attr('class', 'axis axis--y')
        .attr('transform', 'translate(0,0)')
        .call(customYAxis);


    function customXAxis(g) {
        g.call(xAxis);
        g.selectAll('.tick text').attr('x', 4).attr('dy', 24);

    }

    function customYAxis(g) {
        g.call(yAxis);
        g.selectAll('.tick text').attr('x', -24).attr('dy', 4);
    }









    var bar = g.selectAll(".bar")
        .data(baseConf.data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {
            return "translate(" + (x(d.x[0]) - 70) + "," + y(d.y) + ")";
        });

    bar.append("rect")
        .attr("x", 100)
        .attr('stroke', (e, i) => {
            if (e.x[0] < baseConf.gap[0]) return 'salmon';
            if (e.x[0] < baseConf.gap[1]) return 'orange';
            if (e.x[0] < baseConf.gap[2]) return 'seagreen';
            if (e.x[0] < baseConf.gap[3]) return 'orange';
            return 'salmon';
        })
        .attr('fill', (e, i) => {
            let color='salmon';

            ((e.x[0] < baseConf.gap[0]) && (color= 'salmon'))||
            ((e.x[0] < baseConf.gap[1]) && (color= 'orange'))||
            ((e.x[0] < baseConf.gap[2]) && (color= 'seagreen'))||
            ((e.x[0] < baseConf.gap[3]) && (color= 'orange'));

            return 'url(#vpattern-' + color + ')'
        })
        .attr('stroke-width', 1)
        .attr("width", x(14500) - x(14000) - 4)
        .attr("height", function(d) {
            return height - y(d.y);
        });


    // curve
    let data = d3.range(80000).map(d3.randomNormal(22000, 2000));

    var line = d3.line()
        .defined(function(d) {
            return d;
        })
        .x(function(d) {
            return x((d.x0 + d.x1) / 2);
        })
        .y(function(d) {
            return y(d.length / data.length / 2.5);
        })
        .curve(d3.curveBasis);



    var bins = d3.histogram()
        .domain(x.domain())
        .thresholds(x.ticks(20))
        (data);

    console.log(bins);

    g.append("path")
        .datum(bins)
        .attr("class", "line")
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr("d", line);




    // from http://bl.ocks.org/mbostock/4349187
    // Sample from a normal distribution with mean 0, stddev 1.
    function normal() {
        var x = 0,
            y = 0,
            rds, c;
        do {
            x = Math.random() * 2 - 1;
            y = Math.random() * 2 - 1;
            rds = x * x + y * y;
        } while (rds == 0 || rds > 1);
        c = Math.sqrt(-2 * Math.log(rds) / rds); // Box-Muller transform
        return x * c; // throw away extra sample y * c
    }

    //taken from Jason Davies science library
    // https://github.com/jasondavies/science.js/
    function gaussian(x) {
        var gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
            mean = 0,
            sigma = 1;

        x = (x - mean) / sigma;
        return gaussianConstant * Math.exp(-.5 * x * x) / sigma;
    };


}